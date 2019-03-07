
'use strict';

var bDebug = false;


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

exports.retrieveUsers_BasedOnType = function (dbConnection, collectionName, inputUserType, handleUserDatabaseQueryResults, http_Response) {

    var query = null;
    var http_StatuCode;

    console.log("retrieveUsers_BasedOnType => collectionName :" + collectionName + " UserType :" + inputUserType);

    // Pre Validations

    if (inputUserType == null || inputUserType == undefined) {

        console.error("retrieveUsers_BasedOnType : Invalid UserType Entered");
        var failureMessage = "retrieveUsers_BasedOnType : Invalid UserType Entered";

        http_StatuCode = 400;
        buildErrorResponse_Generic("RetrieveUsersBasedOnType", failureMessage, http_StatuCode, http_Response);
    }

    // Query And Response Building

    query = { UserType: inputUserType };

    dbConnection.collection(collectionName).find(query).toArray(function (err, result) {

        if (err) {

            console.error("retrieveUsers_BasedOnType : Internal Server Error while querying for User Records");
            var failureMessage = "retrieveUsers_BasedOnType : Internal Server Error while querying for User Records";

            http_StatuCode = 500;
            buildErrorResponse_Generic("RetrieveUsersBasedOnType", failureMessage, http_StatuCode, http_Response);
        }

        console.log("retrieveUsers_BasedOnType : Successfully retrieved all the user records based on input UserType");
        console.log(result);

        return handleUserDatabaseQueryResults(result, http_Response, inputUserType);

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
 * @param {any} queryInput  : query input value ( UserType Value )
 *
 */

exports.handleUserDatabaseQueryResults = function (queryResult, http_Response, queryInput) {

    console.log("Callback Function (handleUserDatabaseQueryResults) : Successfully retrieved the records through function (retrieveUsers_BasedOnType) => ");
    console.log(queryResult);

    var queryResponse_JSON_String = buildUserDBQueryResponse_JSON(queryResult, queryInput);

    http_Response.writeHead(200, { 'Content-Type': 'application/json' });
    http_Response.end(queryResponse_JSON_String);
}


/**
 * 
 * @param {any} queryResult  : query Response received from Mongo DB ( User & Auth DB )
 * @param {any} queryInput   : query Input Value
 *
 */

function buildUserDBQueryResponse_JSON(queryResult, queryInput) {

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

    queryResult = removeUrlSpacesFromObjectValues(queryResult);

    queryResponse_JSON = {
        "UserType": queryResult.UserType, "Name": queryResult.Name, "Shipment": queryResult.Shipment, "Location": queryResult.Location,
        "Email": queryResult.Email, "Address": queryResult.Address, "UserName": queryResult.UserName, "Password": queryResult.Password
    };

    return queryResponse_JSON;
}


