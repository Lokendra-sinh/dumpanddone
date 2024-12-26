import { Editor, EditorContent } from "@tiptap/react";
import { CardContent } from "@dumpanddone/ui";
import { memo, useCallback, useEffect, useRef } from "react";
import { CHARACTER_LIMIT } from "@/utils/constants";
import { useCustomEditor, useSelection } from "@/providers/playground-provider";
import { EditorFormattingOptionsDropdown } from "./editor-formatting-options";
import { SlashCommandMenu } from "./slash-commmand-menu";
import { blogParser } from "@/socket/blog-parser";
import { trpc } from "@/utils/trpc";
import { useUserStore } from "@/store/useUserStore";
import { useParams } from "@tanstack/react-router";
import { BlogEditorRoute } from "@/routes/routes";
import { createSelectionHandler } from "@/lib/editor-helpers";
import { isValidTiptapDocument } from "@/lib/editor-helpers";





export const PrimaryEditor = () => {
  const userId = useUserStore((state) => state.user?.id);
  const { blogId } = useParams({ from: BlogEditorRoute.id });
  const editorContentRef = useRef<HTMLDivElement>(null);
 
  // Split into specific contexts
  const { editor } = useCustomEditor();
  const { setSelectionInfo, setCoords } = useSelection();

  const deleteAllLoadingNodes = useCallback((editor) => {
    const nodesToDelete: { pos: number; size: number }[] = [];

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "loadingNode") {
        nodesToDelete.push({
          pos,
          size: node.nodeSize,
        });
      }
    });

    nodesToDelete.reverse().forEach(({ pos, size }) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + size })
        .run();
    });
  }, []);

  const { mutate: syncBlog } = trpc.syncBlog.useMutation({
    onError: (error) => {
      console.error("Failed to sync blog:", error);
    },
  });


  useEffect(() => {
    if (!editor) return;
    
    // Log the HTML structure
    console.log('Editor HTML:', editor.getHTML());
    // Log the JSON structure
    console.log('Editor JSON:', editor.getJSON());
  }, [editor?.getHTML()]);

  // Selection update handler
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = createSelectionHandler(
      editor,
      setSelectionInfo,
      setCoords
    );

    editor.commands.focus();
    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, setSelectionInfo, setCoords]);

  // Blog write handler
  useEffect(() => {
    if (!editor) return;
  
    const listener = {
      onNode: (node) => {
        deleteAllLoadingNodes(editor);
        
        // Get the end position of the document
        const endPos = editor.state.doc.content.size;
  
        // If the previous node was a list or a nested structure
        // insert an empty paragraph first to "break out" of any nested context
        const lastNode = editor.state.doc.lastChild;
        if (lastNode && (
          lastNode.type.name === 'bulletList' || 
          lastNode.type.name === 'orderedList' ||
          lastNode.type.name === 'blockquote'
        )) {
          editor
            .chain()
            .insertContentAt(endPos, {
              type: 'paragraph',
              content: []
            })
            .run();
        }
  
        // Now safely insert the new node
        editor.commands.insertContent(node);
  
        if(editorContentRef.current){
          editorContentRef.current.scrollTop = editorContentRef.current.scrollHeight;
        }
      },
      onState: (state) => {
        if (state === "BLOG_END") {
          deleteAllLoadingNodes(editor);
          const jsonContent = editor.getJSON();
          
          if (isValidTiptapDocument(jsonContent)) {
            syncBlog({
              blog: jsonContent,
              userId: userId!,
              blogId: blogId,
            });
          } else {
            console.error("Invalid document structure");
          }
          return;
        }
  
        // For loading nodes, we also want to ensure proper positioning
        deleteAllLoadingNodes(editor);
        const endPos = editor.state.doc.content.size;
        
        // Same check for nested structures before inserting loading node
        const lastNode = editor.state.doc.lastChild;
        if (lastNode && (
          lastNode.type.name === 'bulletList' || 
          lastNode.type.name === 'orderedList' ||
          lastNode.type.name === 'blockquote'
        )) {
          editor
            .chain()
            .insertContentAt(endPos, {
              type: 'paragraph',
              content: []
            })
            .run();
        }
  
        editor.commands.insertContent({
          type: "doc",
          content: [
            {
              type: "loadingNode",
              attrs: { message: state },
            },
          ],
        });
      },
    };
  
    blogParser.subscribeToWriteBlog(listener);
  
    return () => {
      blogParser.unsubscribeFromWriteBlog(listener);
    };
  }, [editor, userId, blogId, deleteAllLoadingNodes]);

  if (!editor) return null;

  return (
    <div className="w-full h-screen-minus-32 overflow-auto flex flex-col justify-start border-none">
      <CardContent className="w-full flex-grow overflow-auto border-none outline-none">
        <div className="w-full h-full flex overflow-auto outline-none relative">
          <EditorContent
            ref={editorContentRef}
            editor={editor}
            className="w-[800px] h-full"
          />
          <MemoizedEditorFormattingDropdown />
          <MemoizedSlashCommandMenu />
        </div>
      </CardContent>
      <WordCount editor={editor} />
    </div>
  );
};

// Split word count into separate component
const WordCount = ({ editor }: { editor: Editor }) => {
  const characterCount = editor.storage.characterCount.characters();
  const wordCount = editor.storage.characterCount.words();

  return (
    <div className="w-full flex justify-between px-5">
      <div className={`w-full flex justify-end character-count ${
        characterCount === CHARACTER_LIMIT ? "character-count--warning" : ""
      }`}>
        <div className="flex flex-col">
          {wordCount} words
        </div>
      </div>
    </div>
  );
}

// Memoize the dropdowns
const MemoizedEditorFormattingDropdown = memo(() => {
  const { editor } = useCustomEditor();
  return editor ? <EditorFormattingOptionsDropdown /> : null;
});

const MemoizedSlashCommandMenu = memo(() => {
  const { editor } = useCustomEditor();
  return editor ? <SlashCommandMenu /> : null;
});
