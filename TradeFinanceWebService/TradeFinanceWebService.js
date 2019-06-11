
/*************************************************************************
 * 
 * =================
 * To Do List:
 * =================
 * 
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

// Generic Variables Global

var http = require('http');
var url = require('url');

var generateLCModule = require('./GenerateLC');
var generateTradeAgreementModule = require('./GenerateTradeAgreement');

var mongoDbCrudModule = require('./MongoDbCRUD');
var HelperUtilsModule = require('./HelperUtils');

var UserAuthenticationModule = require('./UserAuthentication');
var TradeAndLCRecordsUpdateModule = require('./TradeAndLCRecordUpdates');
var UserRecordsQueryAndUpdatesModule = require('./UserRecordsQueryAndUpdates');

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


// Global variables

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

    if (req.url == null || req.url == "/favicon.ico") {

        console.log("unexpected req.url : " + req.url);
        return;
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // Parse the params from Web requests

    console.log("req.url : " + req.url );
    console.log("req.url.query : " + (url.parse(req.url)).query );

    var requestParams = (url.parse(req.url)).query;

    if (requestParams == null || requestParams == "") {

        console.log("Null / empty req.url.query :");
        return;
    }

    // Extract Query Parameters

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
        webClientRequest == "RetrieveUsersBasedOnType" || webClientRequest == "RetrieveUserDetailsBasedOnUserName" ) {

        var dbConnection_UserDetails_Database;

        mongoClient.connect(mongoUserDetailsDbUrl, function (err, db) {

            console.log("Inside the connection to User Details Mongo DB");

            if (err != null) {

                console.error("TradeFinanceWebService.createServer : Server Error while connecting to UserDetails mongo db on local server :"
                    + mongoUserDetailsDbUrl);

                var failureMessage = "TradeFinanceWebService.createServer : Server Error while connecting to UserDetails mongo db on local server :"
                    + mongoUserDetailsDbUrl;
                HelperUtilsModule.logInternalServerError("TradeFinanceWebService.createServer", failureMessage, res);

            }
            else {

                console.log("Successfully connected to UserDetails MongoDb : " + mongoUserDetailsDbUrl);

                // Database Creation

                console.log("Creating / Retrieving User Details Database : ");
                dbConnection_UserDetails_Database = db.db(userDetails_DatabaseName);

                // Table( Collection ) Creation

                dbConnection_UserDetails_Database.createCollection(userDetails_TableName, function (err, result) {

                    if (err) {

                        console.error("TradeFinanceWebService.createServer : Error while creating / retrieving Collection ( Table ) in User Details mongoDb : "
                            + userDetails_TableName);

                        var failureMessage = "TradeFinanceWebService.createServer : Error while creating / retrieving Collection ( Table ) in User Details mongoDb : "
                            + userDetails_TableName;
                        HelperUtilsModule.logInternalServerError("TradeFinanceWebService.createServer", failureMessage, res);

                        return;
                    }

                    console.log("Successfully created / retrieved collection (userDetailsCollection)");
                    console.log("Created / retrieved Collection ( Table ) : Now taking care of User Registration and Authentication");
                });

                // Redirect the web Requests based on Query Key => Client_Request

                var registrationResult = true;

                switch (webClientRequest) {

                    case "UserRegistration":

                        console.log("Adding User Registration Record to Database => clientRequestWithParamsMap.get(UserName) : ", clientRequestWithParamsMap.get("UserName"));

                        if (UserAuthenticationModule.addUserRegistrationRecordToDatabase(dbConnection_UserDetails_Database,
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

                        if (UserAuthenticationModule.validateUserCredentials(dbConnection_UserDetails_Database,
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

                        // Build Query

                        var queryMap = new Map();

                        if (userType != null && userType != undefined) {

                            queryMap.set("UserType", userType);

                        } else {

                            console.error("TradeFinanceWebService : RetrieveUsersBasedOnType WebClientRequest doesn't support any other query apart from UserType");

                            var failureMessage = "TradeFinanceWebService : RetrieveUsersBasedOnType WebClientRequest doesn't support any other query apart from UserType";
                            HelperUtilsModule.logBadHttpRequestError("TradeFinanceWebService", failureMessage, res);

                            break;
                        }

                        if (UserRecordsQueryAndUpdatesModule.retrieveUserDetails(dbConnection_UserDetails_Database,
                            userDetails_TableName,
                            queryMap,
                            UserRecordsQueryAndUpdatesModule.handleUserDatabaseQueryResults,
                            res)) {

                            console.log("Web Service: Switch Statement : Successfully Retrieved the required Type Of Users");
                        }
                        else {

                            console.error("Web Service: Switch Statement : Failed to Retrieve the required Type Of Users");
                        }

                        break;

                    case "RetrieveUserDetailsBasedOnUserName":

                        console.log("Inside User Registration & Auth Switch : RetrieveUserDetailsBasedOnUserName : UserName : " + clientRequestWithParamsMap.get("UserName"));
                        var userName = clientRequestWithParamsMap.get("UserName");

                        // Build Query

                        var queryMap = new Map();

                        if (userName != null && userName != undefined) {

                            queryMap.set("UserName", userName);

                        } else {

                            console.error("TradeFinanceWebService : RetrieveUsersBasedOnType WebClientRequest doesn't support any other query apart from UserName");

                            var failureMessage = "TradeFinanceWebService : RetrieveUsersBasedOnType WebClientRequest doesn't support any other query apart from UserName";
                            HelperUtilsModule.logBadHttpRequestError("TradeFinanceWebService", failureMessage, res);

                            break;
                        }

                        // DB query & Reponse Building

                        if (UserRecordsQueryAndUpdatesModule.retrieveUserDetails(dbConnection_UserDetails_Database,
                            userDetails_TableName,
                            queryMap,
                            UserRecordsQueryAndUpdatesModule.handleUserDatabaseQueryResults,
                            res)) {

                            console.log("Web Service: Switch Statement : Successfully Retrieved the required User Details");
                        }
                        else {

                            console.error("Web Service: Switch Statement : Failed to Retrieve the required User Details");
                        }

                        break;

                    default:

                        console.error("Inappropriate Web Client Request received...exiting");

                        var failureMessage = "TradeFinanceWebService : Inappropriate Web Client Request received...exiting";
                        HelperUtilsModule.logBadHttpRequestError("TradeFinanceWebService", failureMessage, res);

                        break;
                }

            }

        });
    }

    // Connect to "Shipment & LC details" db

    else {

        var dbConnection_TradeAndLcDatabase;

        mongoClient.connect(mongoDbUrl, function (err, db) {

            console.log("Inside the connection to Mongo DB");

            if (err != null) {

                console.error("TradeFinanceWebService.createServer : Error while connecting to mongo db on local server :"
                    + mongoDbUrl);

                var failureMessage = "TradeFinanceWebService.createServer : Error while connecting to mongo db on local server :"
                    + mongoDbUrl;
                HelperUtilsModule.logInternalServerError("TradeFinanceWebService.createServer", failureMessage, res);

            }
            else {

                console.log("Successfully connected to MongoDb : " + mongoDbUrl);

                // Database Creation

                console.log("Creating Trade and LC Information Database : ");
                dbConnection_TradeAndLcDatabase = db.db(shipmentDatabase_Name);

                // Table( Collection ) Creation
                // ToDo: Check if the Table already exists and bail-out if it does 

                dbConnection_TradeAndLcDatabase.createCollection(tradeAndLcTable_Name, function (err, result) {

                    if (err) {

                        console.error("TradeFinanceWebService.createServer : Error while creating Collection ( Table ) in shipmentTradeAndLc mongoDb :"
                            + tradeAndLcTable_Name);

                        var failureMessage = "TradeFinanceWebService.createServer : Error while creating Collection ( Table ) in shipmentTradeAndLc mongoDb :"
                            + tradeAndLcTable_Name;
                        HelperUtilsModule.logInternalServerError("TradeFinanceWebService.createServer", failureMessage, res);

                    }

                    console.log("Successfully created collection (tradeAndLcCollection) : " + tradeAndLcTable_Name);
                    console.log("Create Collection ( Table ) : Now Inserting Document ( Row :=> Trade & Letter Of Credit Details )");
                });


                // Redirect the web Requests based on Query Key => Client_Request

                switch (webClientRequest) {

                    case "RequestTrade":

                        if (TradeAndLCRecordsUpdateModule.addTradeAndLcRecordToDatabase(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            clientRequestWithParamsMap,
                            tradeDetailsRequiredFields,
                            false,
                            res,
                            userDetails_DatabaseName,
                            userDetails_TableName,
                            mongoClient,
                            mongoUserDetailsDbUrl)) {

                            console.log("Web Service: Switch Statement : Successfully added Record for Trade");
                        }
                        else {

                            console.error("Web Service: Switch Statement : Failure while adding Record for Trade");
                        }

                        break;

                    case "RequestLC":

                        if (TradeAndLCRecordsUpdateModule.addTradeAndLcRecordToDatabase(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            clientRequestWithParamsMap,
                            lcDetailsRequiredFields,
                            true,
                            res)) {

                            console.log("Web Service: Switch Statement : Successfully added Record for LC");
                        }
                        else {

                            console.error("Web Service: Switch Statement : Failure while adding Record for LC");
                        }

                        break;

                    // Retrieve Records : Generic

                    case "RetrieveAllRecords":

                        mongoDbCrudModule.retrieveRecordFromTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            null,
                            null,
                            TradeAndLCRecordsUpdateModule.handleQueryResults,
                            req,
                            res);

                        console.log("Web Service: Switch Statement : Successfully retrieved all the existing records");
                        break;

                    case "RetrieveTradeDetails":

                        var tradeId = clientRequestWithParamsMap.get("Trade_Id");
                        mongoDbCrudModule.retrieveRecordFromTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            tradeId,
                            null,
                            TradeAndLCRecordsUpdateModule.handleQueryResults,
                            req,
                            res);

                        console.log("Web Service: Switch Statement : Successfully retrieved the Trade Record details");
                        break;

                    case "RetrieveLCDetails":

                        var lcId = clientRequestWithParamsMap.get("Lc_Id");
                        mongoDbCrudModule.retrieveRecordFromTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            null,
                            lcId,
                            TradeAndLCRecordsUpdateModule.handleQueryResults,
                            req,
                            res);

                        console.log("Web Service: Switch Statement : Successfully retrieved the LC Record details");
                        break;

                    // Retrieve Records : Based on User

                    case "RetrieveTradeDetailsBasedOnUser":

                        var userName = clientRequestWithParamsMap.get("UserName");
                        var tradeId = clientRequestWithParamsMap.get("Trade_Id");

                        // Build Query

                        var queryMap = new Map();

                        if (userName != null && userName != undefined) {

                            queryMap.set("UserName", userName);
                        }

                        if (tradeId != null && tradeId != undefined) {

                            queryMap.set("Trade_Id", tradeId);
                        }

                        mongoDbCrudModule.retrieveRecordFromTradeAndLcDatabase_BasedOnUser(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            queryMap,
                            TradeAndLCRecordsUpdateModule.handleQueryResults,
                            "TradeDetailsBasedOnUser",
                            req,
                            res);

                        console.log("Web Service: Switch Statement : Successfully retrieved the Trade Record details for User : " + userName);
                        break;

                    case "RetrieveLCDetailsBasedOnUser":

                        var userName = clientRequestWithParamsMap.get("UserName");
                        var lcId = clientRequestWithParamsMap.get("Lc_Id");

                        // Build Query

                        var queryMap = new Map();

                        if (userName != null && userName != undefined) {

                            queryMap.set("UserName", userName);
                        }

                        if (lcId != null && lcId != undefined) {

                            queryMap.set("Lc_Id", lcId);
                        }

                        mongoDbCrudModule.retrieveRecordFromTradeAndLcDatabase_BasedOnUser(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            queryMap,
                            TradeAndLCRecordsUpdateModule.handleQueryResults,
                            "LCDetailsBasedOnUser",
                            req,
                            res);

                        console.log("Web Service: Switch Statement : Successfully retrieved the LC Record details for User : " + userName);
                        break;

                    case "RetrieveAllRecordsBasedOnUser":

                        var userName = clientRequestWithParamsMap.get("UserName");

                        // Build Query

                        var queryMap = new Map();

                        if (userName != null && userName != undefined) {

                            queryMap.set("UserName", userName);
                        }

                        mongoDbCrudModule.retrieveRecordFromTradeAndLcDatabase_BasedOnUser(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            queryMap,
                            TradeAndLCRecordsUpdateModule.handleQueryResults,
                            "AllRecordsBasedOnUser",
                            req,
                            res);

                        console.log("Web Service: Switch Statement : Successfully retrieved the Record details for User : " + userName);
                        break;

                    // Status Retrieval

                    case "GetCurrentStatus":

                        break;

                    // Approvals and Shipment processing ( Status Change based on User Input Query )

                    case "ApproveTrade":

                        var statusToBeUpdated = "Trade_Approved";
                        TradeAndLCRecordsUpdateModule.updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            clientRequestWithParamsMap,
                            webClientRequest,
                            statusToBeUpdated,
                            res);

                        break;

                    case "RejectTrade":

                        var statusToBeUpdated = "Trade_Rejected";
                        TradeAndLCRecordsUpdateModule.updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            clientRequestWithParamsMap,
                            webClientRequest,
                            statusToBeUpdated,
                            res);

                        break;

                    case "ApproveLCRequest":

                        var statusToBeUpdated = "LC_Approved";
                        TradeAndLCRecordsUpdateModule.updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            clientRequestWithParamsMap,
                            webClientRequest,
                            statusToBeUpdated,
                            res);

                        break;

                    case "StartShipment":

                        var statusToBeUpdated = "Trade_Shipped";
                        TradeAndLCRecordsUpdateModule.updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            clientRequestWithParamsMap,
                            webClientRequest,
                            statusToBeUpdated,
                            res);

                        break;

                    case "LoadShipment":

                        var statusToBeUpdated = "Shipment_Loaded";
                        TradeAndLCRecordsUpdateModule.updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            clientRequestWithParamsMap,
                            webClientRequest,
                            statusToBeUpdated,
                            res);

                        break;

                    case "ApproveCustomsCheck":

                        var statusToBeUpdated = "Customs_Approved";
                        TradeAndLCRecordsUpdateModule.updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            clientRequestWithParamsMap,
                            webClientRequest,
                            statusToBeUpdated,
                            res);

                        break;

                    case "RejectCustomsCheck":

                        var statusToBeUpdated = "Customs_Rejected";
                        TradeAndLCRecordsUpdateModule.updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            clientRequestWithParamsMap,
                            webClientRequest,
                            statusToBeUpdated,
                            res);

                        break;

                    case "AcceptShipment":

                        var statusToBeUpdated = "Shipment_Accepted";
                        TradeAndLCRecordsUpdateModule.updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            clientRequestWithParamsMap,
                            webClientRequest,
                            statusToBeUpdated,
                            res);

                        break;

                    case "RequestPayment":

                        var statusToBeUpdated = "Payment_Requested";
                        TradeAndLCRecordsUpdateModule.updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            clientRequestWithParamsMap,
                            webClientRequest,
                            statusToBeUpdated,
                            res);

                        break;

                    case "MakePayment":

                        var statusToBeUpdated = "Payment_Made";
                        TradeAndLCRecordsUpdateModule.updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            clientRequestWithParamsMap,
                            webClientRequest,
                            statusToBeUpdated,
                            res);

                        break;

                    case "GenerateLC":

                        // Update the Status to be "LC_Generated" in Mongo DB

                        var statusToBeUpdated = "LC_Generated";
                        generateLCModule.generateLCAndUploadItToFileServer(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            clientRequestWithParamsMap,
                            webClientRequest,
                            statusToBeUpdated,
                            res);

                        break;

                    case "GenerateTradeAgreement":

                        // Generate Trade Agreement and Upload it to Server

                        generateTradeAgreementModule.generateTradeAgreement_AndUploadItToFileServer(dbConnection_TradeAndLcDatabase,
                            tradeAndLcTable_Name,
                            clientRequestWithParamsMap,
                            res);

                        break;

                    default:

                        console.error("Inappropriate Web Client Request received...exiting");

                        var failureMessage = "TradeFinanceWebService : Inappropriate Web Client Request received...exiting";
                        HelperUtilsModule.logBadHttpRequestError("TradeFinanceWebService", failureMessage, res);

                        break;

                }
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


