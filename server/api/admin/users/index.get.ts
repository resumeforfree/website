import type { D1Database } from '@cloudflare/workers-types';

export default defineEventHandler(async (event) => {
    // Verify admin authentication
    await requireAdmin(event);

    const db = event.context.cloudflare?.env?.DB as D1Database;

    if (!db) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Database not configured',
        });
    }

    try {
        // Get pagination params
        const query = getQuery(event);
        const page = Math.max(1, parseInt(query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 50));
        const offset = (page - 1) * limit;

        // Get total count
        const countResult = await db.prepare('SELECT COUNT(*) as total FROM users').first<{ total: number }>();
        const total = countResult?.total || 0;

        // Fetch paginated users
        const result = await db.prepare(`
            SELECT
                id,
                email,
                name,
                role,
                verified,
                created_at,
                updated_at
            FROM users
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `).bind(limit, offset).all();

        return {
            users: result.results || [],
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    catch (error) {
        console.error('Error fetching users:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch users',
        });
    }
});
