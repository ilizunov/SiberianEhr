JST['datetime-picker'] = '' +
    '<div class="row control-group date" data-show="model.hasYear">' +
        '<div class="controls">' +
            '<div class="input-append date datepicker span2">'+
                '<input type="text" data-value="model:getDateValue < .Year .Month .Day" class="input-small">'+
                '<span class="add-on"><em class="icon-calendar"></em></span>' +
            '</div>' +
            '<span class="help-inline error-message"></span>' +
        '</div>'+
    '</div>' +
    '<div class="row control-group time" data-show="model.hasHour">' +
        '<div class="controls">' +
            '<div class="input-append bootstrap-timepicker span2">'+
                '<input type="text" data-value="model:getTimeValue < .Hour .Minute .Second .Millisecond" class="input-small">'+
                '<span class="add-on"><em class="icon-time"></em></span>' +
            '</div>' +
        '</div>'+
    '</div>' +
    '<div class="row control-group clear">'+
        '<a class="btn remove"><i class="icon-remove"></i></a>' +
    '</div>' +
    '<div class="control-group">' +
        '<span class="label" data-text="model:rv_getValue < .Year .Month .Day .Hour .Minute .Second .Millisecond"></span>' +
        '<span class="label" data-text="model.Magnitude  < .Year .Month .Day .Hour .Minute .Second .Millisecond"></span>' +
    '</div>';