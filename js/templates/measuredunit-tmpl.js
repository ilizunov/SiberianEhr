JST['measured-unit'] = '' +
    '<div class="control-group">' +
        '<div class="controls">' +
            '<input data-value="model.Value" type="text" class="span1" name="Value" data-placeholder="model:getAssumedValue < model.Unit">' +
            '<select data-value="model.Unit" class="span1">' +
                '<option data-each-unit="model.unitsAsArray" data-value="unit:measure" data-text="unit:measure"></option>' +
            '</select>' +
            '<span class="help-inline"></span>'+
            '<div>' +
                '<span class="label" data-text="model.Value"></span>' +
                '<span class="label" data-text="model.Unit"></span>' +
            '</div>' +
        '</div>'+
    '</div>';