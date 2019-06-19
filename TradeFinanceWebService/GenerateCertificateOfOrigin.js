
/*************************************************************************
 * 
 *   Certificate of Origin PDF document Generation on Server Side
 * 
**************************************************************************/

'use strict';

/*************************************************************************
 * 
 * Globals : Module Imports & Mongo DB Connection Variables
 * 
 *************************************************************************/

// Include jsPDF Module for CertificateOfOrigin File Generation On Server Side
// Define globals as per JSPDF Inclusion Usage/Syntax

global.window = {
    document: {
        createElementNS: () => { return {} }
    }
};
global.navigator = {};
global.btoa = () => { };


// Modules

var fileSystemModule = require('fs');
var jsPdfModule = require('jspdf');
var HelperUtilsModule = require('./HelperUtils');
var PDFDocHelperUtilsModule = require('./PDFDocHelperUtils');
var TradeAndLCHelperUtilsModule = require('./TradeAndLCHelperUtils.js');


// Generic Variables Global

var bDebug = false;
var certificateOfOriginFilesDestination = "./CertificateOfOriginFiles/";


/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * Certificate of Origin Generation and Corresponding Helper Functions
 * 
 **************************************************************************
 **************************************************************************
 */

/**
 * 
 * @param {any} dbConnection  : Connection to database
 * @param {any} tradeAndLcTable_Name  : Name of Table ( Collection )
 * @param {any} clientRequestWithParamsMap : Map of <K,V> Pairs ( Record ) used to generate COO
 * @param { any } http_response: Http Response to be built based on CertificateOfOrigin Generation and Upload to file Server
 *
*/

exports.generateCertificateOfOrigin_AndUploadItToFileServer = function (dbConnection,
    tradeAndLcTable_Name,
    clientRequestWithParamsMap,
    http_response) {

    TradeAndLCHelperUtilsModule.checkCurrentStatusAndReturnCallback(dbConnection,
        tradeAndLcTable_Name,
        clientRequestWithParamsMap,
        http_response,
        "Trade_Shipped",
        generateCertificateOfOriginAndUpload)

}


/**
 * 
 * @param {any} clientRequestWithParamsMap : Map of <K,V> Pairs ( Record ) used to generate COO
 * @param {any} http_response: Http Response to be built based on COO Generation and Upload to file Server
 *
*/

function generateCertificateOfOriginAndUpload(clientRequestWithParamsMap, http_response) {

    // Generate Certificate Of Origin based on Input Details

    var fileName = "CertificateOfOrigin-" + clientRequestWithParamsMap.get("taId") + ".pdf";

    var fileData = generateCertificateOfOriginFileBasedOnSelectedInput(clientRequestWithParamsMap);
    var dstFile = certificateOfOriginFilesDestination + fileName;

    console.log("generateCertificateOfOriginAndUpload.fs.writeFile => Writing Certificate of Origin Data to PDF File : " + dstFile);

    fileSystemModule.writeFile(dstFile, fileData, (err) => {

        console.log("generateCertificateOfOriginAndUpload.fs.writeFile => in call-back function code");

        if (err) {

            console.error("Error while writing data to pdf file : Error => " + err);
            var failureMessage = "generateCertificateOfOriginAndUpload : Error while writing data to pdf file => " + err;

            var http_StatusCode = 400;
            HelperUtilsModule.buildErrorResponse_Generic("generateCertificateOfOriginAndUpload", failureMessage, http_StatusCode, http_response);

            return;
        }

        console.log("generateCertificateOfOriginAndUpload => Successfully wrote the data to PDF File");

        // Send Success Response

        var successMessage = "Successfully Generated the CertificateOfOrigin";
        HelperUtilsModule.buildSuccessResponse_Generic(successMessage, "generateCertificateOfOriginAndUpload", http_response);

    });

}

/****************************************************************************************
    Generates Certificate of Origin based on Selected Input Details
*****************************************************************************************/

