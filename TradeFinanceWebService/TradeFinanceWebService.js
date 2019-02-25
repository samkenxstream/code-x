
/*************************************************************************
 * 
 * =================
 * To Do List:
 * =================
 * 
 * Modularize the service code
 * Move the globals to local params & return values
 * Decrypt the Client Requests after moving to HTTPS mode
 * Check for Uniqueness of UserName before Registration
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

var http = require('http');
var url = require('url');
var cryptoModule = require('crypto');
var fileSystemModule = require('fs');
var jsPdfModule = require('jspdf');


// Define globals as per JSPDF Inclusion Usage/Syntax

var port = process.env.PORT || 3500;


// MongoDB Connection Variables

var mongoDbConnection = require('mongodb');
var mongoClient = mongoDbConnection.MongoClient;

// Database & Table Names of "Trade & LC Details"

var shipmentDatabase_Name = "shipmentTradeAndLcDb";
var tradeAndLcTable_Name = "tradeAndLcCollection";

// Database & Table Names of "User Details"

var userDetails_DatabaseName = "userDetailsDb";
var userDetails_TableName = "userDetailsCollection";


// Database & Table Names of "Trade & LC Details"

var mongoDbUrl = 'mongodb://127.0.0.1:27017/' + shipmentDatabase_Name;
var mongoUserDetailsDbUrl = 'mongodb://127.0.0.1:27017/' + userDetails_DatabaseName;


// Trade & LC Maps and Record Objects

var tradeDetailsRequiredFields = ["Trade_Id", "Buyer", "Seller", "Shipment", "ShipmentCount", "Amount"];

var lcDetailsRequiredFields = ["Trade_Id", "Lc_Id", "Buyer", "Seller", "Seller_Id", "Bank", "Shipment",
    "ShipmentCount", "Amount", "Expiry_Date", "Request_Location"];

var userRegistrationData_RequiredFields = ["UserType", "User_Id", "Name", "Location", "Email", "Address", "UserName", "Password"];


var trade_Object = {
    Trade_Id: "",
    Buyer: "",
    Seller: "",
    Shipment: "",
    ShipmentCount: "",
    Amount: "",
    Current_Status: ""
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
    Current_Status: ""
};

var userData_Object = {
    UserType: "",
    Name: "",
    Shipment: "",
    Location: "",
    Email: "",
    Address: "",
    UserName: "",
    Password: "",
    _id: "",
};

var credentialsData_Object = {
    UserName: "",
    Password: ""
};

var randomSeed_ForPasswordHash = "RandomHashSeed";

var bDebug = true;


/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * Main Service Module
 * 
 **************************************************************************
 **************************************************************************
 */


/*************************************************************************
 * 
 *  Start Trade Finance Web Server and serve requests from web client ( Single Web Client )
 *  ToDo : Parallel Requests ( Validate and Fix any issues )
 *
 *************************************************************************/

