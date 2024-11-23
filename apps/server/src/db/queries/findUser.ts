import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";
import { TRPCError } from "@trpc/server";



export async function getUser(userId: string){

    try{
        const userData = await db.select().from(users).where(eq(users.id, userId))
        return userData[0]
    } catch (e){
        console.error("Error while retrieving the user from database", e)
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found!"
        })
    }
}


export async function getUserByEmail(emailId: string){

    try{
        const userData = await db.select().from(users).where(eq(users.email, emailId))
        return userData[0]
    } catch (e){
        console.error("Error while retrieving the user from database", e)
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found!"
        })
    }
}