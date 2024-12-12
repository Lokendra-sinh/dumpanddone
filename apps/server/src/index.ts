import express from "express";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { AuthContext, BaseContext, router } from "./trpc/initTRPC";
import { generateBlog } from "./routers/generate-blog";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { googleLogin } from "./routers/user";
import { verifyJwtToken } from "./utils/verify-jwt-token";
import { generateJwtToken } from "./utils/generate-jwt-token";
import cookieParser from "cookie-parser";
import { githubLogin } from "./routers/github-login";
import OpenAI from "openai";
import { silentAuth } from "./routers/silent-auth";
import { createServer } from 'http'
import { WebSocketServer } from "ws";
import { setupWebSocketHandlers } from "./ws/socket";
import { updateBlog } from "./routers/update-blog";


dotenv.config();

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



const appRouter = router({
  generateBlog: generateBlog,
  updateBlog: updateBlog,
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
setupWebSocketHandlers(wss)

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: async ({
      req,
      res,
    }): Promise<BaseContext & Partial<AuthContext>> => {
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
    },
  }),
);

httpServer.listen(4000, () => {
  console.log("Server is listening on port 4000");
});

export type AppRouter = typeof appRouter;