http.createServer(function (req, res) {

    console.log("req.url : " + req.url);

    // Return unexpected urls

    if (req.url == "/favicon.ico") {

        console.log("unexpected req.url : " + req.url);
        return;
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // Parse the params from Web requests

    console.log("req.url : " + req.url );
    console.log("req.url.query : " + (url.parse(req.url)).query );

    var requestParams = (url.parse(req.url)).query;
    var requestParamsCollection = requestParams.split("&");

    console.log("requestParamsMap after parsing URL : " );
    console.log(requestParamsCollection);

    var clientRequestWithParamsMap = ParseWebClientRequest(requestParamsCollection);
    console.log( "Parsed the Web Client Request : " + clientRequestWithParamsMap.get("Client_Request") );
    var webClientRequest = clientRequestWithParamsMap.get("Client_Request");
    console.log("UserType of Client request after parsing => " + clientRequestWithParamsMap.get("UserType"));


    // Connect to Mongo DB, Create Database & Collections

    // Connect to "User Details" db for "User Registration & Authentication"  

    if ( webClientRequest == "UserRegistration" || webClientRequest == "UserAuthentication" ||
         webClientRequest == "RetrieveUsersBasedOnType") {

        var dbConnection_UserDetails_Database;

        mongoClient.connect(mongoUserDetailsDbUrl, function (err, db) {

            console.log("Inside the connection to User Details Mongo DB");

            if (err != null) {
                console.log("Error while connecting to UserDetails mongo db on local server");
                throw err;
            }
            else {
                console.log("Successfully connected to UserDetails MongoDb");
            }

            // Database Creation

            console.log("Creating / Retrieving User Details Database : ");
            dbConnection_UserDetails_Database = db.db(userDetails_DatabaseName);

            // Table( Collection ) Creation

            dbConnection_UserDetails_Database.createCollection(userDetails_TableName, function (err, result) {

                if (err) {
                    console.log("Error while creating / retrieving Collection ( Table ) in User Details mongoDb");
                    throw err;
                }

                console.log("Successfully created / retrieved collection (userDetailsCollection)");
                console.log("Created / retrieved Collection ( Table ) : Now taking care of User Registration and Authentication");
            });


            // Redirect the web Requests based on Query Key => Client_Request

            var registrationResult = true;

            switch (webClientRequest) {

                case "UserRegistration":

                    console.log("Adding User Registration Record to Database => clientRequestWithParamsMap.get(UserName) : ", clientRequestWithParamsMap.get("UserName") );

                    if (addUserRegistrationRecordToDatabase(dbConnection_UserDetails_Database,
                        userDetails_TableName,
                        clientRequestWithParamsMap,
                        userRegistrationData_RequiredFields,
                        res)) {

                        console.log("Web Service: Switch Statement : Successfully Registered the User");
                        registrationResult = true;

                    }
                    else {

                        console.error("Web Service: Switch Statement : Failure while Registering the User");
                        registrationResult = false;

                    }

                    break;

                case "UserAuthentication":

                    if (validateUserCredentials(dbConnection_UserDetails_Database,
                        userDetails_TableName,
                        clientRequestWithParamsMap,
                        res)) {

                        console.log("Web Service: Switch Statement : Successfully Authenticated the User");
                    }
                    else {

                        console.error("Web Service: Switch Statement : Failed to Authenticate the User");
                    }

                    break;

                case "RetrieveUsersBasedOnType":

                    console.log("Inside User Registration & Auth Switch : UserType of Client request : " + clientRequestWithParamsMap.get("UserType"));
                    var userType = clientRequestWithParamsMap.get("UserType");

                    if (retrieveUsers_BasedOnType(dbConnection_UserDetails_Database,
                        userDetails_TableName,
                        userType,
                        handleUserDatabaseQueryResults,
                        res)) {

                        console.log("Web Service: Switch Statement : Successfully Retrieved the required Type Of Users");
                    }
                    else {

                        console.error("Web Service: Switch Statement : Failed to Retrieve the required Type Of Users");
                    }

                    break;

                default:

                    console.error("Inappropriate WebClientRequest : ", webClientRequest);
                    break;
            }
        });
    }

    // Connect to "Shipment & LC details" db

    else {

        var dbConnection_TradeAndLcDatabase;

        mongoClient.connect(mongoDbUrl, function (err, db) {

            console.log("Inside the connection to Mongo DB");

            if (err != null) {
                console.log("Error while connecting to mongo db on local server");
                throw err;
            }
            else {
                console.log("Successfully connected to MongoDb");
            }

            // Database Creation

            console.log("Creating Trade and LC Information Database : ");
            dbConnection_TradeAndLcDatabase = db.db(shipmentDatabase_Name);

            // Table( Collection ) Creation
            // ToDo: Check if the Table already exists and bail-out if it does 

            dbConnection_TradeAndLcDatabase.createCollection(tradeAndLcTable_Name, function (err, result) {

                if (err) {
                    console.log("Error while creating Collection ( Table ) in shipmentTradeAndLc mongoDb");
                    throw err;
                }

                console.log("Successfully created collection (tradeAndLcCollection)");
                console.log("Create Collection ( Table ) : Now Inserting Document ( Row :=> Trade & Letter Of Credit Details )");
            });


            // Redirect the web Requests based on Query Key => Client_Request

            switch (webClientRequest) {

                case "RequestTrade":

                    if (addTradeAndLcRecordToDatabase(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        clientRequestWithParamsMap,
                        tradeDetailsRequiredFields,
                        false)) {

                        console.log("Web Service: Switch Statement : Successfully added Record for Trade");
                    }
                    else {

                        console.error("Web Service: Switch Statement : Failure while adding Record for Trade");
                    }

                    // Build Response

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    var tradeResponseObject = { Request: "Request_Trade", Status: "Trade_Requested" };
                    var tradeResponse = JSON.stringify(tradeResponseObject);

                    res.end(tradeResponse);

                    break;

                case "RequestLC":

                    if (addTradeAndLcRecordToDatabase(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        clientRequestWithParamsMap,
                        lcDetailsRequiredFields,
                        true)) {

                        console.log("Web Service: Switch Statement : Successfully added Record for LC");
                    }
                    else {

                        console.error("Web Service: Switch Statement : Failure while adding Record for LC");
                    }

                    // Build Response

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    var lcResponseObject = { Request: "RequestLC", Status: "LC_Requested" };
                    var lcResponse = JSON.stringify(lcResponseObject);

                    res.end(lcResponse);

                    break;

                case "RetrieveAllRecords":

                    retrieveRecordFromTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        null,
                        null,
                        handleQueryResults,
                        req,
                        res);

                    console.log("Web Service: Switch Statement : Successfully retrieved all the existing records");

                    // Build Response

                    res.writeHead(200, { 'Content-Type': 'application/json' });

                    break;

                case "GetCurrentStatus":

                    break;

                case "RetrieveTradeDetails":

                    var tradeId = clientRequestWithParamsMap.get("Trade_Id");
                    var queriedTradeDetails = retrieveRecordFromTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        tradeId,
                        null,
                        handleQueryResults,
                        req,
                        res);

                    console.log("Web Service: Switch Statement : Successfully retrieved the Trade Record details => " + queriedTradeDetails);

                    // Build Response
                    // Complete Response will be built in Call back function after the DB Query

                    res.writeHead(200, { 'Content-Type': 'application/json' });

                    break;

                case "RetrieveLCDetails":

                    var lcId = clientRequestWithParamsMap.get("Lc_Id");
                    var queriedLcDetails = retrieveRecordFromTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        null,
                        lcId,
                        handleQueryResults,
                        req,
                        res);

                    console.log("Web Service: Switch Statement : Successfully retrieved the LC Record details => " + queriedLcDetails);

                    // Build Response
                    // Complete Response will be built in Call back function after the DB Query

                    res.writeHead(200, { 'Content-Type': 'application/json' });

                    break;

                case "ApproveTrade":

                    var statusToBeUpdated = "Trade_Approved";
                    updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        clientRequestWithParamsMap,
                        webClientRequest,
                        statusToBeUpdated,
                        res);

                    break;

                case "ApproveLCRequest":

                    var statusToBeUpdated = "LC_Approved";
                    updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        clientRequestWithParamsMap,
                        webClientRequest,
                        statusToBeUpdated,
                        res);

                    break;

                case "StartShipment":
    
                    var statusToBeUpdated = "Trade_Shipped";
                    updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        clientRequestWithParamsMap,
                        webClientRequest,
                        statusToBeUpdated,
                        res);

                    break;
    
                case "AcceptShipment":
    
                    var statusToBeUpdated = "Shipment_Accepted";
                    updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        clientRequestWithParamsMap,
                        webClientRequest,
                        statusToBeUpdated,
                        res);

                    break;
    
                case "RequestPayment":
    
                    var statusToBeUpdated = "Payment_Requested";
                    updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        clientRequestWithParamsMap,
                        webClientRequest,
                        statusToBeUpdated,
                        res);

                    break;
    
                case "MakePayment":
    
                    var statusToBeUpdated = "Payment_Made";
                    updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        clientRequestWithParamsMap,
                        webClientRequest,
                        statusToBeUpdated,
                        res);

                    break;

                case "GenerateLC":

                    generateLCAndUploadItToFileServer( clientRequestWithParamsMap,
                        res);

                    break;

                default:

                    console.error("Inappropriate Web Client Request received...exiting");
                    break;

            }

        });

    }

    //  close the db connection

    //db.close();
    //console.log("Closed the Db connection successfully");

    delete global.window;
    delete global.navigator;
    delete global.btoa;

}).listen(port);


