
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

    /***********************************************************************************************************
        uncheckTheSelectedBoxesInTable : Uncheck the Selected Boxes in Table
    ************************************************************************************************************/

    function uncheckTheSelectedBoxesInTable(tableId) {

        // Find the Selected Boxes and toggle the selection

        var tableElementRows = document.getElementById(tableId).rows;
        var tableElementRowsLength = document.getElementById(tableId).rows.length;
        var currentRowCells = tableElementRows[0].cells;
        var selectionBoxIndexInTable = currentRowCells.length - 1;

        if (bDebug == true) {

            alert("tableElementRows : " + tableElementRows);
            alert("tableElementRowsLength : " + tableElementRowsLength);
        }

        for (var i = 0; i < tableElementRowsLength; i++) {

            if (bDebug == true) {

                alert("currentRow.SelectionCell.Child : " + tableElementRows[i].cells[selectionBoxIndexInTable].childNodes[0]);
                alert("currentRow.SelectionCell.Child Node Type : " + tableElementRows[i].cells[selectionBoxIndexInTable].childNodes[0].type);
                alert("currentRow.SelectionBox.Child Node Value : " + tableElementRows[i].cells[selectionBoxIndexInTable].childNodes[0].checked);
            }

            if (tableElementRows[i].cells[selectionBoxIndexInTable].childNodes[0] != null &&
                tableElementRows[i].cells[selectionBoxIndexInTable].childNodes[0].checked == true) {

                tableElementRows[i].cells[selectionBoxIndexInTable].childNodes[0].checked = false;
            }
        }

    }

    /****************************************************************************************
        Reveal private methods
    *****************************************************************************************/

    return {

        removeAllTheExistingRowsFromTable: removeTheExistingRowsFromTable,
        toggleSelectionBoxesInTable: uncheckTheSelectedBoxesInTable

    };

})();
