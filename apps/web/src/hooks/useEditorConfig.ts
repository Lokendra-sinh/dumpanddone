import { CHARACTER_LIMIT } from "../utils/constants";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import CharacterCount from "@tiptap/extension-character-count";
import { all, createLowlight } from "lowlight";
import { mergeAttributes } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

// Custom extensions / nodes
import { highlight } from "@/lib/highlight-extension";
import { LoadingNode } from "@/lib/loading-node";

const lowlight = createLowlight(all);

export const useEditorConfig = () => {
  return {
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        orderedList: {
          HTMLAttributes: {
            style: 'list-style-type: decimal; margin: 0.5rem 1.25rem;',
            class: "list-decimal my-2 px-5",
          },
        },
        bold: {
          HTMLAttributes: {
            style: 'font-weight: bold;',
            class: "font-bold",
          },
        },
        italic: {
          HTMLAttributes: {
            style: 'font-style: italic;',
            class: "italic",
          },
        },
        strike: {
          HTMLAttributes: {
            style: 'text-decoration: line-through;',
            class: "line-through",
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            style: 'border-top: 1px solid rgb(212, 212, 216); margin: 1rem 0;',
            class: "border-t border-zinc-300 my-4",
          },
        },
        hardBreak: {},
        blockquote: {
          HTMLAttributes: {
            style: 'border-left: 4px solid rgb(161, 161, 170); background-color: rgb(244, 244, 245); margin: 1rem 0; padding: 0.5rem 1rem; border-radius: 0.25rem;',
            class: "border-l-4 border-zinc-400 bg-zinc-100 my-4 py-2 px-4 rounded",
          },
        },
        bulletList: {
          HTMLAttributes: {
            style: 'list-style-type: disc; padding-left: 1rem; margin: 0;',
            class: "list-disc px-4 !py-0 !my-0",
          },
        },
        paragraph: {
          HTMLAttributes: {
            style: 'line-height: 1.625; margin: 0.5rem 0; margin-left: 0;',
            class: "leading-relaxed my-2 !ml-0",
          },
        },
      }),

      highlight,
      LoadingNode,
      Underline,

      Heading.configure({ levels: [1, 2, 3] }).extend({
        levels: [1, 2, 3],
        renderHTML({ node, HTMLAttributes }) {
          const level = this.options.levels.includes(node.attrs.level)
            ? node.attrs.level
            : this.options.levels[0];
          const styles = {
            1: 'font-size: 3rem; margin: 1.75rem 0;',
            2: 'font-size: 1.875rem; margin: 1.75rem 0;',
            3: 'font-size: 1.5rem; margin: 1.75rem 0;',
          };
          const classes = {
            1: "text-5xl my-7",
            2: "text-3xl my-7",
            3: "text-2xl my-7",
          };
          return [
            `h${level}`,
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
              class: classes[level],
              style: styles[level],
            }),
            0,
          ];
        },
      }),

      Link.configure({
        HTMLAttributes: {
          style: 'color: rgb(59, 130, 246); text-decoration: underline;',
          class: "text-blue-500 hover:text-blue-600 underline",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),

      Placeholder.configure({
        placeholder: () => "Type / to browse options",
        showOnlyCurrent: true,
        showOnlyWhenEditable: true,
        emptyNodeClass:
          "before:content-[attr(data-placeholder)] before:float-left before:text-gray-400 before:pointer-events-none before:h-0",
        emptyEditorClass: "relative",
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),

      TaskList.configure({
        HTMLAttributes: {
          style: 'margin: 1rem 0; display: flex; flex-direction: column; gap: 0.5rem;',
          class: "not-prose space-y-2 my-4",
        },
      }),

      TaskItem.configure({
        HTMLAttributes: {
          style: 'display: flex; align-items: flex-start; gap: 0.5rem; margin: 0; padding: 0;',
          class: "flex items-start gap-2 !py-0 !my-0",
        },
        nested: true,
      }),

      Image.configure({
        HTMLAttributes: {
          style: 'max-width: 300px; height: auto; display: block; margin: 1rem 0;',
        }
      }),

      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          style: 'background-color: rgb(244, 244, 245); border-radius: 0.25rem; padding: 1rem; font-family: monospace; font-size: 0.875rem; margin: 1rem 0;',
          class: "bg-zinc-100 rounded p-4 font-mono text-sm my-4",
        },
      }),

      CharacterCount.configure({
        limit: CHARACTER_LIMIT,
      }),
    ],

    editorProps: {
      attributes: {
        class: "prose prose-zinc max-w-none focus:outline-none min-h-[200px]",
      },
    },
  };
};
