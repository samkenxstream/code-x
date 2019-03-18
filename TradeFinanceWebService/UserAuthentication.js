
'use strict';

/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * User Registration & Authentication Module
 * 
 **************************************************************************
 **************************************************************************
 */


/*************************************************************************
 * 
 * Globals : Module Imports & Mongo DB Connection Variables
 * 
*************************************************************************/

// Generic Variables Global

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

//var randomSeed_ForPasswordHash = "RandomHashSeed";

var bDebug = false;

var cryptoModule = require('crypto');
var HelperUtilsModule = require('./HelperUtils');
var mongoDbCrudModule = require('./MongoDbCRUD')

/**
 * 
 * @param {any} recordObjectMap  : Map of <K,V> Pairs from Client Request
 * 
*/

function prepareUserRegistrationObject(recordObjectMap) {

    // Replace the "URL Space" with regular space in Record Object Map Values

    recordObjectMap = HelperUtilsModule.removeUrlSpacesFromMapValues(recordObjectMap);

    // Remove "Starting & Trailing Spaces" from Record Object Map Values

    recordObjectMap = HelperUtilsModule.removeStartingAndTrailingSpacesFromMapValues(recordObjectMap);

    // Prepare User Registration Object for MongoDB consumption

    console.log("prepareUserRegistrationObject : recordObjectMap.get(UserType) : " + recordObjectMap.get("UserType") + ", recordObjectMap.get(UserName) : " + recordObjectMap.get("UserName"));

    userData_Object.UserType = recordObjectMap.get("UserType");
    console.log("prepareUserRegistrationObject : After Assignment => userData_Object.UserType : " + userData_Object.UserType);

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

exports.addUserRegistrationRecordToDatabase = function (dbConnection, collectionName, recordObjectMap, requiredDetailsCollection, http_Response) {

    var userRegistrationResponseObject = null;

    console.log("addUserRegistrationRecordToDatabase : recordObjectMap.get(UserType) : " + recordObjectMap.get("UserType") + ", recordObjectMap.get(User_Id) : " + recordObjectMap.get("User_Id"));

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
        console.log("currentDocument_Object.UserType => " + currentDocument_Object.UserType);
    }

    // Remove URL Spaces before adding the Record to User Details Database

    currentDocument_Object = HelperUtilsModule.removeUrlSpacesFromObjectValues(currentDocument_Object);
    addRecordToUserDetailsDatabase_IfNotExists(dbConnection, collectionName, currentDocument_Object, http_Response);

    return true;
}


/**
 * 
 * @param {any} recordObjectMap  : Map of <K,V> Pairs from Client Request
 * 
 */

function prepareUserCredentialsObject (recordObjectMap) {


    // Replace the "URL Space" with regular space in Record Object Map Values

    recordObjectMap = HelperUtilsModule.removeUrlSpacesFromMapValues(recordObjectMap);

    // Remove "Starting & Trailing Spaces" from Record Object Map Values

    recordObjectMap = HelperUtilsModule.removeStartingAndTrailingSpacesFromMapValues(recordObjectMap);

    // Prepare User Registration Object for MongoDB consumption

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

exports.validateUserCredentials = function (dbConnection, collectionName, recordObjectMap, http_Response) {

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
            mongoDbCrudModule.directAdditionOfRecordToDatabase(dbConnection, collectionName, document_Object);

            userRegistrationResponseObject = { Request: "UserRegistration", Status: "Registration Successful" };
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

