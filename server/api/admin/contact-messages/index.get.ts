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
        const countResult = await db.prepare('SELECT COUNT(*) as total FROM contact_messages').first<{ total: number }>();
        const total = countResult?.total || 0;

        // Fetch paginated contact messages, ordered by newest first
        const result = await db.prepare(`
            SELECT
                id,
                name,
                email,
                subject,
                message,
                status,
                ip_address,
                user_agent,
                created_at,
                updated_at
            FROM contact_messages
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `).bind(limit, offset).all();

        return {
            messages: result.results || [],
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    catch (error) {
        console.error('Error fetching contact messages:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch contact messages',
        });
    }
});
