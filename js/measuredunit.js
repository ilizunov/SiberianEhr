!function ($) {

    "use strict";

    SiberianEHR.MeasuredUnit = Backbone.Model.extend({
        defaults: {
            PropertyName : '',              // Name of the measured property, e.g. "temperature"
            Unit:  '',                      // Current measurement unit value
            Value: undefined,               // Current value
            /** Array of possible measurement units
             *  Unit structure - object. Key is measure
             *  {
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
            Required : false,                // specifies whether this value must be filled in
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
            /**
             * Field indicates busy model state (e.g. server calculation or validation). When Model is busy it is
             * supposed to be disabled for user's input
             */
            isBusy : false,
            /**
             * Field indicates the error model state
             */
            error: undefined
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

            /**
             * Creating the structure for selecting measurements, because rivets can only iterate arrays, not objects
             */
            var unit, unitsPattern = '';
            for (unit in this.get('Units')){ // traversing through keys
                unitsPattern += '<option value="'+unit+'">'+unit+'</option>';
            }

            JST['measured-unit'] = '' +
                '<div class="control-group">' +
                    '<label class="control-label" for="" data-text="model.PropertyName"></label>' +
                    '<div class="controls">' +
                        '<input data-value="model.Value" type="text" class="span1" name="Value" data-placeholder="model:getAssumedValue < model.Unit">' +
                        '<span class="help-inline" data-text="model.error"></span>'+
                        '<select data-value="model.Unit" class="span1">' +
                            unitsPattern +
                        '</select>' +
                        '<div>' +
                            '<span class="label" data-text="model.Value"></span>' +
                            '<span class="label" data-text="model.Unit"></span>' +
                        '</div>' +
                    '</div>'+
                '</div>';

            this.on('change:Unit', this.unitChanged, this);
        },
        unitChanged: function() {
            var previous = this.previousAttributes();
            // In case Unit is specified via model.set for the first time (not via initial settings)
            // this event should not be triggered
            if (previous.Unit === this.defaults.Unit) return;
            var oldValue = this.get('Value');
            if (typeof oldValue === 'undefined')
            {
                this.set('error', 'You should specify a value to be converted');
                this.set('unit', previous.Unit);
                return;
            }
            // Blocking the widget during recalculating a value
            this.set('isBusy', true );
            var convertFunctionFactory = this.get('getValueConverter');
            var convertFunction = convertFunctionFactory(this.get('PropertyName'), previous.Unit, this.get('Unit'));
            var newValue = convertFunction(oldValue);
            this.set('Value', newValue);
            // Unblocking the widget
            this.set('isBusy', false);
        },
        validate: function(attrs, options) {
            this.set('error', undefined);
            if (this.get('Required') === true) {
                if (attrs.Value === ''){
                    if (typeof this.get('Units')[this.get('Unit')].assumedValue !== 'undefined'){
                        this.set('Value', this.get('Units')[this.get('Unit')].assumedValue);
                        /**
                         * Return something that is not empty. So validate  method triggers error and empty value
                         * which was specified will not succeed to be set as model value
                         */
                        return false;
                    }
                    this.set('error', "Value should be selected");
                    return this.get('error');
                }
            }
            if (typeof this.get('Units')[this.get('Unit')].minValue !== 'undefined'){
                if (attrs.Value < this.get('Units')[this.get('Unit')].minValue){
                    this.set('error', 'Value should not be less than '+this.get('Units')[this.get('Unit')].minValue + ' ' + this.get('Unit'));
                    return this.get('error');
                }
            }
            if (typeof this.get('Units')[this.get('Unit')].maxValue !== 'undefined'){
                if (attrs.Value > this.get('Units')[this.get('Unit')].maxValue)
                    this.set('error', 'Value should not be greater than '+this.get('Units')[this.get('Unit')].maxValue + ' ' + this.get('Unit'));
                    return this.get('error');
            }
        },
        /**
         * Gets assumed value for model's current unit measure
         * @return {Number}
         */
        getAssumedValue: function(){
            return this.get('Units')[this.get('Unit')].assumedValue;
        }
    });

    SiberianEHR.MeasuredUnitView = SiberianEHR.BindingView.extend({
        templateName: 'measured-unit',
        initialize:function(){
            /**
             * Block UI while the model is busy
             */
            this.model.on('change:isBusy', this.blockWidgetIfModelIsBusy, this);
            /**
             * Adding responsibility of showing validation errors to view
             */
            this.model.on('invalid', this.invalid, this);
        },
        events: {
            'blur input': 'updateModel'
        },
        updateModel: function(el){
            var $el = $(el.target);
            this.$el.children('.control-group').removeClass('error');
            this.model.set($el.attr('name'), $el.val(), {validate: true});
        },
        invalid: function(model, error){
            this.$el.find('input[name=Value]').focus();
            this.$el.children('.control-group').addClass('error');
        },
        blockWidgetIfModelIsBusy: function(){
            if (this.model.get('isBusy'))
                this.blockWidget();
            else
                this.unblockWidget();
        }
    });


    $.fn.measuredUnit = function (options) {
        var settings = _.extend(options || {}, {
            Value: 36.6,
            Required : true,                // specifies whether this value must be filled in
            /** Array of possible measurement units
             *  Unit structure - object. Key is measure
             *  {
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
            Units: {
                'C' : {
                    assumedValue: 36.6,
                    precision: 1,
                    minValue: 35,
                    maxValue: 42
                },
                'F' : {
                    assumedValue: 97.88,
                    precision: 3,           // 3 decimal points, integer value of kilograms
                    minValue: 95,
                    maxValue: 107.6
                }
            },
            Unit: 'C', // Current measurement unit value
            PropertyName : 'Human\'s body temperature', // Name of the measured property, e.g. "temperature"
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
                    case 'Human\'s body temperature':
                        if (fromUnit === 'C'  && toUnit === 'F'){
                            return function (value) {
                                return (value * 9 / 5 + 32);
                            };
                        }
                        if (fromUnit === 'F'  && toUnit === 'C'){
                            return function (value) {
                                return ((value - 32) * 5 / 9);
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

            view.render();
            // TODO: handle if data already exists
            $el.data('view', view);
        });
    };
}(window.jQuery);
