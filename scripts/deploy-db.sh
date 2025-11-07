#!/bin/bash

echo "Deploying D1 database to production..."

# Execute migrations on production database
echo "Running migrations on production..."
for migration in migrations/*.sql; do
    echo "Applying $migration..."
    npx wrangler d1 execute resume-builder-db --file="$migration"
done

echo "Production database deployment complete!"