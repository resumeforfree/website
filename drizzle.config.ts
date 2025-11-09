import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './server/database/schema.ts',
    out: './migrations',
    dialect: 'sqlite',
    driver: 'd1-http',
    dbCredentials: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        databaseId: '18a06c90-6adb-4400-bbf5-85313c47df0a',
        token: process.env.CLOUDFLARE_D1_TOKEN!,
    },
});
