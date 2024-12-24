import { SelectionInfo } from "@/types/editor";
import { TiptapDocument } from "@dumpanddone/types";
import { Editor } from "@tiptap/core";


export const createSelectionHandler = (
  editor: Editor,
  setSelectionInfo: (info: SelectionInfo | null) => void,
  setCoords: (coords: { top: number; left: number }) => void
) => {
  return () => {
    const { selection } = editor.state;
    const { empty, $from, $to } = selection;

    if (empty) {
      setSelectionInfo(null);
      setCoords({ top: 0, left: 0 });
      return;
    }

    // Get coordinates for floating UI
    const fromCoords = editor.view.coordsAtPos($from.pos);
    const toCoords = editor.view.coordsAtPos($to.pos);
    
    setCoords({
      left: Math.max(fromCoords.left, toCoords.left),
      top: Math.max(fromCoords.bottom, toCoords.bottom) + 5
    });

    // Get selection content
    const selectedText = editor.state.doc.textBetween($from.pos, $to.pos);
    const selectedNodes = selection.content().toJSON();

    // Clean up nodes
    delete selectedNodes.openStart;
    delete selectedNodes.openEnd;

    setSelectionInfo({
      nodes: selectedNodes,
      selectedText,
      selectionBoundaries: { 
        from: $from.pos, 
        to: $to.pos 
      }
    });

    editor.commands.focus();
  };
};


export function isValidTiptapDocument(doc: any): doc is TiptapDocument {
  return (
    doc &&
    typeof doc === "object" &&
    doc.type === "doc" &&
    Array.isArray(doc.content) &&
    doc.content.every((node) => isValidTipTapNode(node))
  );
}

export function isValidTipTapNode(node: any): boolean {
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