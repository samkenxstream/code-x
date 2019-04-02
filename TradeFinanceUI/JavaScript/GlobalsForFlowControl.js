
var FlowControlGlobalsModule = (function () {


    // Page Refresh Globals : After Completion of processing

    var inputDataProcessingEventInterval = 250;

    var tradeBuyerInputProcessed = false;
    var lcBuyerInputProcessed = false;
    
    // User context Globals : Current User Related details

    var currentUserName_Key = "currentUserName";

    /****************************************************************************************
        Reveal private methods & variables
    *****************************************************************************************/

    return {

        tradeBuyerInputProcessed: tradeBuyerInputProcessed,
        lcBuyerInputProcessed: lcBuyerInputProcessed,
        inputDataProcessingEventInterval: inputDataProcessingEventInterval,
        currentUserName_Key: currentUserName_Key
    };

})();
