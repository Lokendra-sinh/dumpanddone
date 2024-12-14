import { TiptapDocumentSchema } from './blogSchema';
import z from 'zod'

export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string(),
    created_at: z.date(),
    auth_method: z.union([
      z.literal("google"),
      z.literal("github"),
      z.literal("email"),
    ]),
    blogs: z.array(z.object({
      id: z.string(),
      content: TiptapDocumentSchema
    }))
  });

export type UserSchemaType = z.infer<typeof UserSchema>