
var TradeAndLC_StatusUpdateModule = (function () {

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

                alert("Failure to place changeTradeAndLCStatus call :=> Status : " + this.status + " readyState : " + this.readyState);
            }

        };

        if (bDebug == true) {

            alert("Changing the TradeAndLC Record Status in mongoDB => httpRequest : " + httpRequestString);
        }

        xmlhttp.send();

    }

    /****************************************************************************************
        Reveal private methods 
    *****************************************************************************************/

    return {

        changeStatusOfTradeAndLcRecord: changeStatusOfRecord_InMongoDB
    };

})();
