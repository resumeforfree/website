export default defineEventHandler(async (event) => {
    setCookie(event, 'auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
    });
    setCookie(event, 'user-email', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
    });
    return { success: true };
});
