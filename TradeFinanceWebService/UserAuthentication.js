
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
    Password: "",
    PasswordEncrypted: ""
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

    userData_Object._id = recordObjectMap.get("User_Id");
    userData_Object.Name = recordObjectMap.get("Name");
    userData_Object.Shipment = recordObjectMap.get("Shipment");

    console.log("prepareUserRegistrationObject : userData_Object.AffiliatedBank : " + userData_Object.AffiliatedBank);
    userData_Object.AffiliatedBank = recordObjectMap.get("AffiliatedBank");

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

exports.addUserRegistrationRecordToDatabase = function (dbConnection, collectionName, recordObjectMap, requiredDetailsCollection, http_Response) {

    // Check the uniqueness of UserName before registering the User Details Record

    // Check if the request has UserName

    if (recordObjectMap.get("UserName") == null || recordObjectMap.get("UserName") == undefined ) {

        console.log("addUserRegistrationRecordToDatabase : Missing UserName in User Details Records");
        var failureMessage = "Failure: Blank UserName in input Request";

        buildErrorResponse_ForUserAuthentication(failureMessage, http_Response);
        return false;
    }

    // DB Query

    var query = { UserName: recordObjectMap.get("UserName") };
    console.log("addUserRegistrationRecordToDatabase => collectionName :" + collectionName + ", UserName :" + query.UserName);

    // Validate Uniqueness of UserName in User Details database

    dbConnection.collection(collectionName).findOne(query, function (err, result) {

        if (err) {

            console.error("UserAuthentication.addUserRegistrationRecordToDatabase : Internal Server Error while querying DB for UserName");

            var failureMessage = "UserAuthentication.addUserRegistrationRecordToDatabase : Internal Server Error while querying DB for UserName";
            HelperUtilsModule.logInternalServerError("addUserRegistrationRecordToDatabase", failureMessage, http_Response);

            return false;
        }

        var recordPresent = (result) ? "true" : "false";

        // Check for the presence of User Record
        // Register if not present. Return Error if UserName Already Exists

        if (recordPresent == "false") {

            registerUserInUserDetailsDatabase(dbConnection, collectionName, recordObjectMap, requiredDetailsCollection, http_Response);

        } else {

            console.log("addUserRegistrationRecordToDatabase : UserName was already registered : " + query.UserName);
            var failureMessage = "addUserRegistrationRecordToDatabase : UserName was already registered : " + query.UserName;

            buildErrorResponse_ForUserAuthentication(failureMessage, http_Response);
        }

    });

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

 function registerUserInUserDetailsDatabase(dbConnection, collectionName, recordObjectMap, requiredDetailsCollection, http_Response) {

    var userRegistrationResponseObject = null;

     console.log("registerUserInUserDetailsDatabase : recordObjectMap.get(UserType) : " + recordObjectMap.get("UserType") + ", recordObjectMap.get(User_Id) : " + recordObjectMap.get("User_Id"));

    // Check if all the required fields are present before adding the record

    for (var i = 0; i < requiredDetailsCollection.length; i++) {

        var currentKey = requiredDetailsCollection[i];

        if (recordObjectMap.get(currentKey) == null || recordObjectMap.get(currentKey) == undefined) {

            console.error("registerUserInUserDetailsDatabase : Value corresponding to required Key doesn't exist => Required Key : " + currentKey);

            var failureMessage = "Failure: Required Key doesn't exist => " + currentKey;
            userRegistrationResponseObject = { Request: "UserRegistration", Status: failureMessage };
            var userRegistrationResponse = JSON.stringify(userRegistrationResponseObject);

            http_Response.writeHead(400, { 'Content-Type': 'application/json' });
            http_Response.end(userRegistrationResponse);

            return false;
        }
    }

    // Prepare "User Registration" Object and add them to UserDetails Database

    console.log("registerUserInUserDetailsDatabase => prepareUserRegistrationObject : Num Of  <k,v> Pairs of recordObjectMap => " + recordObjectMap.size);
    var currentDocument_Object = prepareUserRegistrationObject(recordObjectMap);

    console.log("registerUserInUserDetailsDatabase : All <K,V> pairs are present, Adding User Registration Record of Num Of  <k,v> Pairs => " + Object.keys(currentDocument_Object).length);

    // Check the userData_Object after value assignment

    if (bDebug == true) {

        console.log("registerUserInUserDetailsDatabase : userData_Object values after converting from Map => ");
        console.log("registerUserInUserDetailsDatabase.currentDocument_Object.UserType => " + currentDocument_Object.UserType);
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
    credentialsData_Object.PasswordEncrypted = recordObjectMap.get("PasswordEncrypted");
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

            console.error("UserAuthentication.validateUserCredentials : Internal Server Error while querying DB for User Credentials");

            var failureMessage = "UserAuthentication.validateUserCredentials : Internal Server Error while querying DB for User Credentials";
            HelperUtilsModule.logInternalServerError("validateUserCredentials", failureMessage, http_Response);

            return;
        }

        var recordPresent = (result) ? "true" : "false";

        // Check for the presence of User Record

        if (recordPresent == "false") {

            console.log("validateUserCredentials : UserName was not registered : " + document_Object.UserName);
            var failureMessage = "validateUserCredentials : UserName was not registered : " + document_Object.UserName;

            buildErrorResponse_ForUserAuthentication(failureMessage, http_Response);

        } else {

            // User Exists. Validate the Password ( ToDo: Generate Hash and validate against the existing Password Hash)

            console.log("validateUserCredentials : User Exists. Validate the Credentials for User : " + document_Object.UserName);

            var inputPasswordHash = null;

            // Check if Password has already been Encrypted

            if (document_Object.PasswordEncrypted == "True") {

                inputPasswordHash = document_Object.Password;

            } else {

                inputPasswordHash = cryptoModule.createHash('md5').update(document_Object.Password).digest('hex');
            }

            // Password comparison 

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

    // "Log & Return" Error if User already Exists ; Add Record Otherwise

    var query = { UserName: document_Object.UserName };
    console.log("addRecordToUserDetailsDatabase_IfNotExists => collectionName :" + collectionName + ", UserName :" + document_Object.UserName);

    var userRegistrationResponseObject = null;

    // Build Response

    dbConnection.collection(collectionName).findOne(query, function (err, result) {

        if (err) {

            console.error("UserAuthentication.addRecordToUserDetailsDatabase_IfNotExists : Internal Server Error while " +
                + "querying DB to check for existence of current user record(duplicacy validation)");

            var failureMessage = "UserAuthentication.addRecordToUserDetailsDatabase_IfNotExists : Internal Server Error while " +
                + "querying DB to check for existence of current user record(duplicacy validation)";
            HelperUtilsModule.logInternalServerError("addRecordToUserDetailsDatabase_IfNotExists", failureMessage, http_Response);

            return;
        }

        var recordPresent = (result) ? "true" : "false";

        // Add User Registration Record, If not already registered

        if (recordPresent == "false") {

            console.log("addRecordToUserDetailsDatabase_IfNotExists : Record Not Found, Adding New Record => " + " UserName : " + document_Object.UserName);
            mongoDbCrudModule.directAdditionOfRecordToDatabase(dbConnection, collectionName, document_Object, "UserRegistration", http_Response);

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

