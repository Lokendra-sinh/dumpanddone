'use client';

import { withProps } from '@udecode/cn';
import { BasicElementsPlugin } from '@udecode/plate-basic-elements/react';
import {
  BasicMarksPlugin,
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import {
  ParagraphPlugin,
  PlateElement,
  PlateLeaf,
  usePlateEditor,
} from '@udecode/plate-common/react';

// Type definitions for your backend data
interface BackendBlock {
  id: string;
  type: string;
  children: Array<{ text: string; bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean }>;
  message?: string;
  author?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
  // ... any other fields your backend might send
}

interface BlogPost {
  id: string;
  title: string;
  blocks: BackendBlock[];
  // ... other blog post metadata
}

// Function to transform backend data to Plate format
const transformBackendToPlate = (backendData: BlogPost) => {
  return backendData.blocks.map(block => {
    // Create a new object with only the fields Plate needs
    const plateBlock = {
      type: block.type,
      children: block.children,
      // You can preserve your custom fields
      // They won't affect Plate's functionality
      id: block.id,
      message: block.message,
      author: block.author,
      timestamp: block.timestamp,
      metadata: block.metadata,
    };

    return plateBlock;
  });
};

// Example of backend data
const exampleBackendData: BlogPost = {
  id: "post-123",
  title: "My Blog Post",
  blocks: [
    {
      id: "block-1",
      type: "h1",
      children: [{ text: "Basic Editor" }],
      message: "Editor title",
      author: "John Doe",
      timestamp: "2024-03-17T12:00:00Z"
    },
    {
      id: "block-2",
      type: "h2",
      children: [{ text: "Heading 2" }],
      metadata: { importance: "high" }
    },
    {
      id: "block-3",
      type: "blockquote",
      children: [{ text: "This is a blockquote element" }],
      message: "Important quote"
    },
    {
      id: "block-4",
      type: ParagraphPlugin.key,
      children: [
        { text: "Basic marks: " },
        { bold: true, text: "bold" },
        { text: ", " },
        { italic: true, text: "italic" },
        { text: ", " },
        { text: "underline", underline: true },
        { text: ", " },
        { strikethrough: true, text: "strikethrough" },
        { text: "." }
      ],
      metadata: { lastEdited: "2024-03-17T12:00:00Z" }
    }
  ]
};

export const useCreateEditor = () => {
  // Transform backend data to Plate format
  const plateValue = transformBackendToPlate(exampleBackendData);

  return usePlateEditor({
    override: {
      components: {
        [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
        [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
        [ParagraphPlugin.key]: withProps(PlateElement, {
          as: 'p',
          className: 'mb-4',
        }),
        [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
        [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
        blockquote: withProps(PlateElement, {
          as: 'blockquote',
          className: 'mb-4 border-l-4 border-[#d0d7de] pl-4 text-[#636c76]',
        }),
        h1: withProps(PlateElement, {
          as: 'h1',
          className:
            'mb-4 mt-6 text-3xl font-semibold tracking-tight lg:text-4xl',
        }),
        h2: withProps(PlateElement, {
          as: 'h2',
          className: 'mb-4 mt-6 text-2xl font-semibold tracking-tight',
        }),
        h3: withProps(PlateElement, {
          as: 'h3',
          className: 'mb-4 mt-6 text-xl font-semibold tracking-tight',
        }),
      },
    },
    plugins: [BasicElementsPlugin, BasicMarksPlugin],
    value: plateValue,
  });
};

// If you need to access the custom fields later
export const getCustomBlockData = (block: BackendBlock) => {
  return {
    id: block.id,
    message: block.message,
    author: block.author,
    timestamp: block.timestamp,
    metadata: block.metadata,
  };
};