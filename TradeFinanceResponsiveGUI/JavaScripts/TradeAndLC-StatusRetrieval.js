
var TradeAndLC_StatusRetrievalModule = (function () {

    var bDebug = false;
    var webServerPrefix = "http://127.0.0.1:3500/?";

    /****************************************************************************************
        Retrieve LC Details : Retrieve the lc details from mongo DB based on Lc_Id
    *****************************************************************************************/

    function retrieveLcDetails_FromMongoDB(Lc_Id, Client_Request, currentUser, currentUserType) {

        var xmlhttp;
        var httpRequestString = webServerPrefix;

        xmlhttp = new XMLHttpRequest();
        httpRequestString += "Client_Request=" + Client_Request;
        httpRequestString += "&";
        httpRequestString += "Lc_Id=" + Lc_Id;

        xmlhttp.open("POST", httpRequestString, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.setRequestHeader("accept", "application/json");

        // Wait for Async response and Handle it in web page

        xmlhttp.onreadystatechange = function () {

            if (this.status == 200) {

                if (this.readyState == 4) {

                    //Parse the JSON Response Object

                    responseObject = JSON.parse(this.response);

                    if (bDebug == true) {

                        alert("All the LC Details for LC Id => " + Lc_Id + " : " + responseObject);
                    }

                    // Check the inclusiveness of Lc-Id ( to see if it belongs to Current User )

                    if (currentUser != null && currentUser != undefined && currentUserType != null && currentUserType != undefined) {

                        if (currentUser == responseObject[currentUserType]) {

                            fillTheLCStatusDetailsPage(responseObject);

                        } else {

                            alert("LC_Id : " + Lc_Id +" doesn't belong to Current user : " + currentUser);
                        }

                    } else {

                        alert("Either of currentUser or currentUserType values are null/undefined");
                        fillTheLCStatusDetailsPage(responseObject);

                    }

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response while placing RetrieveLCDetails call :=> Status : " + this.status + " readyState : " + this.readyState);
                    }
                }

            } else {

                alert("Failure to place RetrieveLCDetails call :=> Status : " + this.status + " readyState : " + this.readyState);
            }

        };

        if (bDebug == true) {

            alert("Retrieving the LC detais from mongoDB => httpRequest : " + httpRequestString);
        }
        xmlhttp.send();

    }

    /****************************************************************************************
        LC Status Details Page : Fill the LC Details based on Response
    *****************************************************************************************/

    function fillTheLCStatusDetailsPage(LcDetails_ResponseObject) {

        document.getElementById("Loc_Details_Trade_Id_Value").innerHTML = LcDetails_ResponseObject.Trade_Id;
        document.getElementById("Loc_Details_Loc_Id_Value").innerHTML = LcDetails_ResponseObject.Lc_Id;
        document.getElementById("Loc_Details_Buyer_Name_Value").innerHTML = LcDetails_ResponseObject.Buyer;
        document.getElementById("Loc_Details_Seller_Name_Value").innerHTML = LcDetails_ResponseObject.Seller;
        document.getElementById("Loc_Details_Buyer_Bank_Name_Value").innerHTML = LcDetails_ResponseObject.Bank;
        document.getElementById("Loc_Details_Shipment_Value").innerHTML = LcDetails_ResponseObject.Shipment;
        document.getElementById("Loc_Details_Shipment_Count_Value").innerHTML = LcDetails_ResponseObject.ShipmentCount;
        document.getElementById("Loc_Details_Loc_Amount_Value").innerHTML = LcDetails_ResponseObject.Amount;
        document.getElementById("Loc_Details_Status_Value").innerHTML = LcDetails_ResponseObject.Current_Status;
        document.getElementById("Loc_Details_Expiry_Date_Value").innerHTML = LcDetails_ResponseObject.Expiry_Date;

    }

    /***************************************************************************************************************
        Retrieve Trade Details : Retrieve the trade details from mongo DB based on Trade_Id

     *
     * @param {any} Trade_Id  : Trade Agreement Id Value
     * @param {any} Client_Request  : Web Client Request for Mongo DB
     * @param {any} currentUser : Current User Name from User-Context
     * @param {any} currentUserType : Current User Type from User-Context
     * @param {optional} statusFormDetailsMap : Form Document Element IDs where the Trade Details need to be filled
     *

    ****************************************************************************************************************/

    function retrieveTradeDetails_FromMongoDB(Trade_Id, Client_Request, currentUser, currentUserType) {

        retrieveTradeDetails_FromMongoDB(Trade_Id, Client_Request, currentUser, currentUserType, null);

    }

    function retrieveTradeDetails_FromMongoDB(Trade_Id, Client_Request, currentUser, currentUserType, statusFormDetailsMap) {

        if (bDebug == true) {

            alert("retrieveTradeDetails_FromMongoDB : currentUser => " + currentUser + " currentUserType: " + currentUserType);
        }

        var xmlhttp;
        var httpRequestString = webServerPrefix;

        xmlhttp = new XMLHttpRequest();
        httpRequestString += "Client_Request=" + Client_Request;
        httpRequestString += "&";
        httpRequestString += "Trade_Id=" + Trade_Id;

        xmlhttp.open("POST", httpRequestString, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.setRequestHeader("accept", "application/json");

        // Wait for Async response and Handle it in web page

        xmlhttp.onreadystatechange = function () {

            if (bDebug == true) {

                alert("Intermediate Success Response While Placing RetrieveTradeDetails call :=> Status : " + this.status +
                    " readyState : " + this.readyState);
            }

            if (this.status == 200) {

                if (this.readyState == 4) {

                    if (bDebug == true) {

                        alert("All the Trade Details for Trade Id => " + Trade_Id + " : " + this.responseText);
                    }

                    //Parse the JSON Response Object

                    responseObject = JSON.parse(this.response);

                    if (bDebug == true) {

                        alert("All the Trade Details for Trade Id => " + Trade_Id + " : " + responseObject);
                    }

                    // Check the inclusiveness of Ta-Id ( to see if it belongs to Current User )

                    if ( doesUserTypeNeedInclusiveCheck(currentUserType) && HelperUtilsModule.valueDefined(currentUser) &&
                         HelperUtilsModule.valueDefined(currentUserType)) {

                        if (currentUser == responseObject[currentUserType]) {

                            fillTheShipmentStatusDetailsPage(responseObject, statusFormDetailsMap);

                        } else {

                            alert("Ta_Id : " + Trade_Id + " doesn't belong to Current user : " + currentUser);
                        }

                    } else {

                        alert("Either of currentUser or currentUserType values are null/undefined/dont need inclusive check");
                        fillTheShipmentStatusDetailsPage(responseObject, statusFormDetailsMap);

                    }

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response While Placing RetrieveTradeDetails call :=> Status : " + this.status + " readyState : " + this.readyState);
                    }
                }

            } else {

                alert("Failure to place RetrieveTradeDetails call :=> Status : " + this.status + " readyState : " + this.readyState);
            }

        };

        if (bDebug == true) {

            alert("Retrieving the Trade detais from mongoDB => httpRequest : " + httpRequestString);
        }
        xmlhttp.send();

    }

    /********************************************************************************************************************************
        Shipment Status Details Page : Fill the Shipment Details based on Response

     *
     * @param {any} TradeDetails_ResponseObject : Trade Details Response Object retrieved by Web Client Request
     * @param {optional} statusFormDetailsMap : Form Document Element IDs where the Trade Details need to be filled
     *

    **********************************************************************************************************************************/

    function fillTheShipmentStatusDetailsPage(TradeDetails_ResponseObject) {

        HelperUtilsModule.fillDataInDocumentElement("Shipment_Details_TA_Id_Value", TradeDetails_ResponseObject.Trade_Id);
        HelperUtilsModule.fillDataInDocumentElement("Shipment_Details_Buyer_Name_Value", TradeDetails_ResponseObject.Buyer);
        HelperUtilsModule.fillDataInDocumentElement("Shipment_Details_Seller_Name_Value", TradeDetails_ResponseObject.Seller);
        HelperUtilsModule.fillDataInDocumentElement("Shipment_Details_Seller_Bank_Value", TradeDetails_ResponseObject.SellerBank);
        HelperUtilsModule.fillDataInDocumentElement("Shipment_Details_Shipment_Value", TradeDetails_ResponseObject.Shipment);
        HelperUtilsModule.fillDataInDocumentElement("Shipment_Details_Shipment_Count_Value", TradeDetails_ResponseObject.ShipmentCount);
        HelperUtilsModule.fillDataInDocumentElement("Shipment_Details_Amount_Value", TradeDetails_ResponseObject.Amount);
        HelperUtilsModule.fillDataInDocumentElement("Shipment_Details_Status_Value", TradeDetails_ResponseObject.Current_Status);

    }

    function fillTheShipmentStatusDetailsPage(TradeDetails_ResponseObject, statusFormDetailsMap) {

        HelperUtilsModule.fillDataInDocumentElementThroughMap(statusFormDetailsMap, "TA_Element_Id", TradeDetails_ResponseObject.Trade_Id);
        HelperUtilsModule.fillDataInDocumentElementThroughMap(statusFormDetailsMap, "Buyer_Element_Id", TradeDetails_ResponseObject.Buyer);
        HelperUtilsModule.fillDataInDocumentElementThroughMap(statusFormDetailsMap, "Seller_Element_Id", TradeDetails_ResponseObject.Seller);
        HelperUtilsModule.fillDataInDocumentElementThroughMap(statusFormDetailsMap, "SellerBank_Element_Id", TradeDetails_ResponseObject.SellerBank);
        HelperUtilsModule.fillDataInDocumentElementThroughMap(statusFormDetailsMap, "Shipment_Element_Id", TradeDetails_ResponseObject.Shipment);
        HelperUtilsModule.fillDataInDocumentElementThroughMap(statusFormDetailsMap, "ShipmentCount_Element_Id", TradeDetails_ResponseObject.ShipmentCount);
        HelperUtilsModule.fillDataInDocumentElementThroughMap(statusFormDetailsMap, "Amount_Element_Id", TradeDetails_ResponseObject.Amount);
        HelperUtilsModule.fillDataInDocumentElementThroughMap(statusFormDetailsMap, "TradeStatus_Element_Id", TradeDetails_ResponseObject.Current_Status);

    }

    /*************************************************************************************************************
        retrieveTradeDetailsWrapper : Wrapper for Trade Details Retrieval
                                      With the ability to display the status details in given "Form Details Map"

     *
     * @param {any} taid_value  : Trade Agreement Id Value
     * @param {any} bPlaceHyperLederCall  : if true, place HyperLedger call in addition to Mongo DB Call
     * @param {any} statusFormDetailsMap : Form Document Element IDs where the Trade Details need to be filled
     *

    **************************************************************************************************************/

    function retrieveTradeDetailsWrapper(taid_value, bPlaceHyperLederCall, statusFormDetailsMap) {

        if ( !HelperUtilsModule.valueDefined(taid_value) ) {

            alert("TradeAndLC-StatusRetrieval.retrieveTradeDetailsWrapper: taId value must be entered to retrieve the Trade Details");
            return;
        }

        // Retrieve the Trade Details from mongoDb

        var Client_Request = "RetrieveTradeDetails";

        currentUserName = window.localStorage.getItem(FlowControlGlobalsModule.currentUser_Name_Key);
        currentUserType = window.localStorage.getItem(FlowControlGlobalsModule.currentUser_UserType_Key);

        if (bDebug == true) {

            alert("current Name of the logged in User : " + currentUserName);
            alert("current UserType set in User Context during Page Load : " + currentUserType);
        }

        if ( HelperUtilsModule.valueDefined(currentUserName) && HelperUtilsModule.valueDefined(currentUserType) ) {

            if (bDebug == true) {

                alert("currentUserName : " + currentUserName + " ,currentUserType : " + currentUserType);
            }

            TradeAndLC_StatusRetrievalModule.retrieveTradeDetails_MongoDB( taid_value, Client_Request, currentUserName,
                currentUserType, statusFormDetailsMap);

        } else {

            if (bDebug == true) {

                alert("User Name & User Type values are null");
            }

            TradeAndLC_StatusRetrievalModule.retrieveTradeDetails_MongoDB(taid_value, Client_Request, null, null, statusFormDetailsMap);
        }

        /****************************************************************************************
            getTA : Place HyperLedger API Call
        *****************************************************************************************/

        if (bPlaceHyperLederCall == true) {

        /*
         
            var API_Name = "getTA";
            var tradeDetailsRequestObject = { taId: taid_value };

            tradeStatusDetailsObject = HyperLedgerAPIWrapperModule.httpAPIRequestToHyperLedgerServer(tradeDetailsRequestObject, API_Name);
        */

        }

    }


    /***************************************************************************************************************
     *
     * @param {String} currentUserType  : User Type value of current User
     * 
     * @returns {Boolean} true/false : Returns false for user types that need to be excluded. true otherwise
     *
    ****************************************************************************************************************/

    function doesUserTypeNeedInclusiveCheck(currentUserType) {

        if (currentUserType == "Carrier" || currentUserType == "CustomsAuthority") {

            return false;
        }

        return true;
    }

    /****************************************************************************************
        Reveal private methods 
    *****************************************************************************************/

    return {

        retrieveLCDetails_MongoDB: retrieveLcDetails_FromMongoDB,
        retrieveTradeDetails_MongoDB: retrieveTradeDetails_FromMongoDB,
        retrieveTradeDetailsWrapper: retrieveTradeDetailsWrapper

    };

})();

