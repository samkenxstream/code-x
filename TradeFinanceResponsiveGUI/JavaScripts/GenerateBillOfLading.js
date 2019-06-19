
var GenerateBillOfLadingModule = (function () {

    var bDebug = false;

    /****************************************************************************************
        Generate 'Bill of Lading' Based on Selected Input
    *****************************************************************************************/

    function GenerateBillOfLadingOnWebClientEnd(billOfLadingMap) {

        var placeString = billOfLadingMap.get("carrierLocation");
        var headerString = "Bill of Lading";
        var subjectLine = "Subject: Bill of Lading for shipment of Goods & Services of " + billOfLadingMap.get("shipment");

        /*************************************************************************************************************************
         *********                Dynamic Content         ***********************************************************************
        *************************************************************************************************************************/

        // First Paragraph Content

        var billOfLading_Paragraph1 = "This document notifies & certifies that the shipment " + billOfLadingMap.get("shipment") +
            " was handed over by seller " + billOfLadingMap.get("seller") + " to Carrier " + billOfLadingMap.get("carrierName") +
            " at " + billOfLadingMap.get("carrierLocation") + ".";

        // Second Paragraph Content

        var billOfLading_Paragraph2 = "Carrier certifies the receipt of Shipment from Seller on " +
            HelperUtilsModule.returnTodaysDateString() + " and has planned to transport shipment to Destination Port." +
            "Container details of Shipment " + billOfLadingMap.get("shipment") + "can be found below.";

        var dynamicContentParagraphList = [billOfLading_Paragraph1, billOfLading_Paragraph2];

        // Trade Details

        var tradeDetails_Header = "Carrier & Container Details :";
        var tradeDetails_Header_Separator = "=============================";
        var tradeDetails_Shipment = "Shipment Details : " + billOfLadingMap.get("shipment") + "(" +
                                    billOfLadingMap.get("shipmentCount") + ")";
        var tradeDetails_Buyer = "Buyer : " + billOfLadingMap.get("buyer");
        var tradeDetails_Seller = "Seller : " + billOfLadingMap.get("seller");
        var tradeDetails_Carrier = "Carrier : " + billOfLadingMap.get("carrierName");
        var tradeDetails_CarrierLocation = "Carrier Location : " + billOfLadingMap.get("carrierLocation");
        var tradeDetails_CarrierAddress = "Carrier Address : " + billOfLadingMap.get("carrierAddress");
        var tradeDetails_ContainerId = "Container Identifier : " + Math.random().toString();

        var tradeDetails = [tradeDetails_Header, tradeDetails_Header_Separator, tradeDetails_Shipment, tradeDetails_Buyer,
            tradeDetails_Seller, tradeDetails_Carrier, tradeDetails_CarrierLocation, tradeDetails_CarrierAddress, tradeDetails_ContainerId];

        var fileName = "BillOfLading-" + billOfLadingMap.get("taId") + ".pdf";

        // Generate BillOfLading

        PDFDocGenerationHelperUtilsModule.generatePDFDocForTradeFinance(placeString, headerString, subjectLine,
            dynamicContentParagraphList, tradeDetails, fileName);

    }

    /****************************************************************************************
        Reveal private methods
    *****************************************************************************************/

    return {

        GenerateBillOfLadingOnClientSide: GenerateBillOfLadingOnWebClientEnd
    };

})();


