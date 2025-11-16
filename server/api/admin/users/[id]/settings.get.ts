import type { D1Database } from '@cloudflare/workers-types';

interface UserSettings {
    id: string;
    user_id: string;
    settings: string | unknown;
    created_at: string;
    updated_at: string;
}

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

    try {
        // Fetch user settings
        const userSettings = await db
            .prepare('SELECT * FROM user_settings WHERE user_id = ?')
            .bind(userId)
            .first<UserSettings>();

        return {
            settings: userSettings
                ? (typeof userSettings.settings === 'string'
                        ? JSON.parse(userSettings.settings)
                        : userSettings.settings)
                : null,
            updated_at: userSettings?.updated_at || null,
        };
    }
    catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'statusCode' in error) {
            throw error;
        }
        console.error('Error fetching user settings:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch user settings',
        });
    }
});
