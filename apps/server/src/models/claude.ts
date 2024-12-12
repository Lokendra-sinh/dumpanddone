import { text } from "drizzle-orm/pg-core";
import { anthropic, deepseekAi, openai } from "..";
import { blogGeneratorPrompt } from "../prompts/generate-blog-instructions";
import { ModelsType, OutlineSectionType } from "@dumpanddone/types";
import { cleanAndValidateJson } from "../utils/clean-and-validate-json";
import { validateTiptapStructure } from "../utils/validate-tiptap-structure";




async function generateWithClaude(chaos: string, outline: OutlineSectionType[]) {
  const prompt = blogGeneratorPrompt(chaos, outline);
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

// DeepSeek-specific blog generation
async function generateWithDeepseek(chaos: string, outline: OutlineSectionType[]) {
  const prompt = blogGeneratorPrompt(chaos, outline);
  const response = await deepseekAi.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: "deepseek-chat",
    response_format: {
      type: "json_object",
    },
  });

  return response.choices[0].message.content;
}

// OpenAI GPT-specific blog generation
async function generateWithGPT(chaos: string, outline: OutlineSectionType[]) {
  const prompt = blogGeneratorPrompt(chaos, outline);
  const response = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a specialized blog content generator that outputs only valid Tiptap JSON." },
      { role: "user", content: prompt }
    ],
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 8000,
  });

  return response.choices[0].message.content;
}

// Main blog generation function
export async function generateBlogContent(
  chaos: string, 
  outline: OutlineSectionType[],
  model: ModelsType
) {
  try {
    // Generate content based on selected model
    let rawContent;
    switch (model) {
      case "claude":
        rawContent = await generateWithClaude(chaos, outline);
        break;
      case "deepseek":
        rawContent = await generateWithDeepseek(chaos, outline);
        break;
      case "gpt":
        rawContent = await generateWithGPT(chaos, outline);
        break;
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    console.log("RAW CONTENT is", rawContent);

    // Clean and validate JSON structure
    const cleanedJson = cleanAndValidateJson(rawContent);
    const parsedContent = JSON.parse(cleanedJson);

    // Validate Tiptap-specific structure
    validateTiptapStructure(parsedContent);

    return parsedContent;
  } catch (error) {
    console.error("Error generating blog content:", error);
    throw new Error(`Failed to generate blog content with ${model}: ${error}`);
  }
}

