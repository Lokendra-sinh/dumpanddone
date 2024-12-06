import z from 'zod'

export const OutlineSectionSchema = z.object({
    title: z.string(),
    description: z.string(),
    id: z.string(),
    isEdited: z.boolean(),
})

export const BlogOutlineSchema = z.object({
    sections: z.array(OutlineSectionSchema),
    created_at: z.date(),
    updated_at: z.date()
})


export type OutlineSectionType = z.infer<typeof OutlineSectionSchema>
export type BlogOutlineType = z.infer<typeof BlogOutlineSchema>