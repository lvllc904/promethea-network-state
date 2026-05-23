#!/bin/bash
TOKEN="DpvlTCTjCQix7Udb4DG__Hwi5uVWBXP9eyCp7BMj"
ZONE_ID="dfcd262799ad2839371eafbf1df230b5"
NEW_IP="8.233.243.232"

# IDs to delete
IDS_TO_DELETE=(
  "e346369c7f3f4150c866e48adc5e28d5"
  "26733f1fe029fe9b6d2aa1db3ac22242"
  "bc7dd5387666ea54ef6895534859aaf8"
  "a4d2b9476b30fd492d568bb8f4bf7e97"
  "633cd1c445a8e967e473f377c5c6a92d"
  "8b7fa15e4c295dc253d85981da39b346"
  "28b8425e51abe80114d0dbea2526d81a"
)

# Update first A record
curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/c29af2a0a595faa244454b763ac1ed30" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     --data "{\"type\":\"A\",\"name\":\"lvhllc.org\",\"content\":\"$NEW_IP\",\"ttl\":1,\"proxied\":false}"

# Delete the rest
for ID in "${IDS_TO_DELETE[@]}"; do
  curl -s -X DELETE "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$ID" \
       -H "Authorization: Bearer $TOKEN" \
       -H "Content-Type: application/json"
done

echo "DNS Update Complete!"
