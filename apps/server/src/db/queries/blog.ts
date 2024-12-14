// db/queries/blog.ts
import { TiptapDocument, BlogOutlineType } from '@dumpanddone/types'
import { db } from '..'
import { blogs } from '../schema'
import { and, eq } from 'drizzle-orm'

interface BlogData {
    userId: string
    blogId: string
    content?: TiptapDocument
    chaos?: any
    outline?: BlogOutlineType
}


export async function getBlogById(blogId: string, userId: string) {
    try {
        const blog = await db.select()
            .from(blogs)
            .where(and(
                eq(blogs.id, blogId),
                eq(blogs.user_id, userId)
            ))
            .limit(1);
        
        return blog[0];
    } catch (error) {
        console.error("Error fetching blog:", error);
        throw error;
    }
}


export async function getBlogsByUserId(userId: string){
    try{
        const userBlogs = await db.select().from(blogs).where(eq(blogs.user_id, userId))
        console.log("user blogs are", userBlogs);
        return userBlogs.map(blog => ({id: blog.id, content: blog.blog}))
    } catch(e){
        console.error("Error while finding blogs for userID: ", userId)
        return []
    }
}


export async function updateBlog(blogData: BlogData) {
    const { blogId, content, outline } = blogData;
    try {
        return await db.update(blogs)
            .set({
                last_updated: new Date(),
                blog: content,
                outline: outline,
            })
            .where(eq(blogs.id, blogId))
            .returning();
    } catch (error) {
        console.error("Error updating blog:", error);
        throw error;
    }
}


export async function createBlog(blogData: BlogData) {
    const { userId, blogId, content, outline } = blogData;

    try {
        console.log("inseritng blog with blog ID", blogId);
        return await db.insert(blogs)
            .values({
                id: blogId,
                user_id: userId,
                created_at: new Date(),
                last_updated: new Date(),
                chaos: {},
                outline: outline!,
                blog: content!,
            })
            .returning();
    } catch (error) { 
        console.error("Error creating blog:", error);
        throw error;
    }
}


export async function addOrUpdateBlog(blogData: BlogData) {
    try {
        const existingBlog = await getBlogById(blogData.blogId, blogData.userId);
        console.log("existing blog is", existingBlog);
        
        if (existingBlog) {
            return await updateBlog(blogData);
        } else {
            return await createBlog(blogData);
        }
    } catch (error) {
        console.error("Error in addOrUpdateBlog:", error);
        throw error;
    }
}