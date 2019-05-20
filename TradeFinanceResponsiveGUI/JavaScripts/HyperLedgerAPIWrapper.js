
var HyperLedgerAPIWrapperModule = (function () {

    var bDebug = false;

    /***********************************************************************************************************
        httpRequestToHyperLedgerServer : http Request ( API Wraper ) to Hyper Ledger Server
    ************************************************************************************************************/

    function httpRequestToHyperLedgerServer(requestInputObject, API_Name) {

        var webServerPrefix = "/tfbc/"
        var xmlhttp;
        var httpRequestString = webServerPrefix + API_Name;

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
                    alert("Received Success Response from Hyper Ledger Server :=> " + responseObject);

                    return responseObject;

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response While Placing requestTrade call :=> Status : " + this.status + " readyState : " + this.readyState);
                    }
                }

            } else {

                alert("Failure to place requestTrade call :=> Status : " + this.status + " readyState : " + this.readyState);
            }

        };

        var httpParams = JSON.stringify(requestInputObject);

        if (bDebug == true) {

            alert(" Calling HyperLedger API : " + API_Name + " With Params => " + params);
        }

        xmlhttp.send(httpParams);
    }

    /****************************************************************************************
        Reveal private methods
    *****************************************************************************************/

    return {

        httpAPIRequestToHyperLedgerServer: httpRequestToHyperLedgerServer

    };

})();
