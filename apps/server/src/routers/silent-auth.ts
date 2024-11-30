import { TRPCError } from "@trpc/server";
import { publicProcedure } from "../trpc/initTRPC";
import { getUser } from "../db/queries/findUser";
import { LoginResponseSchema, LoginResponseSchemaType } from "./user";


export const silentAuth = publicProcedure
  .output(LoginResponseSchema)
  .query(async ({ ctx }): Promise<LoginResponseSchemaType> => {
    const userId = ctx.userId;
    if (!userId) {
      throw new TRPCError({ 
        code: 'UNAUTHORIZED',
        message: 'No valid session found'
      });
    }

    const user = await getUser(userId);
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found. Please sign up to get started'
      });
    }

    return {
      status: 'success',
      user: {
        name: user.name!,
        avatar: user.avatar!,
        email: user.email,
        created_at: user.created_at,
        auth_method: user.auth_method
      }
    };
  });