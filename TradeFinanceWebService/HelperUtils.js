
'use strict';

/*************************************************************************
 * 
 * Globals : Module that handles Helper Utils
 * 
 *************************************************************************/

// Generic Variables Global

var bDebug = true;

/**************************************************************************
 **************************************************************************
 **************************************************************************
 * 
 * Module to handle => All the Helper Util Functions
 * 
 **************************************************************************
 **************************************************************************
 */

/**
 * 
 * @param {any} queryResult : query Result from mongo DB
 * 
 * @returns     queryResult_WithoutURLSpaces : queryResult with all values minus URL spaces
 * 
*/

exports.removeUrlSpacesFromObjectValues = function (queryResult) {

    // Modify the Values to remove URL Spaces

    var keys = Object.keys(queryResult);
    var values = Object.values(queryResult);

    for (var i = 0; i < values.length; i++) {

        var currentValue = String(values[i]);
        var regExpr = /%20/gi;
        currentValue = currentValue.replace(regExpr, " ");

        queryResult[keys[i]] = currentValue;
    }

    return queryResult;
}


/**
 * 
 * @param {any} inputMap : any map whose values need to be replaced without url space literals
 * 
 * @returns     inputMap : output Map with all values minus URL spaces
 * 
*/

exports.removeUrlSpacesFromMapValues = function (inputMap) {

    // Modify the Values to remove URL Spaces

    var keys = inputMap.keys();

    for (var currentKey of keys) {

        var currentValue = inputMap.get(currentKey);
        var regExpr = /%20/gi;
        currentValue = currentValue.replace(regExpr, " ");

        inputMap.set(currentKey, currentValue);
    }

    return inputMap;
}


/**
 * 
 * @param {any} inputObject : input Object that needs cleanup of Starting & Trailing Spaces
 * 
 * @returns     inputObject : Modified object with "values - "Starting & Trailing" spaces" 
 * 
*/

exports.removeStartingAndTrailingSpacesFromObjectValues = function (inputObject) {

    // Modify the Values to remove URL Spaces

    var keys = Object.keys(inputObject);
    var values = Object.values(inputObject);

    for (var i = 0; i < values.length; i++) {

        /*****************************************************
         *
         * To do : Give exception for password value depending on Password guidelines
         *
         
        if (keys[i] == "Password") {

            continue;
        }

        *****************************************************/

        var newValueWithoutSpaces = removeStartingAndTrailingSpacesFromString(values[i]);
        inputObject[keys[i]] = newValueWithoutSpaces;
    }

    return inputObject;
}


/**
 * 
 * @param {any} currentValue : String that needs cleanup of Starting & Trailing Spaces
 * 
 * @returns     newValueWithoutSpaces : Modified String with "value - "Starting & Trailing" spaces"
 * 
*/

function removeStartingAndTrailingSpacesFromString(currentValue) {

    if (bDebug == true) {

        console.log("removeStartingAndTrailingSpacesFromString => CurrentValue : " + currentValue);
    }

    // Remove Spaces at "Start & End"

    var startPointer = 0;
    var endPointer = 0;

    for (var j = 0; j < currentValue.length; j++) {

        if (currentValue[j] != ' ') {
            startPointer = j;
            break;
        }
    }

    for (var j = currentValue.length - 1; j >= 0; j--) {

        if (currentValue[j] != ' ') {
            endPointer = j;
            break;
        }
    }

    if (bDebug == true) {

        console.log("startPointer : " + startPointer + ", endPointer : " + endPointer);
    }

    var newValueWithoutSpaces = "";

    for (var j = startPointer; j <= endPointer; j++) {

        newValueWithoutSpaces = newValueWithoutSpaces + currentValue.substring(j, j + 1);
    }

    if (bDebug == true) {

        console.log("removeStartingAndTrailingSpacesFromString => newValueWithoutSpaces : " + newValueWithoutSpaces);
    }

    return newValueWithoutSpaces;
}


/**
 * 
 * @param {any} inputMap : input Object that needs cleanup of Starting & Trailing Spaces
 * 
 * @returns     inputMap : Modified object with "values - "Starting & Trailing" spaces"
 * 
*/

exports.removeStartingAndTrailingSpacesFromMapValues = function (inputMap) {

    if (bDebug == true) {

        console.log("removeStartingAndTrailingSpacesFromMapValues of length => " + inputMap.length);
    }

    // Modify the Values to remove URL Spaces

    var keys = inputMap.keys();

    for (var currentKey of keys) {

        var currentValue = inputMap.get(currentKey);

        var newValueWithoutSpaces = removeStartingAndTrailingSpacesFromString(currentValue);
        inputMap.set(currentKey, newValueWithoutSpaces);
    }

    return inputMap;
}

