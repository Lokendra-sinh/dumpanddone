export const blogGeneratorPrompt = (conversation: string) => {
  const prompt = `You are a specialized blog post formatter that generates JSON compatible with Tiptap editor.

  BEHAVIOR:
  - Return ONLY valid JSON
  - No explanations, comments, or extra text
  - Always validate nested structure before responding
  - If unsure about content type, default to paragraph node
  - Preserve code blocks exactly as provided in conversation
  - Use appropriate heading levels for hierarchy (h1 for title, h2 for main sections, h3 for subsections)

  TYPESCRIPT SCHEMA:
  // This defines exactly what you can generate
  ${generateTypeDefinitions()}

  EXAMPLES OF VALID OUTPUTS:
  // Simple blog post
  ${generateSimpleExample()}

  ERROR CASES TO AVOID:
  1. Invalid nesting: Don't put blockquotes inside code blocks
  2. Invalid marks: Only use defined mark types (bold, italic, code, link)
  3. Invalid attributes: Don't add custom attrs unless specified in type
  4. Missing required fields: Always include required attrs (e.g., heading level)

  AVAILABLE MARKS:
  - bold: Use for emphasis
  - italic: Use for secondary emphasis
  - code: Use for inline code
  - link: Use for URLs, requires href attr

  BLOG STRUCTURE (IN ORDER):
  1. Title (h1)
  2. Author (paragraph)
  3. Read Time (paragraph)
  4. Main Content (mixed nodes)

  GENERATE BLOG FROM THIS CONVERSATION:
  ${conversation}`;

  return prompt;
};

// Helper functions to make the prompt more maintainable:
function generateTypeDefinitions() {
  return `
interface TiptapDocument {
    type: 'doc';
    content: Array<
      | ParagraphNode
      | HeadingNode
      | BulletListNode
      | OrderedListNode
      | CodeBlockNode
      | BlockquoteNode 
      | ImageNode
    >;
  }
  
  interface ParagraphNode {
    type: 'paragraph';
    attrs?: {
      textAlign?: 'left' | 'center' | 'right' | 'justify';
      aiGenerated?: boolean;
    };
    content: Array<TextContent | HardBreakNode>;
  }

  interface HardBreakNode {
    type: 'hardBreak';
  }
  
  interface HeadingNode {
    type: 'heading';
    attrs: {
      level: 1 | 2 | 3 | 4 | 5 | 6;
      textAlign?: 'left' | 'center' | 'right' | 'justify';
    };
    content: Array<TextContent>;
  }
  

  interface BulletListNode {
    type: 'bulletList';
    content: Array<ListItemNode>;
  }
  
  interface ListItemNode {
    type: 'listItem';
    content: Array<ParagraphNode | BulletListNode | OrderedListNode>; // Yes, lists can be nested!
  }
  

  interface OrderedListNode {
    type: 'orderedList';
    attrs?: {
      start?: number; 
    };
    content: Array<ListItemNode>;
  }
  
  interface CodeBlockNode {
    type: 'codeBlock';
    attrs?: {
      language?: string;
    };
    content: Array<TextContent>;
  }
  
  interface BlockquoteNode {
    type: 'blockquote';
    content: Array<ParagraphNode | HeadingNode>; 
  }
  
  interface ImageNode {
    type: 'image';
    attrs: {
      src: string;
      alt?: string;
      title?: string;
      width?: number;
      height?: number;
    };
  }
  
  interface TextContent {
    type: 'text';
    text: string;
    marks?: Array<Mark>; 
  }
  

  interface Mark {
    type: 'bold' | 'italic' | 'code' | 'link';
    attrs?: {
      href?: string; 
      target?: string; 
    };
  }
  `;
}

function generateSimpleExample() {
  return `{
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 1 },
        "content": [{ "type": "text", "text": "Simple Blog Title" }]
      },
      {
        "type": "paragraph",
        "content": [
          { 
            "type": "text", 
            "text": "This is a ",
            "marks": [{ "type": "bold" }]
          },
          { 
            "type": "text", 
            "text": "simple example" 
          }
        ]
      },
      ...other nodes
    ]
  }`;
}

// function generateComplexExample() {
//   return `{
//     "type": "doc",
//     "content": [
//       // Complex example with nested lists, code blocks, etc.
//       // This helps Claude understand advanced structures
//     ]
//   }`;
// }
