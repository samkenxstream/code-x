
'use strict';

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

// Start Trade Finance Web Server and serve requests from web client ( Single Web Client )
// To do : Parallel Requests ( Validate and Fix any issues )

http.createServer(function (req, res) {

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Hello World! First Web Server completely from Scratch \n');

    console.log("req.url : ");
    console.log(req.url);

    console.log("req.url.query : ");
    console.log((url.parse(req.url)).query);

    var requestParams = (url.parse(req.url)).query;
    var requestParamsMap = requestParams.split("&");

    console.log("requestParamsMap after parsing URL : " );
    console.log(requestParamsMap);

    // Connect to Mongo DB

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
        var dbConnection_TradeAndLcDatabase = db.db(shipmentDatabase_Name);

        // Table( Collection ) Creation
        // ToDo: Check if the Table already exists and bail-out if it does 

        dbConnection_TradeAndLcDatabase.createCollection( tradeAndLcTable_Name, function (err, result) {

            if (err) {
                console.log("Error while creating Collection ( Table ) in shipmentTradeAndLc mongoDb");
                throw err;
            }

            console.log("Successfully created collection (tradeAndLcCollection)");
            console.log("Create Collection ( Table ) : Now Inserting Document ( Row :=> Trade & Letter Of Credit Details )");
        });

        // Spin off a Server instance to Serve Client Requests
        // Listens to Client Requests through "http AJAX & Rest calls"
        // To Do: Also implement Listening to events that control the behavior & operations of Server

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
            Shipment_Count: "25",
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

        //  close the db connection

        //db.close();
        //console.log("Closed the Db connection successfully");

    });

}).listen(port);


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
                directUpdationOfRecordToDatabase(dbConnection, collectionName, document_Object)
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

function directUpdationOfRecordToDatabase(dbConnection, collectionName, document_Object) {

    // Record Updation

    dbConnection.collection(collectionName).updateOne(document_Object, function (err, result) {

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
