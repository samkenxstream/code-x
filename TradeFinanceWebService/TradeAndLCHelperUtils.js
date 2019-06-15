
'use strict';

/*************************************************************************
 * 
 * Globals : Module that handles Helper Utils for TradeAndLC DB
 * 
 *************************************************************************/

// Generic Variables Global

var bDebug = false;

/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * Module to handle => Helper Util Functions for TradeAndLC DB
 * 
 **************************************************************************
 **************************************************************************
 */

var HelperUtilsModule = require('./HelperUtils');

/**
 * 
 * @param {any} dbConnection  : Connection to database
 * @param {any} tradeAndLcTable_Name  : Name of Table ( Collection )
 * @param {any} clientRequestWithParamsMap : Map of <K,V> Pairs ( Record ) used to generate LC
 * @param {any} http_response: Http Response to be built based on CertificateOfOrigin Generation and Upload to file Server
 * @param {any} statusToBeChecked : Status of Trade to be checked against
 * @param { any } handleStatusCheckResponseForPDFDocGeneration: Callback function after successful status validation
 *
*/


exports.checkCurrentStatusAndReturnCallback = function (dbConnection,
    tradeAndLcTable_Name,
    clientRequestWithParamsMap,
    http_response,
    statusToBeChecked,
    handleSuccessResponseForPDFDocGeneration) {

    // Check the Current Status to be "Trade_Shipped" Before placing "Certificate Of Origin" Generation

    var query_Object = new Object();

    var tradeId = clientRequestWithParamsMap.get("taId");
    console.log("TradeAndLCHelperUtils.checkCurrentStatusAndReturnCallback : Check the current Status to be " + statusToBeChecked +
        " before generating COO : ");

    // Build Query Based on input <k,v> pairs

    if (tradeId != null && tradeId != undefined) {

        query_Object.Trade_Id = tradeId;
    }

    // Find Record & Check Current Status

    console.log("TradeAndLCHelperUtils.checkCurrentStatusAndReturnCallback : " + tradeAndLcTable_Name + ", Trade_Id : " + tradeId);

    if (Object.keys(query_Object).length < 1) {

        var failureMessage = "Wrong Query/missing input query data : Couldn't find Record => " + " Trade_Id : " + tradeId;
        HelperUtilsModule.buildErrorResponse_Generic( clientRequestWithParamsMap.get("Client_Request"), failureMessage,
                                                      404, http_response);

        return;
    }

    // Query For the Existing Status and Validate the Appropriateness in Status Transition

    console.log("TradeAndLCHelperUtils.checkCurrentStatusAndReturnCallback => Checking the current status of Record for valid state Transition : ");

    dbConnection.collection(tradeAndLcTable_Name).findOne(query_Object, function (err, result) {

        if (err) {

            console.error("TradeAndLCHelperUtils.checkCurrentStatusAndReturnCallback : Error while checking the current status of Record");

            var failureMessage = "TradeAndLCHelperUtils.checkCurrentStatusAndReturnCallback : Error while checking the current status of Record";
            HelperUtilsModule.logInternalServerError("checkCurrentStatusAndReturnCallback", failureMessage, http_response);

            return;
        }

        var recordPresent = (result) ? "true" : "false";
        if (recordPresent == "false") {

            // Record Not Found : So Status Cann't be Verified : Return Error

            console.error("TradeAndLCHelperUtils.checkCurrentStatusAndReturnCallback : Record in Query not found");

            var failureMessage = "TradeAndLCHelperUtils.checkCurrentStatusAndReturnCallback : Record in Query not found";
            HelperUtilsModule.buildErrorResponse_Generic(clientRequestWithParamsMap.get("Client_Request"), failureMessage,
                404, http_response);

            return;
        }
        else {

            // Record Found : Check the validity of current Status : Should be "Trade_Approved"

            console.log("TradeAndLCHelperUtils.checkCurrentStatusAndReturnCallback : " +
                "Check the validity of current Status : Should be Trade_Approved");

            // Unexpected State Transition 

            if (result.Current_Status != statusToBeChecked) {

                console.error("TradeAndLCHelperUtils.checkCurrentStatusAndReturnCallback : Unexpected Current Status for State Transition => " + result.Current_Status);

                var failureMessage = "TradeAndLCHelperUtils.checkCurrentStatusAndReturnCallback : Unexpected Current Status for State Transition => " + result.Current_Status;
                HelperUtilsModule.buildErrorResponse_Generic(clientRequestWithParamsMap.get("Client_Request"), failureMessage,
                    404, http_response);

                return;
            }

            // Expected State Transition : return call back function

            else {

                return handleSuccessResponseForPDFDocGeneration(clientRequestWithParamsMap, http_response);
            }

        }

    });

}


