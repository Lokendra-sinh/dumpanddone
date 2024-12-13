import z from 'zod'
import { ListItemNode, ParagraphNode, TextContent } from './blog'

export const ModelsSchema = z.union([z.literal("claude"), z.literal("deepseek"), z.literal("gpt")])

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

// Mark Schema
export const MarkSchema = z.object({
    type: z.enum(['bold', 'italic', 'code', 'link']),
    attrs: z.object({
        href: z.string().optional(),
        target: z.string().optional(),
    }).optional(),
})

// Text Content Schema
export const TextContentSchema: z.ZodType<TextContent> = z.object({
    type: z.literal('text'),
    text: z.string(),
    marks: z.array(MarkSchema).optional(),
})

// Hard Break Node Schema
export const HardBreakNodeSchema = z.object({
    type: z.literal('hardBreak'),
})

// Image Node Schema
export const ImageNodeSchema = z.object({
    type: z.literal('image'),
    attrs: z.object({
        src: z.string(),
        alt: z.string().optional(),
        title: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
    }),
})

// Paragraph Node Schema
export const ParagraphNodeSchema: z.ZodType<ParagraphNode> = z.object({
    type: z.literal('paragraph'),
    attrs: z.object({
        textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
        aiGenerated: z.boolean().optional(),
    }).optional(),
    content: z.array(z.union([TextContentSchema, HardBreakNodeSchema])),
})

// Heading Node Schema
export const HeadingNodeSchema = z.object({
    type: z.literal('heading'),
    attrs: z.object({
        level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
        textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
    }),
    content: z.array(TextContentSchema),
})

// List Item Node Schema (needs to be declared before being used)
export const ListItemNodeSchema: z.ZodType<ListItemNode> = z.lazy(() => 
    z.object({
        type: z.literal('listItem'),
        content: z.array(z.union([
            ParagraphNodeSchema,
            BulletListNodeSchema,
            OrderedListNodeSchema,
        ])),
    })
)

// Bullet List Node Schema
export const BulletListNodeSchema = z.object({
    type: z.literal('bulletList'),
    content: z.array(ListItemNodeSchema),
})

// Ordered List Node Schema
export const OrderedListNodeSchema = z.object({
    type: z.literal('orderedList'),
    attrs: z.object({
        start: z.number().optional(),
    }).optional(),
    content: z.array(ListItemNodeSchema),
})

// Code Block Node Schema
export const CodeBlockNodeSchema = z.object({
    type: z.literal('codeBlock'),
    attrs: z.object({
        language: z.string().optional(),
    }).optional(),
    content: z.array(TextContentSchema),
})

// Blockquote Node Schema
export const BlockquoteNodeSchema = z.object({
    type: z.literal('blockquote'),
    content: z.array(z.union([ParagraphNodeSchema, HeadingNodeSchema])),
})

// Combined Node Type Schema
export const TipTapNodeSchema = z.union([
    ParagraphNodeSchema,
    HeadingNodeSchema,
    BulletListNodeSchema,
    OrderedListNodeSchema,
    CodeBlockNodeSchema,
    BlockquoteNodeSchema,
    ImageNodeSchema,
])

// Content Type Schema
export const TipTapContentSchema = z.array(TipTapNodeSchema)

// Document Schema
export const TiptapDocumentSchema = z.object({
    type: z.literal('doc'),
    content: TipTapContentSchema,
})

// // Type exports
export type OutlineSectionType = z.infer<typeof OutlineSectionSchema>
export type BlogOutlineType = z.infer<typeof BlogOutlineSchema>
// export type TiptapDocumentType = z.infer<typeof TiptapDocumentSchema>
// export type TipTapContentType = z.infer<typeof TipTapContentSchema>
// export type TipTapNodeType = z.infer<typeof TipTapNodeSchema>
// export type MarkType = z.infer<typeof MarkSchema>
// export type TextContentType = z.infer<typeof TextContentSchema>
// export type ParagraphNodeType = z.infer<typeof ParagraphNodeSchema>
// export type HeadingNodeType = z.infer<typeof HeadingNodeSchema>
// export type BulletListNodeType = z.infer<typeof BulletListNodeSchema>
// export type OrderedListNodeType = z.infer<typeof OrderedListNodeSchema>
// export type CodeBlockNodeType = z.infer<typeof CodeBlockNodeSchema>
// export type BlockquoteNodeType = z.infer<typeof BlockquoteNodeSchema>
// export type ImageNodeType = z.infer<typeof ImageNodeSchema>
// export type ListItemNodeType = z.infer<typeof ListItemNodeSchema>
// export type HardBreakNodeType = z.infer<typeof HardBreakNodeSchema>