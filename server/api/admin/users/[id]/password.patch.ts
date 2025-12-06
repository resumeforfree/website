import bcrypt from 'bcryptjs';
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

    const userId = getRouterParam(event, 'id');
    if (!userId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'User ID required',
        });
    }

    const body = await readBody(event);
    const { newPassword } = body;

    if (!newPassword) {
        throw createError({
            statusCode: 400,
            statusMessage: 'New password is required',
        });
    }

    if (newPassword.length < 8) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Password must be at least 8 characters long',
        });
    }

    try {
        // Check if user exists
        const user = await db
            .prepare('SELECT id FROM users WHERE id = ?')
            .bind(userId)
            .first();

        if (!user) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found',
            });
        }

        // Hash the new password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update user password
        await db.prepare(`
            UPDATE users
            SET password_hash = ?, updated_at = datetime("now")
            WHERE id = ?
        `)
            .bind(passwordHash, userId)
            .run();

        return {
            success: true,
            message: 'Password updated successfully',
        };
    }
    catch (error: unknown) {
        if ((error as { statusCode?: number }).statusCode) {
            throw error;
        }
        console.error('Error updating user password:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update user password',
        });
    }
});
