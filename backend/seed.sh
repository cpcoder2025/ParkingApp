#!/bin/bash
BASE="http://localhost:3000"

login() {
  curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"$1\",\"password\":\"$2\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])"
}

echo "=== Logging in all users ==="
ADMIN_TOKEN=$(login admin@test.com Admin123!)
OWNER_TOKEN=$(login owner@test.com Test1234!)
CUST_TOKEN=$(login customer@test.com Customer123!)
SARAH_TOKEN=$(login sarah@test.com Test1234!)
MIKE_TOKEN=$(login mike@test.com Test1234!)
PRIYA_TOKEN=$(login priya@test.com Test1234!)
echo "All logged in"

create_parking() {
  curl -s -X POST $BASE/api/parking -H "Authorization: Bearer $1" -H "Content-Type: application/json" -d "$2" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])"
}

echo ""
echo "=== Creating 8 Parking Locations ==="
P1=$(create_parking "$ADMIN_TOKEN" '{"name":"Downtown Central Garage","address":"100 Market St, San Francisco, CA 94105","latitude":37.7935,"longitude":-122.3960,"totalCapacity":250,"priceHourly":6.00,"priceDaily":35.00,"amenities":["EV Charging","Covered","Security","CCTV","Elevator"]}')
echo "  1. Downtown Central Garage: $P1"

P2=$(create_parking "$ADMIN_TOKEN" '{"name":"Union Square Parking","address":"333 Post St, San Francisco, CA 94108","latitude":37.7879,"longitude":-122.4074,"totalCapacity":180,"priceHourly":8.00,"priceDaily":45.00,"amenities":["Covered","Valet","Security"]}')
echo "  2. Union Square Parking: $P2"

P3=$(create_parking "$ADMIN_TOKEN" '{"name":"Fishermans Wharf Lot","address":"2801 Leavenworth St, San Francisco, CA 94133","latitude":37.8080,"longitude":-122.4177,"totalCapacity":120,"priceHourly":5.50,"priceDaily":30.00,"amenities":["Open Air","Security","Near Transit"]}')
echo "  3. Fishermans Wharf Lot: $P3"

P4=$(create_parking "$OWNER_TOKEN" '{"name":"SOMA Tech Park Garage","address":"500 4th St, San Francisco, CA 94107","latitude":37.7816,"longitude":-122.3978,"totalCapacity":200,"priceHourly":4.00,"priceDaily":22.00,"amenities":["EV Charging","Covered","Bike Storage"]}')
echo "  4. SOMA Tech Park Garage: $P4"

P5=$(create_parking "$OWNER_TOKEN" '{"name":"Mission District Parking","address":"2500 Mission St, San Francisco, CA 94110","latitude":37.7564,"longitude":-122.4188,"totalCapacity":80,"priceHourly":3.00,"priceDaily":18.00,"amenities":["Open Air","24/7 Access"]}')
echo "  5. Mission District Parking: $P5"

P6=$(create_parking "$ADMIN_TOKEN" '{"name":"SFO Airport Long-Term","address":"780 N McDonnell Rd, San Francisco, CA 94128","latitude":37.6213,"longitude":-122.3790,"totalCapacity":800,"priceHourly":3.50,"priceDaily":20.00,"amenities":["Shuttle","Covered","Long Term","Security"]}')
echo "  6. SFO Airport Long-Term: $P6"

P7=$(create_parking "$ADMIN_TOKEN" '{"name":"Golden Gate Park Lot","address":"50 Stow Lake Dr, San Francisco, CA 94118","latitude":37.7694,"longitude":-122.4862,"totalCapacity":60,"priceHourly":2.50,"priceDaily":12.00,"amenities":["Open Air","Near Park"]}')
echo "  7. Golden Gate Park Lot: $P7"

P8=$(create_parking "$OWNER_TOKEN" '{"name":"Nob Hill Premium Valet","address":"905 California St, San Francisco, CA 94108","latitude":37.7920,"longitude":-122.4100,"totalCapacity":50,"priceHourly":12.00,"priceDaily":60.00,"amenities":["Valet","Covered","Premium","Car Wash"]}')
echo "  8. Nob Hill Premium Valet: $P8"

