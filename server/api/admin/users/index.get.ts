import { count, desc, or, like } from 'drizzle-orm';
import { users } from '../../../database/schema';

export default defineEventHandler(async (event) => {
    // Verify admin authentication
    await requireAdmin(event);

    try {
        const db = useDrizzle(event);

        // Get pagination and search params
        const query = getQuery(event);
        const page = Math.max(1, parseInt(query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 50));
        const offset = (page - 1) * limit;
        const search = (query.search as string || '').trim();

        // Build WHERE clause for search
        const whereCondition = search
            ? or(
                like(users.email, `%${search}%`),
                like(users.name, `%${search}%`),
            )
            : undefined;

        // Get total count and users in parallel
        const [totalResult, usersResult] = await Promise.all([
            db.select({ count: count() })
                .from(users)
                .where(whereCondition),
            db.select({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                verified: users.verified,
                created_at: users.createdAt,
                updated_at: users.updatedAt,
            })
                .from(users)
                .where(whereCondition)
                .orderBy(desc(users.createdAt))
                .limit(limit)
                .offset(offset),
        ]);

        const total = totalResult[0]?.count || 0;

        return {
            users: usersResult,
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
