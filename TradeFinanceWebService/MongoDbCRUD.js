
'use strict';

/*************************************************************************
 * 
 * Globals : Module Imports & Mongo DB Connection Variables
 * 
 *************************************************************************/

// Generic Variables Global

var bDebug = true;

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

exports.directAdditionOfRecordToDatabase = function (dbConnection, collectionName, document_Object, clientRequest, http_response) {

    // Record Addition

    dbConnection.collection(collectionName).insertOne(document_Object, function (err, result) {

        if (err) {
            console.error("MongoDbCRUD.directAdditionOfRecordToDatabase : Error while adding the Record to Database collection => " + collectionName);

            var failureMessage = "MongoDbCRUD.directAdditionOfRecordToDatabase : Internal Server Error adding the Record to Database collection => " + collectionName;
            HelperUtilsModule.logInternalServerError("directAdditionOfRecordToDatabase", failureMessage, http_response);

            return;
        }

        console.log("MongoDbCRUD.directAdditionOfRecordToDatabase : Successfully added the record to the Collection : " + collectionName);

        var successMessage = "Successfully added the record to the Collection : " + collectionName;
        HelperUtilsModule.buildSuccessResponse_Generic(successMessage, clientRequest, http_response);

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

exports.directUpdationOfRecordToDatabase = function (dbConnection, collectionName, document_Object, query, clientRequest, http_response) {

    // Record Updation

    console.log("Added Query to Update operation : ");

    var newUpdateObject = { $set: document_Object };
    var udpateSert = {upsert: true};

    dbConnection.collection(collectionName).updateOne(query, newUpdateObject, udpateSert, function (err, result) {

        if (err) {
            console.error("MongoDbCRUD.directUpdationOfRecordToDatabase : Error while updating the Record to Database collection => " + collectionName);

            var failureMessage = "MongoDbCRUD.directUpdationOfRecordToDatabase : Internal Server Error updating the Record to Database collection => " + collectionName;
            HelperUtilsModule.logInternalServerError("directUpdationOfRecordToDatabase", failureMessage, http_response);

            return;
        }

        console.log("MongoDbCRUD.directUpdationOfRecordToDatabase : Successfully updated the record in the Trade and LC Table : " + document_Object.Trade_Id);
        var successMessage = "MongoDbCRUD.directUpdationOfRecordToDatabase : Successfully updated the record to the Collection : " + collectionName;
        HelperUtilsModule.buildSuccessResponse_Generic(successMessage, clientRequest, http_response);

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

exports.removeRecordFromTradeAndLcDatabase = function (dbConnection, collectionName, Trade_Identifier, Lc_Identifier, http_response) {

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

            console.error("MongoDbCRUD.removeRecordFromTradeAndLcDatabase : Error while deleting the Record from tradeAndLc Database collection :" + collectionName);

            var failureMessage = "MongoDbCRUD.removeRecordFromTradeAndLcDatabase : Error while deleting the Record from tradeAndLc Database collection :" + collectionName;
            HelperUtilsModule.logInternalServerError("removeRecordFromTradeAndLcDatabase", failureMessage, http_response);

            return;
        }

        console.log("MongoDbCRUD.removeRecordFromTradeAndLcDatabase : Successfully deleted the record from the TradeAndLC Table : " + Trade_Identifier);
        var successMessage = "MongoDbCRUD.removeRecordFromTradeAndLcDatabase : Successfully deleted the record from the TradeAndLC Table : " + Trade_Identifier;
        HelperUtilsModule.buildSuccessResponse_Generic(successMessage, clientRequest, http_response);

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
 * @param {any[Optional]} Trade_Id : query Key => Trade Id
 * @param {any[Optional]} Lc_Id : query Key => Letter of Credit Id
 * @param {any} handleQueryResults  : Call back function to handle the Query Results
 * @param {any} http_request  : http request passed from web service handler
 * @param {any} http_response : http response to be filled while responding to web client request
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
                HelperUtilsModule.logInternalServerError("retrieveRecordFromTradeAndLcDatabase", failureMessage, http_response);

                return;
            }

            console.log("retrieveRecordFromTradeAndLcDatabase => Query for single Record => returned Answer : ");
            console.log(result);

            if (result == null || result == undefined) {

                var failureMessage = "MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase : Null Records returned for TradeAndLC Record query => Trade_Id: " + Trade_Identifier + ", LC_Id: " + Lc_Identifier;
                HelperUtilsModule.logBadHttpRequestError("retrieveRecordFromTradeAndLcDatabase", failureMessage, http_response);

                return;
            }

            return handleQueryResults(null, result, http_request, http_response, queryType);
        });

    } else {

        dbConnection.collection(collectionName).find({}).toArray( function (err, result) {

            if (err) {

                var failureMessage = "MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase : Internal Server Error while querying for all the Records from tradeAndLc Database : " + err;
                HelperUtilsModule.logInternalServerError("retrieveRecordFromTradeAndLcDatabase", failureMessage, http_response);

                return;
            }

            console.log("MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase : Successfully retrieved all the records => ");
            console.log(result);

            if (result == null || result == undefined) {

                var failureMessage = "MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase : Null Records returned for TradeAndLC Record query For All Records";
                HelperUtilsModule.logBadHttpRequestError("retrieveRecordFromTradeAndLcDatabase", failureMessage, http_response);

                return;
            }

            return handleQueryResults(null, result, http_request, http_response, queryType);
        });
    }
}

/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * Trade and LC "Record Query & Response Building" based on User Name
 * 
 **************************************************************************
 **************************************************************************
 */


/**
 * 
 * @param {any} dbConnection  : Connection to database 
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any} queryObjectMap : Map of <k,v> pairs capturing query information
 * @param {any} handleQueryResults  : Call back function to handle the Query Results
 * @param {any} http_request  : http request passed from web service handler
 * @param {any} http_response : http response to be filled while responding to web client request
 *
*/

exports.retrieveRecordFromTradeAndLcDatabase_BasedOnUser = function (dbConnection, collectionName, queryObjectMap,
    handleQueryResults, queryType, http_request, http_response) {

    // Record Retrieval based on UserName and or "Lc_Id | Trade_Id"

    console.log("MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase_BasedOnUser => collectionName :" + collectionName + ", NumberOfQueryKeys :" + queryObjectMap.length);

    if (queryObjectMap.length == 0) {

        console.error("MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase_BasedOnUser => empty Query Object map. Returning...");

        var failureMessage = "MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase_BasedOnUser => empty Query Object map. Returning..";
        HelperUtilsModule.logBadHttpRequestError("retrieveRecordFromTradeAndLcDatabase_BasedOnUser", failureMessage, http_response);

        return;
    }

    // build Query Object

    var queryObject = new Object();
    var queryKeys = queryObjectMap.keys();

    for (var currentKey of queryKeys) {

        if (bDebug == true) {

            console.log( "MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase_BasedOnUser => Adding <K,V> to query Object => Key : " + currentKey + ", Value : " + queryObjectMap.get(currentKey) );
        }

        queryObject[currentKey] = queryObjectMap.get(currentKey);
    }

    if (bDebug == true) {

        var queryKeys = Object.keys(queryObject);
        console.log("MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase_BasedOnUser => queryObject.length : " + queryKeys.length);

        for (var currentKey of queryKeys) {

            console.log("MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase_BasedOnUser => queryObject.Key : " + currentKey + ", queryObject.Value = " + queryObject[currentKey]);
        }
    }

    // Query And Response Building

    dbConnection.collection(collectionName).find(queryObject).toArray( function (err, result) {

        if (err) {

            var failureMessage = "MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase_BasedOnUser : Internal Server Error while querying the Record from tradeAndLc Database : " + err;
            HelperUtilsModule.logInternalServerError("retrieveRecordFromTradeAndLcDatabase_BasedOnUser", failureMessage, http_response);

            return;
        }

        console.log("retrieveRecordFromTradeAndLcDatabase_BasedOnUser => Query for Records based on User => Returned Answer : ");
        console.log(result);

        if (result == null || result == undefined) {

            var failureMessage = "MongoDbCRUD.retrieveRecordFromTradeAndLcDatabase_BasedOnUser : Null Records returned for TradeAndLC Record query based on UserName";
            HelperUtilsModule.logBadHttpRequestError("retrieveRecordFromTradeAndLcDatabase_BasedOnUser", failureMessage, http_response);

            return;
        }

        return handleQueryResults(null, result, http_request, http_response, queryType);
    });
}

