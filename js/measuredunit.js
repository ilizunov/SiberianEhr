!function ($) {

    "use strict";
    JST['measured-unit'] = '' +
        '<div class="control-group">' +
        '<label class="control-label" for=""></label>' +
        '<div class="controls">' +
            '<div class="input-append">' +
            '<input data-value="model.Value" type="text" class="span1">' +
            '<select data-value="model.Unit" class="span1">' +
                '<option value="кг">кг</option>' +
                '<option value="т">т</option>' +
            '</select>' +
            '</div>' +
        '</div></div>';

    SiberianEHR.MeasuredUnit = Backbone.Model.extend({
        initialize: function(options) {
            /* Convention: Uppercase server variables */
            this.on('change:Unit', this.unitChanged, this);
        },
        unitChanged: function() {
            var previous = this.previousAttributes(),
                oldValue = this.get('Value');
            this.set('Value', this.getConverter(previous.Unit, this.get('Unit'))(oldValue));
        },
        /**
         * @param fromUnit
         * @param toUnit
         * @returns Function, that accepts value in old unit and should return value in new unit
         */
        getConverter: function(fromUnit, toUnit) {
            if (fromUnit === 'кг' && toUnit === 'т') {
                return function(value) {
                    return value / 1000;
                }
            }
            if (fromUnit === 'т' && toUnit === 'кг') {
                return function(value) {
                    return value * 1000;
                }
            }
            // TODO: raise error if converter not found
            // if (fromUnit === toUnit)
            return function(value) {return value};
        }
    });

    SiberianEHR.MeasuredUnitView = SiberianEHR.BindingView.extend({
        templateName: 'measured-unit'
    });


    $.fn.measuredUnit = function (options) {
        var settings = _.extend(options || {}, {
            Value: 1,
            Units: ['кг', 'т'],
            Unit: 'т'
        });

        var model = new SiberianEHR.MeasuredUnit({
            Value: settings.Value,
            Unit: settings.Unit
        });

        return this.each(function () {
            var $el = $(this),
                view = new SiberianEHR.MeasuredUnitView({
                    el: $el,
                    model: model
                });
            view.render();
            // TODO: handle if data already exists
            $el.data('view', view);
        });
    };
}(window.jQuery);
