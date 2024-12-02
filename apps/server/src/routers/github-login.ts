import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { authProcedure } from "../trpc/initTRPC";
import { getUserByEmail } from "../db/queries/findUser";
import { addUser } from "../db/queries/addUser";
import { generateJwtToken } from "../utils/generate-jwt-token";
import { COOKIE_CONFIG } from "../utils/cookies";

const GithubAccessTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  scope: z.string(),
});

const GithubUserResponseSchema = z.object({
  id: z.number(),
  login: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  avatar_url: z.string(),
  created_at: z.string(),
});

const UserSchema = z.object({
  name: z.string(),
  email: z.string(),
  avatar: z.string(),
  created_at: z.date(),
  auth_method: z.union([
    z.literal("google"),
    z.literal("github"),
    z.literal("email"),
  ]),
});

const LoginResponseSchema = z.object({
  status: z.literal("success"),
  user: UserSchema,
});

const GithubLoginInputSchema = z.object({
  accessCode: z.string().min(1, "Access code is required"),
});

type GithubAccessTokenResponse = z.infer<
  typeof GithubAccessTokenResponseSchema
>;
type GithubUserResponse = z.infer<typeof GithubUserResponseSchema>;
type LoginResponseType = z.infer<typeof LoginResponseSchema>;

async function exchangeGithubCode(code: string): Promise<string> {
  try {
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub responded with ${response.status}`);
    }

    const data = await response.json();

    const validatedData = GithubAccessTokenResponseSchema.parse(data);

    return validatedData.access_token;
  } catch (error) {
    console.error("Error exchanging GitHub code:", error);
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Failed to exchange GitHub code for access token",
    });
  }
}

async function fetchUserDataFromGithub(
  accessToken: string,
): Promise<GithubUserResponse> {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const userData = await response.json();

    const validatedUser = GithubUserResponseSchema.parse(userData);

    return validatedUser;
  } catch (error) {
    console.error("Error fetching GitHub user data:", error);
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Failed to fetch user details from GitHub",
    });
  }
}

function normalizeGithubUser(
  githubUser: GithubUserResponse,
): z.infer<typeof UserSchema> {
  if (!githubUser.email) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "GitHub email is required. Please make your email public on GitHub.",
    });
  }

  return {
    name: githubUser.name || githubUser.login,
    email: githubUser.email,
    avatar: githubUser.avatar_url,
    created_at: new Date(),
    auth_method: "github",
  };
}

export const githubLogin = authProcedure
  .input(GithubLoginInputSchema)
  .output(LoginResponseSchema)
  .mutation(async ({ input, ctx }): Promise<LoginResponseType> => {
    const { accessCode } = input;

    const accessToken = await exchangeGithubCode(accessCode);

    const githubUser = await fetchUserDataFromGithub(accessToken);

    const normalizedUser = normalizeGithubUser(githubUser);

    const existingUser = await getUserByEmail(normalizedUser.email);

    const user = existingUser || (await addUser(normalizedUser));

    try {
      const sessionToken = generateJwtToken(user.id);
      ctx.res.cookie("authToken", sessionToken, COOKIE_CONFIG);
      return {
        status: "success",
        user: {
          name: user.name!,
          avatar: user.avatar!,
          email: user.email,
          created_at: user.created_at!,
          auth_method: user.auth_method,
        },
      };
    } catch (error) {
      console.error("Session creation failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create session",
      });
    }
  });
