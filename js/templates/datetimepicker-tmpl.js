JST['datetime-picker'] = '' +
    '<div class="control-group">' +
        '<div class="controls">' +
            '<select data-value="model.Year" class="span2" data-show="model.hasYear" name="Year">' +
                '<option data-each-year="model.ri_YearsArray" data-value="year:yearName" data-text="year:yearName"></option>' +
            '</select>' +
            '<div id="monthPickerPartControl" class="row">' +
                '<div id="monthPickerPart" class="span2">' +
                    '<select data-value="model.Month" class="span2" data-show="model.hasMonth">' +
                        '<option data-each-month="model.ri_MonthsArray" data-value="month:monthNumber" data-text="month:monthName"></option>' +
                    '</select>' +
                '</div>' +
                '<a class="btn" href="#" title="Specify month" id="add" data-hide="model.hasMonth"><i class="icon-plus"></i></a>' +
                '<a class="btn" href="#" title="Remove month" id="remove" data-show="model.hasMonth"><i class="icon-remove"></i></a>' +
            '</div>'+
            '<div id="dayPickerPartControl" class="row">' +
                '<div id="dayPickerPart" class="span2">' +
                    '<select data-value="model.Day" class="span2" data-show="model.hasDay">' +
                        '<option data-each-month="model.ri_DaysArray" data-value="month:DayNumber" data-text="month:DayNumber"></option>' +
                    '</select>' +
                '</div>' +
                '<a class="btn" href="#" title="Specify day" id="add" data-hide="model.hasDay"><i class="icon-plus"></i></a>' +
                '<a class="btn" href="#" title="Remove day" id="remove" data-show="model.hasDay"><i class="icon-remove"></i></a>' +
            '</div>'+
        '</div>'+
    '</div>';