
'use strict';

/*************************************************************************
 * 
 * Globals : Module that handles Helper Utils
 * 
 *************************************************************************/

// Generic Variables Global

var bDebug = false;

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
 * @returns     map_WithoutURLSpaces : output Map with all values minus URL spaces
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