echo ""
echo "=== Setting Occupancy ==="
set_occ() { curl -s -X PUT "$BASE/api/parking/$1/occupancy" -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d "{\"availableSpots\":$2,\"occupiedSpots\":$3}" > /dev/null; }
set_occ $P1 180 70
set_occ $P2 45 135
set_occ $P3 90 30
set_occ $P4 120 80
set_occ $P5 55 25
set_occ $P6 500 300
set_occ $P7 40 20
set_occ $P8 10 40
echo "Occupancy set"

echo ""
echo "=== Creating Bookings ==="
create_booking() {
  curl -s -X POST $BASE/api/bookings -H "Authorization: Bearer $1" -H "Content-Type: application/json" -d "$2" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])"
}

# John (customer) - 4 bookings
B1=$(create_booking "$CUST_TOKEN" "{\"parkingId\":\"$P1\",\"startTime\":\"2026-02-20T08:00:00Z\",\"endTime\":\"2026-02-20T17:00:00Z\",\"vehiclePlate\":\"CA-7821\"}")
echo "  John B1 (Downtown, 9hrs): $B1"
B2=$(create_booking "$CUST_TOKEN" "{\"parkingId\":\"$P2\",\"startTime\":\"2026-02-21T10:00:00Z\",\"endTime\":\"2026-02-21T14:00:00Z\",\"vehiclePlate\":\"CA-7821\"}")
echo "  John B2 (Union Sq, 4hrs): $B2"
B3=$(create_booking "$CUST_TOKEN" "{\"parkingId\":\"$P6\",\"startTime\":\"2026-03-01T06:00:00Z\",\"endTime\":\"2026-03-05T06:00:00Z\",\"vehiclePlate\":\"CA-7821\"}")
echo "  John B3 (Airport, 4 days): $B3"
B4=$(create_booking "$CUST_TOKEN" "{\"parkingId\":\"$P4\",\"startTime\":\"2026-02-22T09:00:00Z\",\"endTime\":\"2026-02-22T18:00:00Z\",\"vehiclePlate\":\"CA-7821\"}")
echo "  John B4 (SOMA, to cancel): $B4"

# Sarah - 3 bookings
B5=$(create_booking "$SARAH_TOKEN" "{\"parkingId\":\"$P1\",\"startTime\":\"2026-02-20T07:00:00Z\",\"endTime\":\"2026-02-20T19:00:00Z\",\"vehiclePlate\":\"NY-5544\"}")
echo "  Sarah B5 (Downtown, 12hrs): $B5"
B6=$(create_booking "$SARAH_TOKEN" "{\"parkingId\":\"$P8\",\"startTime\":\"2026-02-23T11:00:00Z\",\"endTime\":\"2026-02-23T15:00:00Z\",\"vehiclePlate\":\"NY-5544\"}")
echo "  Sarah B6 (Nob Hill valet, 4hrs): $B6"
B7=$(create_booking "$SARAH_TOKEN" "{\"parkingId\":\"$P5\",\"startTime\":\"2026-02-25T08:00:00Z\",\"endTime\":\"2026-02-25T12:00:00Z\",\"vehiclePlate\":\"NY-5544\"}")
echo "  Sarah B7 (Mission, 4hrs): $B7"

# Mike - 3 bookings
B8=$(create_booking "$MIKE_TOKEN" "{\"parkingId\":\"$P3\",\"startTime\":\"2026-02-20T09:00:00Z\",\"endTime\":\"2026-02-20T13:00:00Z\",\"vehiclePlate\":\"TX-9012\"}")
echo "  Mike B8 (Wharf, 4hrs): $B8"
B9=$(create_booking "$MIKE_TOKEN" "{\"parkingId\":\"$P7\",\"startTime\":\"2026-02-22T10:00:00Z\",\"endTime\":\"2026-02-22T16:00:00Z\",\"vehiclePlate\":\"TX-9012\"}")
echo "  Mike B9 (GG Park, 6hrs): $B9"
B10=$(create_booking "$MIKE_TOKEN" "{\"parkingId\":\"$P1\",\"startTime\":\"2026-02-24T07:00:00Z\",\"endTime\":\"2026-02-24T18:00:00Z\",\"vehiclePlate\":\"TX-9012\"}")
echo "  Mike B10 (Downtown, to cancel): $B10"

