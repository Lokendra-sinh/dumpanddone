import { protectedProcedure } from "../trpc/initTRPC";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

const GenerateBlogOutlineInputSchema = z.object({
  content: z.string().min(1),
  model: z.enum(["claude", "deepseek"]),
});

const GeneratedBlogOutputSchema = z.object({
  requestId: z.string(),
});

// Placeholder function that will handle the actual streaming
function startOutlineStreaming(content: string, requestId: string) {
    // This will be implemented in socket.ts
    // It will handle the actual streaming of tokens
    console.log('Starting stream for request:', requestId);
}

export const generateBlogOutline = protectedProcedure
  .input(GenerateBlogOutlineInputSchema)
  .output(GeneratedBlogOutputSchema)
  .mutation(async ({ input }) => {
    const { content } = input;
    
    if (!content) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Content is required",
      });
    }

    try {
      const requestId = uuidv4();
      
      // Start streaming process (non-blocking)
      startOutlineStreaming(content, requestId);
      return { requestId };
      
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to start outline generation",
        cause: error,
      });
    }
  });