import { EditorContent } from "@tiptap/react";
import { CardContent } from "@dumpanddone/ui";
import { useEffect } from "react";
import { CHARACTER_LIMIT } from "@/utils/constants";
import { usePlayground } from "@/providers/playground-provider";
import { EditorFormattingOptionsDropdown } from "./editor-formatting-options";
import { SlashCommandMenu } from "./slash-commmand-menu";
import { blogParser } from "@/socket/blog-parser";
import { trpc } from "@/utils/trpc";
import { useUserStore } from "@/store/useUserStore";
import { useParams } from "@tanstack/react-router";
import { BlogEditorRoute } from "@/routes/routes";
import { createSelectionHandler } from "@/lib/editor-helpers";
import { isValidTiptapDocument } from "@/lib/editor-helpers";
import { useScrollObserver } from "@/hooks/useScrollObserver";
import { useSmartScroll } from "@/hooks/useSmartScroll";




export const PrimaryEditor = () => {
  const userId = useUserStore((state) => state.user?.id);
  const { blogId } = useParams({ from: BlogEditorRoute.id });
 
  const { editor, setSelectionInfo, setCoords } = usePlayground();
  const isOverflowing = useScrollObserver(editor);
  const smartScroll = useSmartScroll(editor);

  const deleteAllLoadingNodes = (editor) => {
    // Get all loading nodes and their positions along with their sizes
    const nodesToDelete: { pos: number; size: number }[] = [];

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "loadingNode") {
        nodesToDelete.push({
          pos,
          size: node.nodeSize,
        });
      }
    });

    // Delete from last to first to maintain correct positions
    nodesToDelete.reverse().forEach(({ pos, size }) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + size })
        .run();
    });
  };

  const { mutate: syncBlog } = trpc.syncBlog.useMutation({
    onError: (error) => {
      console.error("Failed to sync blog:", error);
      // have some mechanism in place to handle this error.
    },
  });

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

  useEffect(() => {
    if (!editor) return;
  
    const listener = {
      onNode: (node) => {
        deleteAllLoadingNodes(editor);
        editor.commands.insertContent({
          type: "doc",
          content: [node],
        });
        if (isOverflowing) {
          smartScroll();
        }
      },
      onState: (state) => {
        if (state === "BLOG_END") {  // Changed from BLOG_COMPLETE
          deleteAllLoadingNodes(editor);
          const jsonContent = editor.getJSON();
          console.log("JSON BLOG to be stored is", jsonContent);
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
  
        deleteAllLoadingNodes(editor);
        editor.commands.insertContent({
          type: "doc",
          content: [
            {
              type: "loadingNode",
              attrs: { message: state },
            },
          ],
        });
        if (isOverflowing) {
          smartScroll();
        }
      },
    };
  
    blogParser.subscribeToWriteBlog(listener);
  
    return () => {
      blogParser.unsubscribeFromWriteBlog(listener);
    };
  }, [editor, userId, blogId]);

  if (!editor) return null;

  return (
    <div className="w-full h-screen-minus-32 overflow-auto flex flex-col justify-center border-none">
      <CardContent className="w-full flex-grow overflow-auto border-none outline-none">
        <div className="w-full h-full flex overflow-auto outline-none relative">
          {" "}
          {/* <BubbleMenuOptions /> */}
          <EditorContent
            key="firstEditor"
            editor={editor}
            className="w-[800px] h-full"
          />
          <EditorFormattingOptionsDropdown />
          <SlashCommandMenu />
        </div>
      </CardContent>
      <div className="w-full flex justify-between px-5">
        <div
          className={`w-full flex justify-end character-count ${editor.storage.characterCount.characters() === CHARACTER_LIMIT ? "character-count--warning" : ""}`}
        >
          <div className="flex flex-col">
            {editor.storage.characterCount.words()} words
          </div>
        </div>
      </div>
    </div>
  );
};
