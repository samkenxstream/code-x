
var GenerateLCModule = (function () {

    var bDebug = false;
    var webServerPrefix = "http://127.0.0.1:3500/?";

    /***********************************************************************************************************
        generateLCAndPlaceItOnServerDatabase : Generate LC on Server End and place it in designated folder
    ************************************************************************************************************/

    function generateLCAndPlaceItOnServerDatabase(Client_Request, shipmentDetailsMap) {

        var xmlhttp;
        var httpRequestString = webServerPrefix;

        xmlhttp = new XMLHttpRequest();
        httpRequestString += "Client_Request=" + Client_Request;

        if (shipmentDetailsMap != null && shipmentDetailsMap != undefined) {

            var shipmentDetailsKeys = shipmentDetailsMap.keys();

            for (var currentKey of shipmentDetailsKeys) {

                httpRequestString += "&";
                httpRequestString += currentKey;
                httpRequestString += "=";
                httpRequestString += shipmentDetailsMap.get(currentKey);
            }
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
                        alert("Success Response for RetrieveLCDetails");
                    }

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response while placing generateLC call :=> Status : " + this.status + " readyState : " + this.readyState);
                    }
                }

            } else {

                alert("Failure to place generateLC call :=> Status : " + this.status + " readyState : " + this.readyState);
            }

        };

        if (bDebug == true) {

            alert("Generating LC for current user Request => httpRequest : " + httpRequestString);
        }

        xmlhttp.send();

    }


    /****************************************************************************************
        Reveal private methods
    *****************************************************************************************/

    return {

        generateLCOnServerSide: generateLCAndPlaceItOnServerDatabase
    };

})();
