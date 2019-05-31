
'use strict';

/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * All CRUD Operations of Trade And LC Records
 * 
 **************************************************************************
 **************************************************************************
 */


/*************************************************************************
 * 
 * Globals : Trade And LC Objects
 * 
*************************************************************************/

var trade_Object = {
    Trade_Id: "",
    Buyer: "",
    Seller: "",
    Shipment: "",
    ShipmentCount: "",
    Amount: "",
    Current_Status: "",
    UserName: ""
};

var lc_Object = {
    Trade_Id: "",
    Lc_Id: "",
    Buyer: "",
    Seller: "",
    Seller_Id: "",
    Bank: "",
    Shipment: "",
    ShipmentCount: "",
    Amount: "",
    Expiry_Date: "",
    Request_Location: "",
    Current_Status: "",
    UserName: ""
};

var bDebug = false;

var HelperUtilsModule = require('./HelperUtils');
var mongoDbCrudModule = require('./MongoDbCRUD');

/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * Trade and LC record : CRUD operation Wrappers Module
 *                       DB Specific User Input/Output processing
 * 
 **************************************************************************
 **************************************************************************
 */


/**
 * 
 * @param {any} recordObjectMap  : Map of <K,V> Pairs from Client Request ( Trade Record )
 * 
 */

function prepareTradeDocumentObject(recordObjectMap) {

    // Replace the "URL Space" with regular space in Record Object Map Values

    recordObjectMap = HelperUtilsModule.removeUrlSpacesFromMapValues(recordObjectMap);

    // Remove "Starting & Trailing Spaces" from Record Object Map Values

    recordObjectMap = HelperUtilsModule.removeStartingAndTrailingSpacesFromMapValues(recordObjectMap);

    // Prepare Trade Object for MongoDB consumption

    trade_Object._id = recordObjectMap.get("Trade_Id");
    trade_Object.Trade_Id = recordObjectMap.get("Trade_Id");
    trade_Object.Buyer = recordObjectMap.get("Buyer");
    trade_Object.Seller = recordObjectMap.get("Seller");
    trade_Object.Shipment = recordObjectMap.get("Shipment");
    trade_Object.ShipmentCount = recordObjectMap.get("ShipmentCount");
    trade_Object.Amount = recordObjectMap.get("Amount");

    if ( recordObjectMap.get("UserName") != null && recordObjectMap.get("UserName") != undefined ) {

        trade_Object.UserName = recordObjectMap.get("UserName");
    }

    trade_Object.Current_Status = "Trade_Requested";
}

/**
 * 
 * @param {any} recordObjectMap  : Map of <K,V> Pairs from Client Request ( LC Record )
 * 
 */

function prepareLcDocumentObject(recordObjectMap) {

    // Replace the "URL Space" with regular space in Record Object Map Values

    recordObjectMap = HelperUtilsModule.removeUrlSpacesFromMapValues(recordObjectMap);

    // Remove "Starting & Trailing Spaces" from Record Object Map Values

    recordObjectMap = HelperUtilsModule.removeStartingAndTrailingSpacesFromMapValues(recordObjectMap);

    // Prepare LC Object for MongoDB consumption

    // Same Record gets modified after Trade Creation ( _id shouldn't be changed )

    lc_Object.Trade_Id = recordObjectMap.get("Trade_Id");
    lc_Object.Lc_Id = recordObjectMap.get("Lc_Id");
    lc_Object.Buyer = recordObjectMap.get("Buyer");
    lc_Object.Seller = recordObjectMap.get("Seller");
    lc_Object.Seller_Id = recordObjectMap.get("Seller_Id");
    lc_Object.Bank = recordObjectMap.get("Bank");
    lc_Object.Shipment = recordObjectMap.get("Shipment");
    lc_Object.ShipmentCount = recordObjectMap.get("ShipmentCount");
    lc_Object.Amount = recordObjectMap.get("Amount");
    lc_Object.Expiry_Date = recordObjectMap.get("Expiry_Date");
    lc_Object.Request_Location = recordObjectMap.get("Request_Location");

    if (recordObjectMap.get("UserName") != null && recordObjectMap.get("UserName") != undefined) {

        lc_Object.UserName = recordObjectMap.get("UserName");
    }

    lc_Object.Current_Status = "LC_Requested";
}