/**
 * 
 * @param {any} clientRequestCollection  : List of <K,V> pairs from input http request
 * 
 */

// ToDo : Decrypt the ClientRequest information after moving to HTTPS mode

function ParseWebClientRequest(clientRequestCollection) {

    var webClientRequestParamsMap = new Map();
    console.log("ParseWebClientRequest : ClientRequest Collection =>")
    console.log(clientRequestCollection);

    for (var index = 0; index < clientRequestCollection.length; index++) {

        var currentKeyValuePair = clientRequestCollection[index].split("=");
        webClientRequestParamsMap = webClientRequestParamsMap.set(currentKeyValuePair[0], currentKeyValuePair[1]);
    }

    return webClientRequestParamsMap;
}


/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * User Registration & Authentication Module 
 * 
 **************************************************************************
 **************************************************************************
 */


/**
 * 
 * @param {any} recordObjectMap  : Map of <K,V> Pairs from Client Request
 * 
 */

function prepareUserRegistrationObject(recordObjectMap) {

    console.log("prepareUserRegistrationObject : recordObjectMap.get(UserType) : " + recordObjectMap.get("UserType") + ", recordObjectMap.get(UserName) : " + recordObjectMap.get("UserName"));

    userData_Object.UserType = recordObjectMap.get("UserType");
    console.log("prepareUserRegistrationObject : After Assignment => userData_Object.UserType : " + userData_Object.UserType );

    userData_Object._id = recordObjectMap.get("User_Id");
    userData_Object.Name = recordObjectMap.get("Name");
    userData_Object.Shipment = recordObjectMap.get("Shipment");
    userData_Object.Location = recordObjectMap.get("Location");
    userData_Object.Email = recordObjectMap.get("Email");
    userData_Object.Address = recordObjectMap.get("Address");
    userData_Object.UserName = recordObjectMap.get("UserName");

    // Store Password in by generating Hash

    var tempLocalParam_Password = recordObjectMap.get("Password");
    var passwordHash = cryptoModule.createHash('md5').update(tempLocalParam_Password).digest('hex');

    userData_Object.Password = passwordHash;

    return userData_Object;
}


/**
 * 
 * @param {any} dbConnection  : Connection to database
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any} recordObjectMap : Map of <K,V> Pairs ( Record ), to be added to Shipment Database : Trade And LC Table
 * @param {any} requiredDetailsCollection : required keys for record addition ( User Registration Record )
 * @param {any} http_Response : Http Response thats gets built
 *
 */

// ToDo : Store the Hash of the Password instead of PlainText 

