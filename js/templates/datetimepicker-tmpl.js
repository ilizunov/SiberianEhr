JST['datetime-picker'] = '' +
    '<div class="control-group">' +
        '<div class="controls">' +
            '<select data-value="model.Year" class="span1" data-show="model.hasYear">' +
                //'<option data-each-unit="model.unitsAsArray" data-value="unit:measure" data-text="unit:measure"></option>' +
            '</select>' +
            '<div id="monthPickerPart">' +
                '<select data-value="model.Month" class="span2" data-show="model.hasMonth">' +
                    '<option data-each-month="model.ri_MonthsArray" data-value="month:monthNumber" data-text="month:monthName"></option>' +
                '</select>' +
            '</div>' +
            '<div id="monthPickerPartControl">' +
                '<a class="btn" href="#" title="Specify month" id="add"><i class="icon-plus"></i></a>' +
                '<a class="btn" href="#" title="Remove month" id="remove"><i class="icon-remove"></i></a>' +
            '</div>' +
        '</div>'+
    '</div>';