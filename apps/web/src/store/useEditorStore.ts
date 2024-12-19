import { OutlineSectionType, TiptapDocument } from "@dumpanddone/types";
import { create } from "zustand";

interface EditorState {
  activeBlogId: string | null;
  chaos: string;
  outline: OutlineSectionType[];
  isScanning: boolean;
  activeBlogContent: TiptapDocument;
  
  // Actions
  setActiveBlog: (blogId: string) => void;
  setChaos: (chaos: string) => void;
  setOutline: (sections: OutlineSectionType[]) => void;
  setScanningState: (isScanning: boolean) => void;
  setActiveBlogContent: (blogData: TiptapDocument) => void;
  
  // Reset when switching blogs
  resetEditor: () => void;
}

const initialBlogContent: TiptapDocument = {
  type: 'doc',
  content: []
};

export const useEditorStore = create<EditorState>((set) => ({
  activeBlogId: null,
  chaos: '',
  outline: [],
  isScanning: false,
  activeBlogContent: initialBlogContent,

  setActiveBlog: (blogId) => set({ 
    activeBlogId: blogId,
    // Reset other states when switching blogs
    chaos: '',
    outline: [],
    isScanning: false,
    activeBlogContent: initialBlogContent
  }),

  setChaos: (content) => set({ chaos: content }),
  setOutline: (sections) => set({ outline: sections }),
  setScanningState: (state) => set({ isScanning: state }),
  setActiveBlogContent: (blogData) => set({ activeBlogContent: blogData }),
  
  resetEditor: () => set({ 
    chaos: '',
    outline: [],
    isScanning: false,
    activeBlogContent: initialBlogContent
  })
}));