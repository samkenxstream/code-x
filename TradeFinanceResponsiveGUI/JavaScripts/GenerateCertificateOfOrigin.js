
var GenerateCertificateOfOriginModule = (function () {

    var bDebug = false;
    var webServerPrefix = "http://127.0.0.1:3500/?";

    /***********************************************************************************************************
        Generate_CertificateOfOrigin_AndPlaceItOnServerDatabase : Generate Certificate of Origin on Server End
                                                                  and place it in designated folder
    ************************************************************************************************************/

    function Generate_CertificateOfOrigin_AndPlaceItOnServerDatabase(Client_Request, certOriginDetailsMap) {

        var xmlhttp;
        var httpRequestString = webServerPrefix;

        xmlhttp = new XMLHttpRequest();
        httpRequestString += "Client_Request=" + Client_Request;

        if (certOriginDetailsMap != null && certOriginDetailsMap != undefined) {

            var certOriginDetailsKeys = certOriginDetailsMap.keys();

            for (var currentKey of certOriginDetailsKeys) {

                httpRequestString += "&";
                httpRequestString += currentKey;
                httpRequestString += "=";
                httpRequestString += certOriginDetailsMap.get(currentKey);
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
                        alert("Success Response for generateCertificateOfOrigin");
                    }

                } else {

                    if (bDebug == true) {

                        alert("Intermediate Success Response while placing GenerateCertificateOfOrigin call :=> Status : " + this.status + " readyState : " + this.readyState);
                    }
                }

            } else {

                if (this.readyState == 4) {

                    alert("Failure to place GenerateCertificateOfOrigin call :=> Status : " + this.status + " readyState : " + this.readyState);

                    var responseObject = JSON.parse(this.response);
                    alert(responseObject.Status);
                }

            }

        };

        if (bDebug == true) {

            alert("Generating Certificate of Origin for current Trade => httpRequest : " + httpRequestString);
        }

        xmlhttp.send();

    }

    /****************************************************************************************
        Generate 'Certificate of Origin' Based on Selected Input
    *****************************************************************************************/

    function GenerateCertificateOfOriginOnWebClientEnd(certOriginDetailsMap) {

        // Create Certificate Of Origin : PDF File

        var pdfDoc = new jsPDF();

        // Date String

        var dateString = HelperUtilsModule.returnTodaysDateString();
        pdfDoc.text(135, 30, dateString);

        // Place

        var placeString = "Place : " + certOriginDetailsMap.get("manufacturerLocation");
        pdfDoc.text(135, 40, placeString);


        /*************************************************************************************************************************
         *********                Dynamic Content         ***********************************************************************
        *************************************************************************************************************************/

        var X_CoOrdinate = 15;
        var Y_CoOrdinate = 60;
        var maxCharsInLine = 60;
        var spaceBetweenLines = 10;
        var bufferBetweenParagraphs = 20;

        // Trade Agreement Header

        pdfDoc.text(75, Y_CoOrdinate, "Certificate of Origin");
        Y_CoOrdinate += bufferBetweenParagraphs;

        // Subject Section Details

        var certOriginDocument_SubjectLine = "Subject: Certificate of Origin for shipment of Goods & Services of " + certOriginDetailsMap.get("shipment");

        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, 25, Y_CoOrdinate, certOriginDocument_SubjectLine, maxCharsInLine, spaceBetweenLines);
        Y_CoOrdinate += bufferBetweenParagraphs;

        /*
        pdfDoc.text(25, Y_CoOrdinate, certOriginDocument_SubjectLine);
        Y_CoOrdinate += bufferBetweenParagraphs;
        */

        // First Paragraph Content

        var certOriginDocument_Paragraph1 = "This document notifies & certifies that the shipment " + certOriginDetailsMap.get("shipment") + " was " +
            "manufactured (produced) by seller " + certOriginDetailsMap.get("seller") + " in their production center located at "
            + certOriginDetailsMap.get("manufacturerLocation") + ", and complete address of their manufacturing hub is " + certOriginDetailsMap.get("manufacturerAddress") + ".";

        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, certOriginDocument_Paragraph1, maxCharsInLine, spaceBetweenLines);
        Y_CoOrdinate += bufferBetweenParagraphs;

        // Second Paragraph Content

        var certOriginDocument_Paragraph2 = "All the details of " + certOriginDetailsMap.get("shipment") +
            " including its origin can be found below.";

        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, certOriginDocument_Paragraph2, maxCharsInLine, spaceBetweenLines);
        Y_CoOrdinate += bufferBetweenParagraphs;

        // Trade Details

        var tradeDetails_Header = "Shipment Origin Details";
        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Header, maxCharsInLine, spaceBetweenLines);
        Y_CoOrdinate += spaceBetweenLines;

        var tradeDetails_Shipment = "Shipment Details : " + certOriginDetailsMap.get("shipment") + "(" +
                                    certOriginDetailsMap.get("shipmentCount") + ")";
        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Shipment, maxCharsInLine, spaceBetweenLines);

        var tradeDetails_Buyer = "Buyer : " + certOriginDetailsMap.get("buyer");
        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Buyer, maxCharsInLine, spaceBetweenLines);

        var tradeDetails_Seller = "Seller : " + certOriginDetailsMap.get("seller");
        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Seller, maxCharsInLine, spaceBetweenLines);

        var tradeDetails_SellerBank = "Manufacturer Location : " + certOriginDetailsMap.get("manufacturerLocation");
        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_SellerBank, maxCharsInLine, spaceBetweenLines);

        var tradeDetails_Amount = "Manufacturer Address : " + certOriginDetailsMap.get("manufacturerAddress");
        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Amount, maxCharsInLine, spaceBetweenLines);

        // Generate CertificateOfOrigin

        var fileName = "CertificateOfOrigin-" + certOriginDetailsMap.get("taId") + "-" + certOriginDetailsMap.get("lcId") + ".pdf";
        pdfDoc.save(fileName);

    }

    /****************************************************************************************
        Reveal private methods
    *****************************************************************************************/

    return {

        GenerateCertificateOfOriginOnServerSide: Generate_CertificateOfOrigin_AndPlaceItOnServerDatabase,
        GenerateCertificateOfOriginOnClientSide: GenerateCertificateOfOriginOnWebClientEnd
    };

})();


