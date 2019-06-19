
'use strict';

/*************************************************************************
 * 
 * Globals : Module that handles Helper Utils for PDF Document Generation
 * 
 *************************************************************************/

// Generic Variables Global

var bDebug = false;

var maxCharsInLine = 60;
var spaceBetweenLines = 10;
var bufferBetweenParagraphs = 15;

/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * Module to handle => Helper Util Functions for PDF Document Generation
 * 
 **************************************************************************
 **************************************************************************
 */

var jsPdfModule = require('jspdf');
var PDFDocHelperUtilsModule = require('./PDFDocHelperUtils');

/**
 * 
 * @returns dateString : Today's Date string in "Date: Today's Date"
 * 
*/

exports.returnTodaysDateString = function () {

    var todaysDate = new Date();
    var todaysMonth = parseInt(todaysDate.getMonth().toString());
    todaysMonth += 1;
    var todaysYear = parseInt(todaysDate.getYear().toString());
    todaysYear += 1900;

    var dateString = "Date : " + todaysDate.getDate().toString() + "-" + todaysMonth.toString() + "-" + todaysYear.toString();
    return dateString;
}

/**
 * 
 * @param {any} pdfDoc            : PDC Document File Handle
 * @param {any} X_CoOrdinate      : X Coordinate in the document to print the current content
 * @param {any} Y_CoOrdinate      : Y Coordinate in the document to print the current content
 * @param {any} strParagraph      : Current content to be printed in the document
 * @param {any} maxCharsInLine    : Maximum number of characters that can be printed in a single line
 * @param {any} spaceBetweenLines : Space between each line of the document
 *
 * @returns Y_CoOrdinate          : Current Y Coordinate after printing the content ( into number of lines )
 * 
*/

exports.printParagraphToPDF = function (pdfDoc, X_CoOrdinate, Y_CoOrdinate, strParagraph, maxCharsInLine, spaceBetweenLines) {

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
 * @param {any} placeString  : Place of document generation
 * @param {any} headerString : Header of the Document ( Document Type )
 * @param {any} subjectLine  : Subject of the Document being generated
 * @param {any} dynamicContentParagraphList  : Dynamic content as a list of Paragraphs
 * @param {any} tradeDetails  : List of trade details in "Key:Value" format
 *
 *
 * @returns pdfDocDataOutput    :  Output of PDF Document that got generated based on input Details
 * 
*/

exports.generatePDFDocForTradeFinance = function (placeString, headerString, subjectLine, dynamicContentParagraphList,
    tradeDetails) {

    // Standard CoOrdinates

    var X_CoOrdinate_Date_Place_String = 135;
    var X_CoOrdinate_Header_String = 75;
    var X_CoOrdinate_Paragraph_Start = 25;

    var X_CoOrdinate = 15;
    var Y_CoOrdinate = 30;


    // Create PDF File

    var pdfDoc = new jsPdfModule();


    /***********************************************************************************************************************
    **********       Standard Date Place Format         ********************************************************************
    ************************************************************************************************************************/

    // Date String

    var dateString = PDFDocHelperUtilsModule.returnTodaysDateString();
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

    Y_CoOrdinate = PDFDocHelperUtilsModule.printParagraphToPDF(pdfDoc, X_CoOrdinate_Paragraph_Start, Y_CoOrdinate,
        subjectLine, maxCharsInLine, spaceBetweenLines);
    Y_CoOrdinate += bufferBetweenParagraphs;


    /************************************************************************************************************************
    *********        Dynamic Content : In Standard Paragraphs format    *****************************************************
    *************************************************************************************************************************/

    for (var currentParagraph of dynamicContentParagraphList) {

        Y_CoOrdinate = PDFDocHelperUtilsModule.printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate,
            currentParagraph, maxCharsInLine, spaceBetweenLines);
        Y_CoOrdinate += bufferBetweenParagraphs;

    }

    // Trade Details

    for (var currentDetail of tradeDetails) {

        Y_CoOrdinate = PDFDocHelperUtilsModule.printParagraphToPDF(pdfDoc, X_CoOrdinate, Y_CoOrdinate,
            currentDetail, maxCharsInLine, spaceBetweenLines);

    }

    // Generate Data Output for pdfDoc

    var pdfDocDataOutput = pdfDoc.output();
    return pdfDocDataOutput;

}

