
'use strict';

/*************************************************************************
 * 
 * Globals : Module that handles Helper Utils for PDF Document Generation
 * 
 *************************************************************************/

// Generic Variables Global

var bDebug = false;

/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * Module to handle => Helper Util Functions for PDF Document Generation
 * 
 **************************************************************************
 **************************************************************************
 */

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

