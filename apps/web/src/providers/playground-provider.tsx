// playground-provider.tsx
import { createContext, useContext, useState } from "react";
import { Editor } from "@tiptap/react";
import { ReactNode } from "@tanstack/react-router";
import { useEditorInstance } from "@/hooks/useEditorInstance";
import { useEditorConfig } from "@/hooks/useEditorConfig";
import { useDashboard } from "./dashboard-provider";

type Coordinates = { top: number; left: number } | null;

interface PlaygroundContextType {
  editor: Editor | null;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (value: boolean) => void;
  coords: Coordinates;
  setCoords: (coords: Coordinates) => void;
  resetDropdownState: () => void;
}

export const PlaygroundContext = createContext<PlaygroundContextType | null>(
  null,
);

export const PlaygroundProvider = ({ children }: { children: ReactNode }) => {
  const { blogData } = useDashboard();
  const config = useEditorConfig();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [coords, setCoords] = useState<Coordinates>(null);

  // Initialize editor with handlers that update shared state
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
    setCoords(null);
  };

  const value: PlaygroundContextType = {
    editor,
    isDropdownOpen,
    setIsDropdownOpen,
    coords,
    setCoords,
    resetDropdownState,
  };

  return (
    <PlaygroundContext.Provider value={value}>
      {children}
    </PlaygroundContext.Provider>
  );
};

export const usePlayground = () => {
  const playgroundContext = useContext(PlaygroundContext);
  if (!playgroundContext) {
    throw new Error("usePlayground must be used within a PlaygroundProvider");
  }
  return playgroundContext;
};
