
var RetrieveAndFillLCDetailsBank_Module = (function () {

    var bDebug = false;
    var webServerPrefix = "http://127.0.0.1:3500/?";

    /***********************************************************************************************************
        Retrieve LC Details of Buyer : Retrieve LC Details from MongoDB and Add them to Table As Row
    ************************************************************************************************************/

    function retrieveLcRecordsOfBuyer_FromMongoDB(Client_Request, Requested_LC_Status) {

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
                    var lcRequestRecords = responseString.split("\n");
                    var numOfRecords = lcRequestRecords.length - 2;
                    responseSingleObject = JSON.parse(lcRequestRecords[numOfRecords]);

                    alert("Success Response for RetrieveLCDetails");

                    fillTheLCRequestDetailsOfCurrentBuyer(lcRequestRecords, Requested_LC_Status);

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

            alert("Retrieving the Lc Requests of Current Buyer => httpRequest : " + httpRequestString);
        }
        xmlhttp.send();

    }

    /***********************************************************************************************************
        fillTheLCRequestDetailsOfCurrentBuyer : Fill the LC Request details of current buyer in the Table
    ************************************************************************************************************/

    function fillTheLCRequestDetailsOfCurrentBuyer(lcRequestRecords, requested_LC_Status) {

        if (bDebug == true) {

            alert("fillTheLCRequestDetailsOfCurrentBuyer : Requested_LC_Status : => " + requested_LC_Status);
        }

        var shipmentDetailsTable = document.getElementById("Buyer_Bank_Shipment_Order_Details");

        if (bDebug == true) {

            alert("fillTheLCRequestDetailsOfCurrentBuyer : totalNumberOfLCRecords Returned : => " + lcRequestRecords.length);
        }

        var currentRowNumber = 1;

        // Account for the non existing last Record  ( due to insertion of new line character at the server end )

        for (var i = 0; i < lcRequestRecords.length - 1; i++) {

            responseSingleObject = JSON.parse(lcRequestRecords[i]);

            // Filter the Shipment Details as per the requested LC Status

            if (requested_LC_Status != responseSingleObject.Current_Status) {

                continue;
            }

            // Add the content to the Table after filtering out records with unexpected status

            var currentRow = shipmentDetailsTable.insertRow(currentRowNumber);
            currentRowNumber++;
            var currentRowElementsArray = [];

            // Add Cells in the Row

            for (var j = 0; j < 10; j++) {

                var currentRowElement;

                if (j == 9) {

                    currentRowElement = document.createElement('td');

                    currentRowElementChild = document.createElement('input');
                    currentRowElementChild.type = "checkbox";

                    currentRowElement.appendChild(currentRowElementChild);

                } else {

                    currentRowElement = document.createElement('td');

                }

                currentRow.appendChild(currentRowElement);
                currentRowElementsArray.push(currentRowElement);
            }

            if (bDebug == true) {

                if (responseSingleObject.Amount != undefined && responseSingleObject.Amount != null) {
                    alert("inappropriate amount in current Row : currentRow Amount = " + responseSingleObject.Amount);
                }
            }

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
        }

        if (bDebug == true) {

            alert("fillTheLCRequestDetailsOfCurrentBuyer : total Number Of Rows inserted : => " + currentRowNumber - 1);
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
    fillTableData_CurrentRowElement : Fills the current Element in Table Cell
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

        retrieveLCRecords_Bank: retrieveLcRecordsOfBuyer_FromMongoDB
    };

})();

