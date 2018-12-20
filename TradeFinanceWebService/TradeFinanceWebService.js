
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

var shipmentDatabase_Name = "shipmentTradeAndLcDb";
var tradeAndLcTable_Name = "tradeAndLcCollection";

var mongoDbUrl = 'mongodb://127.0.0.1:27017/' + shipmentDatabase_Name;


// Trade & LC Maps and Record Objects

var tradeDetailsRequiredFields = ["Trade_Id", "Buyer", "Seller", "Shipment", "ShipmentCount", "Amount"];
var lcDetailsRequiredFields = ["Trade_Id", "Lc_Id", "Buyer", "Seller", "Seller_Id", "Bank", "Shipment",
    "ShipmentCount", "Amount", "Expiry_Date", "Request_Location"];

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
    
    // Parse the params from Web requests

    console.log("req.url : " + req.url );
    console.log("req.url.query : " + (url.parse(req.url)).query );

    var requestParams = (url.parse(req.url)).query;
    var requestParamsCollection = requestParams.split("&");

    console.log("requestParamsMap after parsing URL : " );
    console.log(requestParamsCollection);

    var clientRequestWithParamsMap = ParseWebClientRequest(requestParamsCollection);
    console.log("Parsed the Web Client Request : " + clientRequestWithParamsMap.get("Client_Request") + " Shipment Count : " + clientRequestWithParamsMap.get("ShipmentCount") );
    var webClientRequest = clientRequestWithParamsMap.get("Client_Request");

    // Build Response

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Hello World! First Web Server completely from Scratch \n');
    
    // Connect to Mongo DB, Create Database & Collections

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
                    res.end("Trade Finance Web Service: Successfully added Record for Trade");
                }
                else {

                    console.error("Web Service: Switch Statement : Failure while adding Record for Trade");
                    res.end("Trade Finance Web Service: Failure while adding Record for Trade");
                }

                break;

            case "RequestLC":

                if( addTradeAndLcRecordToDatabase( dbConnection_TradeAndLcDatabase,
                    tradeAndLcTable_Name,
                    clientRequestWithParamsMap,
                    lcDetailsRequiredFields,
                    true )) {

                    console.log("Web Service: Switch Statement : Successfully added Record for LC");
                    res.end("Trade Finance Web Service: Successfully added Record for LC");
                }
                else {

                    console.error("Web Service: Switch Statement : Failure while adding Record for LC");
                    res.end("Trade Finance Web Service: Failure while adding Record for LC");
                }

                break;

            case "RetrieveAllRecords":

                retrieveRecordFromTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
                    tradeAndLcTable_Name,
                    null,
                    null,
                    handleQueryResults);

                console.log("Web Service: Switch Statement : Successfully retrieved all the existing records");

                break;

            case "GetCurrentStatus":

                break;

            case "RetrieveTradeDetails":

                break;

            case "RetrieveLCDetails":

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

    // Spin off a Server instance to Serve Client Requests
    // Listens to Client Requests through "http AJAX & Rest calls"
    // To Do: Also implement Listening to events that control the behavior & operations of Server

    /*
    var todaysDate = new Date();
    var uniqueTradeId = "TradeId_" + todaysDate.getYear().toString() + todaysDate.getMonth().toString() + todaysDate.getDate().toString() + todaysDate.getHours().toString() + todaysDate.getMinutes().toString() + todaysDate.getSeconds().toString();
    var uniqueLcId = "LcId_" + todaysDate.getYear().toString() + todaysDate.getMonth().toString() + todaysDate.getDate().toString() + todaysDate.getHours().toString() + todaysDate.getMinutes().toString() + todaysDate.getSeconds().toString();

    var tradeAndLc_Object = {
        Trade_Id: uniqueTradeId,
        Lc_Id: uniqueLcId,
        Buyer: "BMW Hyd Dealer",
        Seller: "BMW Pvt Ltd",
        Bank: "Deutsche Bank",
        Shipment: "BMW X5",
        ShipmentCount: "25",
        Expiry_Date: "1/31/2019",
        LC_Amount: "625000",
        LC_Location: "Hyderabad",
        Current_Status: "LC_Requested"
    };

    // Add Records

    addRecordToTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
        tradeAndLcTable_Name,
        tradeAndLc_Object);

    /*removeRecordFromTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
        tradeAndLcTable_Name,
        "TradeId_200",
        null);*/

    // Retrieve the Records from shipment Trade & LC Database
