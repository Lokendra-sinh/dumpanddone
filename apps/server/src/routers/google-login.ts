import {
  authProcedure,
} from "../trpc/initTRPC";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { addUser } from "../db/queries/addUser";
import { generateJwtToken } from "../utils/generate-jwt-token";
import { getUser, getUserByEmail } from "../db/queries/queryUser";
import { UserSchema } from "@dumpanddone/types";
import { getBlogsByUserId } from "../db/queries/blog";

const LoginSchema = z.object({
  accessToken: z.string(),
});


export const LoginResponseSchema = z.object({
  status: z.string(),
  user: UserSchema,
});

export type LoginResponseSchemaType = z.infer<typeof LoginResponseSchema>;

// Cookie config can be reused
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const googleLogin = authProcedure
  .input(LoginSchema)
  .output(LoginResponseSchema)
  .mutation(async ({ input, ctx }): Promise<LoginResponseSchemaType> => {
    try {
      const { accessToken } = input;

      const userData = await verifyGoogleToken(accessToken);

      let user = await getUserByEmail(userData.email);


      if (!user || !user.id) {
        user = await addUser({
          name: userData.name,
          email: userData.email,
          avatar: userData.picture,
          auth_method: "google",
        });
      }

      if (!user || !user.id) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get or create user'
        });
      }

      const userBlogs = await getBlogsByUserId(user.id);
      const response = {
        status: "success",
        user: {
          id: user.id,
          name: user.name!,
          avatar: user.avatar!,
          email: user.email,
          created_at: user.created_at!,
          auth_method: user.auth_method,
          blogs: userBlogs,
        },
      };

      try {
        const validationResult = LoginResponseSchema.safeParse(response);
        if (!validationResult.success) {
          console.error('Schema Validation Error:', {
            errors: validationResult.error.errors,
            issues: validationResult.error.issues,
            data: response
          });
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Validation failed: ${validationResult.error.message}`,
            cause: validationResult.error
          });
        }
        
        const sessionToken = generateJwtToken(user.id);
        ctx.res.cookie("authToken", sessionToken, COOKIE_CONFIG);
        
        return response;
      } catch (e) {
        console.error('Final Error:', {
          error: e,
          stack: e instanceof Error ? e.stack : undefined
        });
        throw e;
      }
    } catch (error) {
      console.error('Login Flow Error:', {
        error,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  });

async function verifyGoogleToken(token: string) {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to verify token");
    }

    const userData = await response.json();

    // Validate required fields
    if (!userData.email || !userData.name) {
      throw new Error("Incomplete user data from Google");
    }

    return userData;
  } catch (e) {
    console.error("Error while verifying the google token", e);
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Failed to verify the token",
    });
  }
}
