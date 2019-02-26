
var TradeAndLC_StatusUpdateModule = (function () {

    var bDebug = false;

    /****************************************************************************************
    Change the status of "Trade Agreement / LC" in mongo db as per the input status
    *****************************************************************************************/

    function changeStatusOfRecord_InMongoDB(webServerPrefix, queryObject_Record, Client_Request) {

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

                    responseObject = JSON.parse(this.response);

                    if (bDebug == true) {

                        alert(" Request Content: " + responseObject.Request);
                        alert(" Status Content: " + responseObject.Status);
                    }

                    alert("Successfully changed the Status of Trade : " + Client_Request);

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response for changeTradeAndLCStatus call :=> Status : " + this.status + " readyState : " + this.readyState);
                    }
                }

            } else {

                if (bDebug == true) {

                    alert("Failure to place changeTradeAndLCStatus call :=> Status : " + this.status + " readyState : " + this.readyState);
                }
            }

        };

        if (bDebug == true) {

            alert("Changing the TradeAndLC Record Status in mongoDB => httpRequest : " + httpRequestString);
        }

        xmlhttp.send();

    }

    /****************************************************************************************
    Change the status of "Trade Agreement / LC" in HyperLedger db as per the input status
    *****************************************************************************************/

    function changeStatusOfRecord_HyperLedger(webServerPrefix, queryObject_Record, Client_Request) {

        var xmlhttp;
        var httpRequestString = webServerPrefix + Client_Request;

        xmlhttp = new XMLHttpRequest();

        xmlhttp.open("POST", httpRequestString, true);
        xmlhttp.setRequestHeader("Content-type", "application/json");
        xmlhttp.setRequestHeader("accept", "application/json");

        // Wait for Async response and Handle it in web page

        xmlhttp.onreadystatechange = function () {

            if (this.status == 200) {

                if (this.readyState == 4) {

                    //Parse the JSON Response Object

                    responseObject = JSON.parse(this.response);
                    alert("Received Success Response from Server for  ClientRequest :=> " + Client_Request);

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response while placing ClientRequest: " + Client_Request + " , Status: " + this.status + " readyState: " + this.readyState);
                    }
                }

            } else {

                alert("Failure to place ClientRequest: " + Client_Request + " , Status: " + this.status + " readyState: " + this.readyState);
            }

        };

        // Prepare Http Request from Form-data and send the request

        var taId_value = queryObject_Record.get("Trade_Id");
        var lcId_value = queryObject_Record.get("Lc_Id");

        var obj;
        var emptyQuery = true;

        if (taId_value != null && taId_value != undefined) {

            obj = { taId: taId_value };
            emptyQuery = false;

        }

        if (lcId_value != null && lcId_value != undefined) {

            Object.assign(obj, { lcId: lcId_value });
            emptyQuery = false;

        }

        // Execute the call

        if (emptyQuery == true) {

            alert(" (Trade Agreement Id || lcId) values are missing while placing client request : " + Client_Request);

        } else {

            params = JSON.stringify(obj);

            if (bDebug == true) {

                alert("Placing client_request : " + Client_Request + " with params => " + params);
            }
            xmlhttp.send(params);
        }

    }

    /****************************************************************************************
        Reveal private methods 
    *****************************************************************************************/

    return {

        changeStatusOfTradeAndLcRecord: changeStatusOfRecord_InMongoDB,
        changeStatusOfTradeAndLcRecord_HyperLedger: changeStatusOfRecord_HyperLedger

    };

})();