function generateCertificateOfOriginFileBasedOnSelectedInput(clientRequestWithParamsMap) {

    // Create Certificate of Origin : PDF File

    var pdfDoc = new jsPdfModule();

    clientRequestWithParamsMap = HelperUtilsModule.removeUrlSpacesFromMapValues(clientRequestWithParamsMap);

    // Date String

    var dateString = PDFDocHelperUtilsModule.returnTodaysDateString();
    pdfDoc.text(135, 30, dateString);

    // Place

    var placeString = "Place : " + clientRequestWithParamsMap.get("manufacturerLocation");
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

    var certOriginDocument_SubjectLine = "Subject: Certificate of Origin for shipment of Goods & Services of " + clientRequestWithParamsMap.get("shipment");
    Y_CoOrdinate = PDFDocHelperUtilsModule.printParagraphToPDF(pdfDoc, 25, Y_CoOrdinate, certOriginDocument_SubjectLine, maxCharsInLine, spaceBetweenLines);
    Y_CoOrdinate += bufferBetweenParagraphs;


    // First Paragraph Content

    var certOriginDocument_Paragraph1 = "This document notifies & certifies that the shipment " + clientRequestWithParamsMap.get("shipment") + " was " +
        "manufactured (produced) by seller " + clientRequestWithParamsMap.get("seller") + " in their production center located at "
        + clientRequestWithParamsMap.get("manufacturerLocation") + ", and complete address of their manufacturing hub is " + clientRequestWithParamsMap.get("manufacturerAddress") + ".";

    Y_CoOrdinate = PDFDocHelperUtilsModule.printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, certOriginDocument_Paragraph1, maxCharsInLine, spaceBetweenLines);
    Y_CoOrdinate += bufferBetweenParagraphs;

    // Second Paragraph Content

    var certOriginDocument_Paragraph2 = "All the details of " + clientRequestWithParamsMap.get("shipment") +
        " including its origin can be found below.";

    Y_CoOrdinate = PDFDocHelperUtilsModule.printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, certOriginDocument_Paragraph2, maxCharsInLine, spaceBetweenLines);
    Y_CoOrdinate += bufferBetweenParagraphs;

    // Trade Details

    var tradeDetails_Header = "Shipment Origin Details";
    Y_CoOrdinate = PDFDocHelperUtilsModule.printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Header, maxCharsInLine, spaceBetweenLines);
    Y_CoOrdinate += spaceBetweenLines;

    var tradeDetails_Shipment = "Shipment Details : " + clientRequestWithParamsMap.get("shipment") + "(" +
        clientRequestWithParamsMap.get("shipmentCount") + ")";
    Y_CoOrdinate = PDFDocHelperUtilsModule.printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Shipment, maxCharsInLine, spaceBetweenLines);

    var tradeDetails_Buyer = "Buyer : " + clientRequestWithParamsMap.get("buyer");
    Y_CoOrdinate = PDFDocHelperUtilsModule.printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Buyer, maxCharsInLine, spaceBetweenLines);

    var tradeDetails_Seller = "Seller : " + clientRequestWithParamsMap.get("seller");
    Y_CoOrdinate = PDFDocHelperUtilsModule.printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Seller, maxCharsInLine, spaceBetweenLines);

    var tradeDetails_SellerBank = "Manufacturer Location : " + clientRequestWithParamsMap.get("manufacturerLocation");
    Y_CoOrdinate = PDFDocHelperUtilsModule.printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_SellerBank, maxCharsInLine, spaceBetweenLines);

    var tradeDetails_Amount = "Manufacturer Address : " + clientRequestWithParamsMap.get("manufacturerAddress");
    Y_CoOrdinate = PDFDocHelperUtilsModule.printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Amount, maxCharsInLine, spaceBetweenLines);

    // Generate Data Output for pdfDoc

    var dataOutput = pdfDoc.output();
    return dataOutput;
}

