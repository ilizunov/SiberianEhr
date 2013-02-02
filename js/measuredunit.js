!function ($) {

    "use strict";
    JST['measured-unit'] = '' +
        '<div class="control-group">' +
        '<label class="control-label" for="" data-text="model.PropertyName"></label>' +
        '<div class="controls">' +
            '<div class="input-append">' +
                '<input data-value="model.Value" type="text" class="span1" name="QuantityValue">' +
                '<select data-value="model.Unit" class="span1">' +
                    '<option value="kg">kg</option>' +
                    '<option value="t">t</option>' +
                '</select>' +
            '</div>' +
            '<span class="label" data-text="model.Value"></span>' +
            '<span class="label" data-text="model.Unit"></span>' +
        '</div></div>';

    SiberianEHR.MeasuredUnit = Backbone.Model.extend({
        defaults: {
            PropertyName : '',              // Name of the measured property, e.g. "temperature"
            Unit:  '',                      // Current measurement unit value
            Value: undefined,               // Current value
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
            Units: null,
            Required : true,                // specifies whether this value must be filled in
            /**
             * Measure unit converter function factory to be exposed in measuredUnit widget
             *
             * @param property  {string}    Measured property name. This is the first part of the key to find a rule
             *                              of conversion.
             *                              When called a real function we should pass this.get('propertyName')
             * @param fromUnit  {string}    Current measure unit name. This is the second part of the key.
             * @param toUnit    {string}    New measure unit name. This is the last part of key.
             *
             * @return {function} Value, measured in new units
             */
            getValueConverter: function (property, fromUnit, toUnit){
                throw new Error("Not implemented");
            },
            isBusy : false
        },
        initialize: function(options) {
            /* Convention: Uppercase server variables */
            if (typeof options === 'object'){
                this.set({
                    PropertyName : options.PropertyName || this.defaults.PropertyName,
                    Units: options.Units || this.defaults.Units,
                    Value: options.Value || this.defaults.Value,
                    Unit:  options.Unit  || this.defaults.Unit,
                    Required: options.Required || this.defaults.Required,
                    getValueConverter : options.getValueConverter
                });
            }
            this.on('change:Unit', this.unitChanged, this);
        },
        unitChanged: function() {
            var previous = this.previousAttributes();
            // In case Unit is specified via model.set for the first time (not via initial settings)
            // this event should not be triggered
            if (previous.Unit === this.defaults.Unit) return;
            var oldValue = this.get('Value');
            // Blocking the widget during recalculating a value
            this.set('isBusy', true );
            var convertFunctionFactory = this.get('getValueConverter');
            var convertFunction = convertFunctionFactory(this.get('PropertyName'), previous.Unit, this.get('Unit'));
            var newValue = convertFunction(oldValue);
            this.set('Value', newValue);
            // Unblocking the widget
            this.set('isBusy', false);
        }
    });

    SiberianEHR.MeasuredUnitView = SiberianEHR.BindingView.extend({
        templateName: 'measured-unit',
        attachValidation: function (){
            var rules = {};
            if (this.model.get('Required') === true){
                rules.QuantityValue = { required: true };
            }
            // TODO: handle the situation when field is empty, but we have specified assumed value
            // attach validate rules to the form, not the $el itself
            this.$el.parent().validate( {'rules': rules} );
        },
        validate: function(){
            this.$el.parent().valid();
        }
    });


    $.fn.measuredUnit = function (options) {
        var settings = _.extend(options || {}, {
            Value: 1,                       // Current value
            Required : true,                // specifies whether this value must be filled in
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
            Units: [
                {
                    measure: 'kg',
                    assumedValue: 0,
                    precision: 0            // integer number of kilograms
                },{
                    measure: 't',
                    assumedValue: 0,
                    precision: 3            // 3 decimal points, integer value of kilograms
                }
            ],
            Unit: 't', // Current measurement unit value
            PropertyName : 'weight', // Name of the measured property, e.g. "temperature"
            /**
             * Sample measure unit converter to be exposed in measuredUnit widget
             *
             * @param property  {string}    Measured property name. This is the first part of the key to find a rule
             *                              of conversion.
             *                              When called a real function we should pass this.get('propertyName')
             * @param fromUnit  {string}    Current measure unit name. This is the second part of the key.
             * @param toUnit    {string}    New measure unit name. This is the last part of key.
             *
             * @return {function} Value, measured in new units
             */
            getValueConverter: function (property, fromUnit, toUnit){
                var conversionRuleNotFoundMsg = 'Conversion rule not found';
                switch(property){
                    case 'weight':
                        if (fromUnit === 'kg'  && toUnit === 't'){
                            return function (value) {
                                return value / 1000;
                            };
                        }
                        if (fromUnit === 't'  && toUnit === 'kg'){
                            return function (value) {
                                return value * 1000;
                            }
                        }
                        throw new Error(conversionRuleNotFoundMsg);
                        break;
                    default:
                        throw new Error(conversionRuleNotFoundMsg);
                        break;
                }
            }
        });

        var model = new SiberianEHR.MeasuredUnit(settings);

        return this.each(function () {
            var $el = $(this),
                view = new SiberianEHR.MeasuredUnitView({
                    el: $el,
                    model: model
                });
            /**
             * Block UI while the model is busy
             */
            model.on('change:isBusy',
                function(){
                    if (model.get('isBusy'))
                        view.blockWidget();
                    else
                        view.unblockWidget();
                }, view);
            /**
             * On unit change doing re-validation
             */
            model.on('change:Unit', view.validate, view);
            view.render();
            view.attachValidation();
            // TODO: handle if data already exists
            $el.data('view', view);
        });
    };
}(window.jQuery);
