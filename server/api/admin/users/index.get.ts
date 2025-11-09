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
            whereClause = 'WHERE email LIKE ? OR name LIKE ?';
            const searchPattern = `%${search}%`;
            params = [searchPattern, searchPattern];
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
        const countResult = await db.prepare(countQuery).bind(...params).first<{ total: number }>();
        const total = countResult?.total || 0;

        // Fetch paginated users
        const usersQuery = `
            SELECT
                id,
                email,
                name,
                role,
                verified,
                created_at,
                updated_at
            FROM users
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        const result = await db.prepare(usersQuery).bind(...params, limit, offset).all();

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