function addUserRegistrationRecordToDatabase(dbConnection, collectionName, recordObjectMap, requiredDetailsCollection, http_Response) {

    var userRegistrationResponseObject = null;

    console.log("addUserRegistrationRecordToDatabase : recordObjectMap.get(UserType) : " + recordObjectMap.get("UserType") + ", recordObjectMap.get(User_Id) : " + recordObjectMap.get("User_Id") );

    // Check if all the required fields are present before adding the record

    for (var i = 0; i < requiredDetailsCollection.length; i++) {

        var currentKey = requiredDetailsCollection[i];

        if (recordObjectMap.get(currentKey) == null || recordObjectMap.get(currentKey) == undefined) {

            console.error("addUserRegistrationRecordToDatabase : Value corresponding to required Key doesn't exist => Required Key : " + currentKey);

            var failureMessage = "Failure: Required Key doesn't exist => " + currentKey;
            userRegistrationResponseObject = { Request: "UserRegistration", Status: failureMessage };
            var userRegistrationResponse = JSON.stringify(userRegistrationResponseObject);

            http_Response.writeHead(400, { 'Content-Type': 'application/json' });
            http_Response.end(userRegistrationResponse);

            return false;
        }
    }

    // Prepare "User Registration" Object and add them to UserDetails Database

    console.log("addUserRegistrationRecordToDatabase => prepareUserRegistrationObject : Num Of  <k,v> Pairs of recordObjectMap => " + recordObjectMap.length);
    var currentDocument_Object = prepareUserRegistrationObject(recordObjectMap);

    console.log("addUserRegistrationRecordToDatabase : All <K,V> pairs are present, Adding User Registration Record of Num Of  <k,v> Pairs => " + currentDocument_Object.length);

    // Check the userData_Object after value assignment

    if (bDebug == true) {

        console.log("userData_Object values after converting from Map => ");
        console.log("currentDocument_Object.UserType => " + currentDocument_Object.UserType );
    }

    // Remove URL Spaces before adding the Record to User Details Database

    currentDocument_Object = removeUrlSpacesFromObjectValues(currentDocument_Object);
    addRecordToUserDetailsDatabase_IfNotExists(dbConnection, collectionName, currentDocument_Object, http_Response);

    return true;
}


/**
 * 
 * @param {any} recordObjectMap  : Map of <K,V> Pairs from Client Request
 * 
 */

function prepareUserCredentialsObject(recordObjectMap) {

    credentialsData_Object.UserName = recordObjectMap.get("UserName");
    credentialsData_Object.Password = recordObjectMap.get("Password");
}

/**
 * 
 * @param {any} dbConnection  : Connection to database 
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any} document_Object : Document object to be added ( Record, Row in Table )
 * @param {any} http_Response : Http Response thats gets built
 * 
*/

function validateUserCredentials(dbConnection, collectionName, recordObjectMap, http_Response) {

    var userAuthenticationResponseObject = null;

    // Prepare Credentials Data Object

    prepareUserCredentialsObject(recordObjectMap);
    var document_Object = credentialsData_Object;

    // Check if the request has UserName & Password Details

    if (document_Object.UserName == null || document_Object.UserName == undefined ||
        document_Object.Password == null || document_Object.Password == undefined) {

        console.log("validateUserCredentials : Missing credential Details ( UserName || Password )");
        var failureMessage = "Failure: Blank UserName || Password in input Request";

        buildErrorResponse_ForUserAuthentication(failureMessage, http_Response);
    }

    // DB Query

    var query = { UserName: document_Object.UserName };
    console.log("validateUserCredentials => collectionName :" + collectionName + ", UserName :" + document_Object.UserName);

    // Validate Credentials and Build Response

    dbConnection.collection(collectionName).findOne(query, function (err, result) {

        if (err) {

            console.log("validateUserCredentials : Error while querying DB for User Credentials");
            var failureMessage = "Failure: Error while querying DB for User Credentials";

            buildErrorResponse_ForUserAuthentication(failureMessage, http_Response);

            throw err;
        }

        var recordPresent = (result) ? "true" : "false";

        // Add User Registration Record, If not already registered

        if (recordPresent == "false") {

            console.log("validateUserCredentials : UserName was not registered : " + document_Object.UserName);
            var failureMessage = "validateUserCredentials : UserName was not registered : " + document_Object.UserName;

            buildErrorResponse_ForUserAuthentication(failureMessage, http_Response);

        } else {

            // User Exists. Validate the Password ( ToDo: Generate Hash and validate against the existing Password Hash)

            console.log("validateUserCredentials : User Exists. Validate the Credentials for User : " + document_Object.UserName);

            var inputPasswordHash = cryptoModule.createHash('md5').update(document_Object.Password).digest('hex');
            console.log("validateUserCredentials : generated Hash for input password : " + inputPasswordHash);

            if (result.Password != inputPasswordHash) {

                console.log("validateUserCredentials : Passwords did not Match for UserName : " + document_Object.UserName);
                var failureMessage = "validateUserCredentials : Passwords did not Match for UserName : " + document_Object.UserName;

                buildErrorResponse_ForUserAuthentication(failureMessage, http_Response);

            } else {

                http_Response.writeHead(200, { 'Content-Type': 'application/json' });

                userAuthenticationResponseObject = { Request: "UserAuthentication", Status: "Authentication Successful" };
                var userAuthenticationResponse = JSON.stringify(userAuthenticationResponseObject);

                http_Response.end(userAuthenticationResponse);
            }
        }

    });

}


