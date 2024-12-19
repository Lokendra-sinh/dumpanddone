import { Editor } from "@tiptap/react";

type EditorCommand = (editor: Editor) => boolean;

export const commandsMap = new Map<string, EditorCommand>([
  // Heading Commands
  ["h1", (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run()],
  ["h2", (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run()],
  ["h3", (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run()],

  ["loading", (editor) => {
    
    return editor
      .chain()
      .focus()
      .deleteSelection()
      .insertContent({
        type: 'loadingNode',
        attrs: { message: 'Loading...' }
      })
      .run();
  }],

  // List Variations
  ["bullet", (editor) => editor.commands.toggleBulletList()],
  ["ordered", (editor) => editor.chain().focus().toggleOrderedList().run()],
  ["task", (editor) => editor.commands.toggleTaskList()],

  // Block Transformations
  ["blockquote", (editor) => editor.commands.toggleBlockquote()],
  ["codeBlock", (editor) => editor.commands.toggleCodeBlock()],

  // Text Formatting
  ["bold", (editor) => editor.commands.toggleBold()],
  ["italic", (editor) => editor.commands.toggleItalic()],
  ["strike", (editor) => editor.commands.toggleStrike()],
  ["code", (editor) => editor.commands.toggleCode()],

  // Text Alignment
  ["left", (editor) => editor.commands.setTextAlign("left")],
  ["center", (editor) => editor.commands.setTextAlign("center")],
  ["right", (editor) => editor.commands.setTextAlign("right")],
  ["justify", (editor) => editor.commands.setTextAlign("justify")],

  // Special Blocks
  ["horizontalRule", (editor) => editor.commands.setHorizontalRule()],
  ["hardBreak", (editor) => editor.commands.setHardBreak()],

  //   // List Indentation
  //   ['indent', (editor) => editor.commands.indent()],
  //   ['outdent', (editor) => editor.commands.outdent()],

  // Undo/Redo
  ["undo", (editor) => editor.commands.undo()],
  ["redo", (editor) => editor.commands.redo()],
]);
