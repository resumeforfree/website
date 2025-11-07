#!/bin/bash

echo "Initializing D1 database..."

# Create the database if it doesn't exist
echo "Creating database..."
npx wrangler d1 create resume-builder-db 2>/dev/null || echo "Database already exists"

# Execute migrations
echo "Running migrations..."
for migration in migrations/*.sql; do
    echo "Applying $migration..."
    npx wrangler d1 execute resume-builder-db --file="$migration" --local
done

echo "Database initialization complete!"
echo ""
echo "To deploy to production, run:"
echo "  ./scripts/deploy-db.sh"