/*
    // Query All Records

    retrieveRecordFromTradeAndLcDatabase(dbConnection_TradeAndLcDatabase,
        tradeAndLcTable_Name,
        null,
        null,
        handleQueryResults);

    // Trade Id query

    var tradeIdBasedQuery = "TradeId_1181119193728";
    retrieveRecordFromTradeAndLcDatabase( dbConnection_TradeAndLcDatabase,
        tradeAndLcTable_Name,
        tradeIdBasedQuery,
        null,
        handleQueryResults);

    // Lc Id query

    var lcIdBasedQuery = "LcId_1181119193728";
    retrieveRecordFromTradeAndLcDatabase( dbConnection_TradeAndLcDatabase,
        tradeAndLcTable_Name,
        null,
        lcIdBasedQuery,
        handleQueryResults);
*/

    //  close the db connection

    //db.close();
    //console.log("Closed the Db connection successfully");

}).listen(port);


/**
 * 
 * @param {any} clientRequestCollection  : List of <K,V> pairs from input http request
 * 
 */

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


/**
 * 
 * @param {any} recordObjectMap  : Map of <K,V> Pairs from Client Request
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
 * @param {any} recordObjectMap  : Map of <K,V> Pairs from Client Request
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

/**
 * 
 * @param {any} dbConnection  : Connection to database 
 * @param {any} collectionName  : Name of Table ( Collection )
 * @param {any[Optional]} Lc_Id : query Key => Letter of Credit Id
 * @param {any[Optional]} Trade_Id : query Key => Trade Id
 *
 */

function retrieveRecordFromTradeAndLcDatabase(dbConnection, collectionName, Trade_Identifier, Lc_Identifier, handleQueryResults) {

    // Record Retrieval based on "Lc_Id | Trade_Id | *(All Records)"

    var query = null;

    console.log("retrieveRecordFromTradeAndLcDatabase => collectionName :" + collectionName + " Trade_Identifier :" + Trade_Identifier + " Lc_Identifier :" + Lc_Identifier);

    if (Trade_Identifier != null) {

        query = { Trade_Id : Trade_Identifier };
    }
    else if (Lc_Identifier != null) {

        query = { Lc_Id: Lc_Identifier };
    }

    if (query) {

        dbConnection.collection(collectionName).findOne(query, function (err, result) {

            if (err) {
                console.log("Error while querying the Record from tradeAndLc Database => " + " Trade Id : " + Trade_Identifier + " LC Id : " + Lc_Identifier);
                throw err;
            }

            console.log("retrieveRecordFromTradeAndLcDatabase => Query for single Record => returned Answer : ");
            console.log(result);
            //handleQueryResults( null, result );
        });

    } else {

        dbConnection.collection(collectionName).find({}).toArray( function (err, result) {

            if (err) {
                console.log("Error while querying all the Records from tradeAndLc Database");
                throw err;
            }

            console.log("Successfully retrieved all the records through function (retrieveRecordFromTradeAndLcDatabase) => ");
            console.log(result);
            //handleQueryResults( null, result );
        });
    }
}

/**
 * 
 * @param {any} err  : Error returned to callback function
 * @param {any} result  : Database Query Result ( List of Records : 1 - n )
 * 
 */

function handleQueryResults(err, result) {

    if (err) {
        console.log("Error while retrieving all records of Shipment database : ");
        throw err;
    }

    console.log("Successfully retrieved all the records through function (retrieveRecordFromTradeAndLcDatabase) => ");
    console.log(result);
}
