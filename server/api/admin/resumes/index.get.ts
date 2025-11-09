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
        // Get pagination and search params
        const query = getQuery(event);
        const page = Math.max(1, parseInt(query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 50));
        const offset = (page - 1) * limit;
        const search = (query.search as string || '').trim();

        // Build WHERE clause for search
        let whereClause = '';
        let params: any[] = [];

        if (search) {
            whereClause = 'WHERE r.name LIKE ? OR u.email LIKE ?';
            const searchPattern = `%${search}%`;
            params = [searchPattern, searchPattern];
        }

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM resumes r
            LEFT JOIN users u ON r.user_id = u.id
            ${whereClause}
        `;
        const countResult = await db.prepare(countQuery).bind(...params).first<{ total: number }>();
        const total = countResult?.total || 0;

        // Fetch paginated resumes with user email
        const resumesQuery = `
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
            ${whereClause}
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const result = await db.prepare(resumesQuery).bind(...params, limit, offset).all();

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
