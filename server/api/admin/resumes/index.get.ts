import { count, desc, or, like, eq } from 'drizzle-orm';
import { resumes, users } from '../../../database/schema';

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
                like(resumes.name, `%${search}%`),
                like(users.email, `%${search}%`),
            )
            : undefined;

        // Get total count and resumes in parallel
        const [totalResult, resumesResult] = await Promise.all([
            db.select({ count: count() })
                .from(resumes)
                .leftJoin(users, eq(resumes.userId, users.id))
                .where(whereCondition),
            db.select({
                id: resumes.id,
                user_id: resumes.userId,
                name: resumes.name,
                template: resumes.template,
                is_active: resumes.isActive,
                created_at: resumes.createdAt,
                updated_at: resumes.updatedAt,
                user_email: users.email,
            })
                .from(resumes)
                .leftJoin(users, eq(resumes.userId, users.id))
                .where(whereCondition)
                .orderBy(desc(resumes.createdAt))
                .limit(limit)
                .offset(offset),
        ]);

        const total = totalResult[0]?.count || 0;

        return {
            resumes: resumesResult,
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
