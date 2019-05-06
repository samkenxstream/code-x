
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

// Include jsPDF Module for LC File Generation On Server Side
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
var TradeAndLCRecordsUpdateModule = require('./TradeAndLCRecordUpdates');

var bDebug = false;

var lcFilesDestination = "./LCFiles/";


/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * LC Generation and Corresponding Helper Functions
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
 * @param { any } http_response: Http Response to be built based on LC Generation and Upload to file Server
 *
*/

exports.generateLCAndUploadItToFileServer = function (dbConnection,
    tradeAndLcTable_Name,
    clientRequestWithParamsMap,
    webClientRequest,
    statusToBeUpdated,
    http_response) {

    // Check the Current Status to be "LC_Requested" Before placing LC Generation Request

    var query_Object = new Object();

    var tradeId = clientRequestWithParamsMap.get("taId");
    console.log("GenerateLC.generateLCAndUploadItToFileServer : Check the current Status to be " +
        "LC_Requested before generating LC : ");

    // Build Query Based on input <k,v> pairs

    if (tradeId != null && tradeId != undefined) {

        query_Object.Trade_Id = tradeId;
    }

    // Find Record & Check Current Status

    console.log("GenerateLC.generateLCAndUploadItToFileServer : " + tradeAndLcTable_Name + ", Trade_Id : " + tradeId);

    if (Object.keys(query_Object).length < 1) {

        var failureMessage = "Wrong Query/missing input query data : Couldn't find Record => " + " Trade_Id : " + tradeId;
        buildErrorResponse_ForRecordUpdation(failureMessage, "GenerateLC", http_response);

        return;
    }

    // Query For the Existing Status and Validate the Appropriateness in Status Transition : Should be "LC_Requested"

    console.log("GenerateLC.generateLCAndUploadItToFileServer => Checking the current status of Record for valid state Transition : ");

    dbConnection.collection(tradeAndLcTable_Name).findOne(query_Object, function (err, result) {

        if (err) {

            console.error("GenerateLC.generateLCAndUploadItToFileServer : Error while checking the current status of Record");

            var failureMessage = "GenerateLC.generateLCAndUploadItToFileServer : Error while checking the current status of Record";
            HelperUtilsModule.logInternalServerError("generateLCAndUploadItToFileServer", failureMessage, http_response);

            return;
        }

        var recordPresent = (result) ? "true" : "false";
        if (recordPresent == "false") {

            // Record Not Found : So Status Cann't be updated : Return Error

            console.error("GenerateLC.generateLCAndUploadItToFileServer : Record in Query not found");

            var failureMessage = "GenerateLC.generateLCAndUploadItToFileServer : Record in Query not found";
            HelperUtilsModule.logBadHttpRequestError("generateLCAndUploadItToFileServer", failureMessage, http_response);

            return;
        }
        else {

            // Record Found : Check the validity of current Status : Should be "LC_Requested"

            console.log("GenerateLC.generateLCAndUploadItToFileServer : " +
                "Check the validity of current Status : Should be LC_Requested");

            // Unexpected State Transition 

            if (result.Current_Status != "LC_Requested") {

                console.error("GenerateLC.generateLCAndUploadItToFileServer : Unexpected Current Status for State Transition => " + result.Current_Status);

                var failureMessage = "GenerateLC.generateLCAndUploadItToFileServer : Unexpected Current Status for State Transition => " + result.Current_Status;
                HelperUtilsModule.logBadHttpRequestError("generateLCAndUploadItToFileServer", failureMessage, http_response);

                return;
            }

            // Expected State Transition : Update the status of Record & Generate LC

            else {

                generateLCAndUpload(dbConnection, tradeAndLcTable_Name, clientRequestWithParamsMap, webClientRequest, statusToBeUpdated,
                    http_response)
            }

        }

    });

}


/**
 * 
 * @param {any} dbConnection  : Connection to database
 * @param {any} tradeAndLcTable_Name  : Name of Table ( Collection )
 * @param {any} clientRequestWithParamsMap : Map of <K,V> Pairs ( Record ) used to generate LC
 * @param {any} webClientRequest : Web Client Request API
 * @param {any} statusToBeUpdated : Status of LC Request to be Updated
 * @param { any } http_response: Http Response to be built based on LC Generation and Upload to file Server
 *
*/

