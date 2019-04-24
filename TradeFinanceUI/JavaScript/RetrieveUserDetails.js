
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
        Retrieve User Details and Set Current User Context
    *****************************************************************************************/

    function retrieveUserDetailsAnd_SetCurrentUserContext(webServerPrefix, queryObject_Record, Client_Request) {

        retrieveUserDetailsAnd_SetCurrentUserContext(webServerPrefix, queryObject_Record, Client_Request, false);
    }

    function retrieveUserDetailsAnd_SetCurrentUserContext(webServerPrefix, queryObject_Record, Client_Request, bChangeDisplayAsPerUser) {

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

                    if (bDebug == true) {

                        alert("retrieveUserDetailsAnd_SetCurrentUserContext : Number of Records => " + userDetailRecords.length);
                        alert("retrieveUserDetailsAnd_SetCurrentUserContext : Response String => " + responseString);
                        alert("retrieveUserDetailsAnd_SetCurrentUserContext : First User Record => " + userDetailRecords[userDetailRecords.length - 2]);
                    }

                    var singleUserObject = JSON.parse(userDetailRecords[userDetailRecords.length - 2]);

                    if (bDebug == true) {

                        alert("Success Response for RetrieveUserDetailsBasedOnUserName : Current User Record => " + singleUserObject);
                    }

                    setCurrentUserContextInLocalCache(singleUserObject);

                    // Change the Display Tabs As per Logged In User

                    if (bChangeDisplayAsPerUser == true && FlowControlGlobalsModule.bFirstTimeAuthentication == true) {

                        hidePagesBasedOnLoggedInUser(singleUserObject);
                    }

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response for RetrieveUserDetailsBasedOnUserName call :=> Status : " + this.status + " readyState : " + this.readyState);
                    }
                }

            } else {

                alert("Failure to place RetrieveUserDetailsBasedOnUserName call :=> Status : " + this.status + " readyState : " + this.readyState);
            }

        };

        if (bDebug == true) {

            alert("Retrieving the Registered User Details from MongoDB Based On UserName => httpRequest : " + httpRequestString);
        }

        xmlhttp.send();

    }

    /************************************************************************************************************
        setCurrentUserContextInLocalCache : Sets the current User Context Details ( Usually during Page Load )
    *************************************************************************************************************/

    function setCurrentUserContextInLocalCache(singleUserObject) {

        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_UserType_Key, singleUserObject.UserType);

        if (bDebug == true) {

            alert("setCurrentUserContextInLocalCache : Setting Name of Current User => " + singleUserObject.Name);
        }

        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_Name_Key, singleUserObject.Name);

        if (bDebug == true) {

            alert( "setCurrentUserContextInLocalCache : After setting Name of Current User => " +
                window.localStorage.getItem(FlowControlGlobalsModule.currentUser_Name_Key) );
        }

        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_Shipment_Key, singleUserObject.Shipment);
        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_Location_Key, singleUserObject.Location);
        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_Email_Key, singleUserObject.Email);
        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_Address_Key, singleUserObject.Address);
        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_UserName_Key, singleUserObject.UserName);
        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_Password_Key, singleUserObject.Password);
    }

    /*********************************************************************************************************************
        initializeCurrentUserContextInLocalCache : Resets/Initializes the current User Context ( Usually during Logout )
    **********************************************************************************************************************/

    function initializeCurrentUserContextInLocalCache() {

        if (bDebug == true) {

            alert("initializeCurrentUserContextInLocalCache : Initializing / Resetting User Context in Local cache \n");
        }

        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_UserType_Key, null);
        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_Name_Key, null);
        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_Shipment_Key, null);
        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_Location_Key, null);
        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_Email_Key, null);
        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_Address_Key, null);
        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_UserName_Key, null);
        window.localStorage.setItem(FlowControlGlobalsModule.currentUser_Password_Key, null);

    }

    /********************************************************************************************************
       
       hidePagesBasedOnLoggedInUser : Sets the current User Context Details ( Usually during Page Load )
                                      Show only one of "Buyer, Seller, Bank" Pages during login

    *********************************************************************************************************/

    function hidePagesBasedOnLoggedInUser(singleUserObject) {

        // Hide content Pages based on User Type

        var currentUserType = singleUserObject.UserType;

        if (bDebug == true) {

            alert("hidePagesBasedOnLoggedInUser : After setting User Context Details : currentUserType : " + currentUserType);
        }

        // Build UserPage Ids Map & Hide Pages based on User Type

        var userPageIdsMap = new Map();

        userPageIdsMap.set("Buyer-Page-Id", "Buyer-Link");
        userPageIdsMap.set("Seller-Page-Id", "Seller-Link");
        userPageIdsMap.set("Bank-Page-Id", "Buyer-Bank-Link");

        hideUserPagesBasedOnUserType(currentUserType, userPageIdsMap);
    }

    /*********************************************************************************************************

       hidePagesBasedOnLoggedInUser : Generic function to hide User Pages based on logged info ( Generic )

    **********************************************************************************************************/

    function hideUserPagesBasedOnCurrentUserContext(userPageIdsMap) {

        // Hide content Pages based on User Type

        var currentUserType = window.localStorage.getItem(FlowControlGlobalsModule.currentUser_UserType_Key);

        if (bDebug == true) {

            alert("hideUserPagesBasedOnLoggedInInfo : Current User Context : currentUserType : " + currentUserType);
        }

        hideUserPagesBasedOnUserType(currentUserType, userPageIdsMap);
    }


    /*********************************************************************************************************

       hidePagesBasedOnLoggedInUser : Generic function to hide User Pages based on logged info ( Generic )

    **********************************************************************************************************/

    function hideUserPagesBasedOnUserType(currentUserType, userPageIdsMap) {

        if (currentUserType == "Buyer") {

            document.getElementById(userPageIdsMap.get("Seller-Page-Id")).style.display = "none";
            document.getElementById(userPageIdsMap.get("Bank-Page-Id")).style.display = "none";

        } else if (currentUserType == "Seller") {

            document.getElementById(userPageIdsMap.get("Buyer-Page-Id")).style.display = "none";
            document.getElementById(userPageIdsMap.get("Bank-Page-Id")).style.display = "none";

        } else if (currentUserType == "Bank") {

            document.getElementById(userPageIdsMap.get("Buyer-Page-Id")).style.display = "none";
            document.getElementById(userPageIdsMap.get("Seller-Page-Id")).style.display = "none";

        } else {

            alert("hideUserPagesBasedOnUserType : Incorrect User Type : currentUserType : " + currentUserType);

        }
    }

    /****************************************************************************************
        Reveal private methods 
    *****************************************************************************************/

    return {

        retrieveUserDetailsRecords: retrieveUserDetails_FromMongoDB,
        addOptionToSelectionBox: addOptionToSelectionBox,
        retrieveUserDetailsAnd_SetContext: retrieveUserDetailsAnd_SetCurrentUserContext,
        hideUserPagesBasedOnUserContext: hideUserPagesBasedOnCurrentUserContext,
        initializeUserContextInLocalCache: initializeCurrentUserContextInLocalCache

    };

})();