/**
 * 
 * @param {any} dbConnection  : Connection to database
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any} recordObjectMap : Map of <K,V> Pairs ( Record ), to be added to Shipment Database : Trade And LC Table
 * @param {any} requiredDetailsCollection : required keys for record addition ( Trade & LC )
 * @param {any} bLcRequest : "LC Request" R "Trade Request" ? 
 * 
 */

exports.addTradeAndLcRecordToDatabase = function (dbConnection, collectionName, recordObjectMap, requiredDetailsCollection,
    bLcRequest, http_response) {

    // Check if all the required fields are present before adding the record

    for (var i = 0; i < requiredDetailsCollection.length; i++) {

        var currentKey = requiredDetailsCollection[i];

        if (recordObjectMap.get(currentKey) == null) {

            console.error("TradeAndLCRecordUpdates.addTradeAndLcRecordToDatabase : Value corresponding to required Key doesn't exist => Required Key : " + currentKey);

            var failureMessage = "TradeAndLCRecordUpdates.addTradeAndLcRecordToDatabase : Value corresponding to required Key doesn't exist => Required Key : " + currentKey;
            HelperUtilsModule.logBadHttpRequestError("addTradeAndLcRecordToDatabase", failureMessage, http_response);

            return;
        }
    }

    // Prepare Trade | LC Document Objects and add them to Shipment Database

    if (!bLcRequest) {

        prepareTradeDocumentObject(recordObjectMap);

        console.log("addTradeAndLcRecordToDatabase : All <K,V> pairs are present, Adding Trade Record of Num Of Pairs => " + trade_Object.length);

        // Remove spaces from trade_object values before adding to MongoDB

        trade_Object = HelperUtilsModule.removeUrlSpacesFromObjectValues(trade_Object);
        addRecordToTradeAndLcDatabase(dbConnection,
            collectionName,
            trade_Object,
            "RequestTrade",
            http_response);

    } else {

        // Check the Current Status to be "Trade_Approved" Before placing LC_Request

        var query_Object = new Object();

        var tradeId = recordObjectMap.get("Trade_Id");
        console.log("TradeAndLCRecordUpdates.addTradeAndLcRecordToDatabase : Check the current Status to be " +
            "Trade_Approved before placing LC request : ");

        // Build Query Based on input <k,v> pairs

        if (tradeId != null && tradeId != undefined) {

            query_Object.Trade_Id = tradeId;
        }

        // Find Record & Check Current Status

        console.log("TradeAndLCRecordUpdates.addTradeAndLcRecordToDatabase : " + collectionName + ", Trade_Id : " + tradeId);

        if (Object.keys(query_Object).length < 1) {

            var failureMessage = "Wrong Query/missing input query data : Couldn't find Record => " + " Trade_Id : " + tradeId;
            buildErrorResponse_ForRecordUpdation(failureMessage, "RequestLC", http_response);

            return;
        }

        // Query For the Existing Status and Validate the Appropriateness in Status Transition : Should be "Trade_Approved"

        console.log("TradeAndLCRecordUpdates.addTradeAndLcRecordToDatabase => Checking the current status of Record for valid state Transition : ");

        dbConnection.collection(collectionName).findOne(query_Object, function (err, result) {

            if (err) {

                console.error("TradeAndLCRecordUpdates.addTradeAndLcRecordToDatabase : Error while checking the current status of Record");

                var failureMessage = "TradeAndLCRecordUpdates.addTradeAndLcRecordToDatabase : Error while checking the current status of Record";
                HelperUtilsModule.logInternalServerError("addTradeAndLcRecordToDatabase", failureMessage, http_response);

                return;
            }

            var recordPresent = (result) ? "true" : "false";
            if (recordPresent == "false") {

                // Record Not Found : So Status Cann't be updated : Return Error

                console.error("TradeAndLCRecordUpdates.addTradeAndLcRecordToDatabase : Record in Query not found");

                var failureMessage = "TradeAndLCRecordUpdates.addTradeAndLcRecordToDatabase : Record in Query not found";
                HelperUtilsModule.logBadHttpRequestError("addTradeAndLcRecordToDatabase", failureMessage, http_response);

                return;
            }
            else {

                // Record Found : Check the validity of current Status : Should be "Trade_Approved"

                console.log("TradeAndLCRecordUpdates.addTradeAndLcRecordToDatabase : " +
                    "Check the validity of current Status : Should be Trade_Approved");

                // Unexpected State Transition 

                if (result.Current_Status != "Trade_Approved") {

                    console.error("TradeAndLCRecordUpdates.addTradeAndLcRecordToDatabase : Unexpected Current Status for State Transition => " + result.Current_Status);

                    var failureMessage = "TradeAndLCRecordUpdates.addTradeAndLcRecordToDatabase : Unexpected Current Status for State Transition => " + result.Current_Status;
                    HelperUtilsModule.logBadHttpRequestError("addTradeAndLcRecordToDatabase", failureMessage, http_response);

                    return;
                }

                // Expected State Transition : Update the status of Record

                else {

                    prepareLcDocumentObject(recordObjectMap);

                    console.log("addTradeAndLcRecordToDatabase : All <K,V> pairs are present, Adding LC Record of Num Of Pairs => " + lc_Object.length);

                    // Remove spaces from lc_Object values before adding to MongoDB

                    lc_Object = HelperUtilsModule.removeUrlSpacesFromObjectValues(lc_Object);
                    addRecordToTradeAndLcDatabase(dbConnection,
                        collectionName,
                        lc_Object,
                        "RequestLC",
                        http_response);
                }

            }

        });

    }

}


