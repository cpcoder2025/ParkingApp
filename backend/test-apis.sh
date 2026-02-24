#!/bin/bash
# Run this script when server is running on http://localhost:3000
# Usage: ./test-apis.sh
#
# If server fails to start with "payments.booking_id contains null values", run:
#   psql -U postgres -d parking_db -c "DELETE FROM payments WHERE booking_id IS NULL;"
# Or (if using .env DATABASE_*): psql $DATABASE_URL -c "DELETE FROM payments WHERE booking_id IS NULL;"
# Then: npm run start

BASE="http://localhost:3000"
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

test_api() {
  local name="$1"
  local method="$2"
  local path="$3"
  local data="$4"
  local token="$5"
  local status="$6"  # expected status (optional)

  if [ -n "$token" ]; then
    if [ "$method" = "GET" ]; then
      res=$(curl -s -w "\n%{http_code}" -X GET "$BASE$path" -H "Authorization: Bearer $token")
    else
      res=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE$path" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d "$data")
    fi
  else
    if [ "$method" = "GET" ]; then
      res=$(curl -s -w "\n%{http_code}" -X GET "$BASE$path")
    else
      res=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE$path" -H "Content-Type: application/json" -d "$data")
    fi
  fi

  code=$(echo "$res" | tail -n1)
  body=$(echo "$res" | sed '$d')

  if [ -n "$status" ]; then
    if [ "$code" = "$status" ]; then
      echo -e "${GREEN}✓ $name${NC} (HTTP $code)"
    else
      echo -e "${RED}✗ $name${NC} expected $status got $code"
      echo "  $body" | head -c 200
      echo
    fi
  else
    if [ "${code:0:1}" = "2" ]; then
      echo -e "${GREEN}✓ $name${NC} (HTTP $code)"
    else
      echo -e "${RED}✗ $name${NC} (HTTP $code)"
      echo "  $body" | head -c 200
      echo
    fi
  fi
}

echo "=== 1. Auth APIs ==="
test_api "POST /api/auth/register" POST /api/auth/register '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User","phone":"+1234567890"}' "" "201"
test_api "POST /api/auth/login (invalid)" POST /api/auth/login '{"email":"bad@x.com","password":"wrong"}' "" "401"
LOGIN=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"Test123!"}')
TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
test_api "POST /api/auth/login" POST /api/auth/login '{"email":"test@example.com","password":"Test123!"}' "" "200"
test_api "POST /api/auth/logout" POST /api/auth/logout "" "$TOKEN" "200"
test_api "POST /api/auth/forgot-password" POST /api/auth/forgot-password '{"email":"test@example.com"}' "" "200"

echo ""
echo "=== 2. Parking APIs (need token) ==="
LOGIN=$(curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"Test123!"}')
TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
test_api "GET /api/parking" GET /api/parking "" "$TOKEN"
test_api "GET /api/parking/nearby?latitude=40.7&longitude=-74" GET "/api/parking/nearby?latitude=40.7&longitude=-74" "" "$TOKEN"

echo ""
echo "=== 3. Bookings APIs (need token) ==="
test_api "GET /api/bookings" GET /api/bookings "" "$TOKEN"
test_api "GET /api/bookings/history" GET /api/bookings/history "" "$TOKEN"

echo ""
echo "=== 4. Payments APIs (need token) ==="
test_api "GET /api/payments/methods" GET /api/payments/methods "" "$TOKEN"
test_api "GET /api/payments/invoices" GET /api/payments/invoices "" "$TOKEN"

echo ""
echo "=== Done ===="
