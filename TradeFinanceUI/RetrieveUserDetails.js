
var RetrieveUserDetails_Module = (function () {

    var bDebug = false;

    /****************************************************************************************
    Retrieve the User-Details Records As per Input User Type ( Buyer, Seller, Bank )
    *****************************************************************************************/

    function retrieveUserDetails_FromMongoDB(webServerPrefix, queryObject_Record, Client_Request, selectionBoxId, additionalBoxField_Id, changedSellerInputValue) {

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

                    //Parse the JSON Response Object
                    //responseObject = JSON.parse(this.response);

                    if (bDebug == true) {

                        alert("Successfully Retrieved the User Details Records through API : " + Client_Request);
                        alert(" Response Content: " + responseObject);
                    }


                    //Parse the JSON Response Object

                    var responseString = this.response;
                    var userDetailRecords = responseString.split("\n");
                    var numOfRecords = userDetailRecords.length - 2;
                    responseSingleObject = JSON.parse(userDetailRecords[numOfRecords]);

                    if (bDebug == true) {

                        alert("Success Response for RetrieveUserDetails : Last UserDetails Record => " + responseSingleObject);
                    }

                    if (changedSellerInputValue == null || changedSellerInputValue == undefined) {

                        fillTheDetailsInSelectionBox(userDetailRecords, selectionBoxId, additionalBoxField_Id);

                    } else {

                        fillTheShipmentDetailsInSelectionBox(userDetailRecords, selectionBoxId, changedSellerInputValue);
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
    Helper Methods : fillTheDetailsInSelectionBoxss
    ************************************************************************************************************/

    function fillTheDetailsInSelectionBox(userDetailRecords, selectionBoxId, additionalBoxField_Id) {

        // For all the User Details of corresponding UserType

        for (var i = 0; i < userDetailRecords.length-1; i++) {

            responseSingleObject = JSON.parse(userDetailRecords[i]);

            var selectionBox = document.getElementById(selectionBoxId);

            // Log error if userName doesn't exist

            if (bDebug == true) {

                if (responseSingleObject.Name != undefined && responseSingleObject.Name != null) {
                    alert("inappropriate Name in current record of UserDetails = " + responseSingleObject.Name);
                }
            }

            var currentUserName = responseSingleObject.Name;
            var regExpr = /%20/gi;
            currentUserName = currentUserName.replace(regExpr, " ");

            // Add Option with UserName to the Selection Box

            var currentElementToBeAdded = document.createElement("option");
            currentElementToBeAdded.text = currentUserName;

            selectionBox.add(currentElementToBeAdded);

            // Add additinoal Field if not Null Input

            if (additionalBoxField_Id != null) {

                var additionalFieldBox = document.getElementById(additionalBoxField_Id);
                var currentIdElementToBeAdded = document.createElement("option");
                currentIdElementToBeAdded.text = responseSingleObject.UserName;

                additionalFieldBox.add(currentIdElementToBeAdded);

            }
        }
    }

    /***********************************************************************************************************
    Helper Methods : fillTheShipmentDetailsInSelectionBox
    ************************************************************************************************************/

    function fillTheShipmentDetailsInSelectionBox(userDetailRecords, selectionBoxId, changedSellerInputValue) {

        document.getElementById(selectionBoxId).innerHTML = null;

        // For all the User Details of corresponding UserType

        for (var i = 0; i < userDetailRecords.length-1; i++) {

            responseSingleObject = JSON.parse(userDetailRecords[i]);

            var selectionBox = document.getElementById(selectionBoxId);

            // Log error if userName doesn't exist

            if (responseSingleObject.Name == undefined && responseSingleObject.Name == null) {

                alert("inappropriate Name in current record of UserDetails = " + responseSingleObject.Name);

            } else {

                if (responseSingleObject.Name == changedSellerInputValue) {

                    var currentShipmentValue = responseSingleObject.Shipment;
                    alert("currentShipmentValue = " + currentShipmentValue);
                    var regExpr = /%20/gi;
                    currentShipmentValue = currentShipmentValue.replace(regExpr, " ");

                    // Add Option with Shipment Value to the Selection Box

                    var currentElementToBeAdded = document.createElement("option");
                    currentElementToBeAdded.text = currentShipmentValue;

                    selectionBox.add(currentElementToBeAdded);

                }
            }

        }
    }

    /****************************************************************************************
        Reveal private methods 
    *****************************************************************************************/

    return {

        retrieveUserDetailsRecords: retrieveUserDetails_FromMongoDB

    };

})();

