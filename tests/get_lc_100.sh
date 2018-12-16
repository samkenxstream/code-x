echo "Getting Staus of LC 100.."

curl -X POST "http://localhost:3000/tfbc/getLC" -H  "accept: application/json" -H  "Content-Type: application/json" -d "{\"lcId\": \"100\"}"
echo .
echo "--END--"
