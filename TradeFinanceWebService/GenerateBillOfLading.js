
/*************************************************************************
 * 
 *   Bill of Lading PDF document Generation on Server Side
 *
**************************************************************************/

'use strict';

/*************************************************************************
 * 
 * Globals : Module Imports & Mongo DB Connection Variables
 * 
 *************************************************************************/

// Include jsPDF Module for BillOfLading File Generation On Server Side
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
var HelperUtilsModule = require('./HelperUtils');
var PDFDocHelperUtilsModule = require('./PDFDocHelperUtils');
var TradeAndLCHelperUtilsModule = require('./TradeAndLCHelperUtils.js');


// Generic Variables Global

var bDebug = false;
var billOfLadingFilesDestination = "./BillOfLadingFiles/";


/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * Bill of Lading Generation and Corresponding Helper Functions
 * 
 **************************************************************************
 **************************************************************************
 */

/**
 * 
 * @param {any} dbConnection  : Connection to database
 * @param {any} tradeAndLcTable_Name  : Name of Table ( Collection )
 * @param {any} clientRequestWithParamsMap : Map of <K,V> Pairs ( Record ) used to generate BOL
 * @param { any } http_response: Http Response to be built based on BillOfLading Generation and Upload to file Server
 *
*/

exports.generateBillOfLading_AndUploadItToFileServer = function (dbConnection,
    tradeAndLcTable_Name,
    clientRequestWithParamsMap,
    http_response) {

    TradeAndLCHelperUtilsModule.checkCurrentStatusAndReturnCallback(dbConnection,
        tradeAndLcTable_Name,
        clientRequestWithParamsMap,
        http_response,
        "Shipment_Loaded",
        generateBillOfLadingAndUpload)

}


/**
 * 
 * @param {any} clientRequestWithParamsMap : Map of <K,V> Pairs ( Record ) used to generate BOL
 * @param {any} http_response: Http Response to be built based on BOL Generation and Upload to file Server
 *
*/

function generateBillOfLadingAndUpload(clientRequestWithParamsMap, http_response) {

    // Generate Bill of Lading based on Input Details

    var fileName = "BillOfLading-" + clientRequestWithParamsMap.get("taId") + ".pdf";

    var fileData = generateBillOfLadingFileBasedOnSelectedInput(clientRequestWithParamsMap);
    var dstFile = billOfLadingFilesDestination + fileName;

    console.log("generateBillOfLadingAndUpload.fs.writeFile => Writing Bill of Lading Data to PDF File : " + dstFile);

    fileSystemModule.writeFile(dstFile, fileData, (err) => {

        console.log("generateBillOfLadingAndUpload.fs.writeFile => in call-back function code");

        if (err) {

            console.error("Error while writing data to pdf file : Error => " + err);
            var failureMessage = "generateBillOfLadingAndUpload : Error while writing data to pdf file => " + err;

            var http_StatusCode = 400;
            HelperUtilsModule.buildErrorResponse_Generic("generateBillOfLadingAndUpload", failureMessage,
                http_StatusCode, http_response);

            return;
        }

        console.log("generateBillOfLadingAndUpload => Successfully wrote the data to PDF File");

        // Send Success Response

        var successMessage = "Successfully Generated the BillOfLading";
        HelperUtilsModule.buildSuccessResponse_Generic(successMessage, "generateBillOfLadingAndUpload", http_response);

    });

}

/**
 * 
 * @param {Map} clientRequestWithParamsMap : Map of <K,V> Pairs ( Record ) used to generate BOL
 *
 * @returns {fileData} pdfDocDataOutput  :  Output of PDF Document that got generated based on input Details
 *
*/

function generateBillOfLadingFileBasedOnSelectedInput(clientRequestWithParamsMap) {

    clientRequestWithParamsMap = HelperUtilsModule.removeUrlSpacesFromMapValues(clientRequestWithParamsMap);

    // Create Bill of Lading : PDF File

    var placeString = clientRequestWithParamsMap.get("carrierLocation");
    var headerString = "Bill of Lading";
    var subjectLine = "Subject: Bill of Lading for shipment of Goods & Services of " + clientRequestWithParamsMap.get("shipment");

    /*************************************************************************************************************************
     *********                Dynamic Content         ***********************************************************************
    *************************************************************************************************************************/

    // First Paragraph Content

    var billOfLading_Paragraph1 = "This document notifies & certifies that the shipment " + clientRequestWithParamsMap.get("shipment") +
        " was handed over by seller " + clientRequestWithParamsMap.get("seller") + " to Carrier " + clientRequestWithParamsMap.get("carrierName") +
        " at " + clientRequestWithParamsMap.get("carrierLocation") + ".";

    // Second Paragraph Content

    var billOfLading_Paragraph2 = "Carrier certifies the receipt of Shipment from Seller on " +
        PDFDocHelperUtilsModule.returnTodaysDateString() + " and has planned to transport shipment to Destination Port." +
        "Container details of Shipment " + clientRequestWithParamsMap.get("shipment") + "can be found below.";

    var dynamicContentParagraphList = [billOfLading_Paragraph1, billOfLading_Paragraph2];

    // Trade Details

    var tradeDetails_Header = "Carrier & Container Details :";
    var tradeDetails_Header_Separator = "=============================";
    var tradeDetails_Shipment = "Shipment Details : " + clientRequestWithParamsMap.get("shipment") + "(" +
        clientRequestWithParamsMap.get("shipmentCount") + ")";
    var tradeDetails_Buyer = "Buyer : " + clientRequestWithParamsMap.get("buyer");
    var tradeDetails_Seller = "Seller : " + clientRequestWithParamsMap.get("seller");
    var tradeDetails_Carrier = "Carrier : " + clientRequestWithParamsMap.get("carrierName");
    var tradeDetails_CarrierLocation = "Carrier Location : " + clientRequestWithParamsMap.get("carrierLocation");
    var tradeDetails_CarrierAddress = "Carrier Address : " + clientRequestWithParamsMap.get("carrierAddress");
    var tradeDetails_ContainerId = "Container Identifier : " + Math.random().toString();

    var tradeDetails = [tradeDetails_Header, tradeDetails_Header_Separator, tradeDetails_Shipment, tradeDetails_Buyer,
        tradeDetails_Seller, tradeDetails_Carrier, tradeDetails_CarrierLocation, tradeDetails_CarrierAddress, tradeDetails_ContainerId];

    var fileName = "BillOfLading-" + clientRequestWithParamsMap.get("taId") + ".pdf";

    // Generate BillOfLading Document Output

    var pdfDocDataOutput = PDFDocHelperUtilsModule.generatePDFDocForTradeFinance(placeString, headerString, subjectLine,
        dynamicContentParagraphList, tradeDetails, fileName);

    return pdfDocDataOutput;
}

