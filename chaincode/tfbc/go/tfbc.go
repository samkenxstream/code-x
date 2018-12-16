/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * The sample smart contract for documentation topic:
 * Trade Finance Use Case - WORK IN  PROGRESS
 */

package main


import (
	"encoding/json"
	"fmt"
	"strconv"
	"bytes"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type SmartContract struct {
}

// Define the trade agreement
type TradeAgreement struct {
	TAId 				string    	`json:"tradeAgreementId"`
	Buyer    		string   		`json:"buyer"`
	Seller			string			`json:"seller"`
	Amount			int					`json:"amount"`
	Goods				string			`json:"Goods"`
	GoodsCount 	string 			`json:"GoodsCount"`
	Status			string			`json:"status"` //REQUESTED,ACCEPTED,SHIPPED,GOODS RECEIVED,PAYMENT REQUESTED,PAYMENT DONE
}
// Define the letter of credit
type LetterOfCredit struct {
	LCId					string		`json:"id"`
	ExpiryDate		string		`json:"expiryDate"`
	TAId 					string 		`json:"id"`
	Buyer    			string   	`json:"buyer"`
	Bank					string		`json:"bank"`
	Seller				string		`json:"seller"`
	Amount				int				`json:"amount"`
	Goods					string		`json:"Goods"`
	GoodsCount 		string 		`json:"GoodsCount"`
	Currency 			string 		`json:"Currency"`
	Status				string		`json:"status"` //REQUESTED,ISSUED,ACCEPTED
}


func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger appropriately
	if function == "acceptTrade" {
		return s.acceptTrade(APIstub, args)
	} else if function == "requestTrade" {
		return s.requestTrade(APIstub,args)
	} else if function == "requestLC" {
		return s.requestLC(APIstub, args)
	} else if function == "issueLC" {
		return s.issueLC(APIstub,args)
	} else if function == "acceptLC" {
		return s.acceptLC(APIstub,args)
	} else if function == "sendShipment" {
		return s.sendShipment(APIstub,args)
	} else if function == "receiveShipment" {
		return s.receiveShipment(APIstub,args)
	} else if function == "requestPayment" {
		return s.requestPayment(APIstub, args)
	}else if function == "makePayment" {
		return s.makePayment(APIstub, args)
	}else if function == "getLC" {
		return s.getLC(APIstub, args)
	}else if function == "getLCHistory" {
		return s.getLCHistory(APIstub, args)
	}else if function == "getTA" {
		return s.getTA(APIstub, args)
	}else if function == "getTAHistory" {
		return s.getTAHistory(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) requestTrade(APIstub shim.ChaincodeStubInterface,args []string) sc.Response {

	tradeAgreementId := args[0]
	buyer := args[1]
	seller := args[2]
	Amount, err := strconv.Atoi(args[3])
	if err != nil {
		return shim.Error("No Amount")
	}
	goods := args[4]
	goodsCount := args[5]

	TradeAgreement := TradeAgreement{ TAId: tradeAgreementId,
																		Buyer: buyer,
																		Seller: seller,
																		Amount: Amount,
																		Goods: goods,
																		GoodsCount: goodsCount,
																		Status: "REQUESTED" }

	tradeAgreementBytes, err := json.Marshal(TradeAgreement)

  APIstub.PutState(tradeAgreementId,tradeAgreementBytes)
	fmt.Printf("Trade %s REQUESTED\n", args[0])

	return shim.Success(nil)
}

func (s *SmartContract) acceptTrade(APIstub shim.ChaincodeStubInterface,args []string) sc.Response {

	var tradeAgreement *TradeAgreement
	var tradeAgreementBytes []byte
	var err error

	tradeAgreementId := args[0]
	tradeAgreementBytes, err = APIstub.GetState(tradeAgreementId)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
  if err != nil {
	 return shim.Error(err.Error())
  }

	if tradeAgreement.Status == "ACCEPTED" {
		fmt.Printf("Trade %s already accepted", args[0])
	} else {
		tradeAgreement.Status = "ACCEPTED"
		tradeAgreementBytes, err = json.Marshal(tradeAgreement)
		if err != nil {
			return shim.Error("Error marshaling trade agreement structure")
		}

		err = APIstub.PutState(tradeAgreementId, tradeAgreementBytes)
		if err != nil {
			return shim.Error(err.Error())
	}
}
fmt.Printf("Trade %s ACCEPTED\n", args[0])

return shim.Success(nil)
}

func (s *SmartContract) requestLC(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	var tradeAgreementBytes, letterOfCreditBytes []byte
	var tradeAgreement TradeAgreement
	var letterOfCredit LetterOfCredit
	var err error

	tradeAgreementId := args[0]
	LCId := args[1]
	expiryDate := args[2]
	buyer := args[3]
	bank := args[4]
	seller := args[5]
	amount, err := strconv.Atoi(args[6])
	if err != nil {
		return shim.Error("No Amount")
	}
	goods := args[7]
	goodsCount := args[8]
	currency := args[9]

	tradeAgreementBytes, err = APIstub.GetState(tradeAgreementId)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	if tradeAgreement.Status != "ACCEPTED" {
		return shim.Error("Trade has not been ACCEPTED")
	}

	letterOfCredit = LetterOfCredit{ LCId: LCId,
																	 ExpiryDate: expiryDate,
		 															 TAId: tradeAgreementId,
																	 Buyer: buyer,
																	 Bank: bank,
																	 Seller: seller ,
																	 Amount: amount,
																	 Goods: goods,
																	 GoodsCount: goodsCount,
																	 Currency: currency,
																	 Status: "REQUESTED" }

	letterOfCreditBytes, err = json.Marshal(letterOfCredit)
	if err != nil {
		return shim.Error("Error marshaling letter of credit structure")
	}
	err = APIstub.PutState(LCId, letterOfCreditBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("Letter of Credit %s REQUESTED\n", LCId)

	return shim.Success(nil)
}

func (s *SmartContract) issueLC(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	var letterOfCreditBytes []byte
	var letterOfCredit LetterOfCredit
	var err error

	LCId := args[0]

	letterOfCreditBytes, err = APIstub.GetState(LCId)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = json.Unmarshal(letterOfCreditBytes, &letterOfCredit)
	if err != nil {
		return shim.Error(err.Error())
	}

	if letterOfCredit.Status != "REQUESTED" {
		return shim.Error("Letter of Credit Not Requested")
	}else if letterOfCredit.Status == "ACCEPTED" {
		return shim.Error("Letter of Credit Already Accepted")
	}else{
		letterOfCredit.Status = "ISSUED"
		letterOfCreditBytes, err = json.Marshal(letterOfCredit)
		if err != nil {
			return shim.Error("Error marshaling letter of credit structure")
		}
	}
	err = APIstub.PutState(LCId, letterOfCreditBytes)
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Printf("Letter of Credit %s ISSUED\n", LCId)

	return shim.Success(nil)
}

func (s *SmartContract) acceptLC(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	var letterOfCreditBytes []byte
	var letterOfCredit LetterOfCredit
        var err error

	LCId := args[0]

	letterOfCreditBytes, err = APIstub.GetState(LCId)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = json.Unmarshal(letterOfCreditBytes, &letterOfCredit)
	if err != nil {
		return shim.Error(err.Error())
	}

	if letterOfCredit.Status != "ISSUED" {
		return shim.Error("Letter of Credit Not Issued")
	}else if letterOfCredit.Status == "ACCEPTED" {
		return shim.Error("Letter of Credit Already Accepted")
	}else{
		letterOfCredit.Status = "ACCEPTED"
		letterOfCreditBytes, err = json.Marshal(letterOfCredit)
		if err != nil {
		return shim.Error("Error marshaling letter of credit structure")
	}

	err = APIstub.PutState(LCId, letterOfCreditBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf("Letter of Credit %s ACCEPTED\n", LCId)
}
	return shim.Success(nil)

}

func (s *SmartContract) sendShipment(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	var tradeAgreementBytes, letterOfCreditBytes []byte
	var tradeAgreement TradeAgreement
	var letterOfCredit LetterOfCredit
  var err error

	tradeAgreementId := args[0]
	LCId := args[1]
	shipmentStatus := "SHIPPED"

	tradeAgreementBytes, err = APIstub.GetState(tradeAgreementId)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	letterOfCreditBytes, err = APIstub.GetState(LCId)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = json.Unmarshal(letterOfCreditBytes, &letterOfCredit)
	if err != nil {
		return shim.Error(err.Error())
	}

	if letterOfCredit.Status != "ACCEPTED"{
		return shim.Error("Cannot Start Shipping as Letter of Credit is not Accepted")
	}else{
		tradeAgreement.Status = shipmentStatus
		tradeAgreementBytes, err = json.Marshal(tradeAgreement)
		if err != nil {
		return shim.Error("Error marshaling trade agreement structure")
		}

		err = APIstub.PutState(tradeAgreementId, tradeAgreementBytes)
		if err != nil {
			return shim.Error(err.Error())
		}

		fmt.Printf("Shipment Status for TradeAgreement %s set to %s\n",tradeAgreementId,shipmentStatus)
}
	return shim.Success(nil)

}

func (s *SmartContract) receiveShipment(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	var tradeAgreementBytes []byte
	var tradeAgreement TradeAgreement
  var err error

	tradeAgreementId := args[0]
	shipmentStatus := "GOODS RECEIVED"

	tradeAgreementBytes, err = APIstub.GetState(tradeAgreementId)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	if tradeAgreement.Status == "SHIPPED"{
			tradeAgreement.Status = shipmentStatus
			tradeAgreementBytes, err = json.Marshal(tradeAgreement)
			if err != nil {
				return shim.Error("Error marshaling trade agreement structure")
			}

			err = APIstub.PutState(tradeAgreementId, tradeAgreementBytes)
			if err != nil {
				return shim.Error(err.Error())
			}

			fmt.Printf("Shipment Status for TradeAgreement %s set to %s\n",tradeAgreementId,shipmentStatus)

	}else{
			return shim.Error("Goods not yet shipped")
	}

	return shim.Success(nil)

}

func (s *SmartContract) requestPayment(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	var tradeAgreementBytes, letterOfCreditBytes []byte
	var tradeAgreement TradeAgreement
	var letterOfCredit LetterOfCredit
        var err error

	tradeAgreementId := args[0]
	LCId := args[1]

	tradeAgreementBytes, err = APIstub.GetState(tradeAgreementId)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	letterOfCreditBytes, err = APIstub.GetState(LCId)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = json.Unmarshal(letterOfCreditBytes, &letterOfCredit)
	if err != nil {
		return shim.Error(err.Error())
	}

	if letterOfCredit.Status != "ACCEPTED" {
		return shim.Error("Cannot Request Payment as Letter of Credit is not Accepted")
	}else if tradeAgreement.Status != "GOODS RECEIVED" {
		return shim.Error("Cannot Request Payment as Goods not yet Received")
	}else {
		tradeAgreement.Status = "PAYMENT REQUESTED"
		tradeAgreementBytes, err = json.Marshal(tradeAgreement)
		if err != nil {
		return shim.Error("Error marshaling trade agreement structure")
		}

		err = APIstub.PutState(tradeAgreementId, tradeAgreementBytes)
		if err != nil {
			return shim.Error(err.Error())
		}

		fmt.Printf("Payment Requested for TradeAgreement %s \n",tradeAgreementId)
	}

	return shim.Success(nil)

}

func (s *SmartContract) makePayment(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	var tradeAgreementBytes, letterOfCreditBytes []byte
	var tradeAgreement TradeAgreement
	var letterOfCredit LetterOfCredit
	var err error

	tradeAgreementId := args[0]
	LCId := args[1]

	tradeAgreementBytes, err = APIstub.GetState(tradeAgreementId)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	letterOfCreditBytes, err = APIstub.GetState(LCId)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = json.Unmarshal(letterOfCreditBytes, &letterOfCredit)
	if err != nil {
		return shim.Error(err.Error())
	}

	if letterOfCredit.Status != "ACCEPTED" {
		return shim.Error("Cannot Make Payment as Letter of Credit is not Accepted")
	}else if tradeAgreement.Status != "PAYMENT REQUESTED" {
		return shim.Error("Cannot Make Payment as Payment Request not received")
	}else {
		tradeAgreement.Status = "PAYMENT DONE"
		tradeAgreementBytes, err = json.Marshal(tradeAgreement)
		if err != nil {
		return shim.Error("Error marshaling trade agreement structure")
		}

		err = APIstub.PutState(tradeAgreementId, tradeAgreementBytes)
		if err != nil {
			return shim.Error(err.Error())
		}

		fmt.Printf("Payment Done for TradeAgreement %s \n",tradeAgreementId)
	}

	return shim.Success(nil)

}

func (s *SmartContract) getLC(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	lcId := args[0];

	LCAsBytes, _ := APIstub.GetState(lcId)

	return shim.Success(LCAsBytes)
}

func (s *SmartContract) getLCHistory(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	lcId := args[0];

	resultsIterator, err := APIstub.GetHistoryForKey(lcId)
	if err != nil {
		return shim.Error("Error retrieving LC history.")
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the marble
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return shim.Error("Error retrieving LC history.")
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		// if it was a delete operation on given key, then we need to set the
		//corresponding value null. Else, we will write the response.Value
		//as-is (as the Value itself a JSON marble)
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getLCHistory returning:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) getTA(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	taId := args[0];

	TAAsBytes, _ := APIstub.GetState(taId)

	return shim.Success(TAAsBytes)
}

func (s *SmartContract) getTAHistory(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	taId := args[0];

	resultsIterator, err := APIstub.GetHistoryForKey(taId)
	if err != nil {
		return shim.Error("Error retrieving TA history.")
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the marble
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return shim.Error("Error retrieving TA history.")
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		// if it was a delete operation on given key, then we need to set the
		//corresponding value null. Else, we will write the response.Value
		//as-is (as the Value itself a JSON marble)
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getTAHistory returning:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
