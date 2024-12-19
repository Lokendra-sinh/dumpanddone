
import { z } from "zod";
import { protectedProcedure } from "../trpc/initTRPC";
import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { blogs } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { TiptapDocument, TiptapDocumentSchema } from '@dumpanddone/types';

const SyncBlogInputSchema = z.object({
 blog: TiptapDocumentSchema,
 userId: z.string(),
 blogId: z.string()
});

async function updateBlogContent(userId: string, blogId: string, blog: TiptapDocument) {
 try {
   // Check if blog exists and belongs to user
   const existingBlog = await db
     .select()
     .from(blogs)
     .where(
       and(
         eq(blogs.user_id, userId),
         eq(blogs.id, blogId)
       )
     )
     .limit(1);

   if (existingBlog.length === 0) {
     throw new TRPCError({
       code: 'NOT_FOUND',
       message: 'Blog not found'
     });
   }

   // Update blog content
   const updatedBlog = await db
     .update(blogs)
     .set({
       blog,
       last_updated: new Date()
     })
     .where(
       and(
         eq(blogs.user_id, userId),
         eq(blogs.id, blogId)
       )
     )
     .returning();

   return updatedBlog[0];

 } catch (error) {
   console.error('Database operation failed:', error);
   
   throw new TRPCError({
     code: 'INTERNAL_SERVER_ERROR',
     message: 'Failed to sync blog content'
   });
 }
}

export const syncBlog = protectedProcedure
 .input(SyncBlogInputSchema)
 .mutation(async ({ input }) => {
   const { blog, userId, blogId } = input;

   if (!blog || !userId || !blogId) {
     throw new TRPCError({
       code: "BAD_REQUEST",
       message: "Could not find userId or blogId"
     });
   }

   // Just update blog content - no need to create as it should exist
   return await updateBlogContent(userId, blogId, blog);
 });