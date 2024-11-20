import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js"
import { users } from "./schema";


const connectionString = 'postgresql://localhost:5432/blogdb'

const client = postgres(connectionString)

export const db = drizzle(client, { schema: {users} })