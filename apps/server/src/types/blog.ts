import { z } from "zod";

// Base schemas for primitive types
const headingLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6)
])

const listTypeSchema = z.union([
  z.literal("bullet"),
  z.literal("numbered")
]) 

// Base block schema
const baseBlockSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  last_modified: z.string()
});

// Block schemas using discriminated unions
const headingSchema = baseBlockSchema.extend({
  type: z.literal("heading"),
  level: headingLevelSchema,
  content: z.string()
});

const paragraphSchema = baseBlockSchema.extend({
  type: z.literal("paragraph"),
  content: z.string()
});

const listSchema = baseBlockSchema.extend({
  type: z.literal("list"),
  style: listTypeSchema,
  items: z.array(z.string())
});

const codeSchema = baseBlockSchema.extend({
  type: z.literal("code"),
  language: z.string(),
  content: z.string(),
  filename: z.string().optional()
});

const quoteSchema = baseBlockSchema.extend({
  type: z.literal("quote"),
  content: z.string()
});

// Combined block schema
const blockSchema = z.discriminatedUnion("type", [
  headingSchema,
  paragraphSchema,
  listSchema,
  codeSchema,
  quoteSchema
]);

// Complete blog schema
const generatedBlogSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  author: z.string(),
  datePublished: z.string(),
  dateModified: z.string(),
  estimatedReadTime: z.string(),
  tags: z.array(z.string()),
  content: z.array(blockSchema),
});

export type GeneratedBlogType = z.infer<typeof generatedBlogSchema>

// Validation schemas
const validationErrorSchema = z.object({
  field: z.string(),
  message: z.string()
});

const validationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(validationErrorSchema).optional()
});

// Infer all our types from the schemas
export type HeadingLevel = z.infer<typeof headingLevelSchema>;
export type ListType = z.infer<typeof listTypeSchema>;
export type BaseBlock = z.infer<typeof baseBlockSchema>;
export type Heading = z.infer<typeof headingSchema>;
export type Paragraph = z.infer<typeof paragraphSchema>;
export type List = z.infer<typeof listSchema>;
export type Code = z.infer<typeof codeSchema>;
export type Quote = z.infer<typeof quoteSchema>;
export type Block = z.infer<typeof blockSchema>;
export type GeneratedBlog = z.infer<typeof generatedBlogSchema>;
export type ValidationError = z.infer<typeof validationErrorSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;


export const isHeading = (block: Block): block is Heading => 
 block.type === 'heading' && headingSchema.safeParse(block).success

export const isParagraph = (block: Block): block is Paragraph => 
    block.type === 'paragraph' && paragraphSchema.safeParse(block).success

export const isList = (block: Block): block is List => 
    block.type === "list" && listSchema.safeParse(block).success;
  
  export const isCode = (block: Block): block is Code => 
    block.type === "code" && codeSchema.safeParse(block).success;
  
  export const isQuote = (block: Block): block is Quote => 
    block.type === "quote" && quoteSchema.safeParse(block).success;

 
  export const validateBlog = (blog: unknown): ValidationResult => {
    const result = generatedBlogSchema.safeParse(blog)

    if (!result.success) {
        return {
          isValid: false,
          errors: result.error.errors.map(error => ({
            field: error.path.join("."),
            message: error.message
          }))
        };
      }
    
      return {
        isValid: true
      };
  }

  export {
    generatedBlogSchema,
    blockSchema,
  }
