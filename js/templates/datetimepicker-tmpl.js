JST['datetime-picker'] = '' +
    '<div class="control-group">' +
        '<div class="controls">' +
            '<select data-value="model.Year" class="span1" data-show="model.format.hasYear">' +
                //'<option data-each-unit="model.unitsAsArray" data-value="unit:measure" data-text="unit:measure"></option>' +
            '</select>' +
            '<select data-value="model.Month" class="span1" data-show="model.format.hasMonth">' +
                '<option data-each-month="model.riMonthsArray" data-value="month:monthNumber" data-text="month:monthName"></option>' +
            '</select>' +
        '</div>'+
    '</div>';