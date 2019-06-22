
var WebClientRequestHelperModule = (function () {

    var bDebug = false;
    var webServerPrefix = "http://127.0.0.1:3500/?";

    /**
     * 
     * @param {any} client_request : Http Client Request API Name
     * @param {any} httpClientRequestParamsMap : Request Parameters Map consisting of http client request params
     *
    */

    function webClientRequestAPIWrapper(client_request, httpClientRequestParamsMap) {

        var xmlhttp;
        var httpRequestString = webServerPrefix;

        xmlhttp = new XMLHttpRequest();
        httpRequestString += "Client_Request=" + client_request;

        if (httpClientRequestParamsMap != null && httpClientRequestParamsMap != undefined) {

            var httpRequestDetailsKeys = httpClientRequestParamsMap.keys();

            for (var currentKey of httpRequestDetailsKeys) {

                httpRequestString += "&";
                httpRequestString += currentKey;
                httpRequestString += "=";
                httpRequestString += httpClientRequestParamsMap.get(currentKey);
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

                        alert("Success Response for " + client_request);

                        var responseObject = JSON.parse(this.response);
                        alert(responseObject.Status);
                    }

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response while placing webClientRequestAPIWrapper : " + client_request +
                            " => Status: " + this.status + " readyState: " + this.readyState);
                    }
                }

            } else {

                if (this.readyState == 4) {

                    alert("Failure to place webClientRequestAPIWrapper : " + client_request + " => Status : " +
                        this.status + " readyState : " + this.readyState);

                    var responseObject = JSON.parse(this.response);
                    alert(responseObject.Status);
                }

            }

        };

        if (bDebug == true) {

            alert("Placing webClientRequestAPIWrapper => httpRequest : " + httpRequestString);
        }

        xmlhttp.send();

    }

    /**
     * 
     * @param {any} client_request : Http Client Request API Name
     * @param {any} httpClientRequestParamsMap : Request Parameters Map consisting of http client request params
     * @param {optional} handleSuccessResponse : Callback function to handle Success Response
     * @param {optional} handleFailureResponse : Callback function to handle Failure Response
     *
    */

    function webClientRequestAPIWrapperWithCallback(client_request, httpClientRequestParamsMap, handleSuccessResponse, handleFailureResponse) {

        var xmlhttp;
        var httpRequestString = webServerPrefix;

        // Build Query

        xmlhttp = new XMLHttpRequest();
        httpRequestString += "Client_Request=" + client_request;

        if (httpClientRequestParamsMap != null && httpClientRequestParamsMap != undefined) {

            var httpRequestDetailsKeys = httpClientRequestParamsMap.keys();

            for (var currentKey of httpRequestDetailsKeys) {

                httpRequestString += "&";
                httpRequestString += currentKey;
                httpRequestString += "=";
                httpRequestString += httpClientRequestParamsMap.get(currentKey);
            }
        }

        // POST http request

        xmlhttp.open("POST", httpRequestString, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.setRequestHeader("accept", "application/json");

        // Wait for Async response and Handle it in web page

        xmlhttp.onreadystatechange = function () {

            if (this.status == 200) {

                if (this.readyState == 4) {

                    var responseString = this.response;
                    return handleSuccessResponse(responseString);

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response while placing call :=> " + client_request +
                            " ,status : " + this.status + " readyState : " + this.readyState);
                    }
                }

            } else {

                alert("Failure to place call :=> " + client_request + " ,status : " + this.status + " readyState : " + this.readyState);

                var responseString = this.response;
                return handleFailureResponse(responseString);
            }

        };

        if (bDebug == true) {

            alert("Placing http client request => httpRequest : " + httpRequestString);
        }
        xmlhttp.send();

    }


    /****************************************************************************************
        Reveal private methods
    *****************************************************************************************/

    return {

        webClientRequestAPIWrapper: webClientRequestAPIWrapper,
        webClientRequestAPIWrapperWithCallback: webClientRequestAPIWrapperWithCallback
    };

})();


