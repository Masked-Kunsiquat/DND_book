#!/bin/sh

PB_URL="http://localhost:8090"
PB_EXEC="pb/pocketbase"

ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@example.com"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"SuperSecret123"}

SUPERUSER_EMAIL=${SUPERUSER_EMAIL:-"superadmin@example.com"}
SUPERUSER_PASSWORD=${SUPERUSER_PASSWORD:-"SuperSecret123!!!"}

echo "Waiting for PocketBase to be ready..."
until curl -s "$PB_URL/api/health" | grep "ok"; do
    sleep 2
done
echo "PocketBase is ready!"

if [ ! -f "/pb/pb_data/data.db" ]; then
    echo "Creating PocketBase superuser..."
    $PB_EXEC superuser create "$SUPERUSER_EMAIL" "$SUPERUSER_PASSWORD"
    echo "Superuser created successfully!"
else
    echo "Superuser already exists."
fi

# Check if an admin user exists in the `users` collection
USER_COUNT=$(curl -s "$PB_URL/api/collections/users/records" | jq '.totalItems')

if [ "$USER_COUNT" -eq 0 ]; then
    echo "No users found. Creating the first admin user..."
    curl -X POST "$PB_URL/api/collections/users/records" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "'"$ADMIN_EMAIL"'",
            "password": "'"$ADMIN_PASSWORD"'",
            "passwordConfirm": "'"$ADMIN_PASSWORD"'",
            "username": "admin",
            "role": "admin"
            }'
        echo "Admin user created succesfully!"
    else
        echo "Admin user already exists."
    fi