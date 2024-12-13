import { TiptapDocument } from "@dumpanddone/types"
import { create } from "zustand"

interface BlogType {
    id: string,
    content: TiptapDocument,
}


interface Blog {
    activeBlog: BlogType | undefined
    blogs: BlogType[]
    setActiveBlog: (blog: BlogType) => void
    setBlogs: (blogs: BlogType[]) => void
}

export const useBlogsStore = create<Blog>((set) => ({
    activeBlog: undefined,
    blogs: [],
    setActiveBlog: (blog: BlogType) => set({activeBlog: blog}),
    setBlogs: (blogs) => set({blogs})
}))