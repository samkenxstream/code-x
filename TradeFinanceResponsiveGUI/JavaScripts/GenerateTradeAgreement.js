
var GenerateTradeAgreementModule = (function () {

    var bDebug = false;
    var webServerPrefix = "http://127.0.0.1:3500/?";

    /***********************************************************************************************************
        GenerateTradeAgreementAndPlaceItOnServerDatabase : Generate Trade Agreement on Server End
                                                           and place it in designated folder
    ************************************************************************************************************/

    function GenerateTradeAgreementAndPlaceItOnServerDatabase(Client_Request, tradeDetailsMap) {

        var xmlhttp;
        var httpRequestString = webServerPrefix;

        xmlhttp = new XMLHttpRequest();
        httpRequestString += "Client_Request=" + Client_Request;

        if (tradeDetailsMap != null && tradeDetailsMap != undefined) {

            var tradeDetailsKeys = tradeDetailsMap.keys();

            for (var currentKey of tradeDetailsKeys) {

                httpRequestString += "&";
                httpRequestString += currentKey;
                httpRequestString += "=";
                httpRequestString += tradeDetailsMap.get(currentKey);
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
                        alert("Success Response for generateTradeAgreement");
                    }

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response while placing GenerateTradeAgreement call :=> Status : " + this.status + " readyState : " + this.readyState);
                    }
                }

            } else {

                if (this.readyState == 4) {

                    alert("Failure to place GenerateTradeAgreement call :=> Status : " + this.status + " readyState : " + this.readyState);

                    var responseObject = JSON.parse(this.response);
                    alert(responseObject.Status);
                }

            }

        };

        if (bDebug == true) {

            alert("Generating Trade Agreement for current user Request => httpRequest : " + httpRequestString);
        }

        xmlhttp.send();

    }

    /****************************************************************************************
        Generate Trade Agreement Based on Selected Input
    *****************************************************************************************/

    function GenerateTradeAgreementOnWebClientEnd(tradeDetailsMap) {

        // Create Trade Agreement : PDF File

        var pdfDoc = new jsPDF();

        // Date String

        var dateString = HelperUtilsModule.returnTodaysDateString();
        pdfDoc.text(135, 30, dateString);

        // Place

        var placeString = "Place : " + "Hyderabad, India";
        pdfDoc.text(135, 40, placeString);


        /*************************************************************************************************************************
         * ********                Dynamic Content         ***********************************************************************
        *************************************************************************************************************************/

        var X_CoOrdinate = 15;
        var Y_CoOrdinate = 60;
        var maxCharsInLine = 60;
        var spaceBetweenLines = 10;
        var bufferBetweenParagraphs = 20;

        // Trade Agreement Header

        pdfDoc.text(75, Y_CoOrdinate, "Trade Agreement");
        Y_CoOrdinate += bufferBetweenParagraphs;

        // Subject Section Details

        var tradeAgreement_SubjectLine = "Subject: Trade Agreement for shipment of Goods & Services of " + tradeDetailsMap.get("shipment");
        pdfDoc.text(25, Y_CoOrdinate, tradeAgreement_SubjectLine);
        Y_CoOrdinate += bufferBetweenParagraphs;

        // First Paragraph Content

        var tradeAgreement_Paragraph1 = "An agreement has been reached between buyer: " + tradeDetailsMap.get("buyer") + " and seller: " +
            tradeDetailsMap.get("seller") + " to purchase the goods & services " + tradeDetailsMap.get("shipment") + " , for the amount of "
            + tradeDetailsMap.get("amount") + " .Payment will be processed to " + tradeDetailsMap.get("sellerBank") + " by " +
            tradeDetailsMap.get("buyer") + ".";

        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeAgreement_Paragraph1, maxCharsInLine, spaceBetweenLines);
        Y_CoOrdinate += bufferBetweenParagraphs;

        // Second Paragraph Content

        var tradeAgreement_Paragraph2 = "Payment would be credit to seller bank account registered in " + tradeDetailsMap.get("sellerBank") +
            " once the shipment gets delivered.";

        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeAgreement_Paragraph2, maxCharsInLine, spaceBetweenLines);
        Y_CoOrdinate += bufferBetweenParagraphs;

        // Trade Details

        var tradeDetails_Header = "Shipment Details";
        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Header, maxCharsInLine, spaceBetweenLines);
        Y_CoOrdinate += spaceBetweenLines;

        var tradeDetails_Buyer = "Buyer : " + tradeDetailsMap.get("buyer");
        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Buyer, maxCharsInLine, spaceBetweenLines);

        var tradeDetails_Seller = "Seller : " + tradeDetailsMap.get("seller");
        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Seller, maxCharsInLine, spaceBetweenLines);

        var tradeDetails_Shipment = "Shipment Details : " + tradeDetailsMap.get("shipment");
        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Shipment, maxCharsInLine, spaceBetweenLines);

        var tradeDetails_SellerBank = "Seller Bank : " + tradeDetailsMap.get("sellerBank");
        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_SellerBank, maxCharsInLine, spaceBetweenLines);

        var tradeDetails_Amount = "Amount : " + tradeDetailsMap.get("amount");
        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Amount, maxCharsInLine, spaceBetweenLines);

        // Generate TradeAgreement

        var fileName = "TradeAgreement-" + tradeDetailsMap.get("taId") + ".pdf";
        pdfDoc.save(fileName);

    }

    /****************************************************************************************
        Reveal private methods
    *****************************************************************************************/

    return {

        GenerateTradeAgreementOnServerSide: GenerateTradeAgreementAndPlaceItOnServerDatabase,
        GenerateTradeAgreementOnClientSide: GenerateTradeAgreementOnWebClientEnd
    };

})();