/**
 * 
 * @param {any} dbConnection  : Connection to database 
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any} document_Object : Document object to be added ( Record, Row in Table )
 * 
 */

function addRecordToTradeAndLcDatabase(dbConnection, collectionName, document_Object, clientRequest, http_response) {

    // Update if Present ; Add Otherwise

    var query = null;

    console.log("addRecordToTradeAndLcDatabase => collectionName :" + collectionName + " Trade_Identifier :" + document_Object.Trade_Id + " Lc_Identifier :" + document_Object.Lc_Id);

    if (document_Object.Trade_Id != null) {

        query = { Trade_Id: document_Object.Trade_Id };
    }
    else if (document_Object.Lc_Id != null) {

        query = { Lc_Id: document_Object.Lc_Id };
    }

    if (query) {

        dbConnection.collection(collectionName).findOne(query, function (err, result) {

            if (err) {

                console.error("TradeAndLCRecordUpdates.addRecordToTradeAndLcDatabase : Internal Server Error while querying for record to be inserted");

                var failureMessage = "TradeAndLCRecordUpdates.addRecordToTradeAndLcDatabase : Internal Server Error while querying for record to be inserted";
                HelperUtilsModule.logInternalServerError("addTradeAndLcRecordToDatabase", failureMessage, http_response);

                return;
            }

            var recordPresent = (result) ? "true" : "false";
            if (recordPresent == "false") {

                // Record Addition

                console.log("Record Not Found, Adding New Record => " + " Trade Id : " + document_Object.Trade_Id + " LC Id : " + document_Object.Lc_Id);
                mongoDbCrudModule.directAdditionOfRecordToDatabase(dbConnection, collectionName, document_Object, clientRequest, http_response);
            }
            else {

                // Record Updation

                console.log("Record Found, Updating the existing Record => " + " Trade Id : " + document_Object.Trade_Id + " LC Id : " + document_Object.Lc_Id);
                mongoDbCrudModule.directUpdationOfRecordToDatabase(dbConnection, collectionName, document_Object, query, clientRequest, http_response);
            }

        });

    } else {

        // Record Addition

        console.log("Both Trade_Id and Lc_Id are null in input Object, Adding New Record without primary keys");
        mongoDbCrudModule.directAdditionOfRecordToDatabase(dbConnection, collectionName, document_Object, clientRequest, http_response);
    }

}


/**
 * 
 * @param {any} dbConnection  : Connection to database 
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any} clientRequestWithParamsMap : input Map consisting of Query Details ( "Trade_Id, Lc_Id" )
 * @param {any} statusToBeUpdated : status of the Record to be update
 * @param {any} http_response : Http Response to be built based on the record updation
 * 
 */

