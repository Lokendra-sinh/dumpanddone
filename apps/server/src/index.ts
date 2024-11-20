import { Socket } from 'net';
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


const client = new Socket();

client.connect(5432, '127.0.0.1', () => {
  console.log('Connected to PostgreSQL server on port 5432');

  // Send random text data
  const randomData = 'Hello, PostgreSQL!';
  client.write(randomData);
});

client.on('data', (data) => {
  console.log('Received:', data.toString());
  client.destroy(); // Close the connection after receiving data
});

client.on('close', () => {
  console.log('Connection closed');
});

client.on('error', (err) => {
  console.error('Error:', err.message);
});


export type AppRouter = typeof appRouter
