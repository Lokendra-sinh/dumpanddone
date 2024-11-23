import { protectedProcedure, publicProcedure } from "../trpc/initTRPC";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { generateBlogContent } from "../models/claude"
import { generatedBlogSchema } from "../types/blog";
import { db } from "../db";
import { users } from "../db/schema";
// import { addBlog } from "../db/queries/addBlog";


const GenerateBlogInputSchema = z.object({
  content: z.string().min(1),
});

const GeneratedBlogOutputSchema = z.object({
    status: z.string(),
    data: z.union([generatedBlogSchema, z.string()])
})

export const GeneratedBlogResponseSchema = z.discriminatedUnion('status', [
    z.object({
        status: z.literal('success'),
        data: generatedBlogSchema,
    }),
    z.object({
        status: z.literal('error'),
        error: z.string()
    })
]);


export const generateBlog = protectedProcedure
  .input(GenerateBlogInputSchema)
  .mutation(async ({ ctx, input }) => {
    const { content } = input;
    if(!content){
        throw new TRPCError({
            code: "PARSE_ERROR",
            message: "Cannot generate a blog without content"
        })
    }

    try {
        console.log("Generating blog data");
        const blogData = await generateBlogContent(content);
        console.log("RESPONSE is", blogData)

        // const blogDb = await addBlog({
        //     userId: ctx.user.id,
        //     last_updated: Date.now(),
        //     content: blogData,
        // })
        // await db.insert(users).values({
        //     content: blogData
        // }).returning()
        return {
            status: 'success',
            data: blogData
        };
    } catch (error) {
        console.log("ERROR is", error);
        // Instead of returning error, throw TRPCError
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate blog content',
            // Optional: include cause
            cause: error
        });
    }

  });


