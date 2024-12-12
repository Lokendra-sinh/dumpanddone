import { BubbleMenu, EditorContent } from "@tiptap/react";
import {
  Button,
  CardContent,
  CardDescription,
  CardTitle,
} from "@dumpanddone/ui";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { CHARACTER_LIMIT } from "@/utils/constants";
import { usePlayground } from "@/providers/playground-provider";
import { EditorFormattingOptionsDropdown } from "./editor-formatting-options";

export const Playground = () => {
  const {
    editor,
    setSelectionInfo,
    setCoords,
  } = usePlayground();

  useEffect(() => {
    if (!editor) return;

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


  if (!editor) return null;

  const percentage = editor
    ? Math.round(
        (100 / CHARACTER_LIMIT) * editor.storage.characterCount.characters()
      )
    : 0;

  return (
    <div className="w-full h-screen-minus-32 overflow-auto flex flex-col items-start">
      <div className="w-full flex justify-between px-5 py-4">
        <div className="w-full flex flex-col gap-2">
          <CardTitle>Playground</CardTitle>
          <CardDescription>Customize your blog post</CardDescription>
        </div>
        <div
          className={`w-full flex justify-end character-count ${editor.storage.characterCount.characters() === CHARACTER_LIMIT ? "character-count--warning" : ""}`}
        >
          <svg height="30" width="30" viewBox="0 0 30 30">
            <circle r="10" cx="10" cy="10" fill="#e9ecef" />
            <circle
              r="5"
              cx="10"
              cy="10"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={`calc(${percentage} * 31.4 / 100) 31.4`}
              transform="rotate(-90) translate(-20)"
            />
            <circle r="6" cx="10" cy="10" fill="white" />
          </svg>
          <div className="flex flex-col">
            {editor.storage.characterCount.characters()} / {CHARACTER_LIMIT}{" "}
            characters
            <br />
            {editor.storage.characterCount.words()} words
          </div>
        </div>
      </div>
      <CardContent className="w-full flex-grow overflow-auto">
        <div className="w-full h-full flex overflow-auto outline-none relative">
          {" "}
          {/* <BubbleMenuOptions /> */}
          <EditorContent key="firstEditor" editor={editor} className="w-full h-full" />
          <EditorFormattingOptionsDropdown />
        </div>
      </CardContent>
    </div>
  );
};


export default Playground;

export const BubbleMenuOptions = () => {
  const { editor } = usePlayground();

  if (!editor) return null;
  return (
    <BubbleMenu
      shouldShow={({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { empty, $from } = selection;

        // Get the current node
        const currentNode = $from.node();
        const isEmptyParagraph =
          currentNode.type.name === "paragraph" && !currentNode.content.size;
        const hasSelection = !empty && selection.content().size > 0;

        // Show bubble menu if either condition is true
        return isEmptyParagraph || hasSelection;
      }}
      editor={editor}
      tippyOptions={{ duration: 100 }}
    >
      <div className="flex gap-1 overflow-hidden border-none rounded-md ml-1 px-[0.8px] py-[1px] bg-background shadow-[0_0_0px_2px] shadow-neutral-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`h-fit px-3 py-1 ${
            editor.isActive("heading", { level: 1 })
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`h-fit px-3 py-1 ${
            editor.isActive("heading", { level: 2 })
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`h-fit px-3 py-1 ${
            editor.isActive("heading", { level: 3 })
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Heading3 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-fit px-3 py-1 border-none ${
            editor.isActive("bold")
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-fit px-3 py-1 ${
            editor.isActive("italic")
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`h-fit px-3 py-1 ${
            editor.isActive("strike")
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
      </div>
    </BubbleMenu>
  );
};
