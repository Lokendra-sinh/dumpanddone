import { EditorContent } from "@tiptap/react";
import {
  CardContent,
} from "@dumpanddone/ui";
import { useEffect } from "react";
import { CHARACTER_LIMIT } from "@/utils/constants";
import { usePlayground } from "@/providers/playground-provider";
import { EditorFormattingOptionsDropdown } from "./editor-formatting-options";
import { useBlogsStore } from "@/store/useBlogsStore";
import { SlashCommandMenu } from "./slash-commmand-menu";


export const PrimaryEditor = () => {
  console.log("inside primary");
  const blogData = useBlogsStore(state => state.activeBlog?.content)
  console.log("blogDATA form editor is", blogData);
  const { editor, setSelectionInfo, setCoords } = usePlayground();
  

  useEffect(() => {
    if (!editor) return;

    editor.commands.focus()

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

//   useEffect(() => {
//     console.log("inside useeffect becoz blog data or either ediotr changed");
//     if (editor && blogData) {
//       console.log("setting blof data into editor", blogData);
//         editor.commands.setContent(blogData);
//     }
// }, [blogData, editor]);


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


