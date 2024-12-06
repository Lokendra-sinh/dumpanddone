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
  });



export type UserSchemaType = z.infer<typeof UserSchema>