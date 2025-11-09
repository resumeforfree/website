import { drizzle } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';
import * as schema from '../database/schema';

// Re-export schema for use in API routes
export * from '../database/schema';

/**
 * Get Drizzle ORM instance with D1 database
 *
 * @param event - H3 event from Nuxt/Nitro
 * @returns Drizzle instance configured with D1
 *
 * @example
 * ```ts
 * export default defineEventHandler(async (event) => {
 *   const db = useDrizzle(event);
 *   const users = await db.select().from(schema.users).all();
 *   return users;
 * });
 * ```
 */
export function useDrizzle(event: any) {
    const d1 = event.context.cloudflare?.env?.DB as D1Database;

    if (!d1) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Database not configured',
        });
    }

    return drizzle(d1, { schema });
}

/**
 * Get raw D1 database instance
 * Use this when you need direct D1 API access (e.g., for transactions)
 *
 * @param event - H3 event from Nuxt/Nitro
 * @returns Raw D1 database instance
 */
export function getD1(event: any): D1Database {
    const d1 = event.context.cloudflare?.env?.DB as D1Database;

    if (!d1) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Database not configured',
        });
    }

    return d1;
}
