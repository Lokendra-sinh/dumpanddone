// types/editor.ts
import { TipTapNodeType } from "@dumpanddone/types";
export interface SelectionInfo {
  nodes: TipTapNodeType[];           
  selectedText: string;          
  selectionRange: {
    from: number,
    to: number,
  }
}

export interface Coordinates {
  top: number;
  left: number;
}