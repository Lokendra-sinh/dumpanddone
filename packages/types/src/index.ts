import { z } from "zod";
import {
  TiptapDocument,
  TipTapContentType,
  TipTapNodeType,
  ParagraphNode,
  HardBreakNode,
  HeadingNode,
  BulletListNode,
  ListItemNode,
  CodeBlockNode,
  BlockquoteNode,
  TextContent,
  Mark,
  ImageNode,
  OrderedListNode,
} from "./blog";

import {
  OutlineSectionSchema,
  BlogOutlineSchema,
  MarkSchema,
  TextContentSchema,
  HardBreakNodeSchema,
  ImageNodeSchema,
  ParagraphNodeSchema,
  HeadingNodeSchema,
  ListItemNodeSchema,
  BulletListNodeSchema,
  OrderedListNodeSchema,
  CodeBlockNodeSchema,
  BlockquoteNodeSchema,
  TipTapNodeSchema,
  TipTapContentSchema,
  TiptapDocumentSchema,
  OutlineSectionType,
  BlogOutlineType,
} from "./blogSchema";

import { UserSchema, UserSchemaType } from "./user";


type ModelsType = "claude" | "gpt" | "deepseek"
const ModelsSchema = z.union([z.literal("claude"), z.literal("deepseek"), z.literal("gpt")])

export {
  TiptapDocument,
  TipTapContentType,
  TipTapNodeType,
  ParagraphNode,
  HardBreakNode,
  HeadingNode,
  BulletListNode,
  ListItemNode,
  CodeBlockNode,
  BlockquoteNode,
  TextContent,
  Mark,
  ImageNode,
  OrderedListNode,
  OutlineSectionSchema,
  OutlineSectionType,
  BlogOutlineSchema,
  MarkSchema,
  TextContentSchema,
  HardBreakNodeSchema,
  ImageNodeSchema,
  ParagraphNodeSchema,
  HeadingNodeSchema,
  ListItemNodeSchema,
  BulletListNodeSchema,
  OrderedListNodeSchema,
  CodeBlockNodeSchema,
  BlockquoteNodeSchema,
  TipTapNodeSchema,
  TipTapContentSchema,
  TiptapDocumentSchema,
  UserSchema,
  ModelsSchema,
  BlogOutlineType,
  UserSchemaType,
  ModelsType
};
