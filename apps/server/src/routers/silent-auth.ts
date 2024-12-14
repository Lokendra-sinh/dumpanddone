import { TRPCError } from "@trpc/server";
import { publicProcedure } from "../trpc/initTRPC";
import { getUser } from "../db/queries/queryUser";
import { LoginResponseSchema, LoginResponseSchemaType } from "./user";
import { getBlogsByUserId } from "../db/queries/blog";

export const silentAuth = publicProcedure
  .output(LoginResponseSchema)
  .query(async ({ ctx }): Promise<LoginResponseSchemaType> => {
    const userId = ctx.userId;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No valid session found",
      });
    }

    const user = await getUser(userId);

    const userBlogs = await getBlogsByUserId(userId)

    return {
      status: "success",
      user: {
        id: user.id,
        name: user.name!,
        avatar: user.avatar!,
        email: user.email,
        created_at: user.created_at,
        auth_method: user.auth_method,
        blogs: userBlogs,
      },
    };
  });