exports.updateRecordStatusInTradeAndLcDatabase = function (dbConnection, collectionName, clientRequestWithParamsMap, webClientRequest, statusToBeUpdated, http_response) {

    // Replace the "URL Space" with regular space in Query Object Map Values

    clientRequestWithParamsMap = HelperUtilsModule.removeUrlSpacesFromMapValues(clientRequestWithParamsMap);

    // Extract input Query Values

    var query_Object = new Object();

    var tradeId = clientRequestWithParamsMap.get("Trade_Id");
    var lcId = clientRequestWithParamsMap.get("Lc_Id");
    var userName = clientRequestWithParamsMap.get("UserName");
    var sellerName = clientRequestWithParamsMap.get("Seller");
    var bankName = clientRequestWithParamsMap.get("Bank");

    // Parameter List String Building

    var paramList = "<=> Param List <=> " + "Trade_Id: " + tradeId + ", Lc_Id: " + lcId +
        ", UserName: " + userName + ", Seller: " + sellerName + ", Bank: " + bankName;

    console.log("updateRecordStatusInTradeAndLcDatabase : Updating the status : " + statusToBeUpdated + paramList);

    // Build Query Based on input <k,v> pairs

    if (tradeId != null && tradeId != undefined) {

        query_Object.Trade_Id = tradeId;
    }

    if (lcId != null && lcId != undefined) {

        query_Object.Lc_Id = lcId;
    }

    if (userName != null && userName != undefined) {

        query_Object.UserName = userName;
    }

    if (sellerName != null && sellerName != undefined) {

        query_Object.Seller = sellerName;
    }

    if (bankName != null && bankName != undefined) {

        query_Object.Bank = bankName;
    }

    // Check to make sure the presence of atleast one query

    var queryKeys = Object.keys(query_Object);

    if (queryKeys.length == 0 || statusToBeUpdated == null || statusToBeUpdated == undefined) {

        console.error("TradeAndLCRecordUpdates.updateRecordStatusInTradeAndLcDatabase : "
            + "Atleast one query parameter and Current_Status should be present to change Record Status");

        var failureMessage = "TradeAndLCRecordUpdates.updateRecordStatusInTradeAndLcDatabase : " +
            "Atleast one query parameter and Current_Status should be present to change Record Status";
        HelperUtilsModule.logBadHttpRequestError("addTradeAndLcRecordToDatabase", failureMessage, http_response);

        return;
    }

    // Status to be updated

    var document_Object = {
        $set: { Current_Status: statusToBeUpdated }
    };

    // CRUD Operations to Mongo DB

    updateStatusOfRecordInTradeAndLcDatabase(dbConnection,
        collectionName,
        query_Object,
        document_Object,
        statusToBeUpdated,
        webClientRequest,
        http_response);

    console.log("Web Service: Switch Statement : Successfully launched the update Record with status : " + statusToBeUpdated + paramList);
}

/**
 * 
 * Status Transition :    Trade_Requested => Trade_Approved => LC_Requested => LC_Generated => LC_Approved
 *                        => Trade_Shipped => Shipment_Accepted => Payment_Requested => Payment_Made.
 *
*/

function checkValidityOfShipmentStatusTransition(statusToBeUpdated, currentStatus) {

    var expectedPreviousStatusMap = new Map();

    expectedPreviousStatusMap.set("Trade_Requested", null);
    expectedPreviousStatusMap.set("Trade_Approved", "Trade_Requested");
    expectedPreviousStatusMap.set("Trade_Rejected", "Trade_Requested");
    expectedPreviousStatusMap.set("LC_Requested", null);
    expectedPreviousStatusMap.set("LC_Generated", null);
    expectedPreviousStatusMap.set("LC_Approved", "LC_Generated");
    expectedPreviousStatusMap.set("Trade_Shipped", "LC_Approved");
    expectedPreviousStatusMap.set("Shipment_Accepted", "Trade_Shipped");
    expectedPreviousStatusMap.set("Payment_Requested", "Shipment_Accepted");
    expectedPreviousStatusMap.set("Payment_Made", "Payment_Requested");

    if (expectedPreviousStatusMap.get(statusToBeUpdated) == currentStatus || expectedPreviousStatusMap.get(statusToBeUpdated) == null) {

        return true;
    } 

    return false;
}

/**
 * 
 * @param {any} dbConnection  : Connection to database 
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any} query_Object : Query object to retrieve the corresponding Record ( Record, Row in Table )
 * @param {any} document_Object : Document object that needs to be updated ( Record, Row in Table )
 * @param {any} statusToBeUpdated : Status of Record to be updated
 * @param {any} webClientRequest : Status Change Request Name
 * @param {any} http_response : http Response to be built based on the result
 *
 */

