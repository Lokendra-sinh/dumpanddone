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
import { TiptapDocument } from "@dumpanddone/types";


function isValidTiptapDocument(doc: any): doc is TiptapDocument {
  return (
    doc &&
    typeof doc === "object" &&
    doc.type === "doc" &&
    Array.isArray(doc.content) &&
    doc.content.every((node) => isValidTipTapNode(node))
  );
}

function isValidTipTapNode(node: any): boolean {
  // Add validation for each node type
  const validTypes = [
    "paragraph",
    "heading",
    "bulletList",
    "orderedList",
    "codeBlock",
    "blockquote",
    "image",
  ];
  return node && typeof node === "object" && validTypes.includes(node.type);
}

export const PrimaryEditor = () => {
  const userId = useUserStore((state) => state.user?.id);
  const { blogId } = useParams({ from: BlogEditorRoute.id });
 
  const { editor, setSelectionInfo, setCoords } = usePlayground();

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

  const scrollWithBuffer = () => {
    const editorElement = editor!.view.dom;
    const parentContainer = editorElement.parentElement;

    // Calculate the target scroll position
    const totalHeight = editorElement.scrollHeight;
    const containerHeight = parentContainer!.clientHeight;
    const buffer = 150; // Adjust this value to control how much space to leave at bottom

    // Scroll the parent container
    parentContainer!.scrollTo({
      top: totalHeight - containerHeight + buffer,
      behavior: "smooth",
    });
  };

  const { mutate: syncBlog } = trpc.syncBlog.useMutation({
    onError: (error) => {
      console.error("Failed to sync blog:", error);
      // Show error toast
    },
  });

  useEffect(() => {
    if (!editor) return;

    console.log("editor re-rendered");

    editor.commands.focus();

    const handleSelectionUpdate = () => {
      const { state } = editor;
      const { selection } = state;
      const { empty, $from, $to } = selection;

      if (empty) {
        setSelectionInfo(null);
        setCoords({ top: 0, left: 0 });
        return;
      }

      const fromCoords = editor.view.coordsAtPos($from.pos);
      const toCoords = editor.view.coordsAtPos($to.pos);
      const bottomMostCoord = Math.max(fromCoords.bottom, toCoords.bottom);

      setCoords({
        left: Math.max(fromCoords.left, toCoords.left),
        top: bottomMostCoord + 5,
      });

      // Get the selected text (plain text, if needed)
      const selectedText = editor.state.doc.textBetween($from.pos, $to.pos);

      // Get all nodes within the selection range as a fragment
      const fragment = selection.content();
      // Convert the selected fragment to a JSON representation
      const selectedNodes = fragment.toJSON();

      delete selectedNodes.openStart;
      delete selectedNodes.openEnd;

      // Set selection info with node types, attributes, marks, etc.
      setSelectionInfo({
        nodes: selectedNodes,
        selectedText,
        selectionBoundaries: { from: $from.pos, to: $to.pos },
      });

      editor.commands.focus();
    };

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, setCoords, setSelectionInfo]);
  // In your component
  useEffect(() => {
    if (!editor) return;

    const listener = {
      onNode: (node) => {
        console.log("NODE in useEffect is", node);
        deleteAllLoadingNodes(editor);

        editor.commands.insertContent({
          type: "doc",
          content: [node],
        });

        scrollWithBuffer();
      },
      onState: (state) => {
        if (state === "BLOG_COMPLETE") {
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

        scrollWithBuffer();
      },
    };

    blogParser.receiveEvents(listener);

    return () => {
      blogParser.removeListener(listener);
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
