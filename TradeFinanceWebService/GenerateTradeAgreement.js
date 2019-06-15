
/*************************************************************************
 * 
 * 
 * 
 *************************************************************************/

'use strict';

/*************************************************************************
 * 
 * Globals : Module Imports & Mongo DB Connection Variables
 * 
 *************************************************************************/

// Include jsPDF Module for TradeAgreement File Generation On Server Side
// Define globals as per JSPDF Inclusion Usage/Syntax

global.window = {
    document: {
        createElementNS: () => { return {} }
    }
};
global.navigator = {};
global.btoa = () => { };


// Generic Variables Global

var fileSystemModule = require('fs');
var jsPdfModule = require('jspdf');
var HelperUtilsModule = require('./HelperUtils');

var bDebug = false;

var tradeAgreementFilesDestination = "./TradeAgreementFiles/";


/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * Trade Agreement Generation and Corresponding Helper Functions
 * 
 **************************************************************************
 **************************************************************************
 */

/**
 * 
 * @param {any} dbConnection  : Connection to database
 * @param {any} tradeAndLcTable_Name  : Name of Table ( Collection )
 * @param {any} clientRequestWithParamsMap : Map of <K,V> Pairs ( Record ) used to generate LC
 * @param {any} webClientRequest : Web Client Request API
 * @param {any} statusToBeUpdated : Status of LC Request to be Updated
 * @param { any } http_response: Http Response to be built based on TradeAgreement Generation and Upload to file Server
 *
*/

exports.generateTradeAgreement_AndUploadItToFileServer = function (dbConnection,
    tradeAndLcTable_Name,
    clientRequestWithParamsMap,
    http_response) {

    // Check the Current Status to be "Trade_Approved" Before placing TradeAgreement Document

    var query_Object = new Object();

    var tradeId = clientRequestWithParamsMap.get("taId");
    console.log("GenerateTradeAgreement.generateTradeAgreementAndUploadItToFileServer : Check the current Status to be " +
        "Trade_Approved before generating Trade agreement : ");

    // Build Query Based on input <k,v> pairs

    if (tradeId != null && tradeId != undefined) {

        query_Object.Trade_Id = tradeId;
    }

    // Find Record & Check Current Status

    console.log("GenerateTradeAgreement.generateTradeAgreementAndUploadItToFileServer : " + tradeAndLcTable_Name + ", Trade_Id : " + tradeId);

    if (Object.keys(query_Object).length < 1) {

        var failureMessage = "Wrong Query/missing input query data : Couldn't find Record => " + " Trade_Id : " + tradeId;
        buildErrorResponse_ForRecordUpdation(failureMessage, "GenerateTradeAgreement", http_response);

        return;
    }

    // Query For the Existing Status and Validate the Appropriateness in Status Transition : Should be "Trade_Approved"

    console.log("GenerateTradeAgreement.generateTradeAgreementAndUploadItToFileServer => Checking the current status of Record for valid state Transition : ");

    dbConnection.collection(tradeAndLcTable_Name).findOne(query_Object, function (err, result) {

        if (err) {

            console.error("GenerateTradeAgreement.generateTradeAgreementAndUploadItToFileServer : Error while checking the current status of Record");

            var failureMessage = "GenerateTradeAgreement.generateTradeAgreementAndUploadItToFileServer : Error while checking the current status of Record";
            HelperUtilsModule.logInternalServerError("generateTradeAgreementAndUploadItToFileServer", failureMessage, http_response);

            return;
        }

        var recordPresent = (result) ? "true" : "false";
        if (recordPresent == "false") {

            // Record Not Found : So Status Cann't be Verified : Return Error

            console.error("GenerateTradeAgreement.generateTradeAgreementAndUploadItToFileServer : Record in Query not found");

            var failureMessage = "GenerateTradeAgreement.generateTradeAgreementAndUploadItToFileServer : Record in Query not found";
            HelperUtilsModule.logBadHttpRequestError("generateTradeAgreementAndUploadItToFileServer", failureMessage, http_response);

            return;
        }
        else {

            // Record Found : Check the validity of current Status : Should be "Trade_Approved"

            console.log("GenerateTradeAgreement.generateTradeAgreementAndUploadItToFileServer : " +
                "Check the validity of current Status : Should be Trade_Approved");

            // Unexpected State Transition 

            if (result.Current_Status != "Trade_Approved") {

                console.error("GenerateTradeAgreement.generateTradeAgreementAndUploadItToFileServer : Unexpected Current Status for State Transition => " + result.Current_Status);

                var failureMessage = "GenerateTradeAgreement.generateTradeAgreementAndUploadItToFileServer : Unexpected Current Status for State Transition => " + result.Current_Status;
                HelperUtilsModule.logBadHttpRequestError("generateTradeAgreementAndUploadItToFileServer", failureMessage, http_response);

                return;
            }

            // Expected State Transition : Generate Trade Agreement

            else {

                generateTradeAgreementAndUpload(clientRequestWithParamsMap, http_response);

                // Send Success Response

                var successMessage = "Successfully Generated the TradeAgreement";
                HelperUtilsModule.buildSuccessResponse_Generic(successMessage, "GenerateTradeAgreement", http_response);

                return;
            }

        }

    });

}


