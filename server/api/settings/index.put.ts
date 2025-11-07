import jwt from '@tsndr/cloudflare-worker-jwt';
import type { D1Database } from '@cloudflare/workers-types';

const JWT_SECRET = process.env.JWT_SECRET;
class DatabaseService {
    constructor(private db: D1Database) {}
    async getUserSettings(userId: string): Promise<{ id: string; user_id: string } | null> {
        return await this.db
            .prepare('SELECT * FROM user_settings WHERE user_id = ?')
            .bind(userId)
            .first();
    }

    async upsertUserSettings(userId: string, settings: unknown): Promise<void> {
        const existingSettings = await this.getUserSettings(userId);
        if (existingSettings) {
            await this.db
                .prepare('UPDATE user_settings SET settings = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
                .bind(JSON.stringify(settings), userId)
                .run();
        }
        else {
            const settingsId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
            await this.db
                .prepare('INSERT INTO user_settings (id, user_id, settings) VALUES (?, ?, ?)')
                .bind(settingsId, userId, JSON.stringify(settings))
                .run();
        }
    }
}
export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth-token');
    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Authentication required',
        });
    }
    const isValid = await jwt.verify(token, JWT_SECRET);
    if (!isValid) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid token',
        });
    }
    const decoded = jwt.decode(token);
    const payload = decoded.payload as { sub: string };
    const userId = payload.sub;
    const body = await readBody(event);
    const { settings } = body;
    if (!settings || typeof settings !== 'object') {
        throw createError({
            statusCode: 400,
            statusMessage: 'Settings object is required',
        });
    }
    const db = event.context.cloudflare?.env?.DB;
    if (!db) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Database not configured',
        });
    }
    const dbService = new DatabaseService(db);
    await dbService.upsertUserSettings(userId, settings);
    return {
        success: true,
        settings,
    };
});
