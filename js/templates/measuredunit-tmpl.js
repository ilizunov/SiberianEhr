JST['measured-unit'] = '' +
    '<div class="control-group">' +
        '<div class="controls">' +
            '<input data-value="model.Value" type="text" class="span1" name="Value" data-placeholder="model:getAssumedValue < model.Unit">' +
            '<select data-value="model.Unit" class="span1">' +
                '<option data-each-unit="model.rv_unitsAsArray" data-value="unit:measure" data-text="unit:measure"></option>' +
            '</select>' +
            '<a class="btn remove"><i class="icon-remove"></i></a>' +
            '<span class="help-inline"></span>'+
            '<div>' +
                '<span class="label" data-show="model.Value">' +
                    '<span data-text="model.Value"></span> &nbsp;' +
                    '<span data-text="model.Unit"></span>' +
                '</span>' +
            '</div>' +
        '</div>'+
    '</div>';