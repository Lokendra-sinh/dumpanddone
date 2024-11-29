import { TRPCError } from "@trpc/server";
import { db } from "../index";
import { users } from "../schema";

interface AddUserProps {
  name: string;
  email: string;
  avatar: string;
  password?: string;
  auth_method: "email" | "google" | "github";
}

export async function addUser(props: AddUserProps) {
  try {
    const userData = await db.insert(users).values(props).returning();
    return userData[0];
  } catch (e) {
    console.log("error while adding user to db", e);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to add user",
      cause: e,
    });
  }
}
