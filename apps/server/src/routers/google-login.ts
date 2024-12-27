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
  .mutation(async ({ input, ctx }) => {
    console.log('==== Starting Google Login ====');
    try {
      const { accessToken } = input;
      console.log('Access Token Received:', accessToken.substring(0, 10) + '...');

      // Verify Google Token
      console.log('Verifying Google Token...');
      const userData = await verifyGoogleToken(accessToken);
      console.log('Google User Data:', {
        email: userData.email,
        name: userData.name,
        // Don't log full picture URL for privacy
        hasPicture: !!userData.picture
      });

      // Get or Create User
      let user;
      try {
        console.log('Fetching existing user...');
        user = await getUserByEmail(userData.email);
        console.log('Existing user found:', {
          id: user?.id,
          email: user?.email,
          auth_method: user?.auth_method
        });
      } catch (e) {
        console.log('Creating new user...');
        console.error('User fetch error:', {
          error: e,
          stack: e instanceof Error ? e.stack : undefined
        });
        
        user = await addUser({
          name: userData.name,
          email: userData.email,
          avatar: userData.picture,
          auth_method: "google",
        });
        console.log('New user created:', {
          id: user.id,
          email: user.email
        });
      }

      // Get User Blogs
      console.log('Fetching user blogs...');
      const userBlogs = await getBlogsByUserId(user.id);
      console.log('User blogs fetched:', {
        count: userBlogs.length,
        blogIds: userBlogs.map(b => b.id)
      });

      // Prepare Response
      console.log('Preparing response...');
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

      // Validate Response Against Schema
      console.log('Validating response against schema...');
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
        console.log('Validation successful!');
        
        // Generate Token and Set Cookie
        console.log('Generating session token...');
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
