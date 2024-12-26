import { useCustomEditor } from '@/providers/playground-provider';
import { EditorContent } from '@tiptap/react';

const Settings = () => {
  const { editor } = useCustomEditor()
  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-black">TipTap Spacing Test</h1>
      
      <div className="border rounded-lg p-6 bg-white">
        <div className="editor-wrapper text-black">
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2 text-black">Generated HTML:</h2>
        <pre className="whitespace-pre-wrap text-sm text-black">
          {editor?.getHTML()}
        </pre>
      </div>
    </div>
  );
};

export default Settings