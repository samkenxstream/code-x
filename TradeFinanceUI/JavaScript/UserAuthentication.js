
var UserAuthenticationModule = (function () {

    var bDebug = false;
    var webServerPrefix = "http://127.0.0.1:3500/?";

    /****************************************************************************************
        User Logoff : Logoff from current session 
                    : Redirect to Home Page 
    *****************************************************************************************/

    function processLogoff(event) {

        alert("Logging out from TF Website");

        document.getElementById("Content-Navigation-bar").style.display = "none";
        document.getElementById("Login-Navigation-bar").style.display = "initial";

        var TFHomePage = document.getElementById("TradeFinance-HomePage");

        if (TFHomePage != null && TFHomePage != undefined) {

            TFHomePage.style.display = "initial";
        }
        
        document.location.replace("./TradeFinanceHome.html");

        // Clear the Local Cache : Current User Context

        RetrieveUserDetails_Module.initializeUserContextInLocalCache();
    }

    /****************************************************************************************
        User Registration : Signup the User with the details Provided
    *****************************************************************************************/

    function processUserRegistration(event) {

        var todaysDate = new Date();
        var uniqueUserId = "UserId_" + todaysDate.getYear().toString() + todaysDate.getMonth().toString() + todaysDate.getDate().toString() + todaysDate.getHours().toString() + todaysDate.getMinutes().toString() + todaysDate.getSeconds().toString();

        // Prepare Http Request from Form data for User Registration

        var userId_Value = uniqueUserId;
        var userType_Value = document.getElementById("User-Type").value;
        var name_Value = document.getElementById("User-Name").value;
        var shipment_Value = document.getElementById("User-Shipment").value;
        var location_Value = document.getElementById("User-Location").value;
        var email_Value = document.getElementById("User-Email").value;
        var address_Value = document.getElementById("User-Address").value;
        var userName_Value = document.getElementById("User-UserName").value;
        var password_Value = document.getElementById("User-Password").value;
        var repeatPassword_Value = document.getElementById("User-RepeatPassword").value;

        // Validations for "required / necessary" values

        if (userId_Value == null || userType_Value == null || name_Value == null || location_Value == null
            || email_Value == null || userName_Value == null || password_Value == null || repeatPassword_Value == null) {

            alert("one or many of the required input values are missing for User Registration : please try again");
            return;
        }

        if (userType_Value == "Seller") {

            if (shipment_Value == null || shipment_Value == undefined) {

                alert("Shipment Value field must be entered for Seller User Type");
                return;
            }

        }

        if (password_Value != repeatPassword_Value) {

            alert("Passwords did not confirm with each other : please try again");
            return;
        }

        // Default values for empty but required fields

        if (address_Value == null || address_Value == undefined) {
            address_Value = "Default_Address";
        }

        // Save the details in mongoDb

        var userRegistration_Keys = ["UserType", "User_Id", "Name", "Shipment", "Location", "Email", "Address", "UserName", "Password"];
        var userRegistration_Values = [userType_Value, userId_Value, name_Value, shipment_Value, location_Value, email_Value, address_Value, userName_Value, password_Value];
        var userRegistrationRecord = new Map();

        for (var index = 0; index < userRegistration_Keys.length; index++) {
            userRegistrationRecord.set(userRegistration_Keys[index], userRegistration_Values[index]);
        }

        var Client_Request = "UserRegistration";
        registerUser_MongoDB(userRegistrationRecord, Client_Request);

        // Return to Home-Page after capturing the User Registration input details
        document.getElementById("Signup-Popup").style.display = "none";

    }


    /****************************************************************************************
        User Registration : Register the user in Mongo DB
    *****************************************************************************************/

    function registerUser_MongoDB(userRegistrationRecord, Client_Request) {

        var xmlhttp;
        var httpRequestString = webServerPrefix;

        xmlhttp = new XMLHttpRequest();
        httpRequestString += "Client_Request=" + Client_Request;

        var userRegistrationKeys = userRegistrationRecord.keys();

        for (var currentKey of userRegistrationKeys) {

            httpRequestString += "&"
            httpRequestString += currentKey + "=" + userRegistrationRecord.get(currentKey);
        }

        xmlhttp.open("POST", httpRequestString, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.setRequestHeader("accept", "application/json");

        // Wait for Async response and Handle it in web page

        xmlhttp.onreadystatechange = function () {

            if (this.status == 200) {

                if (this.readyState == 4) {

                    //Parse the JSON Response Object

                    responseObject = JSON.parse(this.responseText);
                    alert(" Request Content: " + responseObject.Request + ", Status Content: " + responseObject.Status);

                } else {

                    if (bDebug == true) {

                        alert("Received intermediate success (200) response for userRegistration call :=> Status : " + this.status + " readyState : " + this.readyState);
                    }
                }

            // Invalid Client Request ( Incorrect User Details Like missing uniqueness  )

            } else if (this.status == 400) {

                if (this.readyState == 4) {

                    alert("Received failure response from Server for userRegistration call");
                    responseObject = JSON.parse(this.responseText);

                    alert(responseObject.Status);
                }

            // All Other Errors

            } else {

                alert("Received failure response for userRegistration call :=> Status : " + this.status + " readyState : " + this.readyState);
            }

        };

        if (bDebug == true) {

            alert("Saving the user registration detais in mongoDB => httpRequest : " + httpRequestString);
        }

        xmlhttp.send();

    }

    /****************************************************************************************
        User Authentication : Authenticate the User using input credentials
    *****************************************************************************************/

    function processUserAuthentication(event) {

        // Prepare Http Request from Form data for User Authentication

        if (bDebug == true) {

            alert("Authentication Request for Current User");
        }

        var userName_Value = document.getElementById("Authentication-UserName").value;
        var password_Value = document.getElementById("Authentication-Password").value;

        if (userName_Value == null || password_Value == null) {

            alert("One of UserName/Password are null : please try again");
            return;
        }

        // Save the details in mongoDb

        var userAuthentication_Keys = ["UserName", "Password"];
        var userAuthentication_Values = [userName_Value, password_Value];
        var userAuthenticationRecord = new Map();

        for (var index = 0; index < userAuthentication_Keys.length; index++) {
            userAuthenticationRecord.set(userAuthentication_Keys[index], userAuthentication_Values[index]);
        }

        var Client_Request = "UserAuthentication";
        authenticateUser_MongoDB(userAuthenticationRecord, Client_Request);

        // Return to Home-Page after capturing the User Authentication input details
        document.getElementById("Login-Popup").style.display = "none";

    }


    /****************************************************************************************
        User Authentication : Authenticate the user in Mongo DB
    *****************************************************************************************/

    function authenticateUser_MongoDB(userAuthenticationRecord, Client_Request) {

        authenticateUser_MongoDB(userAuthenticationRecord, Client_Request, null);
    }

    function authenticateUser_MongoDB(userAuthenticationRecord, Client_Request, AuthFailAction) {

        var xmlhttp;
        var httpRequestString = webServerPrefix;

        xmlhttp = new XMLHttpRequest();
        httpRequestString += "Client_Request=" + Client_Request;

        var userAuthenticationKeys = userAuthenticationRecord.keys();

        for (var currentKey of userAuthenticationKeys) {

            httpRequestString += "&"
            httpRequestString += currentKey + "=" + userAuthenticationRecord.get(currentKey);
        }

        xmlhttp.open("POST", httpRequestString, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.setRequestHeader("accept", "application/json");

        // Wait for Async response and Handle it in web page

        xmlhttp.onreadystatechange = function () {

            if (this.readyState == 4 && this.status == 200) {

                //Parse the JSON Response Object

                responseObject = JSON.parse(this.responseText);

                if (bDebug == true) {

                    alert(" Request Content: " + responseObject.Request);
                    alert(" Status Content: " + responseObject.Status);
                }

                if (responseObject.Request == "UserAuthentication" && responseObject.Status == "Authentication Successful") {

                    if (bDebug == true) {

                        alert("Logging in to TF Website");
                        alert("Login Successful. Setting Global => userAuthenticationRecord.get(UserName) : " + userAuthenticationRecord.get("UserName"));
                    }

                    // Store the current User Name in Local Cache

                    window.localStorage.setItem( FlowControlGlobalsModule.currentUserName_Key, userAuthenticationRecord.get("UserName") );

                    if (bDebug == true) {

                        alert("After setting Global => " + FlowControlGlobalsModule.currentUserName_Key + " : " + window.localStorage.getItem(FlowControlGlobalsModule.currentUserName_Key) );
                    }

                    // Filter the display based on logged-in User Type

                    filterDisplayBasedOnLoggedInUser( );
                }

            } else if (this.status == 200) {

                if (bDebug == true) {

                    alert("Received intermediary success response for userAuthentication call :=> Status : " + this.status + " readyState : " + this.readyState);
                }

            } else {

                if (this.readyState != 4) {

                    if (bDebug == true) {

                        alert("Received intermediary failure response for userAuthentication call :=> Status : " + this.status + " readyState : " + this.readyState);
                    }

                } else {

                    alert("Received failure response for userAuthentication call :=> Status : " + this.status + " readyState : " + this.readyState);
                }

                UserAuthenticationModule.processLogOffEvent(event);
            }

        };

        if (bDebug == true) {

            alert("User Authentication Request => httpRequest : " + httpRequestString);
        }

        xmlhttp.send();
    }

    /****************************************************************************************
        filterDisplayBasedOnLoggedInUser : Filter the display Based on User Type
    *****************************************************************************************/

    function filterDisplayBasedOnLoggedInUser( ) {

        // Hide Login Navigation & Display Content Navigation

        document.getElementById("Content-Navigation-bar").style.display = "initial";
        document.getElementById("Login-Navigation-bar").style.display = "none";
        document.getElementById("TradeFinance-HomePage").style.display = "none";

        // Set User Context

        // Build Query

        currentUserName = window.localStorage.getItem(FlowControlGlobalsModule.currentUserName_Key);

        var queryMap = new Map();
        queryMap.set("UserName", currentUserName);

        // Retrieve the Bank Name on load in local cache: Used for further Queries

        if (bDebug == true) {

            alert("filterDisplayBasedOnLoggedInUser : Before setting User Context Details : currentUserName : " + currentUserName);
        }

        RetrieveUserDetails_Module.retrieveUserDetailsAnd_SetContext(webServerPrefix, queryMap,
            "RetrieveUserDetailsBasedOnUserName", true);

    }

    /**********************************************************************************************************
        pageLoadUserAuthentication : Validate using current User Credentials stored in Local Storage
    ***********************************************************************************************************/

    function pageLoadUserAuthentication() {

        // Build Query

        var currentUser_UserNameVal = window.localStorage.getItem(FlowControlGlobalsModule.currentUser_UserName_Key);
        var currentUser_PasswordVal = window.localStorage.getItem(FlowControlGlobalsModule.currentUser_Password_Key);

        // Validate the credentials on every refresh & Pageload

        var authRecord = new Map();

        authRecord.set("UserName", currentUser_UserNameVal);
        authRecord.set("Password", currentUser_PasswordVal);
        authRecord.set("PasswordEncrypted", "True");

        UserAuthenticationModule.authenticateUser(authRecord, "UserAuthentication", "LogOff");
    }

    /****************************************************************************************
        Reveal private methods 
    *****************************************************************************************/

    return {

        processLogOffEvent: processLogoff,
        processUserRegistrationEvent: processUserRegistration,
        processUserAuthenticationEvent: processUserAuthentication,
        authenticateUser: authenticateUser_MongoDB,
        authenticateUserOnPageLoad: pageLoadUserAuthentication

    };

})();
