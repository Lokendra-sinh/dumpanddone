import express from 'express'
import cors from 'cors'
import * as trpcExpress from '@trpc/server/adapters/express'
import { router } from './trpc/initTRPC'
import { generateBlog } from './routers/generate-blog'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'

dotenv.config()

export const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

const appRouter = router({
    generateBlog: generateBlog,
})

const app = express()
app.use(cors())
app.use(express.json())

app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
        router: appRouter
    })
)

app.listen(4000, () => {
    console.log("Server is listening on port 4000");
})

export type AppRouter = typeof appRouter
