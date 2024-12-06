import { TiptapDocument } from "@dumpanddone/types"
import { create } from "zustand"

interface BlogType {
    id: string,
    content: TiptapDocument,
}


interface Blog {
    activeBlog: BlogType | null
    blogs: BlogType[]
    setActiveBlog: (blog: BlogType) => void
    setBlogs: (blogs: BlogType[]) => void
}

export const useBlogsStore = create<Blog>((set) => ({
    activeBlog: null,
    blogs: [],
    setActiveBlog: (blog: BlogType) => set({activeBlog: blog}),
    setBlogs: (blogs) => set({blogs})
}))