import {
  authProcedure,
  protectedProcedure,
  publicProcedure,
} from "../trpc/initTRPC";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { addUser } from "../db/queries/addUser";
import { generateJwtToken } from "../utils/generate-jwt-token";
import { getUser, getUserByEmail } from "../db/queries/findUser";

const LoginSchema = z.object({
  accessToken: z.string(),
});

// Cookie config can be reused
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const googleLogin = authProcedure
  .input(LoginSchema)
  .mutation(async ({ input, ctx }) => {
    const { accessToken } = input;

    if (!accessToken) {
      throw new TRPCError({
        code: "PARSE_ERROR",
        message: "Access token is missing",
      });
    }

    let userData;

    try {
      userData = await verifyGoogleToken(accessToken);
    } catch (error) {
      console.error("Token verification failed:", error);
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Failed to verify the access token",
      });
    }

    let user;
    try {
      user = await getUserByEmail(userData.email);
      console.log("USER is", user)
      if(!user){
        throw new Error("User does not exist")
      }
    } catch (e) {
      console.log("Creating NEW user");
      try {
        user = await addUser({
          name: userData.name,
          email: userData.email,
          avatar: userData.picture,
          password: null,
          auth_method: "google",
        });
      } catch (error) {
        console.error("Failed to create new user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user account",
        });
      }
    }

    try {
      const sessionToken = generateJwtToken(user.id);
      ctx.res.cookie("authToken", sessionToken, COOKIE_CONFIG);
      console.log("returning the user");
      return {
        user: {
          name: user.name,
          avatar: user.avatar,
          email: user.email,
          created_at: user.created_at,
          auth_method: user.auth_method
        }
      };
    } catch (error) {
      console.error("Session creation failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create session",
      });
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
      }
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
