#!/bin/sh

PB_URL="http://localhost:8080"

# Superuser Credentials
SUPERUSER_EMAIL=${SUPERUSER_EMAIL:-"superadmin@example.com"}
SUPERUSER_PASSWORD=${SUPERUSER_PASSWORD:-"SuperSecret123"}

# App User Credentials
APP_USER_EMAIL=${APP_USER_EMAIL:-"admin@example.com"}
APP_USER_PASSWORD=${APP_USER_PASSWORD:-"AdminSecret123"}

echo "🚀 Waiting for PocketBase to be ready..."
until curl -s "$PB_URL/api/health" | grep -q '"code":200'; do
  sleep 2
done
echo "✅ PocketBase is ready!"

# 🔑 Log in as Superuser to Get an Auth Token
echo "🔑 Logging in as Superuser..."
AUTH_RESPONSE=$(curl -s -X POST "$PB_URL/api/collections/_superusers/auth-with-password" \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "'"$SUPERUSER_EMAIL"'",
    "password": "'"$SUPERUSER_PASSWORD"'"
  }')

AUTH_TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.token')

if [ -z "$AUTH_TOKEN" ] || [ "$AUTH_TOKEN" = "null" ]; then
  echo "❌ Failed to authenticate as Superuser. Exiting..."
  exit 1
fi
echo "✅ Superuser authenticated successfully!"

# 👤 Check if the First App User Exists
echo "🔍 Checking if the first app user exists..."
USER_COUNT=$(curl -s -X GET "$PB_URL/api/collections/users/records" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.totalItems')

if [ "$USER_COUNT" -eq 0 ]; then
  echo "👤 No users found. Creating the first app user..."
  CREATE_RESPONSE=$(curl -s -X POST "$PB_URL/api/collections/users/records" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
      "email": "'"$APP_USER_EMAIL"'",
      "password": "'"$APP_USER_PASSWORD"'",
      "passwordConfirm": "'"$APP_USER_PASSWORD"'",
      "emailVisibility": true,
      "verified": true,
      "name": "Admin User"
    }')

  echo "🔹 API Response: $CREATE_RESPONSE"

  if echo "$CREATE_RESPONSE" | grep -q '"id"'; then
    echo "✅ App user created successfully!"
  else
    echo "❌ Failed to create app user!"
    exit 1
  fi
else
  echo "👤 App user already exists, skipping creation."
fi
