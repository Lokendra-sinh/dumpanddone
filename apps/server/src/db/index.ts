import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { blogs, users } from "./schema";

console.log('All env variables:', process.env);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

function createDbClient() {
  console.log('Current environment:', {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    PWD: process.env.PWD
  });
  const connectionString = process.env.DATABASE_URL!;

  if (!connectionString) {
    throw new Error(
      "Database URL is not defined! How can we connect to database if we don't know the URL"
    );
  }

  return postgres(connectionString);
}

// Create a function to initialize the db
export function initDb() {
  const client = createDbClient();
  return drizzle(client, { schema: { users, blogs } });
}

// Export a singleton instance
export const db = initDb();