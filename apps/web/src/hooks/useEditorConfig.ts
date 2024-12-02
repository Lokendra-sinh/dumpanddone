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

const lowlight = createLowlight(all);

export const useEditorConfig = () => {
  return {
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        // orderedList: false,
        // Ordered list configuration
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal my-2 px-5",
          },
        },

        bold: {
          HTMLAttributes: {
            class: "font-bold",
          },
        },
        italic: {
          HTMLAttributes: {
            class: "italic",
          },
        },
        strike: {
          HTMLAttributes: {
            class: "line-through",
          },
        },
        // code: {
        //   HTMLAttributes: {
        //     class: "bg-zinc-100 rounded px-1 py-0.5 font-mono text-sm",
        //   },
        // },

        horizontalRule: {
          HTMLAttributes: {
            class: "border-t border-zinc-300 my-4",
          },
        },

        // Hard break doesn't need specific styling as it's just a <br>
        hardBreak: {},

        // Blockquote configuration
        blockquote: {
          HTMLAttributes: {
            class:
              "border-l-4 border-zinc-400 bg-zinc-100 my-6 py-2 px-4 rounded",
          },
        },
        // Bullet list configuration
        bulletList: {
          HTMLAttributes: {
            class: "list-disc px-4",
          },
        },
        // Paragraph configuration
        paragraph: {
          HTMLAttributes: {
            class: "leading-relaxed",
          },
        },
        // Code block configuration
        // codeBlock: {
        //   HTMLAttributes: {
        //     class: "bg-zinc-100 rounded p-4 font-mono text-sm my-4",
        //   },
        // },
      }),
      // Additional extensions
      Heading.configure({ levels: [1, 2, 3] }).extend({
        levels: [1, 2, 3],
        renderHTML({ node, HTMLAttributes }) {
          const level = this.options.levels.includes(node.attrs.level)
            ? node.attrs.level
            : this.options.levels[0];
          const classes = {
            1: "text-4xl my-8",
            2: "text-2xl my-6",
            3: "text-xl my-4",
          };
          return [
            `h${level}`,
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
              class: `${classes[level]}`,
            }),
            0,
          ];
        },
      }),
      Link.configure({
        HTMLAttributes: {
          class: "text-blue-500 hover:text-blue-600 underline",
          // Optional: Make external links open in new tab
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({
        placeholder: () => "Type / to browse options",
        showOnlyCurrent: true,
        showOnlyWhenEditable: true,
        // We need both classes!
        emptyNodeClass:
          "before:content-[attr(data-placeholder)] before:float-left before:text-gray-400 before:pointer-events-none before:h-0",
        emptyEditorClass: "relative", // Just for positioning context
      }),

      // OrderedList.configure({
      //   HTMLAttributes: {
      //     class: "text-base text-red-400"
      //   }
      // }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "not-prose space-y-2 my-4",
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: "flex items-start gap-2",
        },
        nested: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full my-4",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
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
