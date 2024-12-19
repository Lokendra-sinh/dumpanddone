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
   anthropic.messages.stream({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: prompt,
      }
    ],
  }).on('text', (text) => {
    if (text) {
        requestState.ws.send(JSON.stringify({
          type: 'BLOG_CHUNK',
          requestId: requestState.requestId,
          content: text
        }));
      }
  })
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
    stream: true
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      requestState.ws.send(JSON.stringify({
        type: 'BLOG_CHUNK',
        requestId: requestState.requestId,
        content
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
    
    currentChunk += content;
    
    if (currentChunk.includes('\n')) {
      const lines = currentChunk.split('\n');
      currentChunk = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          requestState.ws.send(JSON.stringify({
            type: 'BLOG_CHUNK',
            requestId: requestState.requestId,
            content: line
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
  const { outline, requestState, selectedModel, userId, blogId} = props

  const blogData = await getBlogById(blogId, userId)


  requestState.ws.send(JSON.stringify({
    type: "BLOG_START",
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
    
    // Send completion message
    requestState.ws.send(JSON.stringify({
      type: 'BLOG_COMPLETE',
      requestId: requestState.requestId
    }));
    
  } catch (error) {
    console.error("Error streaming blog content:", error);
    requestState.ws.send(JSON.stringify({
      type: 'ERROR',
      requestId: requestState.requestId,
      message: `Failed to stream blog content: ${error}`
    }));
  }
}

