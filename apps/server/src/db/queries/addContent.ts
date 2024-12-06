import { TRPCError } from "@trpc/server";
import { db } from "..";
import { blogs } from "../schema";
import { type BlogOutlineType, type TiptapDocument } from '@dumpanddone/types';

const emptyOutline: BlogOutlineType = {
    sections: [],
    created_at: new Date(),
    updated_at: new Date()
};

const emptyBlog: TiptapDocument = {
    type: 'doc',
    content: []
};

export async function addChaos(chaos: string, userId: string, blogId: string) {
    try {

        return await db.insert(blogs).values({
            id: blogId,
            user_id: userId,
            chaos: chaos,
            outline: emptyOutline,
            blog: emptyBlog,
        });

    } catch (e) {
        console.error("Operation failed while writing chaos to DB", e);
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to add chaos to database',
            cause: e
        });
    }
}