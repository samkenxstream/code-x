# Trade finance on Hyperledger Fabric 
Trade finance application on Hyperledger Fabric - Hackathon Project - Group 8

Chaincode actions are explained in this doc - https://docs.google.com/document/d/1jHLU-W_vb5CjjyPxxhi5eaFXUxqojh0OG5-7AfXU8Vs/edit?usp=sharing


pre-requisites
1) Use an ubuntu machine
2) install docker-ce, docker-compose
3) install npm

Instructions
1) git clone https://github.com/TSBlockchain/Hackathon-Team8-TF.git
2) cd Hackathon-Team8-TF
3) run
  1) sudo ./start.sh
  2) sudo ./setup.sh
4) at this point ensure you have 11 docker containers running. 
    1.cli                        
    2.peer0.bank.tfbc.com                        
    3.peer0.seller.tfbc.com                        
    4.peer0.buyer.tfbc.com                        
    5.couchdb1                        
    6.ca.buyer.tfbc.com                        
    7.orderer.tfbc.com                        
    8.ca.seller.tfbc.com                        
    9.couchdb0                        
    10.ca.bank.tfbc.com                        
    11.couchdb2
5) cd tfbc-api
6) run
  1) npm install
  2) rm hfc-key-store/*
  3) ./enroll_all.sh
  4) npm start
7) at this point, you will see that express server is running in the 3000 port with
  1) /tfbc - API
  2) /api-docs - swagger UI
  3) /static/tests/ - all UI material.
  
8) start at http://<ipaddress of vm or paperspace>:3000/static/tests/TradeFinanceUI/TradeFinanceHome.html