function generateLCAndUpload( dbConnection, tradeAndLcTable_Name, clientRequestWithParamsMap, webClientRequest, statusToBeUpdated,
    http_response) {

    // Generate LC based on Input Details

    var fileName = "LoC-Shipment-" + clientRequestWithParamsMap.get("taId") + clientRequestWithParamsMap.get("lcId") + ".pdf";

    var fileData = generateLCFileBasedOnSelectedInput(clientRequestWithParamsMap);
    var dstFile = lcFilesDestination + fileName;

    console.log("generateLCAndUploadItToFileServer.fs.writeFile => Writing LC Data to PDF File : " + dstFile);

    fileSystemModule.writeFile(dstFile, fileData, (err) => {

        console.log("generateLCAndUploadItToFileServer.fs.writeFile => in call back function code");

        if (err) {

            console.error("Error while writing data to pdf file : Error => " + err);
            var failureMessage = "generateLCAndUploadItToFileServer : Error while writing data to pdf file => " + err;

            var http_StatusCode = 400;
            HelperUtilsModule.buildErrorResponse_Generic("generateLC", failureMessage, http_StatusCode, http_response);

            return;
        }

        console.log("generateLCAndUploadItToFileServer => Successfully wrote the data to PDF File");

        var tradeId = clientRequestWithParamsMap.get("taId");
        var lcId = clientRequestWithParamsMap.get("lcId");

        clientRequestWithParamsMap.set("Trade_Id", tradeId);
        clientRequestWithParamsMap.set("Lc_Id", lcId);

        TradeAndLCRecordsUpdateModule.updateRecordStatusInTradeAndLcDatabase(dbConnection,
            tradeAndLcTable_Name,
            clientRequestWithParamsMap,
            webClientRequest,
            statusToBeUpdated,
            http_response);

    });

    // ToDo : Copy the File from downloads location to File Server Location

    /*
    console.log("generateLCAndUploadItToFileServer => : Moving the file to File Server Location => LCFiles");

    var srcFile = "C:/Users/Administrator/Downloads/RetrieveText.txt";
    var dstFile = "./LCFiles/RetrieveText.txt";

    fileSystemModule.copyFile( srcFile, dstFile, (err) => {

        if (err) {

            console.error("Error while moving the LC File to Destination : Error => " + err);
            var failureMessage = "generateLCAndUploadItToFileServer : Error while moving the LC File to Destination => " + err;

            var http_StatusCode = 400;
            HelperUtilsModule.buildErrorResponse_Generic("generateLC", failureMessage, http_StatusCode, http_response);

            return;
        }

        console.log("generateLCAndUploadItToFileServer => Successfully moved the file to File Server Location :");

        var successMessage = "generateLCAndUploadItToFileServer : Successfully moved the file to File Server Location";
        buildSuccessResponse_ForLCGeneration(successMessage, "generateLC", http_response);

    });
    */

}

/****************************************************************************************
    Generate Single LC based on Selected Input Details
*****************************************************************************************/

function generateLCFileBasedOnSelectedInput(clientRequestWithParamsMap) {

    // Create LC : PDF File

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

    // To Section Details

    pdfDoc.text(15, 60, "To : ");
    pdfDoc.text(15, 70, clientRequestWithParamsMap.get("seller") + ",");

    // Subject Section Details

    var LCSubjectLine = "Sub : Letter of Credit For Shipment : (" + clientRequestWithParamsMap.get("shipment") + "), Id : (" + clientRequestWithParamsMap.get("taId") + ")";
    pdfDoc.text(25, 95, LCSubjectLine);

    // Letter content Paragraph 1

    var LCContentLine1 = clientRequestWithParamsMap.get("bank") + " here by certifies that, payment for the amount of " + clientRequestWithParamsMap.get("creditAmount");
    var LCContentLine2 = "will be processed by " + clientRequestWithParamsMap.get("bank") + " on behalf of " + clientRequestWithParamsMap.get("buyer") + ", as soon as";
    var LCContentLine3 = clientRequestWithParamsMap.get("shipment") + "(" + clientRequestWithParamsMap.get("count") + ")" + " are delivered on or before " + clientRequestWithParamsMap.get("expiryDate") + ".";

    pdfDoc.text(30, 120, LCContentLine1);
    pdfDoc.text(15, 130, LCContentLine2);
    pdfDoc.text(15, 140, LCContentLine3);

    // Subject Section Details

    var LCContentLine4 = "LC would expire with immediate effect on " + clientRequestWithParamsMap.get("expiryDate") + " , if promised";
    var LCContentLine5 = "items : " + clientRequestWithParamsMap.get("shipment") + "(" + clientRequestWithParamsMap.get("count") + ")" + " are not delivered by then.";

    pdfDoc.text(30, 155, LCContentLine4);
    pdfDoc.text(15, 165, LCContentLine5);

    // Closure : Addressing by Author

    var LCAddressingSignOffByAuthor = "Thanks & Regards,";
    pdfDoc.text(135, 190, LCAddressingSignOffByAuthor);
    pdfDoc.text(135, 200, clientRequestWithParamsMap.get("buyer"));

    var generateUniqueTradeId = "TradeId_" + todaysDate.getYear().toString() + todaysDate.getMonth().toString() + todaysDate.getDate().toString() + todaysDate.getHours().toString() + todaysDate.getMinutes().toString() + todaysDate.getSeconds().toString();
    var generateUniqueLCId = "LCId_" + todaysDate.getYear().toString() + todaysDate.getMonth().toString() + todaysDate.getDate().toString() + todaysDate.getHours().toString() + todaysDate.getMinutes().toString() + todaysDate.getSeconds().toString();

    var tradeIdString = "Trade Id : " + generateUniqueTradeId;
    var lcIdString = "LC Id : " + generateUniqueLCId;

    pdfDoc.text(25, 220, tradeIdString);
    pdfDoc.text(25, 230, lcIdString);

    // Generate Data Output for pdfDoc

    var dataOutput = pdfDoc.output();
    return dataOutput;
}

/**
 * 
 * @param {any} successMessage  : Success Message Content
 * @param {any} webClientRequest  : Client Request Name
 * @param {any} http_Response : Http Response thats gets built
 * 
*/

function buildSuccessResponse_ForLCGeneration(successMessage, webClientRequest, http_response) {

    // Build success Response for Record Updation

    var lcGenerationResponseObject = null;

    lcGenerationResponseObject = { Request: webClientRequest, Status: successMessage };
    var lcGenerationResponse = JSON.stringify(lcGenerationResponseObject);

    http_response.writeHead(200, { 'Content-Type': 'application/json' });
    http_response.end(lcGenerationResponse);
}


