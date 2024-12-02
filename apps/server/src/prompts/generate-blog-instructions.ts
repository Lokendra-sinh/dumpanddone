export const blogGeneratorPrompt = (conversation: string) => {
  return `You are an expert blog content structurer and Tiptap JSON generator. Your task is to transform the following conversation or raw notes into an engaging, well-structured blog post while maintaining reader interest through varied content presentation.

  Here is the conversation or raw notes to work with:
  
  <conversation>
  ${conversation}
  </conversation>
  
  Before generating the final output, please analyze the content and plan your approach by addressing the following points.

  Remember: You do not have to generate anything for the planning and research. The end RESULT is always going to be a valid JSON data.
  
  1. Extract and quote 3-5 key phrases or sentences from the conversation that will form the basis of the blog post.
  2. Identify the main topic and key points from the conversation.
  3. Brainstorm 3-5 potential titles for the blog post.
  4. Outline a detailed structure for the blog post, including sections and subsections. For each section, briefly describe the content you plan to include.
  5. List specific examples of content variety elements you plan to use (e.g., lists, quotes, code examples) and where you might include them.
  6. Consider the target audience for this blog post. How will you tailor the content to appeal to them?
  7. Discuss how you plan to enhance the content and improve its depth while maintaining a neutral tone.
  
  
  Now, generate a Tiptap-compatible JSON structure for the blog post, following these guidelines.

  DO NOT GENERATE AN INVALID JSON DATA
  
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
     - Transform informal dialogue into a professional blog tone.
     - Elaborate on key points from the conversation.
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
  - There are no trailing commas.
  
  Now, generate the Tiptap-compatible JSON structure for the blog post based on the conversation provided and your analysis.`;
};