/**
 * 
 * @param {any} failureMessage  : Failure Message Error Content
 * @param {any} http_Response : Http Response thats gets built
 * 
*/

function buildErrorResponse_ForUserAuthentication(failureMessage, http_Response) {

    // Check if the request has UserName & Password Details

    var userCredsValidationResponseObject = null;

    userCredsValidationResponseObject = { Request: "UserAuthentication", Status: failureMessage };
    var userAuthenticationResponse = JSON.stringify(userCredsValidationResponseObject);

    http_Response.writeHead(400, { 'Content-Type': 'application/json' });
    http_Response.end(userAuthenticationResponse);
}


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

function retrieveUsers_BasedOnType(dbConnection, collectionName, inputUserType, handleUserDatabaseQueryResults, http_Response) {

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

function handleUserDatabaseQueryResults(queryResult, http_Response, queryInput) {

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


/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * User Registration & Auth Record : CRUD operation Wrappers Module
 *                       DB Specific User Input/Output processing
 * 
 **************************************************************************
 **************************************************************************
 */


/**
 * 
 * @param {any} dbConnection  : Connection to database 
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any} document_Object : Document object to be added ( Record, Row in Table )
 * @param {any} http_Response : Http Response thats gets built
 * 
 */

function addRecordToUserDetailsDatabase_IfNotExists(dbConnection, collectionName, document_Object, http_Response) {

    // Throw Error if User already Exists ; Add Record Otherwise

    var query = { UserName: document_Object.UserName };
    console.log("addRecordToUserDetailsDatabase_IfNotExists => collectionName :" + collectionName + ", UserName :" + document_Object.UserName);

    var userRegistrationResponseObject = null;

    // Build Response

    dbConnection.collection(collectionName).findOne(query, function (err, result) {

        if (err) {

            console.log("addRecordToUserDetailsDatabase_IfNotExists : Error while querying for document to be inserted");

            var failureMessage = "Failure: Unknown failure during User Registration";
            userRegistrationResponseObject = { Request: "UserRegistration", Status: failureMessage };
            var userRegistrationResponse = JSON.stringify(userRegistrationResponseObject);

            http_Response.writeHead(400, { 'Content-Type': 'application/json' });
            http_Response.end(userRegistrationResponse);

            throw err;
        }

        var recordPresent = (result) ? "true" : "false";

        // Add User Registration Record, If not already registered

        if (recordPresent == "false") {

            console.log("addRecordToUserDetailsDatabase_IfNotExists : Record Not Found, Adding New Record => " + " UserName : " + document_Object.UserName);
            directAdditionOfRecordToDatabase(dbConnection, collectionName, document_Object);

            userRegistrationResponseObject = { Request: "UserRegistration", Status: "Registration Successful"};
            var userRegistrationResponse = JSON.stringify(userRegistrationResponseObject);

            http_Response.writeHead(200, { 'Content-Type': 'application/json' });
            http_Response.end(userRegistrationResponse);

        } else {

            // User Already Exists, Send Error Response

            console.log("User Already Registered => UserName : " + document_Object.UserName);

            var failureMessage = "Failure: User ( " + document_Object.Name + " ) was already registered";
            userRegistrationResponseObject = { Request: "UserRegistration", Status: failureMessage };
            var userRegistrationResponse = JSON.stringify(userRegistrationResponseObject);

            http_Response.writeHead(400, { 'Content-Type': 'application/json' });
            http_Response.end(userRegistrationResponse);

        }

    });

}


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

    trade_Object.Trade_Id = recordObjectMap.get("Trade_Id");
    trade_Object.Buyer = recordObjectMap.get("Buyer");
    trade_Object.Seller = recordObjectMap.get("Seller");
    trade_Object.Shipment = recordObjectMap.get("Shipment");
    trade_Object.ShipmentCount = recordObjectMap.get("ShipmentCount");
    trade_Object.Amount = recordObjectMap.get("Amount");
    trade_Object.Current_Status = "Trade_Requested";
}

/**
 * 
 * @param {any} recordObjectMap  : Map of <K,V> Pairs from Client Request ( LC Record )
 * 
 */

function prepareLcDocumentObject(recordObjectMap) {

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

function addTradeAndLcRecordToDatabase(dbConnection, collectionName, recordObjectMap, requiredDetailsCollection, bLcRequest) {

    // Check if all the required fields are present before adding the record

    for (var i = 0; i < requiredDetailsCollection.length; i++) {

        var currentKey = requiredDetailsCollection[i];

        if (recordObjectMap.get(currentKey) == null) {

            console.error("addTradeAndLcRecordToDatabase : Value corresponding to required Key doesn't exist => Required Key : " + currentKey);
            return false;
        }
    }

    // Prepare Trade | LC Document Objects and add them to Shipment Database

    if (!bLcRequest) {

        prepareTradeDocumentObject(recordObjectMap);

        console.log("addTradeAndLcRecordToDatabase : All <K,V> pairs are present, Adding Trade Record of Num Of Pairs => " + trade_Object.length);

        // Remove spaces from trade_object values before adding to MongoDB

        trade_Object = removeUrlSpacesFromObjectValues(trade_Object);
        addRecordToTradeAndLcDatabase(dbConnection,
            collectionName,
            trade_Object);

    } else {

        prepareLcDocumentObject(recordObjectMap);

        console.log("addTradeAndLcRecordToDatabase : All <K,V> pairs are present, Adding LC Record of Num Of Pairs => " + lc_Object.length);

        // Remove spaces from lc_Object values before adding to MongoDB

        lc_Object = removeUrlSpacesFromObjectValues(lc_Object);
        addRecordToTradeAndLcDatabase(dbConnection,
            collectionName,
            lc_Object);
    }

    return true;
}


/**
 * 
 * @param {any} dbConnection  : Connection to database 
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any} document_Object : Document object to be added ( Record, Row in Table )
 * 
 */

function addRecordToTradeAndLcDatabase(dbConnection, collectionName, document_Object) {

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

                console.log("addRecordToTradeAndLcDatabase : Error while querying for document to be inserted");
                throw err;
            }

            var recordPresent = (result) ? "true" : "false";
            if (recordPresent == "false") {

                // Record Addition

                console.log("Record Not Found, Adding New Record => " + " Trade Id : " + document_Object.Trade_Id + " LC Id : " + document_Object.Lc_Id);
                directAdditionOfRecordToDatabase(dbConnection, collectionName, document_Object);
            }
            else {

                // Record Updation

                console.log("Record Found, Updating the existing Record => " + " Trade Id : " + document_Object.Trade_Id + " LC Id : " + document_Object.Lc_Id);
                directUpdationOfRecordToDatabase(dbConnection, collectionName, document_Object, query);
            }

        });

    } else {

        // Record Addition

        console.log("Both Trade_Id and Lc_Id are null in input Object, Adding New Record without primary keys");
        directAdditionOfRecordToDatabase(dbConnection, collectionName, document_Object);
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

function updateRecordStatusInTradeAndLcDatabase(dbConnection, collectionName, clientRequestWithParamsMap, webClientRequest, statusToBeUpdated, http_response) {

    var tradeId = clientRequestWithParamsMap.get("Trade_Id");
    var lcId = clientRequestWithParamsMap.get("Lc_Id");

    var query_Object = { Trade_Id: tradeId, Lc_Id: lcId };
    var document_Object = {
        $set: { Current_Status: statusToBeUpdated }
    };

    updateRecordInTradeAndLcDatabase(dbConnection,
        collectionName,
        query_Object,
        document_Object,
        webClientRequest,
        http_response);

    console.log("Web Service: Switch Statement : Successfully launched the update Record with status Trade_Approved => Trade_Id: " + tradeId + " Lc_Id: " + lcId);

    return;
}

/**
 * 
 * @param {any} dbConnection  : Connection to database 
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any} query_Object : Query object to retrieve the corresponding Record ( Record, Row in Table )
 * @param {any} document_Object : Document object that needs to be updated ( Record, Row in Table )
 * 
 */

function updateRecordInTradeAndLcDatabase(dbConnection, collectionName, query_Object, document_Object, webClientRequest, http_response) {

    // Find Record & Update

    var query = null;

    console.log("updateRecordInTradeAndLcDatabase => collectionName :" + collectionName + " Trade_Identifier :" + query_Object.Trade_Id + " Lc_Identifier :" + query_Object.Lc_Id);

    if (query_Object.Trade_Id != null) {

        query = { Trade_Id: query_Object.Trade_Id };

    } else if (query_Object.Lc_Id != null) {

        query = { Lc_Id: query_Object.Lc_Id };

    } else {

        var failureMessage = "Wrong Query/missing input data : Couldn't find Record";
        buildErrorResponse_ForRecordUpdation(failureMessage, webClientRequest, http_response);

        return;
    }

    // Update Record in DB

    dbConnection.collection(collectionName).updateOne(query, document_Object, function (err, result) {

        if (err) {

            var failureMessage = "Error while executing the updation on Record";
            buildErrorResponse_ForRecordUpdation(failureMessage, webClientRequest, http_response);
            throw err;
        }

        var recordPresent = (result == null || result == undefined) ? "false" : "true";
        if (recordPresent == "false") {

            // Record Not Found : Return Error Response

            console.error("Record Not Found => For Trade Id : " + query_Object.Trade_Id + " LC Id : " + query_Object.Lc_Id);
            var failureMessage = "Record Updation: Record not found for Trade_Id : " + query_Object.Trade_Id + " LC Id : " + query_Object.Lc_Id;
            buildErrorResponse_ForRecordUpdation(failureMessage, webClientRequest, http_response);

        }
        else {

            // Record Updation Successful

            console.log("Record Found, Updated the Record with latest Status => " + " Trade Id : " + query_Object.Trade_Id + " LC Id : " + query_Object.Lc_Id);
            var successMessage = "Record Found, Updated the Record with latest Status => " + " Trade Id : " + query_Object.Trade_Id + " LC Id : " + query_Object.Lc_Id;
            buildSuccessResponse_ForRecordUpdation(successMessage, webClientRequest, http_response);
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

function directAdditionOfRecordToDatabase(dbConnection, collectionName, document_Object) {

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

function directUpdationOfRecordToDatabase(dbConnection, collectionName, document_Object, query) {

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

function removeRecordFromTradeAndLcDatabase(dbConnection, collectionName, Trade_Identifier, Lc_Identifier) {

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

function retrieveRecordFromTradeAndLcDatabase(dbConnection, collectionName, Trade_Identifier, Lc_Identifier, handleQueryResults, req, res) {

    // Record Retrieval based on "Lc_Id | Trade_Id | *(All Records)"

    var query = null;
    var queryType = "AllRecords";

    console.log("retrieveRecordFromTradeAndLcDatabase => collectionName :" + collectionName + " Trade_Identifier :" + Trade_Identifier + " Lc_Identifier :" + Lc_Identifier);

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
                console.log("Error while querying the Record from tradeAndLc Database => " + " Trade Id : " + Trade_Identifier + " LC Id : " + Lc_Identifier);
                throw err;
            }

            console.log("retrieveRecordFromTradeAndLcDatabase => Query for single Record => returned Answer : ");
            console.log(result);
            return handleQueryResults(null, result, req, res, queryType);
        });

    } else {

        dbConnection.collection(collectionName).find({}).toArray( function (err, result) {

            if (err) {
                console.log("Error while querying all the Records from tradeAndLc Database");
                throw err;
            }

            console.log("Successfully retrieved all the records through function (retrieveRecordFromTradeAndLcDatabase) => ");
            console.log(result);
            return handleQueryResults( null, result, req, res, queryType);
        });
    }
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

function handleQueryResults(err, queryResult, req, res, queryType) {

    if (err) {
        console.log("Error in executing Retrieval Query : ");
        throw err;
    }

    console.log("Callback Function (handleQueryResults) : Successfully retrieved the records through function (retrieveRecordFromTradeAndLcDatabase) => ");
    console.log(queryResult);

    var queryResponse_JSON_String = buildQueryResponse_JSON(queryResult, queryType);
    res.end(queryResponse_JSON_String);

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

        return JSON.stringify( buildTradeRecord_JSON(queryResult) );

    } else if (queryType == "SingleLcRecord") {

        return JSON.stringify(buildLcRecord_JSON(queryResult));

    } else {

        var queryResponse_AllRecords_JSON_String = "";

        for (var i = 0; i < queryResult.length; i++) {

            if (queryResult[i].Lc_Id != null && queryResult[i].Lc_Id != undefined) {

                queryResponse_AllRecords_JSON_String += JSON.stringify( buildLcRecord_JSON(queryResult[i]) );
                queryResponse_AllRecords_JSON_String += "\n";

            } else {

                queryResponse_AllRecords_JSON_String += JSON.stringify( buildTradeRecord_JSON(queryResult[i]) );
                queryResponse_AllRecords_JSON_String += "\n";
            }

        }

        return queryResponse_AllRecords_JSON_String;
    }

    return queryResponse_JSON;
}

/**
 * 
 * @param {any} queryResult : query Result from mongo DB
 * 
 * @returns {any} queryResponse_JSON : Trade Record in JSON format
 * 
 */

function buildTradeRecord_JSON(queryResult) {

    var queryResponse_JSON = null;

    queryResult = removeUrlSpacesFromObjectValues(queryResult);

    queryResponse_JSON = {
        "Trade_Id": queryResult.Trade_Id, "Buyer": queryResult.Buyer, "Seller": queryResult.Seller, "Shipment": queryResult.Shipment,
        "ShipmentCount": queryResult.ShipmentCount, "Amount": queryResult.Amount, "Current_Status": queryResult.Current_Status
    };

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

    var queryResponse_JSON = null;

    queryResult = removeUrlSpacesFromObjectValues(queryResult);

    queryResponse_JSON = {
        "Trade_Id": queryResult.Trade_Id, "Lc_Id": queryResult.Lc_Id, "Buyer": queryResult.Buyer, "Seller": queryResult.Seller,
        "Seller_Id": queryResult.Seller_Id, "Bank": queryResult.Bank, "Shipment": queryResult.Shipment, "Amount": queryResult.Amount,
        "ShipmentCount": queryResult.ShipmentCount, "Current_Status": queryResult.Current_Status, "Expiry_Date": queryResult.Expiry_Date,
        "Request_Location": queryResult.Request_Location
    };

    return queryResponse_JSON;
}


/**
 * 
 * @param {any} queryResult : query Result from mongo DB
 * 
 * @returns     queryResult_WithoutURLSpaces : queryResult with all values minus URL spaces
 * 
*/

function removeUrlSpacesFromObjectValues(queryResult) {

    // Modify the Values to remove URL Spaces

    var keys = Object.keys(queryResult);
    var values = Object.values(queryResult);

    for (var i = 0; i < values.length; i++) {

        var currentValue = String(values[i]);
        var regExpr = /%20/gi;
        currentValue = currentValue.replace(regExpr, " ");

        queryResult[keys[i]] = currentValue;
    }

    return queryResult;
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
 * @param { any } clientRequestWithParamsMap: input Map consisting of LC Details("Trade_Id, Lc_Id")
 * @param { any } http_response: Http Response to be built based on LC Generation and Upload to file Server
 *
*/

function generateLCAndUploadItToFileServer(clientRequestWithParamsMap, http_response) {

    // ToDo : Generate LC based on Input Details

    var fileName = "LoC-Shipment-" + clientRequestWithParamsMap.get("taId") + clientRequestWithParamsMap.get("lcId") + ".pdf";

    //pdfDoc.save(fileName);

    var fileData = generateLCFileBasedOnSelectedInput( clientRequestWithParamsMap.get("taId"),
        clientRequestWithParamsMap.get("lcId"),
        clientRequestWithParamsMap.get("buyer"),
        clientRequestWithParamsMap.get("bank"),
        clientRequestWithParamsMap.get("seller"),
        clientRequestWithParamsMap.get("shipment"),
        clientRequestWithParamsMap.get("count"),
        clientRequestWithParamsMap.get("expiryDate"),
        clientRequestWithParamsMap.get("creditAmount") );

    var dstFile = "./LCFiles/" + fileName;

    console.log("generateLCAndUploadItToFileServer.fs.writeFile => Writing LC Data to PDF File : " + dstFile);

    fileSystemModule.writeFile(dstFile, fileData, (err) => {

        console.log("generateLCAndUploadItToFileServer.fs.writeFile => in call back function code");

        if (err) {

            console.error("Error while writing data to pdf file : Error => " + err);
            var failureMessage = "generateLCAndUploadItToFileServer : Error while writing data to pdf file => " + err;

            var http_StatusCode = 400;
            buildErrorResponse_Generic("generateLC", failureMessage, http_StatusCode, http_response);

            return;
        }

        console.log("generateLCAndUploadItToFileServer => Successfully wrote the data to PDF File");

        var successMessage = "generateLCAndUploadItToFileServer : Successfully wrote the data to PDF File";
        buildSuccessResponse_ForLCGeneration(successMessage, "generateLC", http_response);

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
            buildErrorResponse_Generic("generateLC", failureMessage, http_StatusCode, http_response);

            return;
        }

        console.log("generateLCAndUploadItToFileServer => Successfully moved the file to File Server Location :");

        var successMessage = "generateLCAndUploadItToFileServer : Successfully moved the file to File Server Location";
        buildSuccessResponse_ForLCGeneration(successMessage, "generateLC", http_response);

    });
    */

}

/****************************************************************************************
    Generate Single LC based on Selected Input
*****************************************************************************************/

function generateLCFileBasedOnSelectedInput(shipmentId, shipmentLcId, shipmentBuyer, shipmentBuyerBank, shipmentSeller,
    shipmentShipment, shipmentCount, shipmentExpiryDate, shipmentCreditAmount) {

    // Create LC : PDF File

    var pdfDoc = new jsPdfModule();

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
    pdfDoc.text(15, 70, shipmentSeller + ",");

    // Subject Section Details

    var LCSubjectLine = "Sub : Letter of Credit For Shipment : (" + shipmentShipment + "), Id : (" + shipmentId + ")";
    pdfDoc.text(25, 95, LCSubjectLine);

    // Letter content Paragraph 1

    var LCContentLine1 = shipmentBuyerBank + " here by certifies that, payment for the amount of " + shipmentCreditAmount;
    var LCContentLine2 = "will be processed by " + shipmentBuyerBank + " on behalf of " + shipmentBuyer + ", as soon as";
    var LCContentLine3 = shipmentShipment + "(" + shipmentCount + ")" + " are delivered on or before " + shipmentExpiryDate + ".";

    pdfDoc.text(30, 120, LCContentLine1);
    pdfDoc.text(15, 130, LCContentLine2);
    pdfDoc.text(15, 140, LCContentLine3);

    // Subject Section Details

    var LCContentLine4 = "LC would expire with immediate effect on " + shipmentExpiryDate + " , if promised";
    var LCContentLine5 = "items : " + shipmentShipment + "(" + shipmentCount + ")" + " are not delivered by then.";

    pdfDoc.text(30, 155, LCContentLine4);
    pdfDoc.text(15, 165, LCContentLine5);

    // Closure : Addressing by Author

    var LCAddressingSignOffByAuthor = "Thanks & Regards,";
    pdfDoc.text(135, 190, LCAddressingSignOffByAuthor);
    pdfDoc.text(135, 200, shipmentBuyer);

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

