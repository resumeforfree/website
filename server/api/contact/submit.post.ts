import type { D1Database } from '@cloudflare/workers-types';

// Simple in-memory rate limiter (for production, consider Redis or D1-based storage)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const RATE_LIMIT_MAX = 3; // Max 3 submissions per hour

function checkRateLimit(ipAddress: string): boolean {
    const now = Date.now();
    const timestamps = rateLimitMap.get(ipAddress) || [];

    // Filter out timestamps older than 1 hour
    const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);

    if (recentTimestamps.length >= RATE_LIMIT_MAX) {
        return false; // Rate limit exceeded
    }

    // Add current timestamp and update map
    recentTimestamps.push(now);
    rateLimitMap.set(ipAddress, recentTimestamps);

    // Clean up old entries periodically (simple approach)
    if (rateLimitMap.size > 1000) {
        for (const [ip, times] of rateLimitMap.entries()) {
            const validTimes = times.filter(ts => now - ts < RATE_LIMIT_WINDOW);
            if (validTimes.length === 0) {
                rateLimitMap.delete(ip);
            }
        }
    }

    return true; // Within rate limit
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const db = event.context.cloudflare?.env?.DB as D1Database;

    if (!db) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Database not configured',
        });
    }

    // Parse request body
    const body = await readBody(event);
    const { name, email, subject, message, turnstileToken } = body;

    // Validate input
    if (!name || !email || !subject || !message) {
        throw createError({
            statusCode: 400,
            statusMessage: 'All fields are required',
        });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid email address',
        });
    }

    // Verify Turnstile token (only in production)
    if (process.env.NODE_ENV === 'production') {
        const isValidToken = await verifyTurnstileToken(turnstileToken, config.turnstile.secretKey);
        if (!isValidToken) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid captcha verification',
            });
        }
    }

    // Get IP address and user agent
    const ipAddress = getRequestHeader(event, 'cf-connecting-ip')
        || getRequestHeader(event, 'x-forwarded-for')
        || getRequestHeader(event, 'x-real-ip')
        || 'unknown';

    const userAgent = getRequestHeader(event, 'user-agent') || 'unknown';

    // Check rate limit
    if (!checkRateLimit(ipAddress)) {
        throw createError({
            statusCode: 429,
            statusMessage: 'Too many requests. Please try again later.',
        });
    }

    try {
        // Generate unique ID
        const messageId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

        // Insert contact message into database
        await db.prepare(`
            INSERT INTO contact_messages
            (id, name, email, subject, message, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
            .bind(messageId, name.trim(), email.trim(), subject.trim(), message.trim(), ipAddress, userAgent)
            .run();

        return {
            success: true,
            message: 'Message sent successfully',
        };
    }
    catch (error) {
        console.error('Error saving contact message:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to save message',
        });
    }
});
