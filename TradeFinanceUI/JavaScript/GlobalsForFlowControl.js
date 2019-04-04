
var FlowControlGlobalsModule = (function () {


    // Page Refresh Globals : After Completion of processing

    var inputDataProcessingEventInterval = 250;

    var tradeBuyerInputProcessed = false;
    var lcBuyerInputProcessed = false;
    
    // User context Globals : Current User Related details

    var currentUserName_Key = "currentUserName";

    var currentUser_UserType_Key = "currentUser_UserType";
    var currentUser_Name_Key = "currentUser_Name";
    var currentUser_Shipment_Key = "currentUser_Shipment";
    var currentUser_Location_Key = "currentUser_Location";
    var currentUser_Email_Key = "currentUser_Email";
    var currentUser_Address_Key = "currentUser_Address";
    var currentUser_UserName_Key = "currentUser_UserName";

    /****************************************************************************************
        Reveal private methods & variables
    *****************************************************************************************/

    return {

        // Page Refresh : Reload Form Data Globals

        tradeBuyerInputProcessed: tradeBuyerInputProcessed,
        lcBuyerInputProcessed: lcBuyerInputProcessed,
        inputDataProcessingEventInterval: inputDataProcessingEventInterval,

        // User Context of Current User

        currentUserName_Key: currentUserName_Key,
        currentUser_Name_Key: currentUser_Name_Key,
        currentUser_UserType_Key: currentUser_UserType_Key,
        currentUser_Shipment_Key: currentUser_Shipment_Key,
        currentUser_Location_Key: currentUser_Location_Key,
        currentUser_Email_Key: currentUser_Email_Key,
        currentUser_Address_Key: currentUser_Address_Key,
        currentUser_UserName_Key: currentUser_UserName_Key,

    };

})();
