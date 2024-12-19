import { z } from "zod";
import { protectedProcedure } from "../trpc/initTRPC";
import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { blogs } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { PostgresError } from "postgres";

const SyncChaosInputSchema = z.object({
  chaos: z.string().min(1),
  userId: z.string(),
  blogId: z.string(),
});


// helpers for blog operations
async function findOrCreateBlog(userId: string, blogId: string, chaos: string) {
    try {
      // First try to get existing blog
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
        // Blog doesn't exist, create new one
        const newBlog = await db
          .insert(blogs)
          .values({
            id: blogId,
            user_id: userId,
            chaos,
            created_at: new Date(),
            last_updated: new Date(),
            outline: {
                sections: [],
                created_at: new Date(),
                updated_at: new Date()
              },
              blog: {
                type: 'doc',
                content: []
              },
          })
          .returning();
        
        return newBlog[0];
      }
  
      // Blog exists, update chaos
      const updatedBlog = await db
        .update(blogs)
        .set({
          chaos,
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
  
  // Clean TRPC procedure
  export const syncChaos = protectedProcedure
    .input(SyncChaosInputSchema)
    .mutation(async ({ input }) => {
      const { chaos, userId, blogId } = input;
  
      if (!chaos || !userId || !blogId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not find userId or blogId"
        });
      }
  
      // Single responsibility - just find or create blog
      return await findOrCreateBlog(userId, blogId, chaos);
    });