function updateStatusOfRecordInTradeAndLcDatabase(dbConnection, collectionName, query_Object, document_Object,
    statusToBeUpdated, webClientRequest, http_response) {

    // Parameter List String Building

    var paramList = "<=> Param List <=> " + " Trade_Identifier :" + query_Object.Trade_Id + " Lc_Identifier :" + query_Object.Lc_Id +
        ", UserName: " + query_Object.UserName + ", Seller: " + query_Object.Seller + ", BankName: " + query_Object.Bank;

    // Find Record & Update

    console.log("updateStatusOfRecordInTradeAndLcDatabase => collectionName :" + collectionName + paramList);

    if (Object.keys(query_Object).length < 1) {

        var failureMessage = "Wrong Query/missing input query data : Couldn't find Record" + paramList;
        buildErrorResponse_ForRecordUpdation(failureMessage, webClientRequest, http_response);

        return;
    }

    // Query For the Existing Status and Validate the Appropriateness in Status Transition

    // Status Transition :    Trade_Requested => Trade_Approved => LC_Requested => LC_Generated => LC_Approved 
    //                     => Trade_Shipped => Shipment_Accepted => Payment_ Requested => Payment_Made.

    console.log("TradeAndLCRecordUpdates.updateStatusOfRecordInTradeAndLcDatabase => Checking the current status of Record for valid state Transition : ");

    dbConnection.collection(collectionName).findOne(query_Object, function (err, result) {

        if (err) {

            console.error("TradeAndLCRecordUpdates.updateStatusOfRecordInTradeAndLcDatabase : Error while checking the current status of Record");

            var failureMessage = "TradeAndLCRecordUpdates.updateStatusOfRecordInTradeAndLcDatabase : Error while checking the current status of Record";
            HelperUtilsModule.logInternalServerError("updateStatusOfRecordInTradeAndLcDatabase", failureMessage, http_response);

            return;
        }

        var recordPresent = (result) ? "true" : "false";
        if (recordPresent == "false") {

            // Record Not Found : So Status Cann't be updated : Return Error

            console.error("TradeAndLCRecordUpdates.updateStatusOfRecordInTradeAndLcDatabase : Record in Query not found");

            var failureMessage = "TradeAndLCRecordUpdates.updateStatusOfRecordInTradeAndLcDatabase : Record in Query not found";
            HelperUtilsModule.logBadHttpRequestError("updateStatusOfRecordInTradeAndLcDatabase", failureMessage, http_response);

            return;
        }
        else {

            // Record Found : Check the validity of current Status using ExpectedPreviousStatusMap

            console.log("TradeAndLCRecordUpdates.updateStatusOfRecordInTradeAndLcDatabase : " +
                "Check the validity of current Status using ExpectedPreviousStatusMap");

            // Unexpected State Transition 

            if (checkValidityOfShipmentStatusTransition(statusToBeUpdated, result.Current_Status) == false) {

                console.error("TradeAndLCRecordUpdates.updateStatusOfRecordInTradeAndLcDatabase : Unexpected Current Status for State Transition");

                var failureMessage = "TradeAndLCRecordUpdates.updateStatusOfRecordInTradeAndLcDatabase : Unexpected Current Status for State Transition";
                HelperUtilsModule.logBadHttpRequestError("updateStatusOfRecordInTradeAndLcDatabase", failureMessage, http_response);

                return;
            }

            // Expected State Transition : Update the status of Record

            else {

                updateStatusOfRecord(dbConnection, collectionName, query_Object, document_Object, webClientRequest, http_response);
            }

        }

    });

}


/**
    * 
    * @param {any} dbConnection  : Connection to database 
    * @param {any} collectionName  : Name of Table ( Collection )
    * @param {any} query_Object : Query object to retrieve the corresponding Record ( Record, Row in Table )
    * @param {any} document_Object : Document object that needs to be updated ( Record, Row in Table )
    * @param {any} webClientRequest : Status Change Request Name
    * @param {any} http_response : http Response to be built based on the result
    *
*/

