
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

                        alert("Incorrect User Name/Type in current User Context");
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

    /****************************************************************************************
        Retrieve Trade Details : Retrieve the trade details from mongo DB based on Trade_Id
    *****************************************************************************************/

    function retrieveTradeDetails_FromMongoDB(Trade_Id, Client_Request, currentUser, currentUserType) {

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

                alert("Intermediate Success Response While Placing RetrieveTradeDetails call :=> Status : " + this.status + " readyState : " + this.readyState);
            }

            if (this.status == 200) {

                if (this.readyState == 4) {

                    //Parse the JSON Response Object

                    responseObject = JSON.parse(this.response);

                    if (bDebug == true) {

                        alert("All the Trade Details for Trade Id => " + Trade_Id + " : " + responseObject);
                    }

                    // Check the inclusiveness of Ta-Id ( to see if it belongs to Current User )

                    if (currentUser != null && currentUser != undefined && currentUserType != null && currentUserType != undefined) {

                        if (currentUser == responseObject[currentUserType]) {

                            fillTheShipmentStatusDetailsPage(responseObject);

                        } else {

                            alert("Ta_Id : " + Trade_Id + " doesn't belong to Current user : " + currentUser);
                        }

                    } else {

                        alert("Incorrect User Name/Type in current User Context");
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

    /****************************************************************************************
        Shipment Status Details Page : Fill the Shipment Details based on Response
    *****************************************************************************************/

    function fillTheShipmentStatusDetailsPage(TradeDetails_ResponseObject) {

        if (bDebug == true) {

            alert("fillTheShipmentStatusDetailsPage : Trade_Id => " + TradeDetails_ResponseObject.Trade_Id);
            alert("fillTheShipmentStatusDetailsPage : Buyer => " + TradeDetails_ResponseObject.Buyer);
        }

        document.getElementById("Shipment_Details_TA_Id_Value").textContent = TradeDetails_ResponseObject.Trade_Id;

        if (bDebug == true) {

            alert("document.getElementById.Shipment_Details_TA_Id_Value.innerHTML => " + document.getElementById("Shipment_Details_TA_Id_Value").value);
        }

        document.getElementById("Shipment_Details_Buyer_Name_Value").innerHTML = TradeDetails_ResponseObject.Buyer;
        document.getElementById("Shipment_Details_Seller_Name_Value").innerHTML = TradeDetails_ResponseObject.Seller;
        document.getElementById("Shipment_Details_Seller_Bank_Value").innerHTML = TradeDetails_ResponseObject.SellerBank;
        document.getElementById("Shipment_Details_Shipment_Value").innerHTML = TradeDetails_ResponseObject.Shipment;
        document.getElementById("Shipment_Details_Shipment_Count_Value").innerHTML = TradeDetails_ResponseObject.ShipmentCount;
        document.getElementById("Shipment_Details_Amount_Value").innerHTML = TradeDetails_ResponseObject.Amount;
        document.getElementById("Shipment_Details_Status_Value").innerHTML = TradeDetails_ResponseObject.Current_Status;

    }

    /****************************************************************************************
        Reveal private methods 
    *****************************************************************************************/

    return {

        retrieveLCDetails_MongoDB: retrieveLcDetails_FromMongoDB,
        retrieveTradeDetails_MongoDB: retrieveTradeDetails_FromMongoDB

    };

})();

