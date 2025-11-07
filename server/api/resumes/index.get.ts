import jwt from '@tsndr/cloudflare-worker-jwt';
import type { D1Database } from '@cloudflare/workers-types';

const JWT_SECRET = process.env.JWT_SECRET;
interface Resume {
    id: string;
    user_id: string;
    name: string;
    is_active: boolean;
    template: string;
    data: string | unknown;
    settings: string | unknown;
    created_at: string;
    updated_at: string;
}
class DatabaseService {
    constructor(private db: D1Database) {}
    async getResumesByUserId(userId: string): Promise<Resume[]> {
        return await this.db
            .prepare('SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC')
            .bind(userId)
            .all<Resume>()
            .then(result => result.results || []);
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
    const db = event.context.cloudflare?.env?.DB;
    if (!db) {
        return {
            resumes: [],
        };
    }
    const dbService = new DatabaseService(db);
    const resumes = await dbService.getResumesByUserId(userId);
    return {
        resumes: resumes.map(resume => ({
            id: resume.id,
            name: resume.name,
            isActive: resume.is_active,
            template: resume.template,
            data: typeof resume.data === 'string' ? JSON.parse(resume.data) : resume.data,
            settings: typeof resume.settings === 'string' ? JSON.parse(resume.settings || '{}') : resume.settings,
            createdAt: resume.created_at,
            updatedAt: resume.updated_at,
        })),
    };
});
