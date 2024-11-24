import { anthropic } from "..";
import { blogGeneratorPrompt } from "../prompts/generate-blog-instructions"


export async function generateBlogContent(conversation: string) {
    
    const prompt = blogGeneratorPrompt(conversation)

    console.log("Generating the blog");

    try {
      const message = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });
  
      // Validate JSON structure before returning
      try {
        const content = message.content[0];
  
        if (content.type === "text") {
          const parsedContent = JSON.parse(content.text);
          console.log("PARSED Content is", parsedContent);
          return parsedContent;
        } else {
          throw new Error("Unexpected content type from Claude");
        }
      } catch (error) {
        console.error("Error calling Claude API:", error);
        throw new Error("Failed to generate blog content");
      }
    } catch (error) {
      console.log("Error while initalizing claude is", error);
    }
  }