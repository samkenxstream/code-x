
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
        Generate Single LC based on Selected Input
    *****************************************************************************************/

    function generateLCOnWebClientEnd(shipmentDetailsMap) {

        // Create LC : PDF File

        var pdfDoc = new jsPDF();

        // Generate Pdf Doc

        var todaysDate = new Date();
        var todaysMonth = parseInt(todaysDate.getMonth().toString());
        todaysMonth += 1;
        var todaysYear = parseInt(todaysDate.getYear().toString());
        todaysYear += 1900;

        var dateString = "Date : " + todaysDate.getDate().toString() + "-" + todaysMonth.toString() + "-" + todaysYear.toString();
        pdfDoc.text(135, 30, dateString);

        // Place

        var placeString = "Place : " + "Hyderabad, India";
        pdfDoc.text(135, 40, placeString);

        // To Section Details

        pdfDoc.text(15, 60, "To : ");
        pdfDoc.text(15, 70, shipmentDetailsMap.get("seller") + ",");

        // Subject Section Details

        var LCSubjectLine = "Sub : Letter of Credit For Shipment : (" + shipmentDetailsMap.get("shipment") + "), Id : (" + shipmentDetailsMap.get("taId") + ")";
        pdfDoc.text(25, 95, LCSubjectLine);

        // Letter content Paragraph 1

        var LCContentLine1 = shipmentDetailsMap.get("bank") + " here by certifies that, payment for the amount of " + shipmentDetailsMap.get("creditAmount");
        var LCContentLine2 = "will be processed by " + shipmentDetailsMap.get("bank") + " on behalf of " + shipmentDetailsMap.get("buyer") + ", as soon as";
        var LCContentLine3 = shipmentDetailsMap.get("shipment") + "(" + shipmentDetailsMap.get("count") + ")" + " are delivered on or before " + shipmentDetailsMap.get("expiryDate") + ".";

        pdfDoc.text(30, 120, LCContentLine1);
        pdfDoc.text(15, 130, LCContentLine2);
        pdfDoc.text(15, 140, LCContentLine3);

        // Subject Section Details

        var LCContentLine4 = "LC would expire with immediate effect on " + shipmentDetailsMap.get("expiryDate") + " , if promised";
        var LCContentLine5 = "items : " + shipmentDetailsMap.get("shipment") + "(" + shipmentDetailsMap.get("count") + ")" + " are not delivered by then.";

        pdfDoc.text(30, 155, LCContentLine4);
        pdfDoc.text(15, 165, LCContentLine5);

        // Closure : Addressing by Author

        var LCAddressingSignOffByAuthor = "Thanks & Regards,";
        pdfDoc.text(135, 190, LCAddressingSignOffByAuthor);
        pdfDoc.text(135, 200, shipmentDetailsMap.get("buyer"));

        var generateUniqueTradeId = "TradeId_" + todaysDate.getYear().toString() + todaysDate.getMonth().toString() + todaysDate.getDate().toString() + todaysDate.getHours().toString() + todaysDate.getMinutes().toString() + todaysDate.getSeconds().toString();
        var generateUniqueLCId = "LCId_" + todaysDate.getYear().toString() + todaysDate.getMonth().toString() + todaysDate.getDate().toString() + todaysDate.getHours().toString() + todaysDate.getMinutes().toString() + todaysDate.getSeconds().toString();

        var tradeIdString = "Trade Id : " + generateUniqueTradeId;
        var lcIdString = "LC Id : " + generateUniqueLCId;

        pdfDoc.text(25, 220, tradeIdString);
        pdfDoc.text(25, 230, lcIdString);

        // Generate LC

        var fileName = "LoC-Shipment-" + shipmentDetailsMap.get("taId") + shipmentDetailsMap.get("lcId") + ".pdf";
        pdfDoc.save(fileName);

        // Issue LC

        /*
        issueLC(lcIdString);
        */
    }


    /****************************************************************************************
        Reveal private methods
    *****************************************************************************************/

    return {

        generateLCOnServerSide: generateLCAndPlaceItOnServerDatabase,
        generateLCOnClientSide: generateLCOnWebClientEnd
    };

})();
