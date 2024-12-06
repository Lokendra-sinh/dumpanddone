

interface TiptapDocument {
  type: "doc";
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
  type: "paragraph";
  attrs?: {
    textAlign?: "left" | "center" | "right" | "justify";
    aiGenerated?: boolean;
  };
  content: Array<TextContent | HardBreakNode>;
}

interface HardBreakNode {
  type: "hardBreak";
}

interface HeadingNode {
  type: "heading";
  attrs: {
    level: 1 | 2 | 3;
    textAlign?: "left" | "center" | "right" | "justify";
  };
  content: Array<TextContent>;
}

interface BulletListNode {
  type: "bulletList";
  content: Array<ListItemNode>;
}

interface ListItemNode {
  type: "listItem";
  content: Array<ParagraphNode | BulletListNode | OrderedListNode>; // Yes, lists can be nested!
}

interface OrderedListNode {
  type: "orderedList";
  attrs?: {
    start?: number;
  };
  content: Array<ListItemNode>;
}

interface CodeBlockNode {
  type: "codeBlock";
  attrs?: {
    language?: string;
  };
  content: Array<TextContent>;
}

interface BlockquoteNode {
  type: "blockquote";
  content: Array<ParagraphNode | HeadingNode>;
}

interface ImageNode {
  type: "image";
  attrs: {
    src: string;
    alt?: string;
    title?: string;
    width?: number;
    height?: number;
  };
}

interface TextContent {
  type: "text";
  text: string;
  marks?: Array<Mark>;
}

interface Mark {
  type: "bold" | "italic" | "code" | "link";
  attrs?: {
    href?: string;
    target?: string;
  };
}


export {
  TiptapDocument,
  ParagraphNode,
  HardBreakNode,
  HeadingNode,
  BulletListNode,
  ListItemNode,
  CodeBlockNode,
  BlockquoteNode,
  TextContent,
  Mark,
  ImageNode,
  OrderedListNode,
};
