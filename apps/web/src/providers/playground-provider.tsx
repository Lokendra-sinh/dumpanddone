import { createContext, useContext, useEffect, useState } from "react";
import { Editor } from "@tiptap/react"
import { ReactNode } from "@tanstack/react-router";
import { useEditorInstance } from "@/hooks/useEditorInstance";
import { useEditorConfig } from "@/hooks/useEditorConfig";
import { TipTapContentType } from "@dumpanddone/types";
import { useBlogsStore } from "@/store/useBlogsStore";

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

  const blogData = useBlogsStore(state => state.activeBlog?.content)
  const config = useEditorConfig();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [coords, setCoords] = useState<Coordinates>({top: 0, left: 0});
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null);

  console.log("blogData changed in provider ", blogData);

  const editor = useEditorInstance({
    config,
    content: blogData,
    handlers: {
      editorProps: {
        handleKeyDown: (view, event) => {
          const { state } = view;
          const { selection } = state;
          const { empty, from } = selection;
          
          if (event.key === "/" && empty) {
            // Get the node before cursor using 'from' position
            const $from = state.doc.resolve(from);
            const textBefore = $from.parent.textBetween(
              Math.max(0, $from.parentOffset - 1),
              $from.parentOffset,
              ''
            );
            
            // Only show menu if "/" is typed at start of line or after space
            if (!textBefore || textBefore === ' ') {
              const coords = view.coordsAtPos(from);
              setCoords({ 
                left: coords.left, 
                top: coords.bottom + 8 
              });
              setIsDropdownOpen(true);
              return true; // Prevent "/" from being inserted
            }
          }

          // Close menu on escape
          if (event.key === 'Escape' && isDropdownOpen) {
            resetDropdownState();
            return true;
          }
          
          return false;
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = () => {
      if (isDropdownOpen) {
        resetDropdownState();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isDropdownOpen]);

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