/**
 * 
 * @param {any} clientRequestWithParamsMap : Map of <K,V> Pairs ( Record ) used to generate LC
 * @param {any} http_response: Http Response to be built based on Trade Agreement Generation and Upload to file Server
 *
*/

function generateTradeAgreementAndUpload( clientRequestWithParamsMap, http_response) {

    // Generate Trade Agreement based on Input Details

    var fileName = "Trade-Agreement-" + clientRequestWithParamsMap.get("taId") + ".pdf";

    var fileData = generateTradeAgreementFileBasedOnSelectedInput(clientRequestWithParamsMap);
    var dstFile = tradeAgreementFilesDestination + fileName;

    console.log("generateTradeAgreementAndUpload.fs.writeFile => Writing Trade Agreement Data to PDF File : " + dstFile);

    fileSystemModule.writeFile(dstFile, fileData, (err) => {

        console.log("generateTradeAgreementAndUpload.fs.writeFile => in call-back function code");

        if (err) {

            console.error("Error while writing data to pdf file : Error => " + err);
            var failureMessage = "generateTradeAgreementAndUpload : Error while writing data to pdf file => " + err;

            var http_StatusCode = 400;
            HelperUtilsModule.buildErrorResponse_Generic("generateTradeAgreementAndUpload", failureMessage, http_StatusCode, http_response);

            return;
        }

        console.log("generateTradeAgreementAndUpload => Successfully wrote the data to PDF File");

    });

}

/****************************************************************************************
    Generates Trade Agreement based on Selected Input Details
*****************************************************************************************/

function generateTradeAgreementFileBasedOnSelectedInput(clientRequestWithParamsMap) {

    // Create Trade Agreement : PDF File

    var pdfDoc = new jsPdfModule();

    clientRequestWithParamsMap = HelperUtilsModule.removeUrlSpacesFromMapValues(clientRequestWithParamsMap);

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


    /*************************************************************************************************************************
    ***********                Dynamic Content               *****************************************************************
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

    var tradeAgreement_SubjectLine = "Subject: Trade Agreement for shipment of Goods & Services of " + clientRequestWithParamsMap.get("shipment");
    pdfDoc.text(25, Y_CoOrdinate, tradeAgreement_SubjectLine);
    Y_CoOrdinate += bufferBetweenParagraphs;

    // First Paragraph Content

    var tradeAgreement_Paragraph1 = "An agreement has been reached between buyer, " + clientRequestWithParamsMap.get("buyer") + " and seller, " +
        clientRequestWithParamsMap.get("seller") + " to purchase the goods & services of " + clientRequestWithParamsMap.get("shipment") + " , for the amount of "
        + clientRequestWithParamsMap.get("amount") + ". Payment will be processed to seller account in " + clientRequestWithParamsMap.get("sellerBank") + " by " +
        clientRequestWithParamsMap.get("buyer") + ".";

    Y_CoOrdinate = printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeAgreement_Paragraph1, maxCharsInLine, spaceBetweenLines);
    Y_CoOrdinate += bufferBetweenParagraphs;

    // Second Paragraph Content

    var tradeAgreement_Paragraph2 = "Payment would be credit to seller bank account registered in " + clientRequestWithParamsMap.get("sellerBank") +
        " once the shipment gets delivered.";

    Y_CoOrdinate = printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeAgreement_Paragraph2, maxCharsInLine, spaceBetweenLines);
    Y_CoOrdinate += bufferBetweenParagraphs;

    // Trade Details

    var tradeDetails_Header = "Shipment Details";
    Y_CoOrdinate = printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Header, maxCharsInLine, spaceBetweenLines);
    Y_CoOrdinate += spaceBetweenLines;

    var tradeDetails_Buyer = "Buyer : " + clientRequestWithParamsMap.get("buyer");
    Y_CoOrdinate = printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Buyer, maxCharsInLine, spaceBetweenLines);

    var tradeDetails_Seller = "Seller : " + clientRequestWithParamsMap.get("seller");
    Y_CoOrdinate = printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Seller, maxCharsInLine, spaceBetweenLines);

    var tradeDetails_Shipment = "Shipment Details : " + clientRequestWithParamsMap.get("shipment");
    Y_CoOrdinate = printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Shipment, maxCharsInLine, spaceBetweenLines);

    var tradeDetails_SellerBank = "Seller Bank : " + clientRequestWithParamsMap.get("sellerBank");
    Y_CoOrdinate = printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_SellerBank, maxCharsInLine, spaceBetweenLines);

    var tradeDetails_Amount = "Amount : " + clientRequestWithParamsMap.get("amount");
    Y_CoOrdinate = printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, tradeDetails_Amount, maxCharsInLine, spaceBetweenLines);

    // Generate Data Output for pdfDoc

    var dataOutput = pdfDoc.output();
    return dataOutput;
}

/****************************************************************************************
    Prints paragraph into the document by splitting it based on input parameters
*****************************************************************************************/

function printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, strParagraph, maxCharsInLine, spaceBetweenLines) {

    var totalLenth = strParagraph.length;
    var startPos = 0;

    while (startPos < totalLenth) {

        var currentLine = strParagraph.substr(startPos, maxCharsInLine);
        pdfDoc.text(X_CoOrdinate, Y_CoOrdinate, currentLine);

        Y_CoOrdinate += spaceBetweenLines;
        startPos += maxCharsInLine;
    }

    return Y_CoOrdinate;

}



