
var HelperUtilsModule = (function () {


    // Helper Module Globals

    var bDebug = false;

    /****************************************************************************************
        Prints paragraph into the document by splitting it based on input parameters
    *****************************************************************************************/

    function returnTodaysDateString() {

        var todaysDate = new Date();
        var todaysMonth = parseInt(todaysDate.getMonth().toString());
        todaysMonth += 1;
        var todaysYear = parseInt(todaysDate.getYear().toString());
        todaysYear += 1900;

        var dateString = "Date : " + todaysDate.getDate().toString() + "-" + todaysMonth.toString() + "-" + todaysYear.toString();
        return dateString;

    }

    /****************************************************************************************
        Prints paragraph into the document by splitting it based on input parameters
    *****************************************************************************************/

    function printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate, strParagraph, maxCharsInLine, spaceBetweenLines) {

        var totalLenth = strParagraph.length;
        var startPos = 0;

        while (startPos < totalLenth) {

            var currentLine = strParagraph.substr(startPos, maxCharsInLine);
            pdfDoc.text(X_CoOrdinate, Y_CoOrdinate, currentLine);

            Y_CoOrdinate += spaceBetweenLines;
            startPos += maxCharsInLine;
        }

        return Y_CoOrdinate;

    }

    /**
     * 
     * @param {any} inputValue  : inputValue whose value needs to be checked
     * 
     * @returns {any} "true/false": Return 'true' if defined 'false' otherwise
     *
    */

    function valueDefined(inputValue) {

        if (inputValue == null || inputValue == undefined) {

            return false;
        }

        return true;

    }

    /**
     * 
     * @param {any} elementId  : id of element whose data needs to be filled
     * @param {any} elementValue  : value that needs to be filled
     *
    */

    function setValueOfDocumentElement(elementId, elementValue) {

        if ( valueDefined(document.getElementById(elementId) ) ) {

            document.getElementById(elementId).innerHTML = elementValue;
        }

    }

    /**
     * 
     * @param {any} elementId  : id of element whose data needs to be filled
     * @param {any} elementValue  : value that needs to be filled
     *
    */

    function setValueOfDocumentElementThroughMap(elementsMap, elementKey, elementValue) {

        var elementId = elementsMap.get(elementKey);

        if ( valueDefined(elementId) && valueDefined(document.getElementById(elementId)) ) {

            document.getElementById(elementId).innerHTML = elementValue;
        }

    }

    /****************************************************************************************
        Reveal private methods & variables
    *****************************************************************************************/

    return {

        printParagraphToPDFDocument: printParagraphToPDF,
        returnTodaysDateString: returnTodaysDateString,
        valueDefined: valueDefined,
        fillDataInDocumentElement: setValueOfDocumentElement,
        fillDataInDocumentElementThroughMap: setValueOfDocumentElementThroughMap

    };

})();
