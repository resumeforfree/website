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
        const countResult = await db.prepare('SELECT COUNT(*) as total FROM resumes').first<{ total: number }>();
        const total = countResult?.total || 0;

        // Fetch paginated resumes with user email
        const result = await db.prepare(`
            SELECT
                r.id,
                r.user_id,
                r.name,
                r.template,
                r.is_active,
                r.created_at,
                r.updated_at,
                u.email as user_email
            FROM resumes r
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        `).bind(limit, offset).all();

        return {
            resumes: result.results || [],
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    catch (error) {
        console.error('Error fetching resumes:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch resumes',
        });
    }
});
