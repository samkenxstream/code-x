
'use strict';

/*************************************************************************
 * 
 * Globals : Module Imports & Mongo DB Connection Variables
 * 
 *************************************************************************/

// Generic Variables Global

var bDebug = false;

var HelperUtilsModule = require('./HelperUtils');

/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * Module to handle => Direct CRUD Operations with MongoDB.
 * 
 **************************************************************************
 **************************************************************************
 */

/**
 * 
 * @param {any} dbConnection  : Connection to database 
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any} document_Object : Document object to be added ( Record, Row in Table )
 * 
 */

exports.directAdditionOfRecordToDatabase = function (dbConnection, collectionName, document_Object) {

    // Record Addition

    dbConnection.collection(collectionName).insertOne(document_Object, function (err, result) {

        if (err) {
            console.log("Error while adding the Record to Database collection => " + collectionName);
            throw err;
        }
        console.log("Successfully added the record to the Collection : " + collectionName);
        console.log(result);

    });
}

/**
 * 
 * @param {any} dbConnection  : Connection to database 
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any} document_Object : Document object to be updated ( Record, Row in Table )
 * 
 */

exports.directUpdationOfRecordToDatabase = function (dbConnection, collectionName, document_Object, query) {

    // Record Updation

    console.log("Added Query to Update operation : ");

    var newUpdateObject = { $set: document_Object };
    var udpateSert = {upsert: true};
    dbConnection.collection(collectionName).updateOne(query, newUpdateObject, udpateSert, function (err, result) {

        if (err) {
            console.log("Error while updating the Record to tradeAndLc Database collection");
            throw err;
        }
        console.log("Successfully updated the record in the Trade and LC Table : " + document_Object.Trade_Id);
        console.log(result);

    });
}

/**
 * 
 * @param {any} dbConnection  : Connection to database 
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any[Optional]} Lc_Id : query Key => Letter of Credit Id
 * @param {any[Optional]} Trade_Id : query Key => Trade Id
 *
 */

exports.removeRecordFromTradeAndLcDatabase = function (dbConnection, collectionName, Trade_Identifier, Lc_Identifier) {

    var query = null;

    console.log("removeRecordFromTradeAndLcDatabase => collectionName :" + collectionName + " Trade_Identifier :" + Trade_Identifier + " Lc_Identifier :" + Lc_Identifier);

    if (Trade_Identifier != null) {

        query = { Trade_Id: Trade_Identifier };
    }
    else if (Lc_Identifier != null) {

        query = { Lc_Id: Lc_Identifier };
    } else {

        return;
    }

    // Record Deletion

    dbConnection.collection(collectionName).deleteMany(query, function (err, result) {

        if (err) {
            console.log("Error while deleting the Record from tradeAndLc Database collection");
            throw err;
        }
        console.log("Successfully deleted the record from the TradeAndLC Table : ");
        console.log(result);

    });

}

/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * Trade and LC record Query & Response Building
 * 
 **************************************************************************
 **************************************************************************
 */

/**
 * 
 * @param {any} dbConnection  : Connection to database 
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any[Optional]} Lc_Id : query Key => Letter of Credit Id
 * @param {any[Optional]} Trade_Id : query Key => Trade Id
 *
 */

exports.retrieveRecordFromTradeAndLcDatabase = function (dbConnection, collectionName, Trade_Identifier, Lc_Identifier, handleQueryResults, http_request, http_response) {

    // Record Retrieval based on "Lc_Id | Trade_Id | *(All Records)"

    var query = null;
    var queryType = "AllRecords";

    console.log("MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase => collectionName :" + collectionName + " Trade_Identifier :" + Trade_Identifier + " Lc_Identifier :" + Lc_Identifier);

    if (Trade_Identifier != null) {

        query = { Trade_Id: Trade_Identifier };
        queryType = "SingleTradeRecord";

    }
    else if (Lc_Identifier != null) {

        query = { Lc_Id: Lc_Identifier };
        queryType = "SingleLcRecord";
    }

    if (query) {

        dbConnection.collection(collectionName).findOne(query, function (err, result) {

            if (err) {

                var failureMessage = "MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase : Internal Server Error while querying the Record from tradeAndLc Database : " + err;
                logInternalServerError("retrieveRecordFromTradeAndLcDatabase", failureMessage, http_response);

                return;
            }

            console.log("retrieveRecordFromTradeAndLcDatabase => Query for single Record => returned Answer : ");
            console.log(result);

            if (result == null || result == undefined) {

                var failureMessage = "MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase : Null Records returned for TradeAndLC Record query => Trade_Id: " + Trade_Identifier + ", LC_Id: " + Lc_Identifier;
                logBadHttpRequestError("retrieveRecordFromTradeAndLcDatabase", failureMessage, http_response);

                return;
            }

            return handleQueryResults(null, result, http_request, http_response, queryType);
        });

    } else {

        dbConnection.collection(collectionName).find({}).toArray( function (err, result) {

            if (err) {

                var failureMessage = "MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase : Internal Server Error while querying for all the Records from tradeAndLc Database : " + err;
                logInternalServerError("retrieveRecordFromTradeAndLcDatabase", failureMessage, http_response);

                return;
            }

            console.log("MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase : Successfully retrieved all the records => ");
            console.log(result);

            if (result == null || result == undefined) {

                var failureMessage = "MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase : Null Records returned for TradeAndLC Record query For All Records";
                logBadHttpRequestError("retrieveRecordFromTradeAndLcDatabase", failureMessage, http_response);

                return;
            }

            return handleQueryResults(null, result, http_request, http_response, queryType);
        });
    }
}

/**
 * 
 * @param {any} clientRequest  : Web Client Request
 * @param {any} failureMessage  : Failure Message Error Content
 * @param {any} http_Response : Http Response thats gets built
 * 
*/

function logInternalServerError(clientRequest, failureMessage, http_Response) {

    console.error(failureMessage);

    var http_StatusCode = 500;
    HelperUtilsModule.buildErrorResponse_Generic(clientRequest, failureMessage, http_StatusCode, http_Response);
}

/**
 * 
 * @param {any} clientRequest  : Web Client Request
 * @param {any} failureMessage  : Failure Message Error Content
 * @param {any} http_Response : Http Response thats gets built
 * 
*/

function logBadHttpRequestError(clientRequest, failureMessage, http_Response) {

    console.error(failureMessage);

    var http_StatusCode = 400;
    HelperUtilsModule.buildErrorResponse_Generic(clientRequest, failureMessage, http_StatusCode, http_Response);
}

