
/*************************************************************************
 * 
 * =================
 * To Do List:
 * =================
 * 
 * Modularize the service code
 * Move the globals to local params & return values
 * Decrypt the Client Requests after moving to HTTPS mode
 * Store the password ( user registration ) as Hash instead of Plain Text
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
    User_Id: "",
    Name: "",
    Location: "",
    Email: "",
    Address: "",
    UserName: "",
    Password: ""
};


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


    // Connect to Mongo DB, Create Database & Collections

    // Connect to "User Details" db for "User Registration & Authentication"  

    if (webClientRequest == "UserRegistration" || webClientRequest == "UserAuthentication") {

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

            console.log("Creating User Details Database : ");
            dbConnection_UserDetails_Database = db.db(userDetails_DatabaseName);

            // Table( Collection ) Creation

            dbConnection_UserDetails_Database.createCollection(userDetails_TableName, function (err, result) {

                if (err) {
                    console.log("Error while creating Collection ( Table ) in User Details mongoDb");
                    throw err;
                }

                console.log("Successfully created collection (userDetailsCollection)");
                console.log("Create Collection ( Table ) : Now Inserting Document ( Row :=> User Registration information )");
            });


            // Redirect the web Requests based on Query Key => Client_Request

            var registrationResult = null;

            switch (webClientRequest) {

                case "UserRegistration":

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

/*                case "UserAuthentication":

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
*/

                default:

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

                    break;

                case "ApproveLCRequest":

                    break;

                /*
                case "StartShipment":
    
                    break;
    
                case "AcceptShipment":
    
                    break;
    
                case "RequestPayment":
    
                    break;
    
                case "MakePayment":
    
                    break;
                */

                default:

                    console.error("Inappropriate Web Client Request received...exiting");
                    break;

            }

        });

    }

    //  close the db connection

    //db.close();
    //console.log("Closed the Db connection successfully");

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

    userData_Object.UserType = recordObjectMap.get("UserType");
    userData_Object.User_Id = recordObjectMap.get("User_Id");
    userData_Object.Name = recordObjectMap.get("Name");
    userData_Object.Location = recordObjectMap.get("Location");
    userData_Object.Email = recordObjectMap.get("Email");
    userData_Object.Address = recordObjectMap.get("Address");
    userData_Object.UserName = recordObjectMap.get("UserName");
    userData_Object.Password = recordObjectMap.get("Password");
}


/**
 * 
 * @param {any} dbConnection  : Connection to database
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any} recordObjectMap : Map of <K,V> Pairs ( Record ), to be added to Shipment Database : Trade And LC Table
 * @param {any} requiredDetailsCollection : required keys for record addition ( User Registration Record )
 *
 */

// ToDo : Store the Hash of the Password instead of PlainText 

function addUserRegistrationRecordToDatabase(dbConnection, collectionName, recordObjectMap, requiredDetailsCollection, http_Response) {

    http_Response.writeHead(200, { 'Content-Type': 'application/json' });
    var userRegistrationResponseObject = null;

    // Check if all the required fields are present before adding the record

    for (var i = 0; i < requiredDetailsCollection.length; i++) {

        var currentKey = requiredDetailsCollection[i];

        if (recordObjectMap.get(currentKey) == null || recordObjectMap.get(currentKey) == undefined) {

            console.error("addUserRegistrationRecordToDatabase : Value corresponding to required Key doesn't exist => Required Key : " + currentKey);

            var failureMessage = "Failure: Required Key doesn't exist => " + currentKey;
            userRegistrationResponseObject = { Request: "UserRegistration", Status: failureMessage };

            var userRegistrationResponse = JSON.stringify(userRegistrationResponseObject);
            http_Response.end(userRegistrationResponse);

            return false;
        }
    }

    // Prepare "User Registration" Object and add them to UserDetails Database

    prepareUserRegistrationObject(recordObjectMap);
    console.log("addUserRegistrationRecordToDatabase : All <K,V> pairs are present, Adding User Registration Record of Num Of  <k,v> Pairs => " + userData_Object.length);

    addRecordToUserDetailsDatabase_IfNotExists(dbConnection, collectionName, userData_Object, http_Response);

    return true;
}


/**
 * 
 * @param {any} dbConnection  : Connection to database 
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any} document_Object : Document object to be added ( Record, Row in Table )
 * 
 */

function addRecordToUserDetailsDatabase_IfNotExists(dbConnection, collectionName, document_Object, http_Response) {

    // Throw Error if User already Exists ; Add Record Otherwise

    var query = { User_Id: document_Object.User_Id };
    console.log("addRecordToUserDetailsDatabase_IfNotExists => collectionName :" + collectionName + ", User_Id :" + document_Object.User_Id);

    var userRegistrationResponseObject = null;

    // Build Response

    dbConnection.collection(collectionName).findOne(query, function (err, result) {

        if (err) {

            console.log("addRecordToUserDetailsDatabase_IfNotExists : Error while querying for document to be inserted");

            var failureMessage = "Failure: Unknown failure during User Registration";
            userRegistrationResponseObject = { Request: "UserRegistration", Status: failureMessage };
            var userRegistrationResponse = JSON.stringify(userRegistrationResponseObject);
            http_Response.end(userRegistrationResponse);

            throw err;
        }

        var recordPresent = (result) ? "true" : "false";

        // Add User Registration Record, If not already registered

        if (recordPresent == "false") {

            console.log("addRecordToUserDetailsDatabase_IfNotExists : Record Not Found, Adding New Record => " + " User Id : " + document_Object.User_Id);
            directAdditionOfRecordToDatabase(dbConnection, collectionName, document_Object);

            userRegistrationResponseObject = { Request: "UserRegistration", Status: "Registration Successful"};
            var userRegistrationResponse = JSON.stringify(userRegistrationResponseObject);
            http_Response.end(userRegistrationResponse);

        } else {

            // User Already Exists, Send Error Response

            console.log("User Already Registered => " + " User Id : " + document_Object.User_Id);

            var failureMessage = "Failure: User ( " + document_Object.Name + " ) was already registered";
            userRegistrationResponseObject = { Request: "UserRegistration", Status: failureMessage };
            var userRegistrationResponse = JSON.stringify(userRegistrationResponseObject);
            http_Response.end(userRegistrationResponse);

        }

    });

}


/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * Trade and LC record CRUD operations Module
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

        addRecordToTradeAndLcDatabase(dbConnection,
            collectionName,
            trade_Object);

    } else {
        prepareLcDocumentObject(recordObjectMap);

        console.log("addTradeAndLcRecordToDatabase : All <K,V> pairs are present, Adding LC Record of Num Of Pairs => " + lc_Object.length);

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
            console.log("Error while adding the Record to tradeAndLc Database collection");
            throw err;
        }
        console.log("Successfully added the record to the Trade and LC Table : " + document_Object.Trade_Id);
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
 * Trade and LC record CRUD operations Module
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

    queryResponse_JSON = {
        "Trade_Id": queryResult.Trade_Id, "Lc_Id": queryResult.Lc_Id, "Buyer": queryResult.Buyer, "Seller": queryResult.Seller,
        "Seller_Id": queryResult.Seller_Id, "Bank": queryResult.Bank, "Shipment": queryResult.Shipment, "Amount": queryResult.Amount,
        "ShipmentCount": queryResult.ShipmentCount, "Current_Status": queryResult.Current_Status, "Expiry_Date": queryResult.Expiry_Date,
        "Request_Location": queryResult.Request_Location
    };

    return queryResponse_JSON;
}


