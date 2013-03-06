JST['datetime-picker'] = '' +
    '<div class="control-group date" data-show="model.hasYear">' +
        '<div class="controls">' +
            '<div class="input-append date datepicker span2">'+
                '<input type="text" data-value="model:getDateValue < .Year .Month .Day" class="input-small">'+
                '<span class="add-on"><i class="icon-calendar"></i></span>' +
            '</div>' +
            '<span class="help-inline error-message"></span>' +
        '</div>'+
    '</div>' +
    '<div class="control-group time" data-show="model.hasHour">' +
        '<div class="controls">' +
            '<div class="input-append bootstrap-timepicker span2">'+
                '<input type="text" data-value="model:getTimeValue < .Hour .Minute .Second .Millisecond" class="input-small">'+
                '<span class="add-on"><i class="icon-time"></i></span>' +
            '</div>' +
        '</div>'+
    '</div>' +
    '<div class="control-group">' +
        '<span class="label" data-text="model:ri_getValue < .Year .Month .Day .Hour .Minute .Second .Millisecond"></span>' +
        '<span class="label" data-text="model.Magnitude  < .Year .Month .Day .Hour .Minute .Second .Millisecond"></span>' +
    '</div>';