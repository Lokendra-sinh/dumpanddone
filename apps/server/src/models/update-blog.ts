import { ModelsType, TipTapContentType, TiptapDocument } from "@dumpanddone/types";
import { anthropic, deepseekAi, openai } from "..";
import { TRPCError } from "@trpc/server";
import { blogContentUpdatePrompt } from "../prompts/update-blog-instructions";
import { cleanAndValidateJson } from "../utils/clean-and-validate-json";
import { validateTiptapStructure } from "../utils/validate-tiptap-structure";

interface UpdateBlogType {
    selectedContent: TipTapContentType;
    userQuery: string;
  blogContent: TiptapDocument;
  model: ModelsType;
}

// Claude-specific content update
async function updateWithClaude(
  userQuery: string,
  selectedContent: TipTapContentType,
  blogData: TiptapDocument
) {
  const prompt = blogContentUpdatePrompt(userQuery, selectedContent, blogData);
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: prompt,
      },
      {
        role: "assistant",
        content: "Here is the JSON requested:\n{"
      }
    ],
  });

  const content = message.content[0];
  return content;
}

// DeepSeek-specific content update
async function updateWithDeepseek(
  userQuery: string,
  selectedContent: TipTapContentType,
  blogData: TiptapDocument
) {
  const prompt = blogContentUpdatePrompt(userQuery, selectedContent, blogData);
  const response = await deepseekAi.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: "deepseek-chat",
    response_format: {
      type: "json_object",
    },
  });

  return response.choices[0].message.content;
}

// OpenAI GPT-specific content update
async function updateWithGPT(
  userQuery: string,
  selectedContent: TipTapContentType,
  blogData: TiptapDocument
) {
  const prompt = blogContentUpdatePrompt(userQuery, selectedContent, blogData);
  const response = await openai.chat.completions.create({
    messages: [
      { 
        role: "system", 
        content: "You are a specialized blog content updater that outputs only valid Tiptap JSON for the selected portion of content." 
      },
      { role: "user", content: prompt }
    ],
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 8000,
  });

  return response.choices[0].message.content;
}

// Main blog update function
export async function updateBlogContent({
  blogContent,
  selectedContent,
  userQuery,
  model
}: UpdateBlogType): Promise<TipTapContentType> {
  try {

    let rawContent;
    switch (model) {
      case "claude":
        rawContent = await updateWithClaude(userQuery, selectedContent, blogContent);
        break;
      case "deepseek":
        rawContent = await updateWithDeepseek(userQuery, selectedContent, blogContent);
        break;
      case "gpt":
        rawContent = await updateWithGPT(userQuery, selectedContent, blogContent);
        break;
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    console.log("RAW UPDATE CONTENT:", rawContent);

    // Clean and validate JSON structure
    const cleanedJson = cleanAndValidateJson(rawContent);
    const parsedContent = JSON.parse(cleanedJson);

    // Validate Tiptap-specific structure
    // validateTiptapStructure(parsedContent);

    return parsedContent;
  } catch (error) {
    console.error("Error updating blog content:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to update blog content with ${model}: ${error}`,
    });
  }
}