function updateStatusOfRecord(  dbConnection, collectionName, query_Object, document_Object,
                                webClientRequest, http_response )
{

    var paramList = "<=> Param List <=> " + " Trade_Identifier :" + query_Object.Trade_Id + " Lc_Identifier :" + query_Object.Lc_Id +
        ", UserName: " + query_Object.UserName + ", Seller: " + query_Object.Seller + ", BankName: " + query_Object.Bank;

    // Update Status of Record in DB

    dbConnection.collection(collectionName).updateOne(query_Object, document_Object, function (err, res) {

        if (err) {

            var failureMessage = "Error while executing the updation on Record" + paramList;
            buildErrorResponse_ForRecordUpdation(failureMessage, webClientRequest, http_response);

            return;
        }

        var recordPresent = (res == null || res == undefined) ? "false" : "true";

        // Invalid Result of CRUD operation : Return Error Response

        if (recordPresent == "false") {

            console.error("Record Not Found => For Query : " + paramList);
            var failureMessage = "Record Updation: Record not found for Query : " + paramList;
            buildErrorResponse_ForRecordUpdation(failureMessage, webClientRequest, http_response);

        } else {

            // Record Not Found : Return Error Response

            console.log("updateStatusOfRecordInTradeAndLcDatabase => result.nModified : " + res.result.nModified +
                ", result.n : " + res.result.n + ", result.ok : " + res.result.ok);

            if (res.result.n == 0) {

                console.error("Record Not Found => For Query : " + paramList);
                var failureMessage = "Record Updation: Record not found for Query : " + paramList;
                buildErrorResponse_ForRecordUpdation(failureMessage, webClientRequest, http_response);

            // Record Updation Successful

            } else {

                if (res.result.nModified == 1) {

                    console.log("Record Found, Updated the Record with latest Status => Query : " + paramList);
                    var successMessage = "Record Found, Updated the Record with latest Status => Query : " + paramList;

                } else {

                    console.log("Record Found, But Status already updated to required state => Query : " + paramList);
                    var successMessage = "Record Found, But Status already updated to required state => Query : " + paramList;

                } 

                buildSuccessResponse_ForRecordUpdation(successMessage, webClientRequest, http_response);
            }

        }

    });

}


/**
 * 
 * @param {any} failureMessage  : Failure Message Error Content
 * @param {any} http_response : Http Response thats gets built
 * 
*/

function buildErrorResponse_ForRecordUpdation(failureMessage, webClientRequest, http_response) {

    // Build error Response for Record Updation

    var recordUpdationResponseObject = null;

    recordUpdationResponseObject = { Request: webClientRequest, Status: failureMessage };
    var recordUpdationResponse = JSON.stringify(recordUpdationResponseObject);

    http_response.writeHead(400, { 'Content-Type': 'application/json' });
    http_response.end(recordUpdationResponse);
}

/**
 * 
 * @param {any} successMessage  : Success Message Content
 * @param {any} http_Response : Http Response thats gets built
 * 
*/

function buildSuccessResponse_ForRecordUpdation(successMessage, webClientRequest, http_response) {

    // Build success Response for Record Updation

    var recordUpdationResponseObject = null;

    recordUpdationResponseObject = { Request: webClientRequest, Status: successMessage };
    var recordUpdationResponse = JSON.stringify(recordUpdationResponseObject);

    http_response.writeHead(200, { 'Content-Type': 'application/json' });
    http_response.end(recordUpdationResponse);
}

/**
 * 
 * @param {any} queryResult : query Result from mongo DB
 * 
 * @returns {any} queryResponse_JSON : Trade Record in JSON format
 * 
 */

function buildTradeRecord_JSON(queryResult) {

    var queryResponse_JSON = new Object();

    queryResult = HelperUtilsModule.removeUrlSpacesFromObjectValues(queryResult);

    queryResponse_JSON.Trade_Id = queryResult.Trade_Id;
    queryResponse_JSON.Buyer = queryResult.Buyer;
    queryResponse_JSON.Seller = queryResult.Seller;
    queryResponse_JSON.Shipment = queryResult.Shipment;
    queryResponse_JSON.ShipmentCount = queryResult.ShipmentCount;
    queryResponse_JSON.Amount = queryResult.Amount;
    queryResponse_JSON.Current_Status = queryResult.Current_Status;

    if (queryResult.UserName != null && queryResult.UserName != undefined) {

        queryResponse_JSON.UserName = queryResult.UserName;
    }

    return queryResponse_JSON;
}


/**
 * 
 * @param {any} queryResult : query Result from mongo DB
 * 
 * @returns {any} queryResponse_JSON : LC Record in JSON format
 * 
*/

