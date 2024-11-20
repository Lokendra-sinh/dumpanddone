import { timestamp } from "drizzle-orm/pg-core";
import { jsonb, pgTable,text, serial } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name'),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    created_at: timestamp('created_at', {withTimezone: true}).defaultNow().notNull()
})


export const blogs = pgTable('blogs', {
    id: uuid('id').defaultRandom(),
    userId: uuid('user_id').references(() => users.id, {
        onDelete: 'cascade',
    }).notNull(),
    created_at: timestamp('created_at', {withTimezone: true}).defaultNow().notNull(),
    last_updated: timestamp('last_updated', {withTimezone: true}).defaultNow().notNull(),
    content: jsonb('content').notNull(),
})