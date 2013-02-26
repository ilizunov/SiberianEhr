JST['datetime-picker'] = '' +
    '<div class="control-group">' +
        '<div class="controls">' +
            '<div class="input-append" id="date">'+
                '<input type="text" data-value="model:getDateValue < .Year .Month .Day" class="input-small">'+
                '<span class="add-on"><i class="icon-calendar"></i></span>' +
            '</div>' +
            '<span class="label" data-text="model:getValue < .Year .Month .Day .Hour .Minute .Second .Millisecond"></span>' +
            '<span class="label" data-text="model.Magnitude  < .Year .Month .Day .Hour .Minute .Second .Millisecond"></span>' +
        '</div>'+
    '</div>';