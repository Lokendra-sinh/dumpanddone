import { initTRPC, TRPCError } from "@trpc/server";
import { Response } from "express";


export interface BaseContext{
    userId: string | undefined
}

export interface AuthContext extends BaseContext {
    res: Response
}

export const t = initTRPC.context<BaseContext>().create()
export const authT = initTRPC.context<AuthContext>().create()

export const isAuthenticated = t.middleware(({ ctx, next }) => {
    if (!ctx.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' });
    }
    return next();
  });
  

  export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthenticated)
export const authProcedure = authT.procedure
export const router = t.router