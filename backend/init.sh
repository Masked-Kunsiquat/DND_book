#!/bin/sh

PB_EXEC="/pb/pocketbase"
PB_URL="http://localhost:8080"

# Superuser Credentials (Environment Variables or Defaults)
SUPERUSER_EMAIL=${SUPERUSER_EMAIL:-"superadmin@example.com"}
SUPERUSER_PASSWORD=${SUPERUSER_PASSWORD:-"SuperSecret123"}

# First App User Credentials
ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@example.com"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"SuperSecret123"}

echo "Waiting for PocketBase to be ready..."
until curl -s "$PB_URL/api/health" | grep "ok"; do
  sleep 2
done
echo "✅ PocketBase is ready!"

# Create Superuser (Only if Database is Empty)
if [ ! -f "/pb/pb_data/data.db" ]; then
  echo "🔑 Creating PocketBase Superuser..."
  $PB_EXEC superuser create "$SUPERUSER_EMAIL" "$SUPERUSER_PASSWORD"
  echo "✅ Superuser created successfully!"
else
  echo "🔑 Superuser already exists, skipping creation."
fi

# Check if an admin user exists
USER_COUNT=$(curl -s "$PB_URL/api/collections/users/records" | jq '.totalItems')

if [ "$USER_COUNT" -eq 0 ]; then
  echo "👤 No users found. Creating the first admin user..."
  curl -X POST "$PB_URL/api/collections/users/records" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "'"$ADMIN_EMAIL"'",
      "password": "'"$ADMIN_PASSWORD"'",
      "passwordConfirm": "'"$ADMIN_PASSWORD"'",
      "emailVisibility": true,
      "verified": true,
      "name": "Admin User"
    }'
  echo "✅ Admin user created successfully!"
else
  echo "👤 Admin user already exists, skipping creation."
fi
