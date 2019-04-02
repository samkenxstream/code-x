
var RetrieveUserDetails_Module = (function () {

    var bDebug = false;

    /****************************************************************************************
    Retrieve the User-Details Records As per Input User Type ( Buyer, Seller, Bank )
    *****************************************************************************************/

    function retrieveUserDetails_FromMongoDB(webServerPrefix, queryObject_Record, Client_Request, dynamicFieldsToBeUpdated, sellerInputChanged) {

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

                        alert("Successfully Retrieved the User Details Records through API : " + Client_Request);
                    }

                    //Parse the JSON Response Object

                    var responseString = this.response;
                    var userDetailRecords = responseString.split("\n");
                    responseLastUserRecordObject = JSON.parse(userDetailRecords[userDetailRecords.length - 2]);

                    if (bDebug == true) {

                        alert("Success Response for RetrieveUserDetails : Last UserDetails Record => " + responseLastUserRecordObject);
                    }

                    if (sellerInputChanged == true) {

                        fillDynamicFieldsBasedOnChangedSellerInput(userDetailRecords, dynamicFieldsToBeUpdated);

                    } else {

                        fillTheDetailsInSelectionBox(userDetailRecords, queryObject_Record.get("UserType"), dynamicFieldsToBeUpdated);
                    }

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
        Helper Methods : fillTheDetailsInSelectionBoxes
    ************************************************************************************************************/

    function fillTheDetailsInSelectionBox(userDetailRecords, userType, dynamicFieldsToBeUpdated) {

        // Select the Combo Box based on User Type

        var selectionBox = null;
        var sellerIdFieldBox = null;

        if (userType == "Buyer") {

            selectionBox = document.getElementById(dynamicFieldsToBeUpdated.get("Buyer_Field_Id"));

        } else if (userType == "Seller") {

            selectionBox = document.getElementById(dynamicFieldsToBeUpdated.get("Seller_Field_Id"));
            sellerIdFieldBox = document.getElementById(dynamicFieldsToBeUpdated.get("Seller_Id_Field_Id"));

        } else if (userType == "Bank") {

            selectionBox = document.getElementById(dynamicFieldsToBeUpdated.get("Bank_Field_Id"));

        }

        // For all the User Details of corresponding UserType

        for (var i = 0; i < userDetailRecords.length-1; i++) {

            responseSingleObject = JSON.parse(userDetailRecords[i]);

            // Log error if userName doesn't exist

            if (responseSingleObject.Name == undefined || responseSingleObject.Name == null) {

                alert("Inappropriate Name in current record of UserDetails = " + responseSingleObject.Name);
                continue;
            }

            var currentUserName = responseSingleObject.Name;
            var regExpr = /%20/gi;
            currentUserName = currentUserName.replace(regExpr, " ");

            // Add Option with UserName to the Selection Box

            var currentElementToBeAdded = document.createElement("option");
            currentElementToBeAdded.text = currentUserName;

            selectionBox.add(currentElementToBeAdded);

            // Add additinoal Field if not Null Input

            if (userType == "Seller" && sellerIdFieldBox != null && sellerIdFieldBox != undefined) {

                var currentIdElementToBeAdded = document.createElement("option");
                currentIdElementToBeAdded.text = responseSingleObject.UserName;

                sellerIdFieldBox.add(currentIdElementToBeAdded);
            }
        }
    }

    /***********************************************************************************************************
    Helper Methods : fillTheDynamicFieldsBasedOnChangedInput
    ************************************************************************************************************/

    function fillDynamicFieldsBasedOnChangedSellerInput(userDetailRecords, dynamicFieldsToBeUpdated) {

        // Cleanup the values in "Seller Id & Shipment" Combo Boxes

        sellerIdSelectionBox = document.getElementById(dynamicFieldsToBeUpdated.get("Seller_Id_Field_Id"));
        shipmentSelectionBox = document.getElementById(dynamicFieldsToBeUpdated.get("Shipment_Field_Id"));

        if (sellerIdSelectionBox != null && sellerIdSelectionBox != undefined) {

            sellerIdSelectionBox.innerHTML = null;
        }
        if (shipmentSelectionBox != null && shipmentSelectionBox != undefined) {

            shipmentSelectionBox.innerHTML = null;
        }

        var changedSellerInputValue = document.getElementById(dynamicFieldsToBeUpdated.get("Seller_Field_Id")).value;

        // For all the User Details of Seller

        for (var i = 0; i < userDetailRecords.length-1; i++) {

            responseSingleObject = JSON.parse(userDetailRecords[i]);

            // Log error if userName doesn't exist

            if (responseSingleObject.Name == undefined || responseSingleObject.Name == null) {

                alert("inappropriate Name in current record of UserDetails = " + responseSingleObject.Name);
                continue;

            }

            if (responseSingleObject.Name == changedSellerInputValue) {

                // Shipment Value Addition without Spaces

                var currentShipmentValue = responseSingleObject.Shipment;
                var currentSellerIdValue = responseSingleObject.UserName;

                if (sellerIdSelectionBox != null && sellerIdSelectionBox != undefined) {

                    addOptionToSelectionBox(sellerIdSelectionBox, currentSellerIdValue);
                }
                if (shipmentSelectionBox != null && shipmentSelectionBox != undefined) {

                    addOptionToSelectionBox(shipmentSelectionBox, currentShipmentValue);
                }
            }
        }
    }

    /***********************************************************************************************************
        Helper Methods : addOptionToSelectionBox
    ************************************************************************************************************/

    function addOptionToSelectionBox(selectionBox, currentOptionValue) {

        if (currentOptionValue == null || currentOptionValue == undefined) {

            return;
        }

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

        retrieveUserDetailsRecords: retrieveUserDetails_FromMongoDB,
        addOptionToSelectionBox: addOptionToSelectionBox
    };

})();

