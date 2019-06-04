
'use strict';

var bDebug = false;

var HelperUtilsModule = require('./HelperUtils');

/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * User Records  : Queries and Response Building
 * 
 **************************************************************************
 **************************************************************************
 */


/**
 * 
 * @param {any} dbConnection  : Connection to database 
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any} UserType : query Key => Type of User for which Records have to be retrieved
 * @param {any} handleUserDatabaseQueryResults : Response Building Callback function based on Query Results
 * @param {any} http_Response : Http Response to be built based on Results
 *
 */

exports.retrieveUserDetails = function (dbConnection, collectionName, queryMap, handleUserDatabaseQueryResults, http_Response) {

    var http_StatuCode;

    console.log("retrieveUserDetails => collectionName :" + collectionName + ", Number of User based Queries:" + queryMap.keys().length);

    // Pre Validations

    if (queryMap == null || queryMap == undefined || queryMap.length == 0 ) {

        console.error("retrieveUserDetails : Invalid Query Map Input");
        var failureMessage = "retrieveUserDetails : Invalid input Query Map";

        http_StatuCode = 400;
        buildErrorResponse_Generic("RetrieveUserDetails", failureMessage, http_StatuCode, http_Response);
    }

    // build query object based on input Query Map

    var queryKeys = queryMap.keys();
    var queryObject = new Object();

    for (var currentKey of queryKeys) {

        queryObject[currentKey] = queryMap.get(currentKey);
    }

    // query the db & build Response

    dbConnection.collection(collectionName).find(queryObject).toArray(function (err, result) {

        if (err) {

            console.error("retrieveUserDetails : Internal Server Error while querying for User Records");
            var failureMessage = "retrieveUserDetails : Internal Server Error while querying for User Records";

            http_StatuCode = 500;
            buildErrorResponse_Generic("RetrieveUserDetails", failureMessage, http_StatuCode, http_Response);

            return;
        }

        console.log("retrieveUserDetails : Successfully retrieved all the user records based on input QueryMap");

        if (result == null || result == undefined) {

            console.error("retrieveUserDetails : Null Result returned while querying user Records");
            var failureMessage = "retrieveUserDetails : Null Result returned while querying user Records";

            http_StatusCode = 404;
            buildErrorResponse_Generic("RetrieveUserDetails", failureMessage, http_StatusCode, http_Response);

            return;
        }

        console.log(result);

        return handleUserDatabaseQueryResults(result, http_Response);

    });
}


/**
 * 
 * @param {any} clientRequest  : Web Client Request
 * @param {any} failureMessage  : Failure Message Error Content
 * @param {any} http_StatusCode : Http Status code based on type of Error
 * @param {any} http_Response : Http Response thats gets built
 * 
*/

function buildErrorResponse_Generic(clientRequest, failureMessage, http_StatusCode, http_Response) {

    // build Error Response and attach it to Http_Response

    var responseObject = null;

    responseObject = { Request: clientRequest, Status: failureMessage };
    var builtResponse = JSON.stringify(responseObject);

    http_Response.writeHead(http_StatusCode, { 'Content-Type': 'application/json' });
    http_Response.end(builtResponse);
}

/**
 * 
 * @param {any} result  : Database Query Result ( List of Records : 1 - n )
 * @param       http_Response  : Reponse To be built
 *
 */

exports.handleUserDatabaseQueryResults = function (queryResult, http_Response) {

    console.log("Callback Function (handleUserDatabaseQueryResults) : Successfully retrieved the records through function (retrieveUserDetails) => ");
    console.log(queryResult);

    var queryResponse_JSON_String = buildUserDBQueryResponse_JSON(queryResult);

    http_Response.writeHead(200, { 'Content-Type': 'application/json' });
    http_Response.end(queryResponse_JSON_String);
}


/**
 * 
 * @param {any} queryResult  : query Response received from Mongo DB ( User & Auth DB )
 *
 */

function buildUserDBQueryResponse_JSON( queryResult ) {

    var queryResponse_AllRecords_JSON_String = "";

    for (var i = 0; i < queryResult.length; i++) {

        queryResponse_AllRecords_JSON_String += JSON.stringify(buildUserDBRecord_JSON(queryResult[i]));
        queryResponse_AllRecords_JSON_String += "\n";
    }

    return queryResponse_AllRecords_JSON_String;
}

/**
 * 
 * @param {any} queryResult : query Result from mongo DB ( User Registration & Auth DB )
 * 
 * @returns {any} queryResponse_JSON : User DB Record in JSON format
 * 
 */

function buildUserDBRecord_JSON(queryResult) {

    var queryResponse_JSON = null;

    queryResult = HelperUtilsModule.removeUrlSpacesFromObjectValues(queryResult);

    queryResponse_JSON = {
        "UserType": queryResult.UserType, "Name": queryResult.Name, "Shipment": queryResult.Shipment,
        "AffiliatedBank": queryResult.AffiliatedBank, "Location": queryResult.Location, "Email": queryResult.Email,
        "Address": queryResult.Address, "UserName": queryResult.UserName, "Password": queryResult.Password
    };

    return queryResponse_JSON;
}

