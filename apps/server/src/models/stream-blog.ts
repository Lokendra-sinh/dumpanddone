import { anthropic, deepseekAi, openai } from "..";
import { blogGeneratorPrompt } from "../prompts/generate-blog-instructions";
import { ModelsType, OutlineSectionType } from "@dumpanddone/types";
import { RequestStateType } from "../ws/socket";
import { getBlogById } from "../db/queries/blog";
import { fetchChaosFromR2 } from "../r2/store";
import { TRPCError } from "@trpc/server";

async function streamWithClaude(
  chaos: string, 
  outline: OutlineSectionType[], 
  requestState: RequestStateType
) {
  const prompt = blogGeneratorPrompt(chaos, outline);
  
  return new Promise((resolve, reject) => {
    const stream = anthropic.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    // Handle text streaming
    stream.on('text', (text) => {
      if (requestState.status === 'aborted') {
        stream.controller.abort();
        return;
      }

      if (text) {
        requestState.ws.send(JSON.stringify({
          type: 'BLOG_PROGRESS',
          content: text,
          userId: requestState.userId,
          blogId: requestState.blogId,
          selectedModel: "claude"
        }));
      }
    });

    // Handle stream completion
    stream.on('end', () => {
      resolve(undefined);
    });

    // Handle errors
    stream.on('error', (error) => {
      console.error("Blog stream error:", error);
      reject(error);
    });
  });
}


async function streamWithDeepseek(
 chaos: string, 
 outline: OutlineSectionType[], 
 requestState: RequestStateType
) {
 const prompt = blogGeneratorPrompt(chaos, outline);
 const stream = await deepseekAi.chat.completions.create({
   messages: [{ role: "system", content: prompt }],
   model: "deepseek-chat",
   stream: true,
 });

 for await (const chunk of stream) {
   const content = chunk.choices[0]?.delta?.content;
   if (content) {

    if(requestState.status === 'aborted'){
      break;
    }
     requestState.ws.send(JSON.stringify({
       type: 'BLOG_PROGRESS',
       content,
       userId: requestState.userId,
       blogId: requestState.blogId,
       selectedModel: "deepseek"
     }));
   }
 }
}

async function streamWithGPT(
  chaos: string, 
  outline: OutlineSectionType[], 
  requestState: RequestStateType
) {
  const prompt = blogGeneratorPrompt(chaos, outline);
  
  const stream = await openai.chat.completions.create({
    messages: [
      { 
        role: "system", 
        content: "You are a specialized blog content generator that streams content with STATE and NODE delimiters." 
      },
      { role: "user", content: prompt }
    ],
    model: "gpt-4o", 
    stream: true,
    temperature: 0.7,
    max_tokens: 16000,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content && requestState.status !== 'aborted') {
      requestState.ws.send(JSON.stringify({
        type: 'BLOG_PROGRESS',
        content,
        userId: requestState.userId,
        blogId: requestState.blogId,
        selectedModel: "gpt" 
      }));
    }
  }
}

interface StartBlogStreamProps {
outline: OutlineSectionType[]
requestState: RequestStateType
selectedModel: ModelsType
userId: string
blogId: string
}

async function getBlogWithChaos(blogId: string, userId: string) {
  // First, get blog data
  const blogData = await getBlogById(blogId, userId);
  
  if (!blogData) {
      throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog not found'
      });
  }

  if (!blogData.chaos_path) {
      // This should never happen in normal flow
      // If it does, it indicates data corruption
      throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Blog data corrupted - missing chaos content reference'
      });
  }

  try {
      const chaos = await fetchChaosFromR2({ chaosPath: blogData.chaos_path });
      return { ...blogData, chaos };
  } catch (error) {
      // Convert R2 errors to appropriate TRPC errors
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve blog content',
          cause: error
      });
  }
}

export async function startBlogStreaming(props: StartBlogStreamProps) {
  const { outline, requestState, selectedModel, userId, blogId } = props;

  try {

      const blogData = await getBlogWithChaos(blogId, userId);

      requestState.ws.send(JSON.stringify({
          type: "BLOG_START",
          userId,
          blogId,
          selectedModel,
          requestId: requestState.requestId
      }));


      const streamFunction = {
          claude: streamWithClaude,
          deepseek: streamWithDeepseek,
          gpt: streamWithGPT
      }[selectedModel] ?? streamWithDeepseek;

      await streamFunction(blogData.chaos, outline, requestState);


      requestState.ws.send(JSON.stringify({
          type: 'BLOG_END',
          userId,
          blogId,
          selectedModel,
          requestId: requestState.requestId
      }));

  } catch (error) {
      console.error("Error in blog streaming:", error);
      
      // Determine error type and send appropriate message
      const errorMessage = error instanceof TRPCError 
          ? error.message
          : 'An unexpected error occurred while processing your blog';

      requestState.ws.send(JSON.stringify({
          type: 'BLOG_ERROR',
          userId,
          blogId,
          selectedModel,
          requestId: requestState.requestId,
          error: errorMessage
      }));

      // Re-throw for upstream handling
      throw error;
  }
}