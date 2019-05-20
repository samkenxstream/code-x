
var RetrieveLCDetailsModule = (function () {

    var bDebug = false;
    var webServerPrefix = "http://127.0.0.1:3500/?";

    /****************************************************************************************************************************
    Retrieve LCRequest Details for current Seller : Retrieve LCRequest Details from MongoDB for current Seller
    *****************************************************************************************************************************/

    function retrieveLCRequestsToCurrentSeller_FromMongoDB(Client_Request, Requested_LC_Status, currentUser, currentUserType) {

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
                    var lcRequests = responseString.split("\n");

                    if (bDebug == true) {

                        alert("All the lcRequests of Current Buyer => " + lcRequests);
                    }

                    fillTheLcRequestDetailsOfCurrentSeller(lcRequests, Requested_LC_Status, currentUser, currentUserType);

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

            alert("Retrieving the LC Requests of Current Seller => httpRequest : " + httpRequestString);
        }
        xmlhttp.send();

    }

    /****************************************************************************************************************************
    fillTheLcRequestDetailsOfCurrentSeller : Fill the LC Request details of current seller in the Table as per input LC Status
    *****************************************************************************************************************************/

    function fillTheLcRequestDetailsOfCurrentSeller(lcRequests, Requested_LC_Status, currentUser, currentUserType) {

        var shipmentDetailsTable = document.getElementById("Seller_LC_Request_Details");

        for (var i = 0, currentRowIndex = 0; i < lcRequests.length - 1; i++) {

            responseSingleObject = JSON.parse(lcRequests[i]);

            // Filter out Records with different status than required

            if (responseSingleObject.Current_Status != Requested_LC_Status) {
                continue;
            }

            // Filter the LC Details Based on current User    

            if (currentUser != null && currentUserType != null) {

                if (bDebug == true) {

                    alert("fillTheLcRequestDetailsOfCurrentSeller : Name of Current User => " + currentUser +
                        ", CurrentUserType => " + currentUserType +
                        ", Name of Current Record User => " + responseSingleObject[currentUserType]);
                }

                if (currentUser != responseSingleObject[currentUserType]) {

                    continue;
                }
            }

            // Fill the form Data

            if (bDebug == true) {

                alert( "fillTheLcRequestDetailsOfCurrentSeller : Current User matched with Record's value : Filling data => " + currentUser +
                    ", Name of Current Record User => " + responseSingleObject[currentUserType]);
            }

            // Fill the form Data

            var currentRow = shipmentDetailsTable.insertRow(currentRowIndex + 1);
            currentRowIndex++;

            var currentRowElementsArray = [];

            // Add Cells in the Row

            for (var j = 0; j < 12; j++) {

                var currentRowElement;

                if (j == 11) {

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
            fillTableData_CurrentRowElement(currentRowElementsArray, 1, responseSingleObject.Lc_Id);
            fillTableData_CurrentRowElement(currentRowElementsArray, 2, responseSingleObject.Buyer);
            fillTableData_CurrentRowElement(currentRowElementsArray, 3, responseSingleObject.Bank);
            fillTableData_CurrentRowElement(currentRowElementsArray, 4, responseSingleObject.Seller);
            fillTableData_CurrentRowElement(currentRowElementsArray, 5, responseSingleObject.Shipment);
            fillTableData_CurrentRowElement(currentRowElementsArray, 6, responseSingleObject.ShipmentCount);
            fillTableData_CurrentRowElement(currentRowElementsArray, 7, responseSingleObject.Expiry_Date);

            var filteredTradeAmountValue = filterTradeAmount(responseSingleObject.Amount);
            fillTableData_CurrentRowElement(currentRowElementsArray, 8, filteredTradeAmountValue);

            fillTableData_CurrentRowElement(currentRowElementsArray, 9, responseSingleObject.Current_Status);
            fillTableData_CurrentRowElement(currentRowElementsArray, 10, "LC");

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

        retrieveLCRecordsOfCurrentSeller: retrieveLCRequestsToCurrentSeller_FromMongoDB
    };

})();

