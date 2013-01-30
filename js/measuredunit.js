!function ($) {

    "use strict";
    JST['measured-unit'] = '' +
        '<div class="control-group">' +
        '<label class="control-label" for=""></label>' +
        '<div class="controls">' +
            '<div class="input-append">' +
            '<input data-value="model.Value" type="text" class="span1">' +
            '<select data-value="model.Unit" class="span1">' +
                '<option value="kg">kg</option>' +
                '<option value="t">t</option>' +
            '</select>' +
            '</div>' +
        '</div></div>';

    SiberianEHR.MeasuredUnit = Backbone.Model.extend({
        defaults: {
            PropertyName : "",  // Name of the measured property, e.g. "temperature"
            /** Array of possible measurement units
             *  Unit structure:
             *  {
             *      measure : "",           // measurement unit, e.g. "Celsius degrees" or "Fahrenheit degrees"
             *      minValue: undefined,    // minimal value
             *      maxValue: undefined,    // maximal value
             *      assumedValue: undefined,// assumed value - the value set to the control if user has not touched it
             *      //
             *      // Precision, in terms of number of decimal places
             *      // Value  0 implies integer value
             *      // Value -1 implies no rounding, the value is stored as is
             *      //
             *      precision: -1
             *  }*/
            Units : [],
            /**
             *
             * @param property  {string}    Measured property name. This is the first part of the key to find a rule
             *                              of conversion.
             *                              When called a real function we should pass this.get('propertyName')
             * @param fromUnit  {string}    Current measure unit name. This is the second part of the key.
             * @param toUnit    {string}    New measure unit name. This is the last part of key.
             * @param magnitude {number}    Current value
             *
             * @return {number} Value, measured in new units
             */
            convertValue: function (property, fromUnit, toUnit, magnitude) {
                throw new Error('Not implemented');
            },
            Unit: "",           // Current measurement unit value
            Value: undefined    // Current value
        },
        initialize: function(options) {
            /* Convention: Uppercase server variables */
            //Setting a property name if passed through options
            if (typeof options.PropertyName !== "undefined")
                this.set( { PropertyName : options.PropertyName } );
            //Deep copy of Units
            if (typeof options.Units !== "undefined"){
                var units = $.extend(true, {}, options.Units);
                this.set( { Units : units } );
            }
            //copying a callback function from options if set
            if (typeof options.convertValue === "function")
                this.set( {convertValue : options.convertValue} );
            //Setting a unit if passed through options
            if (typeof options.Unit !== "undefined")
                this.set( { Unit : options.Unit } );
            //Setting a value name if passed through options
            if (typeof options.Value !== "undefined")
                this.set( { Value : options.Value } );
            this.on('change:Unit', this.unitChanged, this);
        },
        unitChanged: function() {
            var previous = this.previousAttributes(),
                oldValue = this.get('Value');
            this.set('Value', this.convertValue(this.get('PropertyName'), previous.Unit, this.get('Unit'), oldValue));
        }
    });

    SiberianEHR.MeasuredUnitView = SiberianEHR.BindingView.extend({
        templateName: 'measured-unit'
    });


    $.fn.measuredUnit = function (options) {
        var settings = _.extend(options || {}, {
            Value: 1,
            Units: ['kg', 't'],
            Unit: 't',
            PropertyName : 'weight',
            /**
             * Sample measure unit converter to be exposed in measuredUnit widget
             *
             * @param property  {string}    Measured property name. This is the first part of the key to find a rule
             *                              of conversion.
             *                              When called a real function we should pass this.get('propertyName')
             * @param fromUnit  {string}    Current measure unit name. This is the second part of the key.
             * @param toUnit    {string}    New measure unit name. This is the last part of key.
             * @param magnitude {number}    Current value
             *
             * @return {number} Value, measured in new units
             */
            convertValue: function (property, fromUnit, toUnit, magnitude){
                var conversionRuleNotFoundMsg = 'Conversion rule not found';
                switch(property){
                    case 'weight':
                        if (fromUnit === 'kg' && toUnit === 't'){
                            return magnitude / 1000;
                        }
                        if (fromUnit === 't'  && toUnit === 'kg'){
                            return magnitude * 1000;
                        }
                        throw new Error(conversionRuleNotFoundMsg);
                        break;
                    default:
                        throw new Error(conversionRuleNotFoundMsg);
                        break;
                }
            }
        });

        var model = new SiberianEHR.MeasuredUnit({
            Value: settings.Value,
            Unit: settings.Unit,
            Units: settings.Units,
            PropertyName: settings.PropertyName,
            convertValue: settings.convertValue
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
