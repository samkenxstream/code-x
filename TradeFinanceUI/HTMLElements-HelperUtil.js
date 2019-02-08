
var HTMLElementsUtilModule = (function () {

    var bDebug = false;

    /***********************************************************************************************************
        removeTheExistingRowsFromTable : delete the existing rows from Table
    ************************************************************************************************************/

    function removeTheExistingRowsFromTable(tableId) {

        var tableElement_NumOfRows = document.getElementById(tableId).rows.length;

        if (bDebug == true) {

            alert("removeAllTheExistingRowsFromTable : Number Of Rows To Be Deleted => " + tableElement_NumOfRows);
        }

        while (tableElement_NumOfRows > 1) {

            document.getElementById(tableId).deleteRow(tableElement_NumOfRows - 1);
            tableElement_NumOfRows = document.getElementById(tableId).rows.length;
        }
    }

    /****************************************************************************************
        Reveal private methods
    *****************************************************************************************/

    return {

        removeAllTheExistingRowsFromTable: removeTheExistingRowsFromTable
    };

})();
