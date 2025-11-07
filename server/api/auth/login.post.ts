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
    verification_token?: string;
    verification_sent_at?: string;
    created_at: string;
    updated_at: string;
}
class DatabaseService {
    constructor(private db: D1Database) {}
    async getUserByEmail(email: string): Promise<User | null> {
        return await this.db
            .prepare('SELECT * FROM users WHERE email = ?')
            .bind(email)
            .first<User>();
    }
}
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const db = event.context.cloudflare?.env?.DB;

    if (!db) {
        const body = await readBody(event);
        const { email, password, turnstileToken } = body;

        if (process.env.NODE_ENV === 'production' && turnstileToken) {
            const isValidToken = await verifyTurnstileToken(turnstileToken, config.turnstile.secretKey);
            if (!isValidToken) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Invalid captcha verification',
                });
            }
        }
        if (!email || !password) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Email and password are required',
            });
        }
        const mockUser = {
            id: 'dev-user-' + Buffer.from(email).toString('base64').slice(0, 8),
            email,
            name: email.split('@')[0],
            verified: true,
        };
        const token = await jwt.sign(
            {
                sub: mockUser.id,
                email: mockUser.email,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
            },
            JWT_SECRET,
        );
        setCookie(event, 'auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
        });
        setCookie(event, 'user-email', mockUser.email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
        });
        return {
            user: mockUser,
            token,
        };
    }
    const body = await readBody(event);
    const { email, password, turnstileToken } = body;

    if (process.env.NODE_ENV === 'production') {
        const isValidToken = await verifyTurnstileToken(turnstileToken, config.turnstile.secretKey);
        if (!isValidToken) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid captcha verification',
            });
        }
    }

    if (!email || !password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Email and password are required',
        });
    }
    const dbService = new DatabaseService(db);
    const user = await dbService.getUserByEmail(email);
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid email or password',
        });
    }
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid email or password',
        });
    }
    const token = await jwt.sign(
        {
            sub: user.id,
            email: user.email,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        },
        JWT_SECRET,
    );
    setCookie(event, 'auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
    });
    setCookie(event, 'user-email', user.email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
    });
    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            verified: user.verified,
        },
        token,
    };
});
