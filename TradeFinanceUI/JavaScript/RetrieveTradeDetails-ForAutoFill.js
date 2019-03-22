
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

                        autoFillTheTradeDetails(webServerPrefix, responseTradeDetails, dynamicFieldsToBeUpdated);

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

    function autoFillTheTradeDetails(webServerPrefix, tradeDetailsRecord, dynamicFieldsToBeUpdated) {

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

        // Auto Fill the Seller-Id Input Value

        autoFillTheSellerIdInput(webServerPrefix, sellerInputValue, sellerIdInputField);

        // Disable Updated Fields

        disableAutoUpdatedFields(dynamicFieldsToBeUpdated);
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
        Auto fill the Seller Id Input Value based on Seller Value
    *****************************************************************************************/

    function autoFillTheSellerIdInput(webServerPrefix, sellerInputValue, sellerIdInputField) {

        // Build Query

        var queryMap = new Map();
        queryMap.set("UserType", "Seller");

        // Mongo DB call for Retrieving The User Details

        var xmlhttp;
        var httpRequestString = webServerPrefix;

        xmlhttp = new XMLHttpRequest();
        httpRequestString += "Client_Request=" + "RetrieveUsersBasedOnType";

        var queryObject_Keys = queryMap.keys();

        for (var currentKey of queryObject_Keys) {

            httpRequestString += "&"
            httpRequestString += currentKey + "=" + queryMap.get(currentKey);
        }

        xmlhttp.open("POST", httpRequestString, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.setRequestHeader("accept", "application/json");

        // Wait for Async response and Handle it in web page

        xmlhttp.onreadystatechange = function () {

            if (this.status == 200) {

                if (this.readyState == 4) {

                    if (bDebug == true) {

                        alert("Successfully Retrieved the User Details Records through API : RetrieveUsersBasedOnType");
                    }

                    //Parse the JSON Response Object

                    var responseString = this.response;
                    var userDetailRecords = responseString.split("\n");

                    responseLastObject = JSON.parse(userDetailRecords[userDetailRecords.length - 2]);

                    if (bDebug == true) {

                        alert("Success Response for RetrieveUserDetails : Last UserDetails Record => " + responseLastObject);
                    }

                    fillTheSellerIdInputValue(sellerInputValue, sellerIdInputField, userDetailRecords);

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response for RetrieveUserDetails call :=> Status : " + this.status + " readyState : " + this.readyState);
                    }
                }

            } else {

                alert("Failure to place RetrieveUserDetails call :=> Status : " + this.status + " readyState : " + this.readyState);
            }

        };

        if (bDebug == true) {

            alert("Retrieving the Registered User Details from MongoDB => httpRequest : " + httpRequestString);
        }

        xmlhttp.send();

    }

    /***********************************************************************************************************
    Helper Methods : fillTheSellerIdInputValue : Auto fill Seller Id Value after Seller Input Change
    ************************************************************************************************************/

    function fillTheSellerIdInputValue(sellerInputValue, sellerIdInputField, userDetailRecords) {

        // For all the User Details of corresponding UserType

        for (var i = 0; i < userDetailRecords.length - 1; i++) {

            responseSingleObject = JSON.parse(userDetailRecords[i]);

            // Log error if userName doesn't exist

            if (responseSingleObject.Name == undefined && responseSingleObject.Name == null) {

                alert("inappropriate Name in current record of UserDetails = " + responseSingleObject.Name);

            } else {

                if (responseSingleObject.Name == sellerInputValue) {

                    // Change the Seller Id Input Value

                    var currentSellerIdValue = responseSingleObject.UserName;

                    cleanUpSelectionBoxValues(sellerIdInputField);
                    addOptionToSelectionBox(sellerIdInputField, currentSellerIdValue);
                }
            }
        }
    }


    /****************************************************************************************
        Disable the dynamic fields that are auto filled upon Trade_Id Entry
    *****************************************************************************************/

    function disableAutoUpdatedFields(dynamicFieldsUpdated) {

        var dynamicFieldIds = dynamicFieldsUpdated.values();

        for (var currentId of dynamicFieldIds) {

            var currentInputField = document.getElementById(currentId);
            currentInputField.disabled = true;
        }
    }

    /****************************************************************************************
        Reveal private methods 
    *****************************************************************************************/

    return {

        RetrieveAutoFillTradeDetailsRecords: RetrieveAutoFillTradeDetails_FromMongoDB
    };

})();

