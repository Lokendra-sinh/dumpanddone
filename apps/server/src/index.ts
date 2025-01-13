import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { AuthContext, BaseContext, router } from "./trpc/initTRPC";
import { createOrUpdateBlog } from "./routers/create-or-update-blog";
import Anthropic from "@anthropic-ai/sdk";
import { googleLogin } from "./routers/google-login";
import { verifyJwtToken } from "./utils/verify-jwt-token";
import { generateJwtToken } from "./utils/generate-jwt-token";
import cookieParser from "cookie-parser";
import { githubLogin } from "./routers/github-login";
import OpenAI from "openai";
import { silentAuth } from "./routers/silent-auth";
import { createServer } from 'http'
import { WebSocketServer } from "ws";
import { Socket } from "./ws/socket";
import { updateBlog } from "./routers/update-blog";
import { syncChaos } from "./routers/sync-chaos";
import { syncOutline } from "./routers/sync-outline";
import { syncBlog } from "./routers/sync-blog";
import { S3Client } from "@aws-sdk/client-s3";


const port = process.env.PORT || 4000;

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const deepseekAi = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});


export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://994e5e1edeb19651e7bc091ce176fd9a.r2.cloudflarestorage.com`,
  credentials: {
   accessKeyId: process.env.R2_ACCESS_KEY_ID!,
   secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  },
})



const appRouter = router({
  createOrUpdateBlog: createOrUpdateBlog,
  updateBlog: updateBlog,
  syncChaos: syncChaos,
  syncOutline: syncOutline,
  syncBlog: syncBlog,
  googleLogin: googleLogin,
  githubLogin: githubLogin,
  silentAuth: silentAuth,
});

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

const httpServer = createServer(app)
export const wss = new WebSocketServer({server: httpServer})
new Socket(wss)

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: async ({
      req,
      res,
    }): Promise<BaseContext & Partial<AuthContext>> => {
      try {
        const token = req.cookies.authToken;

        const baseContextWithRes = {
          userId: undefined,
          res: res,
        };
        if (!token) return baseContextWithRes;

        const verification = verifyJwtToken(token);

        if (!verification.decoded) {
          return baseContextWithRes;
        }

        if (verification.isExpired) {
          const newSessionToken = generateJwtToken(verification.decoded.id);
          res.cookie("authToken", newSessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });
          return {
            userId: verification.decoded.id,
            res: res,
          };
        }

        return {
          userId: verification.decoded.id,
          res: res,
        };
      } catch (error) {
        console.error('Context Creation Error:', {
          error,
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    },
    onError: ({ error, type, path, input }) => {
      console.error('TRPC Error:', {
        type,
        path,
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
          cause: error.cause
        },
        input
      }); 
    }
  })
);


httpServer.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

export type AppRouter = typeof appRouter;
