import { createContext, useContext, useState } from "react";
import { Editor } from "@tiptap/react"
import { ReactNode } from "@tanstack/react-router";
import { useEditorInstance } from "@/hooks/useEditorInstance";
import { useEditorConfig } from "@/hooks/useEditorConfig";
import { useDashboard } from "./dashboard-provider";
import { TipTapContentType } from "@dumpanddone/types";

type Coordinates = { top: number; left: number }

export interface SelectionInfo {
  nodes: TipTapContentType;
  selectedText: string;
  selectionBoundaries: {
    from: number;
    to: number;
  };
}

interface PlaygroundContextType {
  editor: Editor | null;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (value: boolean) => void;
  coords: Coordinates;
  setCoords: (coords: Coordinates) => void;
  resetDropdownState: () => void;
  selectionInfo: SelectionInfo | null;
  setSelectionInfo: (info: SelectionInfo | null) => void;
}

export const PlaygroundContext = createContext<PlaygroundContextType | null>(null);

export const PlaygroundProvider = ({ children }: { children: ReactNode }) => {
  const { blogData } = useDashboard();
  const config = useEditorConfig();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [coords, setCoords] = useState<Coordinates>({top: 0, left: 0});
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null);

  const editor = useEditorInstance({
    config,
    content: blogData,
    handlers: {
      editorProps: {
        handleKeyDown: (view, event) => {
          if (event.key === "/") {
            const { state } = view;
            const { from } = state.selection;
            const coords = view.coordsAtPos(from);

            setCoords({ left: coords.left + 20, top: coords.top - 20 });
            setIsDropdownOpen(true);
            return false;
          }
        },
      },
    },
  });

  const resetDropdownState = () => {
    setIsDropdownOpen(false);
    setCoords({top: 0, left: 0});
  };

  const value: PlaygroundContextType = {
    editor,
    isDropdownOpen,
    setIsDropdownOpen,
    coords,
    setCoords,
    resetDropdownState,
    selectionInfo,
    setSelectionInfo
  };

  return (
    <PlaygroundContext.Provider value={value}>
      {children}
    </PlaygroundContext.Provider>
  );
};

export const usePlayground = () => {
  const context = useContext(PlaygroundContext);
  if (!context) {
    throw new Error("usePlayground must be used within a PlaygroundProvider");
  }
  return context;
};