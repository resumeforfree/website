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

    async createResume(userId: string, name: string, data: unknown, template = 'template1', settings: unknown = {}): Promise<string> {
        const resumeId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
        await this.db
            .prepare('INSERT INTO resumes (id, user_id, name, is_active, template, data, settings) VALUES (?, ?, ?, 0, ?, ?, ?)')
            .bind(resumeId, userId, name, template, JSON.stringify(data), JSON.stringify(settings))
            .run();
        return resumeId;
    }

    async getResumeById(resumeId: string, userId: string): Promise<{
        id: string;
        name: string;
        is_active: number;
        template: string;
        data: string | unknown;
        settings: string | unknown;
        created_at: string;
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
    const { name, data, template, settings } = body;
    if (!name || !data) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Name and data are required',
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
    if (currentCount >= 3) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Free accounts can only store up to 3 resumes in the cloud. Please delete a resume to add a new one.',
        });
    }
    const resumeId = await dbService.createResume(userId, name, data, template, settings);
    const resume = await dbService.getResumeById(resumeId, userId);
    return {
        resume: {
            id: resume.id,
            name: resume.name,
            isActive: resume.is_active,
            template: resume.template,
            data: typeof resume.data === 'string' ? JSON.parse(resume.data) : resume.data,
            settings: typeof resume.settings === 'string' ? JSON.parse(resume.settings || '{}') : resume.settings,
            createdAt: resume.created_at,
            updatedAt: resume.updated_at,
        },
    };
});
