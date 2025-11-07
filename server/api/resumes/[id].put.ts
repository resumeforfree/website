import jwt from '@tsndr/cloudflare-worker-jwt';
import type { D1Database } from '@cloudflare/workers-types';

const JWT_SECRET = process.env.JWT_SECRET;

interface ResumeUpdates {
    name?: string;
    data?: unknown;
    template?: string;
    settings?: unknown;
    isActive?: boolean;
}

class DatabaseService {
    constructor(private db: D1Database) {}
    async updateResume(resumeId: string, userId: string, updates: ResumeUpdates): Promise<void> {
        const setParts: string[] = [];
        const values: unknown[] = [];
        if (updates.name !== undefined) {
            setParts.push('name = ?');
            values.push(updates.name);
        }
        if (updates.data !== undefined) {
            setParts.push('data = ?');
            values.push(JSON.stringify(updates.data));
        }
        if (updates.template !== undefined) {
            setParts.push('template = ?');
            values.push(updates.template);
        }
        if (updates.settings !== undefined) {
            setParts.push('settings = ?');
            values.push(JSON.stringify(updates.settings));
        }
        if (updates.isActive !== undefined) {
            setParts.push('is_active = ?');
            values.push(updates.isActive ? 1 : 0);
        }
        if (setParts.length === 0) {
            return;
        }
        setParts.push('updated_at = CURRENT_TIMESTAMP');
        values.push(resumeId, userId);
        const query = `UPDATE resumes SET ${setParts.join(', ')} WHERE id = ? AND user_id = ?`;
        await this.db.prepare(query).bind(...values).run();
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
    const resumeId = getRouterParam(event, 'id');
    if (!resumeId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Resume ID is required',
        });
    }
    const body = await readBody(event);
    const db = event.context.cloudflare?.env?.DB;
    if (!db) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Database not configured',
        });
    }
    const dbService = new DatabaseService(db);
    const existingResume = await dbService.getResumeById(resumeId, userId);
    if (!existingResume) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Resume not found',
        });
    }
    await dbService.updateResume(resumeId, userId, body);
    const updatedResume = await dbService.getResumeById(resumeId, userId);
    return {
        resume: {
            id: updatedResume.id,
            name: updatedResume.name,
            isActive: updatedResume.is_active,
            template: updatedResume.template,
            data: typeof updatedResume.data === 'string' ? JSON.parse(updatedResume.data) : updatedResume.data,
            settings: typeof updatedResume.settings === 'string' ? JSON.parse(updatedResume.settings || '{}') : updatedResume.settings,
            createdAt: updatedResume.created_at,
            updatedAt: updatedResume.updated_at,
        },
    };
});
