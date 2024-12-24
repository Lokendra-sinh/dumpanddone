import { anthropic, deepseekAi, openai } from "..";
import { blogGeneratorPrompt } from "../prompts/generate-blog-instructions";
import { ModelsType, OutlineSectionType } from "@dumpanddone/types";
import { RequestStateType } from "../ws/socket";
import { getBlogById } from "../db/queries/blog";

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
      console.log("Blog stream completed");
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
   model: "gpt-4",
   stream: true,
   temperature: 0.7,
   max_tokens: 8000,
 });

 let currentChunk = '';
 for await (const chunk of stream) {
   const content = chunk.choices[0]?.delta?.content || '';
   if (!content) continue;

   if(requestState.status === 'aborted'){
    break;
  }
   
   currentChunk += content;
   
   if (currentChunk.includes('\n')) {
     const lines = currentChunk.split('\n');
     currentChunk = lines.pop() || '';
     
     for (const line of lines) {
       if (line.trim()) {
         requestState.ws.send(JSON.stringify({
           type: 'BLOG_PROGRESS',
           content: line,
           userId: requestState.userId,
           blogId: requestState.blogId,
           selectedModel: "gpt" 
         }));
       }
     }
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

export async function startBlogStreaming(props: StartBlogStreamProps) {
 const { outline, requestState, selectedModel, userId, blogId } = props

 const blogData = await getBlogById(blogId, userId)


 requestState.ws.send(JSON.stringify({
   type: "BLOG_START",
   userId,
   blogId,
   selectedModel,
   requestId: requestState.requestId
 }))


 try {
   switch (selectedModel) {
     case "claude":
       await streamWithClaude(blogData.chaos, outline, requestState);
       break;
     case "deepseek":
       await streamWithDeepseek(blogData.chaos, outline, requestState);
       break;
     case "gpt":
       await streamWithGPT(blogData.chaos, outline, requestState);
       break;
     default:
       await streamWithDeepseek(blogData.chaos, outline, requestState);
       break;
   }
   
   requestState.ws.send(JSON.stringify({
     type: 'BLOG_END',
     userId,
     blogId,
     selectedModel,
     requestId: requestState.requestId
   }));
   
 } catch (error) {
   console.error("Error streaming blog content:", error);
   requestState.ws.send(JSON.stringify({
     type: 'BLOG_ERROR',
     userId,
     blogId,
     selectedModel,
     error: `Failed to stream blog content: ${error}`
   }));
 }
}