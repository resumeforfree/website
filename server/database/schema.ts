import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import type { ResumeData, AppSettings } from '~/types/resume';

/**
 * Users table
 * Stores user authentication and profile information
 */
export const users = sqliteTable('users', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, '')),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: text('name'),
    verified: integer('verified', { mode: 'boolean' }).default(false),
    verificationToken: text('verification_token'),
    verificationSentAt: text('verification_sent_at'), // SQLite uses TEXT for dates
    role: text('role', { enum: ['user', 'admin'] }).default('user').notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    emailIdx: index('idx_users_email').on(table.email),
    roleIdx: index('idx_users_role').on(table.role),
}));

/**
 * Resumes table
 * Stores user resume data with JSON fields
 */
export const resumes = sqliteTable('resumes', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, '')),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).default(false),
    template: text('template').default('template1'),
    data: text('data', { mode: 'json' }).$type<ResumeData>().notNull(),
    settings: text('settings', { mode: 'json' }).$type<AppSettings>(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    userIdIdx: index('idx_resumes_user_id').on(table.userId),
    userActiveIdx: index('idx_resumes_user_active').on(table.userId, table.isActive),
}));

/**
 * User Settings table
 * Stores user-specific application settings
 */
export const userSettings = sqliteTable('user_settings', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, '')),
    userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
    settings: text('settings', { mode: 'json' }).$type<Record<string, any>>().notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    userIdIdx: index('idx_user_settings_user_id').on(table.userId),
}));

/**
 * Contact Messages table
 * Stores messages submitted via contact form
 */
export const contactMessages = sqliteTable('contact_messages', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID().replace(/-/g, '')),
    name: text('name').notNull(),
    email: text('email').notNull(),
    subject: text('subject').notNull(),
    message: text('message').notNull(),
    status: text('status', { enum: ['new', 'read', 'resolved'] }).default('new').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    statusIdx: index('idx_contact_messages_status').on(table.status),
    createdAtIdx: index('idx_contact_messages_created_at').on(table.createdAt),
    emailIdx: index('idx_contact_messages_email').on(table.email),
}));

// Export types for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;

export type UserSetting = typeof userSettings.$inferSelect;
export type NewUserSetting = typeof userSettings.$inferInsert;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;
