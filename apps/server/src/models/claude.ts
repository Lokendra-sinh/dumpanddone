import { text } from "drizzle-orm/pg-core";
import { anthropic, openai } from "..";
import { blogGeneratorPrompt } from "../prompts/generate-blog-instructions";

// Comprehensive JSON cleaning and validation
const cleanAndValidateJson = (content: any): string => {
  try {
    let jsonStr = content;

    // Handle the case where content is wrapped in a text object
    if (typeof content === "object" && content.type === "text") {
      // Get the text property which contains our actual JSON
      jsonStr = content.text;
    }

    // If the string contains concatenation (like '\n' + '...'), join it
    if (typeof jsonStr === "string" && jsonStr.includes("' +\n")) {
      // Split by concatenation operator and join
      jsonStr = jsonStr
        .split(/'\s*\+\s*'/) // Split on ' + '
        .join("") // Join the parts
        .replace(/^\s*'|'\s*$/g, ""); // Remove outer quotes
    }

    // At this point we should have a clean JSON string
    // Remove any leading/trailing whitespace
    jsonStr = jsonStr.trim();

    // Ensure we have proper JSON structure
    if (!jsonStr.startsWith("{")) jsonStr = "{" + jsonStr;
    if (!jsonStr.endsWith("}")) jsonStr += "}";

    // Validate by parsing
    const parsed = JSON.parse(jsonStr);

    // Ensure required structure
    if (!parsed.type) parsed.type = "doc";
    if (!parsed.content) parsed.content = [];

    // Return pretty-printed JSON
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    console.error("Failed to clean JSON:", e);
    throw new Error(`JSON validation failed: ${e}`);
  }
};

// Tiptap-specific structure validation
const validateTiptapStructure = (json: any): void => {
  // Validate root structure
  if (!json.type || json.type !== "doc") {
    throw new Error("Invalid root structure: missing or invalid type");
  }

  if (!Array.isArray(json.content)) {
    throw new Error("Invalid root structure: content must be an array");
  }

  // Validate minimum content requirements
  if (json.content.length < 3) {
    throw new Error("Document must have at least title, author, and read time");
  }

  // Validate specific node types
  const validateNode = (node: any, path = "") => {
    if (!node.type) {
      throw new Error(`Missing type at ${path}`);
    }

    switch (node.type) {
      case "heading":
        if (
          !node.attrs?.level ||
          ![1, 2, 3, 4, 5, 6].includes(node.attrs.level)
        ) {
          throw new Error(`Invalid heading level at ${path}`);
        }
        break;
      case "text":
        if (typeof node.text !== "string") {
          throw new Error(`Invalid text content at ${path}`);
        }
        break;
      case "paragraph":
        if (!Array.isArray(node.content)) {
          throw new Error(`Invalid paragraph content at ${path}`);
        }
        break;
      case "bulletList":
      case "orderedList":
        if (!Array.isArray(node.content)) {
          throw new Error(`Invalid list content at ${path}`);
        }
        break;
      case "listItem":
        if (!Array.isArray(node.content)) {
          throw new Error(`Invalid list item content at ${path}`);
        }
        break;
      case "blockquote":
        if (!Array.isArray(node.content)) {
          throw new Error(`Invalid blockquote content at ${path}`);
        }
        break;
    }

    // Recursively validate content
    if (Array.isArray(node.content)) {
      node.content.forEach((child: any, index: number) => {
        validateNode(child, `${path}[${index}]`);
      });
    }

    // Validate marks
    if (Array.isArray(node.marks)) {
      node.marks.forEach((mark: any, index: number) => {
        if (!["bold", "italic", "code", "link"].includes(mark.type)) {
          throw new Error(`Invalid mark type at ${path}.marks[${index}]`);
        }
        if (mark.type === "link" && !mark.attrs?.href) {
          throw new Error(
            `Missing href in link mark at ${path}.marks[${index}]`,
          );
        }
      });
    }
  };

  // Validate document structure
  const [title, author, readTime, ...rest] = json.content;

  if (title.type !== "heading" || title.attrs?.level !== 1) {
    throw new Error("First node must be h1 title");
  }

  if (author.type !== "paragraph") {
    throw new Error("Second node must be author paragraph");
  }

  if (readTime.type !== "paragraph") {
    throw new Error("Third node must be read time");
  }

  // Validate all nodes recursively
  json.content.forEach((node: any, index: number) => {
    validateNode(node, `content[${index}]`);
  });
};

export async function generateBlogContent(conversation: string) {
  const prompt = blogGeneratorPrompt(conversation);
  try {
    // const message = await anthropic.messages.create({
    //   model: "claude-3-5-sonnet-20241022",
    //   max_tokens: 8192,
    //   messages: [
    //     {
    //       "role": "user",
    //       "content": blogGeneratorPrompt(prompt),
    //     },
    //     {
    //       "role": "assistant",
    //       "content": "Here is the JSON requested:\n{"
    //   }
    //   ],
    // });

    const message = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "deepseek-chat",
      response_format: {
        type: "json_object",
      },
    });

    const content = message.choices[0].message.content;

    console.log("RAW CONTENT is", content);

    // if (content!. !== "text") {
    //   throw new Error("Unexpected content type from Claude");
    // }

    // Clean and validate JSON structure
    const cleanedJson = cleanAndValidateJson(content);
    const parsedContent = JSON.parse(cleanedJson);

    // Validate Tiptap-specific structure
    validateTiptapStructure(parsedContent);

    return parsedContent;
  } catch (error) {
    console.error("Error generating blog content:", error);
    throw new Error("Failed to generate blog content");
  }
}

// Export validation functions for testing
// export const _test = {
//   cleanAndValidateJson,
//   validateTiptapStructure
// };
