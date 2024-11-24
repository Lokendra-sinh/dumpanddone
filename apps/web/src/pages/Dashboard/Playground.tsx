import { useDashboard } from '@/providers/dashboard-provider';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight'

const lowlight = createLowlight(all)


// Enhanced dummy content with various elements
// const dummyContent = {
//   type: 'doc',
//   content: [
//     {
//       type: 'heading',
//       attrs: { 
//         level: 1,
//         textAlign: 'center'
//       },
//       content: [{ type: 'text', text: 'Rich Text Editor Example' }]
//     },
//     {
//       type: 'paragraph',
//       attrs: { textAlign: 'center' },
//       content: [
//         { 
//           type: 'text', 
//           marks: [{ type: 'italic' }],
//           text: 'A comprehensive example with various text formatting options' 
//         }
//       ]
//     },
//     {
//       type: 'heading',
//       attrs: { level: 2 },
//       content: [{ type: 'text', text: '1. Ordered Lists' }]
//     },
//     {
//       type: 'orderedList',
//       content: [
//         {
//           type: 'listItem',
//           content: [{
//             type: 'paragraph',
//             content: [
//               { type: 'text', text: 'Main point one ' },
//               { 
//                 type: 'text',
//                 marks: [{ type: 'bold' }], 
//                 text: 'with bold text' 
//               }
//             ]
//           }]
//         },
//         {
//           type: 'listItem',
//           content: [{
//             type: 'paragraph',
//             content: [
//               { type: 'text', text: 'Main point two ' },
//               { 
//                 type: 'text',
//                 marks: [{ type: 'italic' }],
//                 text: 'with italic text' 
//               }
//             ]
//           }]
//         }
//       ]
//     },
//     {
//       type: 'heading',
//       attrs: { level: 2 },
//       content: [{ type: 'text', text: '2. Task List' }]
//     },
//     {
//       type: 'taskList',
//       content: [
//         {
//           type: 'taskItem',
//           attrs: { checked: true },
//           content: [{ type: 'text', text: 'Completed task' }]
//         },
//         {
//           type: 'taskItem',
//           attrs: { checked: false },
//           content: [{ type: 'text', text: 'Pending task' }]
//         }
//       ]
//     },
//     {
//       type: 'heading',
//       attrs: { level: 2 },
//       content: [{ type: 'text', text: '3. Code Block' }]
//     },
//     {
//       type: 'codeBlock',
//       attrs: { language: 'javascript' },
//       content: [{
//         type: 'text',
//         text: 'const greeting = "Hello, World!";\nconsole.log(greeting);'
//       }]
//     },
//     {
//       type: 'blockquote',
//       content: [{
//         type: 'paragraph',
//         content: [{ 
//           type: 'text',
//           text: 'This is a blockquote with proper styling and spacing' 
//         }]
//       }]
//     }
//   ]
// };

export const Playground = () => {
  const { blogData } = useDashboard();

  console.log("BLOG DATA is", blogData);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Ordered list configuration
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal space-y-2 my-4',
          }
        },
        // Heading configuration
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: "font-medium my-6 text-2xl",
          }
        },
        // Blockquote configuration
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-zinc-400 bg-zinc-100 my-6 py-2 px-4 rounded",
          }
        },
        // Bullet list configuration
        bulletList: {
          HTMLAttributes: {
            class: "list-disc space-y-2 my-4",
          }
        },
        // Paragraph configuration
        paragraph: {
          HTMLAttributes: {
            class: "my-2 leading-relaxed",
          }
        },
        // Code block configuration
        codeBlock: {
          HTMLAttributes: {
            class: "bg-zinc-100 rounded p-4 font-mono text-sm my-4",
          }
        }
      }),
      // Additional extensions
      Placeholder.configure({
        placeholder: 'Start writing...',
        emptyEditorClass: 'text-gray-400 before:content-[attr(data-placeholder)] before:float-left before:pointer-events-none',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose space-y-2 my-4',
        }
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
        nested: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-4',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-zinc-100 rounded p-4 font-mono text-sm my-4',
        },
      }),
    ],
    content: blogData,
    onUpdate: ({ editor }) => {
      console.log('Current HTML:', editor.getHTML());
      console.log('Current JSON:', editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-zinc max-w-none focus:outline-none min-h-[200px]',
      },
    },
  });

  return (
    <div className="w-full outline-none ">

        <EditorContent editor={editor} />

    </div>
  );
};

export default Playground;