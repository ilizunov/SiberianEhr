JST['datetime-picker'] = '' +
    '<div class="control-group">' +
        '<div class="controls">' +
            '<div class="row">' +
                '<select data-value="model.Year" class="span2" data-show="model.hasYear" name="Year">' +
                    '<option data-each-year="model.ri_YearsArray" data-value="year:yearName" data-text="year:yearName"></option>' +
                '</select>' +
                '<select data-value="model.Month" class="span2" data-show="model.hasMonth">' +
                    '<option data-each-month="model.ri_MonthsArray" data-value="month:monthNumber" data-text="month:monthName"></option>' +
                '</select>' +
                '<select data-value="model.Day" class="span1" data-show="model.hasDay">' +
                    '<option data-each-month="model.ri_DaysArray" data-value="month:DayNumber" data-text="month:DayNumber"></option>' +
                '</select>' +
            '</div>'+
            '<div class="row">' +
                '<select data-value="model.Hour" class="span1" data-show="model.hasHour">' +
                    '<option data-each-hour="model.ri_HoursArray" data-value="hour:hourNumber" data-text="hour:hourNumber"></option>' +
                '</select>' +
                '<select data-value="model.Minute" class="span1" data-show="model.hasMinute">' +
                    '<option data-each-minute="model.ri_MinutesArray" data-value="minute:minuteNumber" data-text="minute:minuteNumber"></option>' +
                '</select>' +
                '<select data-value="model.Second" class="span1" data-show="model.hasSecond">' +
                    '<option data-each-second="model.ri_SecondsArray" data-value="second:secondNumber" data-text="second:secondNumber"></option>' +
                '</select>' +
            '</div>'+
            '<span class="label" data-text="model:getValue < .Year .Month .Day .Hour .Minute .Second .Millisecond"></span>' +
            '<span class="label" data-text="model.Magnitude"></span>' +
        '</div>'+
    '</div>';