
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
var mongoDbCrudModule = require('./MongoDbCRUD');
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


/*
*
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

*/


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

                    if (UserRecordsQueryAndUpdatesModule.retrieveUsers_BasedOnType(dbConnection_UserDetails_Database,
                        userDetails_TableName,
                        userType,
                        UserRecordsQueryAndUpdatesModule.handleUserDatabaseQueryResults,
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

                    if (TradeAndLCRecordsUpdateModule.addTradeAndLcRecordToDatabase(dbConnection_TradeAndLcDatabase,
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

                    if (TradeAndLCRecordsUpdateModule.addTradeAndLcRecordToDatabase(dbConnection_TradeAndLcDatabase,
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

                    mongoDbCrudModule.retrieveRecordFromTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        null,
                        null,
                        TradeAndLCRecordsUpdateModule.handleQueryResults,
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
                    var queriedTradeDetails = mongoDbCrudModule.retrieveRecordFromTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        tradeId,
                        null,
                        TradeAndLCRecordsUpdateModule.handleQueryResults,
                        req,
                        res);

                    console.log("Web Service: Switch Statement : Successfully retrieved the Trade Record details => " + queriedTradeDetails);

                    // Build Response
                    // Complete Response will be built in Call back function after the DB Query

                    res.writeHead(200, { 'Content-Type': 'application/json' });

                    break;

                case "RetrieveLCDetails":

                    var lcId = clientRequestWithParamsMap.get("Lc_Id");
                    var queriedLcDetails = mongoDbCrudModule.retrieveRecordFromTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        null,
                        lcId,
                        TradeAndLCRecordsUpdateModule.handleQueryResults,
                        req,
                        res);

                    console.log("Web Service: Switch Statement : Successfully retrieved the LC Record details => " + queriedLcDetails);

                    // Build Response
                    // Complete Response will be built in Call back function after the DB Query

                    res.writeHead(200, { 'Content-Type': 'application/json' });

                    break;

                case "ApproveTrade":

                    var statusToBeUpdated = "Trade_Approved";
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

                    /*
                    var statusToBeUpdated = "LC_Generated";
                    TradeAndLCRecordsUpdateModule.updateRecordStatusInTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        clientRequestWithParamsMap,
                        webClientRequest,
                        statusToBeUpdated,
                        res);

                    // Generate LC File on the Server Side

                    generateLCModule.generateLCAndUploadItToFileServer( clientRequestWithParamsMap,
                        res);
                    */

                    var statusToBeUpdated = "LC_Generated";
                    generateLCModule.generateLCAndUploadItToFileServer(dbConnection_TradeAndLcDatabase,
                        tradeAndLcTable_Name,
                        clientRequestWithParamsMap,
                        webClientRequest,
                        statusToBeUpdated,
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


