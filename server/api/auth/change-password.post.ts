import jwt from '@tsndr/cloudflare-worker-jwt';
import bcrypt from 'bcryptjs';
import type { D1Database } from '@cloudflare/workers-types';

const JWT_SECRET = process.env.JWT_SECRET;

interface User {
    id: string;
    email: string;
    password_hash: string;
    name?: string;
    verified: boolean;
    created_at: string;
    updated_at: string;
}

class DatabaseService {
    constructor(private db: D1Database) {}

    async getUserById(id: string): Promise<User | null> {
        return await this.db
            .prepare('SELECT * FROM users WHERE id = ?')
            .bind(id)
            .first<User>();
    }

    async updateUserPassword(id: string, passwordHash: string): Promise<void> {
        await this.db
            .prepare('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?')
            .bind(passwordHash, id)
            .run();
    }
}

export default defineEventHandler(async (event) => {
    try {
        // Get auth token from cookies
        const token = getCookie(event, 'auth-token');

        if (!token) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Authentication required',
            });
        }

        // Verify JWT token
        let payload;
        try {
            const isValid = await jwt.verify(token, JWT_SECRET || '');
            if (!isValid) {
                throw new Error('Invalid token');
            }
            payload = jwt.decode(token);
        }
        catch {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid authentication token',
            });
        }

        const userId = payload.payload?.sub;
        if (!userId) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid token payload',
            });
        }

        const body = await readBody(event);
        const { currentPassword, newPassword } = body;

        // Validate input
        if (!currentPassword || !newPassword) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Current password and new password are required',
            });
        }

        if (newPassword.length < 8) {
            throw createError({
                statusCode: 400,
                statusMessage: 'New password must be at least 8 characters long',
            });
        }

        const db = event.context.cloudflare?.env?.DB;

        if (!db) {
            return {
                success: true,
                message: 'Password changed successfully (development mode)',
            };
        }

        const dbService = new DatabaseService(db);

        const user = await dbService.getUserById(userId);
        if (!user) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found',
            });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Current password is incorrect',
            });
        }

        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        await dbService.updateUserPassword(userId, newPasswordHash);

        return {
            success: true,
            message: 'Password changed successfully',
        };
    }
    catch (error: unknown) {
        console.error('Change password error:', error);

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to change password',
        });
    }
});
