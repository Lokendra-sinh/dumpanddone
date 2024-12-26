import { SelectionInfo } from "@/types/editor";
import { TiptapDocument } from "@dumpanddone/types";
import { Editor } from "@tiptap/core";


import { Command } from "@tiptap/core";
import { liftTarget } from "prosemirror-transform"; 

/**
 * A custom command that lifts out of *all* nested blocks (blockquote, listItem, etc.)
 * until there's nothing left to lift. This is more general than .liftListItem("listItem"),
 * because it keeps lifting no matter which node type is wrapping the selection.
 */
export const liftAll = (): Command => ({ state, dispatch }) => {
  let { tr } = state;
  const { $from, $to } = tr.selection;

  // blockRange() returns the depth/positions needed for a possible lift
  let range = $from.blockRange($to);
  let lifted = false;

  // Repeatedly lift while there's a valid target
  while (range) {
    const target = liftTarget(range);
    if (target == null) break; // can't lift further
    tr = tr.lift(range, target).scrollIntoView(); 
    lifted = true;

    // After lifting, the selection positions may have changed,
    // so recalc range
    const { $from: newFrom, $to: newTo } = tr.selection;
    range = newFrom.blockRange(newTo);
  }

  if (lifted && dispatch) {
    dispatch(tr);
    return true;
  }
  return false;
};



// editor-helper.ts
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

    // Get selection content
    const selectedText = editor.state.doc.textBetween($from.pos, $to.pos);
    const selectedNodes = selection.content().toJSON();

    console.log('Selection boundaries:', {
      from: $from.pos,
      to: $to.pos,
      selectedText,
      selectedNodes
    });

    setSelectionInfo({
      nodes: selectedNodes,
      selectedText,
      selectionRange: {
        from: $from.pos,
        to: $to.pos
      }
    });

    // Set coordinates for UI
    const fromCoords = editor.view.coordsAtPos($from.pos);
    const toCoords = editor.view.coordsAtPos($to.pos);
    setCoords({
      left: Math.max(fromCoords.left, toCoords.left),
      top: Math.max(fromCoords.bottom, toCoords.bottom) + 5
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



export const wrapWithDocType = (content: any) => {
  if (!content.type || content.type !== 'doc') {
    return {
      type: 'doc',
      content: Array.isArray(content) ? content : [content]
    };
  }
  return content;
};