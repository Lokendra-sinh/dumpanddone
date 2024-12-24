// types/editor.ts
import { TipTapNodeType } from "@dumpanddone/types";

export type SelectionType = 
  | 'SECTION_HEADER'     // H1/H2 selection
  | 'PARTIAL_SELECTION'  // Part of node(s) selected
  | 'FULL_SELECTION'    // Complete node(s) selected
  | 'CROSS_SELECTION';  // Selection spans multiple nodes

export interface SelectionInfo {
  nodes: TipTapNodeType[];           // For LLM context
  selectedText: string;          // For UI preview
  selectionBoundaries: {         // For replacement
    from: number;
    to: number;
  };
}

export interface Coordinates {
  top: number;
  left: number;
}