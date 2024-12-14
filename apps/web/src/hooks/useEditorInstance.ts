import { TiptapDocument } from "@/types/tiptap-blog";
import { useEditorConfig } from "./useEditorConfig";
import { Editor, useEditor } from "@tiptap/react";
import { EditorView } from "prosemirror-view";

type EditorConfigReturn = ReturnType<typeof useEditorConfig>;

export interface EditorHandlers {
  onUpdate?: ({ editor }: { editor: Editor }) => void;
  onSelectionUpdate?: ({ editor }: { editor: Editor }) => void; 
  editorProps?: {
    handleKeyDown?: (view: EditorView, event: KeyboardEvent) => boolean | void;
  };
}

interface UseEditorInstanceProps {
  config: EditorConfigReturn;
  content: TiptapDocument | undefined;
  handlers: EditorHandlers;
}

export const useEditorInstance = (props: UseEditorInstanceProps) => {
  const { config, content, handlers } = props;
  
  return useEditor({
    ...config,
    content,
    onSelectionUpdate: handlers.onSelectionUpdate,
    editorProps: {
      ...config.editorProps,
      ...handlers.editorProps,
    },
  },[content]);
};