# Priya - 2 bookings
B11=$(create_booking "$PRIYA_TOKEN" "{\"parkingId\":\"$P2\",\"startTime\":\"2026-02-20T08:00:00Z\",\"endTime\":\"2026-02-20T20:00:00Z\",\"vehiclePlate\":\"FL-3456\"}")
echo "  Priya B11 (Union Sq, 12hrs): $B11"
B12=$(create_booking "$PRIYA_TOKEN" "{\"parkingId\":\"$P4\",\"startTime\":\"2026-02-21T09:00:00Z\",\"endTime\":\"2026-02-21T17:00:00Z\",\"vehiclePlate\":\"FL-3456\"}")
echo "  Priya B12 (SOMA, 8hrs): $B12"

echo ""
echo "=== Setting Booking Statuses ==="

# Activate some bookings via QR verify (entry)
activate() {
  QR=$(curl -s "http://localhost:3000/api/bookings/$1/qr-code" -H "Authorization: Bearer $2" | python3 -c "import sys,json; print(json.load(sys.stdin)['qrCode'])")
  curl -s -X POST "$BASE/api/bookings/$1/verify" -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d "{\"qrCode\":\"$QR\"}" > /dev/null
}

# Complete some bookings (verify twice: entry + exit)
complete() {
  QR=$(curl -s "http://localhost:3000/api/bookings/$1/qr-code" -H "Authorization: Bearer $2" | python3 -c "import sys,json; print(json.load(sys.stdin)['qrCode'])")
  curl -s -X POST "$BASE/api/bookings/$1/verify" -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d "{\"qrCode\":\"$QR\"}" > /dev/null
  curl -s -X POST "$BASE/api/bookings/$1/verify" -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d "{\"qrCode\":\"$QR\"}" > /dev/null
}

# B1 - Active (John checked in at Downtown)
activate $B1 "$CUST_TOKEN"
echo "  B1: active (John at Downtown)"

# B5 - Active (Sarah checked in at Downtown)
activate $B5 "$SARAH_TOKEN"
echo "  B5: active (Sarah at Downtown)"

# B8 - Completed (Mike finished at Wharf)
complete $B8 "$MIKE_TOKEN"
echo "  B8: completed (Mike at Wharf)"

# B11 - Completed (Priya finished at Union Sq)
complete $B11 "$PRIYA_TOKEN"
echo "  B11: completed (Priya at Union Sq)"

# B4 - Cancelled (John)
curl -s -X POST "$BASE/api/bookings/$B4/cancel" -H "Authorization: Bearer $CUST_TOKEN" > /dev/null
echo "  B4: cancelled (John)"

# B10 - Cancelled (Mike)
curl -s -X POST "$BASE/api/bookings/$B10/cancel" -H "Authorization: Bearer $MIKE_TOKEN" > /dev/null
echo "  B10: cancelled (Mike)"

echo ""
echo "=== SEED COMPLETE ==="
echo ""
echo "Summary:"
echo "  Users: 7 (1 admin, 1 owner, 5 customers)"
echo "  Parking Locations: 8 (with realistic occupancy)"
echo "  Bookings: 12"
echo "    - 2 active (B1, B5)"
echo "    - 2 completed (B8, B11)"
echo "    - 2 cancelled (B4, B10)"
echo "    - 6 pending (B2, B3, B6, B7, B9, B12)"
echo ""
echo "Test accounts:"
echo "  admin@test.com / Admin123!    (admin)"
echo "  owner@test.com / Test1234!    (owner)"
echo "  customer@test.com / Customer123! (customer - John Doe)"
echo "  sarah@test.com / Test1234!    (customer)"
echo "  mike@test.com / Test1234!     (customer)"
echo "  priya@test.com / Test1234!    (customer)"
