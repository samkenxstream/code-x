
var RetrieveAutoFillTradeDetails_Module = (function () {

    var bDebug = false;

    /****************************************************************************************
    Retrieve the TradeDetails for Auto Fill after Trade_Id Entry by User
    *****************************************************************************************/

    function RetrieveAutoFillTradeDetails_FromMongoDB(webServerPrefix, queryObject_Record, Client_Request, dynamicFieldsToBeUpdated) {

        var xmlhttp;
        var httpRequestString = webServerPrefix;

        xmlhttp = new XMLHttpRequest();
        httpRequestString += "Client_Request=" + Client_Request;

        var queryObject_Keys = queryObject_Record.keys();

        for (var currentKey of queryObject_Keys) {

            httpRequestString += "&"
            httpRequestString += currentKey + "=" + queryObject_Record.get(currentKey);
        }

        xmlhttp.open("POST", httpRequestString, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.setRequestHeader("accept", "application/json");

        // Wait for Async response and Handle it in web page

        xmlhttp.onreadystatechange = function () {

            if (this.status == 200) {

                if (this.readyState == 4) {

                    if (bDebug == true) {

                        alert("Successfully Retrieved the Trade Details Records through API : " + Client_Request);
                    }


                    //Parse the JSON Response Object

                    var responseTradeDetails = JSON.parse(this.response);

                    if (bDebug == true) {

                        alert("Response for RetrieveTradeDetails : Trade Details Record => " + responseTradeDetails);
                    }

                    if (responseTradeDetails != null && responseTradeDetails != undefined) {

                        autoFillTheTradeDetails(responseTradeDetails, dynamicFieldsToBeUpdated);

                    } else {

                        alert("Trade Details are not found for Trade_Id => " + queryObject_Record.get("Trade_Id"));
                    }

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response for RetrieveTradeDetails call :=> Status : " + this.status + " readyState : " + this.readyState);
                    }
                }

            } else {

                alert("Failure to place RetrieveTradeDetails call :=> Status : " + this.status + " readyState : " + this.readyState);
            }

        };

        if (bDebug == true) {

            alert("Retrieving the Trade Details from MongoDB => httpRequest : " + httpRequestString);
        }

        xmlhttp.send();

    }

    /***********************************************************************************************************
    Helper Methods : fillTheDetailsInSelectionBoxss
    ************************************************************************************************************/

    function autoFillTheTradeDetails(tradeDetailsRecord, dynamicFieldsToBeUpdated) {

        // Retrieve Input Field Id's

        var buyerInputField = document.getElementById(dynamicFieldsToBeUpdated.get("Buyer_Field_Id"));
        var sellerInputField = document.getElementById(dynamicFieldsToBeUpdated.get("Seller_Field_Id"));
        var sellerIdInputField = document.getElementById(dynamicFieldsToBeUpdated.get("Seller_Id_Field_Id"));
        var shipmentInputField = document.getElementById(dynamicFieldsToBeUpdated.get("Shipment_Field_Id"));
        var shipmentCountInputField = document.getElementById(dynamicFieldsToBeUpdated.get("Shipment_Count_Field_Id"));
        var creditAmountInputField = document.getElementById(dynamicFieldsToBeUpdated.get("Credit_Amount_Field_Id"));

        // Retrieve Input Field Values to be filled

        var buyerInputValue = tradeDetailsRecord.Buyer;
        var sellerInputValue = tradeDetailsRecord.Seller;
        var shipmentInputValue = tradeDetailsRecord.Shipment;
        var shipmentCountValue = tradeDetailsRecord.ShipmentCount;
        var creditAmountValue = tradeDetailsRecord.Amount;

        // Log error if one of the required Fields is missing while raising LC Request

        if (buyerInputValue == undefined || buyerInputValue == null ||
            sellerInputValue == undefined || sellerInputValue == null ||
            shipmentInputValue == undefined || shipmentInputValue == null ||
            shipmentCountValue == undefined || shipmentCountValue == null ||
            creditAmountValue == undefined || creditAmountValue == null
        ) {

            alert("inappropriate Trade Details are recorded : Please place the Trade properly and get approval before raising LC Request ");
            return;
        }

        // Add Option with UserName to the Selection Box

        cleanUpSelectionBoxValues(buyerInputField);
        addOptionToSelectionBox(buyerInputField, buyerInputValue);

        cleanUpSelectionBoxValues(sellerInputField);
        addOptionToSelectionBox(sellerInputField, sellerInputValue);

        cleanUpSelectionBoxValues(shipmentInputField);
        addOptionToSelectionBox(shipmentInputField, shipmentInputValue);

        shipmentCountInputField.value = shipmentCountValue;

        creditAmountInputField.value = creditAmountValue;
    }

    /***********************************************************************************************************
        Helper Methods : cleanUpSelectionBoxValues
    ************************************************************************************************************/

    function cleanUpSelectionBoxValues(selectionBox) {

        var numOfValues = selectionBox.length;

        if (bDebug == true) {

            alert("cleanUpSelectionBoxValues : numOfValues => " + numOfValues);
        }

        // Remove All the Values

        while (numOfValues > 0 ) {

            selectionBox.remove(0);
            numOfValues = selectionBox.length;
        }
    }

    /***********************************************************************************************************
        Helper Methods : addOptionToSelectionBox
    ************************************************************************************************************/

    function addOptionToSelectionBox(selectionBox, currentOptionValue) {

        var regExpr = /%20/gi;
        currentOptionValue = currentOptionValue.replace(regExpr, " ");

        // Add Option with input OptionValue to the Selection Box

        var currentElementToBeAdded = document.createElement("option");
        currentElementToBeAdded.text = currentOptionValue;

        selectionBox.add(currentElementToBeAdded);
    }

    /****************************************************************************************
        Reveal private methods 
    *****************************************************************************************/

    return {

        RetrieveAutoFillTradeDetailsRecords: RetrieveAutoFillTradeDetails_FromMongoDB
    };

})();

