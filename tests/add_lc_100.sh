echo "requsting a new LC 100.."

curl -X POST "http://localhost:3000/tfbc/requestLC" -H  "accept: application/json" -H  "Content-Type: application/json" -d "{  \"lcId\": \"100\",  \"buyer\": \"GlobalBuyer\",  \"bank\": \"World Bank\",  \"seller\": \"LocalSeller\",  \"expiryDate\": \"never\",  \"amount\": \"100\"}"

echo .
echo "--END--"


