import jwt from '@tsndr/cloudflare-worker-jwt';
import type { D1Database } from '@cloudflare/workers-types';

const JWT_SECRET = process.env.JWT_SECRET;
class DatabaseService {
    constructor(private db: D1Database) {}
    async getUserResumeCount(userId: string): Promise<number> {
        const result = await this.db
            .prepare('SELECT COUNT(*) as count FROM resumes WHERE user_id = ?')
            .bind(userId)
            .first<{ count: number }>();
        return result?.count || 0;
    }

    async upsertResume(userId: string, resumeData: {
        serverId?: string;
        name: string;
        data: unknown;
        template?: string;
        settings?: unknown;
        id: string;
    }): Promise<string> {
        let existingResume = null;
        if (resumeData.serverId) {
            existingResume = await this.db
                .prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?')
                .bind(resumeData.serverId, userId)
                .first();
        }
        if (existingResume) {
            await this.db
                .prepare('UPDATE resumes SET name = ?, data = ?, template = ?, settings = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?')
                .bind(
                    resumeData.name,
                    JSON.stringify(resumeData.data),
                    resumeData.template || 'template1',
                    JSON.stringify(resumeData.settings || {}),
                    existingResume.id,
                    userId,
                )
                .run();
            return existingResume.id;
        }
        else {
            const resumeId = resumeData.serverId || crypto.randomUUID().replace(/-/g, '').slice(0, 16);
            await this.db
                .prepare('INSERT INTO resumes (id, user_id, name, is_active, template, data, settings) VALUES (?, ?, ?, 0, ?, ?, ?)')
                .bind(
                    resumeId,
                    userId,
                    resumeData.name,
                    resumeData.template || 'template1',
                    JSON.stringify(resumeData.data),
                    JSON.stringify(resumeData.settings || {}),
                )
                .run();
            return resumeId;
        }
    }

    async getResumeById(resumeId: string, userId: string): Promise<{
        id: string;
        updated_at: string;
    } | null> {
        return await this.db
            .prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?')
            .bind(resumeId, userId)
            .first();
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
    const { resumes } = body;
    if (!resumes || !Array.isArray(resumes)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Resumes array is required',
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
    const currentCount = await dbService.getUserResumeCount(userId);
    const newResumesCount = resumes.filter(resume => !resume.serverId).length;
    if (currentCount + newResumesCount > 3) {
        throw createError({
            statusCode: 400,
            statusMessage: `Free accounts can only store up to 3 resumes in the cloud. You currently have ${currentCount} resumes and are trying to add ${newResumesCount} more.`,
        });
    }
    const syncResults = [];
    for (const resumeData of resumes) {
        const serverId = await dbService.upsertResume(userId, resumeData);
        const syncedResume = await dbService.getResumeById(serverId, userId);
        syncResults.push({
            localId: resumeData.id,
            serverId: serverId,
            name: resumeData.name,
            synced: true,
            updatedAt: syncedResume.updated_at,
        });
    }
    return {
        success: true,
        results: syncResults,
    };
});
