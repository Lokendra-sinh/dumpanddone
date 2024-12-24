import { anthropic, deepseekAi, openai } from "..";
import { blogContentUpdatePrompt } from "../prompts/update-blog-instructions";
import { ModelsType, TipTapNodeType, TiptapDocument } from "@dumpanddone/types";
import { RequestStateType } from "../ws/socket";
import { getBlogById } from "../db/queries/blog";

interface SelectionInfo {
  nodes: TipTapNodeType[];      
  selectedText: string;         
  selectionBoundaries: {        
    from: number;
    to: number;
  };
}


const handleStreamChunks = async (
  stream: any,
  requestState: RequestStateType,
  metadata: {
    userId: string;
    blogId: string;
    selectedModel: ModelsType;
  }
) => {
  try {
    for await (const chunk of stream) {
      if (requestState.status === 'aborted') break;
      
      const content = chunk.choices?.[0]?.delta?.content;
      if (!content) continue;
      
      requestState.ws.send(JSON.stringify({
        type: 'EDIT_BLOG_PROGRESS',
        content,
        userId: metadata.userId,
        blogId: metadata.blogId,
        selectedModel: metadata.selectedModel
      }));
    }
  } catch (error) {
    console.error('Stream processing error:', error);
    throw error;
  }
};

async function streamWithClaude(
  userPrompt: string,
  selectionContext: SelectionInfo,
  blogData: TiptapDocument,
  requestState: RequestStateType
) {
  const prompt = blogContentUpdatePrompt(
    userPrompt,
    selectionContext.nodes,
    blogData,
    "claude"
  );
  
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
          type: 'EDIT_BLOG_PROGRESS',
          content: text,
          userId: requestState.userId,
          blogId: requestState.blogId,
          selectedModel: "claude"
        }));
      }
    });

    // Handle stream completion
    stream.on('end', () => {
      console.log("Edit stream completed");
      resolve(undefined);
    });

    // Handle errors
    stream.on('error', (error) => {
      console.error("Edit stream error:", error);
      reject(error);
    });
  });
}

async function streamWithDeepseek(
  userPrompt: string,
  selectionContext: SelectionInfo,
  blogData: TiptapDocument,
  requestState: RequestStateType
) {
  const prompt = blogContentUpdatePrompt(
    userPrompt,
    selectionContext.nodes,
    blogData,
    "deepseek"
  );

  const stream = await deepseekAi.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: "deepseek-chat",
    stream: true,
  });

  await handleStreamChunks(stream, requestState, {
    userId: requestState.userId,
    blogId: requestState.blogId,
    selectedModel: "deepseek"
  });
}

async function streamWithGPT(
  userPrompt: string,
  selectionContext: SelectionInfo,
  blogData: TiptapDocument,
  requestState: RequestStateType
) {
  const prompt = blogContentUpdatePrompt(
    userPrompt,
    selectionContext.nodes,
    blogData,
    "gpt"
  );

  const stream = await openai.chat.completions.create({
    messages: [
      { 
        role: "system", 
        content: "You are a specialized content updater that streams updates with STATE and NODE delimiters." 
      },
      { role: "user", content: prompt }
    ],
    model: "gpt-4",
    stream: true,
    temperature: 0.7,
    max_tokens: 8000,
  });

  await handleStreamChunks(stream, requestState, {
    userId: requestState.userId,
    blogId: requestState.blogId,
    selectedModel: "gpt"
  });
}

interface StartEditContentStream {
  userPrompt: string;
  selectionContext: SelectionInfo;
  requestState: RequestStateType;
  selectedModel: ModelsType;
  userId: string;
  blogId: string;
}

export async function startContentEditStreaming(props: StartEditContentStream) {
  const { 
    userPrompt,
    selectionContext, 
    requestState, 
    selectedModel, 
    userId, 
    blogId 
  } = props;

  // Get full blog data for context
  const blogData = await getBlogById(blogId, userId);

  // Signal stream start
  requestState.ws.send(JSON.stringify({
    type: "EDIT_BLOG_START",
    userId,
    blogId,
    selectedModel,
    requestId: requestState.requestId
  }));

  try {
    switch (selectedModel) {
      case "claude":
        await streamWithClaude(userPrompt, selectionContext, blogData.blog, requestState);
        break;
      case "deepseek":
        await streamWithDeepseek(userPrompt, selectionContext, blogData.blog, requestState);
        break;
      case "gpt":
        await streamWithGPT(userPrompt, selectionContext, blogData.blog, requestState);
        break;
      default:
        await streamWithDeepseek(userPrompt, selectionContext, blogData.blog, requestState);
        break;
    }
    
    // Signal stream end
    requestState.ws.send(JSON.stringify({
      type: 'EDIT_BLOG_END',
      userId,
      blogId,
      selectedModel,
      requestId: requestState.requestId
    }));
    
  } catch (error) {
    console.error("Error streaming content update:", error);
    requestState.ws.send(JSON.stringify({
      type: 'EDIT_BLOG_ERROR',
      userId,
      blogId,
      selectedModel,
      error: `Failed to stream content update: ${error}`
    }));
  }
}