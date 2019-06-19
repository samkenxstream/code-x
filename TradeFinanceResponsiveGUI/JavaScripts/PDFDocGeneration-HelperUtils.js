
var PDFDocGenerationHelperUtilsModule = (function () {


    // Helper Module Globals

    var bDebug = false;

    var maxCharsInLine = 60;
    var spaceBetweenLines = 10;
    var bufferBetweenParagraphs = 15;

    /**
     * 
     * @param {any} placeString  : Place of document generation
     * @param {any} headerString  : Header of the Document ( Document Type )
     * @param {any} subjectLine  : Subject of the Document being generated
     * @param {any} dynamicContentParagraphList  : Dynamic content as a list of Paragraphs
     * @param {any} tradeDetails  : List of trade details in "Key:Value" format
     * @param {any} fileName  : Name of the PDF File to be generated
     *
    */

    function generatePDFDocForTradeFinance(placeString, headerString, subjectLine, dynamicContentParagraphList, tradeDetails, fileName) {


        // Standard CoOrdinates

        var X_CoOrdinate_Date_Place_String = 135;
        var X_CoOrdinate_Header_String = 75;
        var X_CoOrdinate_Paragraph_Start = 25;

        var X_CoOrdinate = 15;
        var Y_CoOrdinate = 30;


        // Create PDF File

        var pdfDoc = new jsPDF();


        /***********************************************************************************************************************
        **********       Standard Date Place Format         ********************************************************************
        ************************************************************************************************************************/

        // Date String

        var dateString = HelperUtilsModule.returnTodaysDateString();
        pdfDoc.text(X_CoOrdinate_Date_Place_String, Y_CoOrdinate, dateString);

        Y_CoOrdinate += spaceBetweenLines;

        // Place

        var placeString = "Place : " + placeString;
        pdfDoc.text(X_CoOrdinate_Date_Place_String, Y_CoOrdinate, placeString);

        Y_CoOrdinate += bufferBetweenParagraphs;


        /***********************************************************************************************************************
        **********       Standard Header & Subject Line            *************************************************************
        ************************************************************************************************************************/

        // Header

        pdfDoc.text(X_CoOrdinate_Header_String, Y_CoOrdinate, headerString);
        Y_CoOrdinate += bufferBetweenParagraphs;

        // Subject Section Details

        Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate_Paragraph_Start, Y_CoOrdinate,
            subjectLine, maxCharsInLine, spaceBetweenLines);
        Y_CoOrdinate += bufferBetweenParagraphs;


        /************************************************************************************************************************
        *********        Dynamic Content : In Standard Paragraphs format    *****************************************************
        *************************************************************************************************************************/

        for (var currentParagraph of dynamicContentParagraphList) {

            Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate,
                currentParagraph, maxCharsInLine, spaceBetweenLines);
            Y_CoOrdinate += bufferBetweenParagraphs;

        }

        // Trade Details

        for (var currentDetail of tradeDetails) {

            Y_CoOrdinate = HelperUtilsModule.printParagraphToPDFDocument(pdfDoc, X_CoOrdinate, Y_CoOrdinate,
                currentDetail, maxCharsInLine, spaceBetweenLines);

        }

        // Generate PDF File

        pdfDoc.save(fileName);

    }

    /****************************************************************************************
        Reveal private methods & variables
    *****************************************************************************************/

    return {

        generatePDFDocForTradeFinance: generatePDFDocForTradeFinance,

    };

})();
