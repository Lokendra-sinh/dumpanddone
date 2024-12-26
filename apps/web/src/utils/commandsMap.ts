import { Editor } from "@tiptap/react";

type EditorCommand = (editor: Editor, ...args: any[]) => boolean;

export const commandsMap = new Map<string, EditorCommand>([
  // Heading Commands
  ["heading-1", (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run()],
  ["heading-2", (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run()],
  ["heading-3", (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run()],

  // Text Formatting
  ["bold", (editor) => editor.chain().focus().toggleBold().run()],
  ["italic", (editor) => editor.chain().focus().toggleItalic().run()],
  ["underline", (editor) => editor.chain().focus().toggleUnderline().run()],
  ["strikethrough", (editor) => editor.chain().focus().toggleStrike().run()],
  ["code", (editor) => editor.chain().focus().toggleCode().run()],

  // Text Alignment
  ["align-left", (editor) => editor.chain().focus().setTextAlign("left").run()],
  ["align-center", (editor) => editor.chain().focus().setTextAlign("center").run()],
  ["align-right", (editor) => editor.chain().focus().setTextAlign("right").run()],
  ["align-justify", (editor) => editor.chain().focus().setTextAlign("justify").run()],

  // List Commands
  ["bullet-list", (editor) => editor.chain().focus().toggleBulletList().run()],
  ["numbered-list", (editor) => editor.chain().focus().toggleOrderedList().run()],

  // Special Elements
  ["link", (editor) => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return false;
    if (url === '') {
      return editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }

    return editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }],

  ["image", (editor, source?: string) => {
    // If source is provided (from file upload or URL), use it directly
    if (source) {
      return editor.chain().focus().setImage({ src: source }).run();
    }

    // Default prompt behavior for when no source is provided
    const url = window.prompt('Image URL');
    if (url === null) return false;
    return editor.chain().focus().setImage({ src: url }).run();
  }],

  // Loading Node (Custom)
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

  // Block Transformations
  ["blockquote", (editor) => editor.chain().focus().toggleBlockquote().run()],
  ["codeBlock", (editor) => editor.chain().focus().toggleCodeBlock().run()],

  // Horizontal Rules
  ["horizontalRule", (editor) => editor.chain().focus().setHorizontalRule().run()],
  ["hardBreak", (editor) => editor.chain().focus().setHardBreak().run()],

  // History Commands
  ["undo", (editor) => editor.chain().focus().undo().run()],
  ["redo", (editor) => editor.chain().focus().redo().run()],

  // Task List
  ["task", (editor) => editor.chain().focus().toggleTaskList().run()]
]);