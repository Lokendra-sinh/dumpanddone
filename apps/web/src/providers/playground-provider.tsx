import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Editor } from "@tiptap/react"
import { ReactNode, useLoaderData } from "@tanstack/react-router";
import { useEditorInstance } from "@/hooks/useEditorInstance";
import { useEditorConfig } from "@/hooks/useEditorConfig";
import { SelectionInfo } from "@/types/editor";
import { BlogEditorRoute } from "@/routes/routes";
import { TiptapDocument } from "@dumpanddone/types";

type Coordinates = { top: number; left: number }

interface EditorContextType {
  editor: Editor | null;
}

interface SelectionContextType {
  coords: Coordinates;
  setCoords: (coords: Coordinates) => void;
  selectionInfo: SelectionInfo | null;
  setSelectionInfo: (info: SelectionInfo | null) => void;
}

interface DropdownContextType {
  isDropdownOpen: boolean;
  setIsDropdownOpen: (value: boolean) => void;
  resetDropdownState: () => void;
}

const EditorContext = createContext<EditorContextType | null>(null);
const SelectionContext = createContext<SelectionContextType | null>(null);
const DropdownContext = createContext<DropdownContextType | null>(null);

export const PlaygroundProvider = ({ children }: { children: ReactNode }) => {
  const { blog } = useLoaderData({ from: BlogEditorRoute.id })
  const blogContent: TiptapDocument = blog.content as TiptapDocument || {
    type: "doc",
    content: []
  };

  const config = useEditorConfig();
  
  // Group related state
  const [dropdownState, setDropdownState] = useState({
    isOpen: false,
    coords: { top: 0, left: 0 }
  });
  
  const [selectionState, setSelectionState] = useState<{
    coords: Coordinates;
    info: SelectionInfo | null;
  }>({
    coords: { top: 0, left: 0 },
    info: null
  });

  const editor = useEditorInstance({
    config,
    content: blogContent,
    handlers: {
      // ... existing handlers
    },
  });

  const resetDropdownState = useCallback(() => {
    setDropdownState({
      isOpen: false,
      coords: { top: 0, left: 0 }
    });
  }, []);

  // Create separate context values
  const editorValue = useMemo(() => ({
    editor
  }), [editor]);

  const selectionValue = useMemo(() => ({
    coords: selectionState.coords,
    setCoords: (coords: Coordinates) => 
      setSelectionState(prev => ({ ...prev, coords })),
    selectionInfo: selectionState.info,
    setSelectionInfo: (info: SelectionInfo | null) => 
      setSelectionState(prev => ({ ...prev, info }))
  }), [selectionState]);

  const dropdownValue = useMemo(() => ({
    isDropdownOpen: dropdownState.isOpen,
    setIsDropdownOpen: (isOpen: boolean) => 
      setDropdownState(prev => ({ ...prev, isOpen })),
    resetDropdownState
  }), [dropdownState, resetDropdownState]);

  return (
    <EditorContext.Provider value={editorValue}>
      <SelectionContext.Provider value={selectionValue}>
        <DropdownContext.Provider value={dropdownValue}>
          {children}
        </DropdownContext.Provider>
      </SelectionContext.Provider>
    </EditorContext.Provider>
  );
};

// Custom hooks for accessing specific context
export const useCustomEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used within PlaygroundProvider");
  return context;
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) throw new Error("useSelection must be used within PlaygroundProvider");
  return context;
};

export const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) throw new Error("useDropdown must be used within PlaygroundProvider");
  return context;
};