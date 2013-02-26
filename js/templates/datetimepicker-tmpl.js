JST['datetime-picker'] = '' +
    '<div class="control-group">' +
        '<div class="controls">' +
            '<div class="input-append date" id="date" data-show="model.hasYear">'+
                '<input type="text" data-value="model:getDateValue < .Year .Month .Day" class="input-small">'+
                '<span class="add-on"><i class="icon-calendar"></i></span>' +
            '</div>' +
            '<div class="input-append bootstrap-timepicker" id="time" data-show="model.hasHour">'+
                '<input type="text" data-value="model:getTimeValue < .Hour .Minute .Second .Millisecond" class="input-small">'+
                '<span class="add-on"><i class="icon-time"></i></span>' +
            '</div>' +
            '<span class="label" data-text="model:getValue < .Year .Month .Day .Hour .Minute .Second .Millisecond"></span>' +
            '<span class="label" data-text="model.Magnitude  < .Year .Month .Day .Hour .Minute .Second .Millisecond"></span>' +
        '</div>'+
    '</div>';