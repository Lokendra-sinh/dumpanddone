import { OutlineSectionType } from "@dumpanddone/types";
type ModelType = "claude" | "deepseek" | "gpt";

const MODEL_CONFIGS = {
  claude: {
    maxTokens: 8192,
    targetTokens: 7000, // Leave some buffer for safety
  },
  deepseek: {
    maxTokens: 4000,
    targetTokens: 3500,
  },
  gpt: {
    maxTokens: 4000,
    targetTokens: 3500,
  },
} as const;

export const blogGeneratorPrompt = (
  chaos: string,
  outline: OutlineSectionType[],
  model: ModelType = "claude"
) => {
  const { targetTokens } = MODEL_CONFIGS[model];
  const avgTokensPerSection = Math.floor(targetTokens / (outline.length + 3));

  return `You are an expert blog content structurer and Tiptap JSON generator. Your task is to transform the raw notes into an engaging, well-structured blog post following a predefined outline while maintaining reader interest through varied content presentation.

  TOKEN MANAGEMENT RULES:
  1. Your total response must not exceed ${targetTokens} tokens
  2. Allocate approximately ${avgTokensPerSection} tokens per section
  3. High priority sections can use up to 50% more tokens
  4. Title, author, and read time should use minimal tokens
  5. If content needs to be trimmed, preserve the most important points
  
  Here is the raw content to work with:
  
  <chaos>
  ${chaos}
  </chaos>

  Here is the outline to follow:
  <outline>
  ${outline
    .map(
      (section) => `
    Section Title: ${section.title}
    Section Description: ${section.description}
    Priority: ${section.isEdited ? "HIGH" : "NORMAL"}
  `
    )
    .join("\n")}
  </outline>

  Key Instructions:
  1. Follow the outline structure precisely. Each section title should become an h2 heading in the final blog.
  2. For sections marked with HIGH priority (isEdited: true), provide more detailed content, examples, and in-depth analysis.
  3. Use the section descriptions as guidelines for what content to include in each section.
  4. Maintain a logical flow between sections while ensuring each section aligns with its outline description.
  5. For each section, incorporate:
     - Relevant content from the chaos text
     - Examples and elaborations that support the section's description
     - Appropriate formatting (lists, quotes, code blocks) based on the content type
  
  Before generating the final output, thouroughly analyze the content and plan your approach by addressing the following points.

  Remember: You do not have to generate anything for the planning and research. The end RESULT is always going to be a valid JSON data.
  
  1. Extract and quote 3-5 key phrases or sentences from the conversation that will form the basis of the blog post.
  2. List specific examples of content variety elements you plan to use (e.g., lists, quotes, code examples) and where you might include them.
  3. Consider the target audience for this blog post. How will you tailor the content to appeal to them?
  4. Enhance the content and improve its depth while maintaining a neutral tone.
  
  
  Now, generate a Tiptap-compatible JSON structure for the blog post, following below guidelines and above outline.

  DO NOT GENERATE AN INVALID JSON DATA. MAKE SURE TO USE COMPLETE DATA FROM CHAOS WHILE GENERATING THE CONTEN FOR EACH SECTION!
  
  1. Content Variety:
     - Alternate between paragraphs, lists, quotes, and code examples.
     - Break down long paragraphs into digestible chunks.
     - Use headings to create a clear content hierarchy.
     - Include relevant blockquotes for emphasis.
     - Add code examples when discussing technical concepts.
  
  2. Content Flow:
     - Create smooth transitions between sections.
     - Ensure logical progression of ideas.
     - Use subheadings (h2, h3) to organize related content.
     - Group similar points into lists.
     - Highlight key takeaways in blockquotes.
  
  3. Content Enhancement:
     - For tone - Maintain natural user tone same as we have in the chaos.
     - Make use of the entire content in the chaos and only ignore irrelevant parts.
     - Elaborate on key points from the chaos.
     - Add relevant examples and explanations.
     - Use formatting (bold, italic) to emphasize important points.
     - Include links to reference materials when mentioned.
  
  4. Document Structure:
     - Start with an engaging title (h1).
     - Include author attribution.
     - Add estimated read time.
     - Organize content into clear sections.
     - End with a conclusion or call to action.
  
  Technical Requirements for Tiptap JSON:
  - Output a single, valid JSON object.
  - Make sure third node is the read time node
  - Use only double quotes (") for strings and property names.
  - No comments, explanations, or extra characters outside the JSON structure.
  - No string concatenation, template literals, or escaped newlines in the structure.
  - Include all required attributes for each node type.
  - Adhere to the following document structure and node types:
  
  {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 1 },
        "content": [{ "type": "text", "text": "Title" }]
      },
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "Content" }]
      },
      {
        "type": "bulletList",
        "content": [
          {
            "type": "listItem",
            "content": [
              {
                "type": "paragraph",
                "content": [{ "type": "text", "text": "List item" }]
              }
            ]
          }
        ]
      },
      {
        "type": "blockquote",
        "content": [
          {
            "type": "paragraph",
            "content": [{ "type": "text", "text": "Quote" }]
          }
        ]
      },
      {
        "type": "codeBlock",
        "attrs": { "language": "javascript" },
        "content": [{ "type": "text", "text": "console.log('Hello, World!');" }]
      }
    ]
  }
  
  Available marks: bold, italic, code, and link (with href and target attributes).
  
  Ensure that:
  - Every node has "type" and "content" properties.
  - Text nodes have "type": "text" and "text": string.
  - Headings have "level" in attrs.
  - Lists contain only listItem nodes.
  - ListItems contain only paragraph nodes.
  - There are no empty content arrays.
  - There are no null or undefined values.
  - There are no trailing comma.

  NOTE: Maintain the user tone as analyzed form the chaos and make use of the entire chaos content for blog generation.
  
  Now, generate the Tiptap-compatible JSON structure for the blog post based on the conversation provided and your analysis.`;
};