function buildLcRecord_JSON(queryResult) {

    var queryResponse_JSON = new Object();

    queryResult = HelperUtilsModule.removeUrlSpacesFromObjectValues(queryResult);

    queryResponse_JSON.Trade_Id = queryResult.Trade_Id;
    queryResponse_JSON.Lc_Id = queryResult.Lc_Id;
    queryResponse_JSON.Buyer = queryResult.Buyer;
    queryResponse_JSON.Seller = queryResult.Seller;
    queryResponse_JSON.Seller_Id = queryResult.Seller_Id;
    queryResponse_JSON.Bank = queryResult.Bank;
    queryResponse_JSON.Shipment = queryResult.Shipment;
    queryResponse_JSON.Amount = queryResult.Amount;
    queryResponse_JSON.ShipmentCount = queryResult.ShipmentCount;
    queryResponse_JSON.Current_Status = queryResult.Current_Status;
    queryResponse_JSON.Expiry_Date = queryResult.Expiry_Date;
    queryResponse_JSON.Request_Location = queryResult.Request_Location;

    if (queryResult.UserName != null && queryResult.UserName != undefined) {

        queryResponse_JSON.UserName = queryResult.UserName;
    }

    return queryResponse_JSON;
}


/**
 * 
 * @param {any} err  : Error returned to callback function
 * @param {any} result  : Database Query Result ( List of Records : 1 - n )
 * @param       req  : Web Client Request
 * @param       res  : Reponse To be built
 * @param {any} queryType  : Type of Query Result ( SingleTradeRecord, SingleLcRecord, AllRecords ) to be processed
 *
 */

exports.handleQueryResults = function (err, queryResult, req, res, queryType) {

    if (err) {

        console.error("TradeAndLCRecordUpdates.handleQueryResults : Internal Server during record retrieval query execution");

        var failureMessage = "TradeAndLCRecordUpdates.handleQueryResults : Internal Server during record retrieval query execution";
        HelperUtilsModule.logInternalServerError("handleQueryResults", failureMessage, http_Response);

        return;
    }

    console.log("Callback Function (handleQueryResults) : Successfully retrieved the records through function (mongoDbCrudModule.retrieveRecordFromTradeAndLcDatabase) => ");
    console.log(queryResult);

    var queryResponse_JSON_String = buildQueryResponse_JSON(queryResult, queryType);

    // Build Success Response with Query Results

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(queryResponse_JSON_String);

    console.log("handleQueryResults: Written Success response for input query : " + queryResponse_JSON_String);
}


/**
 * 
 * @param {any} queryResult  : query Response received from Mongo DB
 * @param {any} queryType  : query Type for which JSON Response has to be built
 *
 */

function buildQueryResponse_JSON(queryResult, queryType) {

    var queryResponse_JSON = null;

    if (queryType == "SingleTradeRecord") {

        return JSON.stringify(buildTradeRecord_JSON(queryResult));

    } else if (queryType == "SingleLcRecord") {

        return JSON.stringify(buildLcRecord_JSON(queryResult));

    } else if (queryType == "TradeDetailsBasedOnUser") {

        var queryResponse_TradeRecords_JSON_String = "";

        for (var i = 0; i < queryResult.length; i++) {

            if (queryResult[i].Lc_Id == null || queryResult[i].Lc_Id == undefined) {

                queryResponse_TradeRecords_JSON_String += JSON.stringify(buildTradeRecord_JSON(queryResult[i]));
                queryResponse_TradeRecords_JSON_String += "\n";
            }

        }

        return queryResponse_TradeRecords_JSON_String;

    } else if (queryType == "LCDetailsBasedOnUser") {

        var queryResponse_LCRecords_JSON_String = "";

        for (var i = 0; i < queryResult.length; i++) {

            if (queryResult[i].Lc_Id != null && queryResult[i].Lc_Id != undefined) {

                queryResponse_LCRecords_JSON_String += JSON.stringify(buildLcRecord_JSON(queryResult[i]));
                queryResponse_LCRecords_JSON_String += "\n";

            }
        }

        return queryResponse_LCRecords_JSON_String;

    } else {

        var queryResponse_AllRecords_JSON_String = "";

        for (var i = 0; i < queryResult.length; i++) {

            if (queryResult[i].Lc_Id != null && queryResult[i].Lc_Id != undefined) {

                queryResponse_AllRecords_JSON_String += JSON.stringify(buildLcRecord_JSON(queryResult[i]));
                queryResponse_AllRecords_JSON_String += "\n";

            } else {

                queryResponse_AllRecords_JSON_String += JSON.stringify(buildTradeRecord_JSON(queryResult[i]));
                queryResponse_AllRecords_JSON_String += "\n";
            }

        }

        return queryResponse_AllRecords_JSON_String;
    }

    return queryResponse_JSON;
}

