import { z } from "zod";
import { protectedProcedure } from "../trpc/initTRPC";
import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { blogs } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { BlogOutlineSchema, BlogOutlineType } from '@dumpanddone/types';

const BlogOutlineWithoutTimeSchema = BlogOutlineSchema.omit({created_at: true, updated_at: true})

const SyncOutlineInputSchema = z.object({
  outline: BlogOutlineWithoutTimeSchema,
  userId: z.string(),
  blogId: z.string()
});

type BlogOutlineWithoutTimeType = Omit<BlogOutlineType, 'created_at' | 'updated_at'>

async function updateBlogOutline(userId: string, blogId: string, outline: BlogOutlineWithoutTimeType) {
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

    const existingCreatedDate = existingBlog[0].outline.created_at

    // Update outline
    const updatedBlog = await db
      .update(blogs)
      .set({
        outline: {
            ...outline,
            updated_at: new Date(),
            created_at: existingCreatedDate,
        },
        last_updated: new Date()
      })
      .where(
        and(
          eq(blogs.user_id, userId),
          eq(blogs.id, blogId)
        )
      )
      .returning();

    return {
        status: "success",
        message: "Outline synced successfully!"
    }

  } catch (error) {
    console.error('Outline SYNC Database operation failed:', error);
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to sync blog outline'
    });
  }
}

export const syncOutline = protectedProcedure
  .input(SyncOutlineInputSchema)
  .mutation(async ({ input }) => {
    const { outline, userId, blogId } = input;

    if (!outline || !userId || !blogId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Could not find userId or blogId"
      });
    }

    // Just update outline - no need to create blog as it should exist
    return await updateBlogOutline(userId, blogId, outline);
  });