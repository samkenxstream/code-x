
var FlowControlGlobalsModule = (function () {


    // Page Refresh Globals : After Completion of processing
    // ToDo : Use Events for better maintenance

    var inputDataProcessingEventInterval = 250;

    var tradeBuyerInputProcessed = false;
    var lcBuyerInputProcessed = false;
    

    /****************************************************************************************
        Reveal private methods & variables
    *****************************************************************************************/

    return {

        tradeBuyerInputProcessed: tradeBuyerInputProcessed,
        lcBuyerInputProcessed: lcBuyerInputProcessed,
        inputDataProcessingEventInterval: inputDataProcessingEventInterval
    };

})();
