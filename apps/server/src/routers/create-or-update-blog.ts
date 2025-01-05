import { protectedProcedure, publicProcedure } from "../trpc/initTRPC";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { generateBlogContent } from "../models/generate-blog";
import { generatedBlogSchema } from "../types/blog";
import { db } from "../db";
import { blogs, users } from "../db/schema";
import { OutlineSectionSchema } from "@dumpanddone/types";
import { and, eq } from "drizzle-orm";
import { addOrUpdateBlog } from "../db/queries/blog";
import { fetchChaosFromR2 } from "../r2/store";
import { serializeDate } from "../utils/date-helpers";
// import { addBlog } from "../db/queries/addBlog";


const GenerateBlogInputSchema = z.object({
  model: z.enum(["claude", "deepseek", "gpt"]),
  outline: z.array(OutlineSectionSchema),
  userId: z.string(),
  blogId: z.string(),
});

// const GeneratedBlogOutputSchema = z.object({
//   status: z.string(),
//   data: z.union([generatedBlogSchema, z.string()]),
// });

export const GeneratedBlogResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    data: generatedBlogSchema,
  }),
  z.object({
    status: z.literal("error"),
    error: z.string(),
  }),
]);

export const createOrUpdateBlog = protectedProcedure
  .input(GenerateBlogInputSchema)
  .mutation(async ({ ctx, input }) => {
    const { userId, blogId, outline, model } = input;
    if (!userId) {
      throw new TRPCError({
        code: "PARSE_ERROR",
        message: "Cannot find the user ID",
      });
    }

    if(!blogId){
      throw new TRPCError({
        code: "PARSE_ERROR",
        message: "Blog ID cannot be empty",
      });
    }

    const blogData = await db
      .select()
      .from(blogs)
      .where(
        and(
          eq(blogs.user_id, userId),
          eq(blogs.id, blogId)
        )
      )
      .limit(1);

    if (!blogData[0]?.chaos_path) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Blog chaos content not found",
      });
    }

    try {
      console.log("Fetching chaos from R2");
      const chaos = await fetchChaosFromR2({ 
        chaosPath: blogData[0].chaos_path 
      });

      console.log("Generating blog data");
      const blogContent = await generateBlogContent(chaos, outline, model);
      console.log("Blogdata before adding to db is", blogContent);

      await addOrUpdateBlog({
        userId, 
        blogId, 
        content: blogContent, 
        outline: {
          sections: outline, 
          created_at: serializeDate(new Date()), 
          updated_at: serializeDate(new Date())
        }
      });

      return {
        status: "success",
        data: {
          blogId: blogId,
          blogData: blogContent,
        },
      };
    } catch (error) {
      console.log("ERROR is", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate blog content",
        cause: error,
      });
    }
  });