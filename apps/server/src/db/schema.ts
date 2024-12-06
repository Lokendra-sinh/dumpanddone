import { BlogOutlineType, TiptapDocument } from '@dumpanddone/types'
import { timestamp, pgEnum } from "drizzle-orm/pg-core";
import { jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { type InferSelectModel } from "drizzle-orm";

// const authMethodEnum = pgEnum("auth_method", ["email", "github", "google"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  password: text("password"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  auth_method: text({ enum: ["email", "github", "google"] }).notNull(),
});

export type Users = InferSelectModel<typeof users>;



export const blogs = pgTable("blogs", {
  id: uuid("id").defaultRandom(),
  user_id: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  last_updated: timestamp("last_updated", { withTimezone: true })
    .defaultNow()
    .notNull(),
  chaos: jsonb("chaos").notNull(),
  outline: jsonb("outline").notNull().$type<BlogOutlineType>(),
  blog: jsonb("blog").notNull().$type<TiptapDocument>()

});

export type Blogs = InferSelectModel<typeof blogs>;
