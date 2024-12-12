import { ModelsSchema, ModelsType, TipTapContentSchema, TiptapDocumentSchema } from "@dumpanddone/types";
import { z } from "zod";
import { protectedProcedure } from "../trpc/initTRPC";
import { TRPCError } from "@trpc/server";
import { updateBlogContent } from "../models/update-blog";


const UpdateBlogInputSchema = z.object({
  selectedContent: TipTapContentSchema,
  userQuery: z.string(),
  blogContent: TiptapDocumentSchema,
  userId: z.string(),
  model: ModelsSchema
});

export const updateBlog = protectedProcedure
  .input(UpdateBlogInputSchema)
  .mutation(async ({ctx, input}) => {
    const { userId, selectedContent, userQuery, blogContent, model } = input;
    if (!userId) {
      throw new TRPCError({
        code: "PARSE_ERROR",
        message: "Cannot find the user ID",
      });
    }

    const response = await updateBlogContent({blogContent, selectedContent, userQuery, model})
    console.log("response for udpated blog is", response)

    return {
        status: "success",
        data: response
    }

  });
