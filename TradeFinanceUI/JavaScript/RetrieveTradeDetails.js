
var RetrieveTradeDetailsModule = (function () {

    var bDebug = false;
    var webServerPrefix = "http://127.0.0.1:3500/?";

    /****************************************************************************************************************************
    Retrieve Trade Details Corresponding to Seller : Retrieve Shipment ( Trade ) Details from MongoDB that haven't reached LC stage
    *****************************************************************************************************************************/

    function retrieveTradeRecordsOfSeller_FromMongoDB(Client_Request, Requested_Trade_Status) {

        var xmlhttp;
        var httpRequestString = webServerPrefix;

        xmlhttp = new XMLHttpRequest();
        httpRequestString += "Client_Request=" + Client_Request;

        xmlhttp.open("POST", httpRequestString, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.setRequestHeader("accept", "application/json");

        // Wait for Async response and Handle it in web page

        xmlhttp.onreadystatechange = function () {

            if (this.status == 200) {

                if (this.readyState == 4) {

                    //Parse the JSON Response Object

                    var responseString = this.response;
                    var tradeRecords = responseString.split("\n");

                    if (bDebug == true) {

                        alert(" All the Trade Records of Current Buyer => " + tradeRecords);
                    }

                    fillTheTradeDetailsOfCurrentSeller(tradeRecords, Requested_Trade_Status);

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response while placing RetrieveAllRecords call :=> Status : " + this.status + " readyState : " + this.readyState);
                    }
                }

            } else {

                alert("Failure to place RetrieveAllRecords call :=> Status : " + this.status + " readyState : " + this.readyState);
            }

        };

        if (bDebug == true) {

            alert("Retrieving the Trade Requests of Current Buyer => httpRequest : " + httpRequestString);
        }
        xmlhttp.send();

    }

    /***********************************************************************************************************
    fillTheTradeDetailsOfCurrentSeller : Fill the Trade details of current seller in the Table
    ************************************************************************************************************/

    function fillTheTradeDetailsOfCurrentSeller(tradeRecords, Requested_Trade_Status) {

        var shipmentDetailsTable = document.getElementById("Seller_Page_Trade_Details");

        for (var i = 0, currentRowIndex = 0; i < tradeRecords.length - 1; i++) {

            responseSingleObject = JSON.parse(tradeRecords[i]);

            // Exclude Trades ( Shipments ) that have reached LC Stage

            if (responseSingleObject.Lc_Id != undefined && responseSingleObject.Lc_Id != null) {
                continue;
            }

            // Filter out Trades based on Trade Status

            if (responseSingleObject.Current_Status != Requested_Trade_Status) {
                continue;
            }

            var currentRow = shipmentDetailsTable.insertRow(currentRowIndex + 1);
            currentRowIndex++;

            var currentRowElementsArray = [];

            // Add Cells in the Row

            for (var j = 0; j < 8; j++) {

                var currentRowElement;

                if (j == 7) {

                    currentRowElement = document.createElement('input');
                    currentRowElement.type = "checkbox";

                } else {

                    currentRowElement = document.createElement('td');

                }

                currentRow.appendChild(currentRowElement);
                currentRowElementsArray.push(currentRowElement);
            }

            // Fill the Cell data

            fillTableData_CurrentRowElement(currentRowElementsArray, 0, responseSingleObject.Trade_Id);
            fillTableData_CurrentRowElement(currentRowElementsArray, 1, responseSingleObject.Buyer);
            fillTableData_CurrentRowElement(currentRowElementsArray, 2, responseSingleObject.Seller);
            fillTableData_CurrentRowElement(currentRowElementsArray, 3, responseSingleObject.Shipment);
            fillTableData_CurrentRowElement(currentRowElementsArray, 4, responseSingleObject.ShipmentCount);

            var filteredTradeAmountValue = filterTradeAmount(responseSingleObject.Amount);
            fillTableData_CurrentRowElement(currentRowElementsArray, 5, filteredTradeAmountValue);

            fillTableData_CurrentRowElement(currentRowElementsArray, 6, responseSingleObject.Current_Status);

        }
    }

    /***********************************************************************************************************
    filterTradeAmount : Filter to make sure only numericals exist in the Amount field
    ************************************************************************************************************/

    function filterTradeAmount(currentElement) {

        var newStr = new String(currentElement);
        var i = 0;

        for (; i < newStr.length; i++) {

            if (newStr.charAt(i) > '9' || newStr.charAt(i) < '0') {

                alert("Found alpha instead numeric in current string : " + newStr);
                break;
            }
        }

        return newStr.substring(0, i);
    }

    /***********************************************************************************************************
    fillTableData_CurrentRowElement : Fills the current Element value in Table Cell
    ************************************************************************************************************/

    function fillTableData_CurrentRowElement(currentRowElementsArray, currentIndex, currentElement) {

        if (currentElement != undefined && currentElement != null) {

            currentRowElementsArray[currentIndex].innerHTML = currentElement;

        } else {

            currentRowElementsArray[currentIndex].innerHTML = "-NA-";

        }

        currentRowElementsArray[currentIndex].style.color = "#422319";
        currentRowElementsArray[currentIndex].style.backgroundColor = "#E7D8D9";
        currentRowElementsArray[currentIndex].style.paddingTop = "10px";
        currentRowElementsArray[currentIndex].style.paddingRight = "10px";
        currentRowElementsArray[currentIndex].style.paddingBottom = "10px";
        currentRowElementsArray[currentIndex].style.paddingLeft = "10px";

    }

    /****************************************************************************************
        Reveal private methods 
    *****************************************************************************************/

    return {

        retrieveTradeRecordsForCurrentSeller: retrieveTradeRecordsOfSeller_FromMongoDB
    };

})();

