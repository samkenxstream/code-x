
var TradeAndLC_DatabaseUpdateModule = (function () {

    var bDebug = false;
    var webServerPrefix = "http://127.0.0.1:3500/?";

    /****************************************************************************************
        Request Trade : Store the Trade details in mongo db for later consumption
    *****************************************************************************************/

    function saveTradeDetailsInMongoDB(tradeRequestRecord, Client_Request) {

        var xmlhttp;
        var httpRequestString = webServerPrefix;

        xmlhttp = new XMLHttpRequest();
        httpRequestString += "Client_Request=" + Client_Request;

        var tradeRequestKeys = tradeRequestRecord.keys();

        for (var currentKey of tradeRequestKeys) {

            httpRequestString += "&"
            httpRequestString += currentKey + "=" + tradeRequestRecord.get(currentKey);
        }

        xmlhttp.open("POST", httpRequestString, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.setRequestHeader("accept", "application/json");

        // Wait for Async response and Handle it in web page

        xmlhttp.onreadystatechange = function () {

            if (this.status == 200) {

                if (this.readyState == 4) {

                    //Parse the JSON Response Object

                    if (bDebug == true) {

                        alert("Full JSON Response before parsing : " + this.responseText);
                    }

                    responseObject = JSON.parse(this.responseText);
                    alert("Request Content: " + responseObject.Request + " , Status Content: " + responseObject.Status);

                    FlowControlGlobalsModule.tradeBuyerInputProcessed = true;

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response While Placing requestTrade call :=> Status : " + this.status + " readyState : " + this.readyState);
                    }
                }

            } else {

                alert("Failure to receive response for requestTrade call :=> Status : " + this.status + " readyState : " + this.readyState);
                FlowControlGlobalsModule.tradeBuyerInputProcessed = true;
            }

        };

        if (bDebug == true) {

            alert("Saving the trade detais in mongoDB => httpRequest : " + httpRequestString);
        }
        xmlhttp.send();

    }

    /****************************************************************************************
        Request LC : Store the LC details in mongo db for later consumption
    *****************************************************************************************/

    function saveLCDetailsInMongoDB(lcRequestRecord, Client_Request) {

        var xmlhttp;
        var httpRequestString = webServerPrefix;

        xmlhttp = new XMLHttpRequest();
        httpRequestString += "Client_Request=" + Client_Request;

        var lcRequestKeys = lcRequestRecord.keys();

        for (var currentKey of lcRequestKeys) {

            httpRequestString += "&"
            httpRequestString += currentKey + "=" + lcRequestRecord.get(currentKey);
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
                    alert("Request Content: " + responseObject.Request + " , Status Content: " + responseObject.Status);

                    FlowControlGlobalsModule.lcBuyerInputProcessed = true;

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response for requestLc call :=> Status : " + this.status + " readyState : " + this.readyState);
                    }
                }

            } else {

                if (this.readyState == 4) {

                    alert("Failure to place requestLc call :=> Status : " + this.status + " readyState : " + this.readyState);

                    responseObject = JSON.parse(this.response);
                    alert(responseObject.Status);

                    FlowControlGlobalsModule.lcBuyerInputProcessed = true;
                }

            }

        };

        if (bDebug == true) {

            alert("Saving the LC detais in mongoDB => httpRequest : " + httpRequestString);
        }

        xmlhttp.send();

    }

    /****************************************************************************************
        Reveal private methods 
    *****************************************************************************************/

    return {

        updateTradeDetailsInMongoDB: saveTradeDetailsInMongoDB,
        updateLCDetailsInMongoDB: saveLCDetailsInMongoDB

    };

})();

