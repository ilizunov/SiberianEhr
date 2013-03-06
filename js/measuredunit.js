!function ($) {

    'use strict';

    SiberianEHR.MeasuredUnit = {}; // adds widget namespace

    SiberianEHR.MeasuredUnit.Model = Backbone.Model.extend({
        initialize: function(options) {
            /**
             * Options are passed here, because model should be able to get its defaults by its own, not by widget
             * @type {*}
             */
            var settings = _.defaults(options, {
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
                    //if not implemented in options - when called there will be an exception
                    throw new Error('Not implemented');
                },
                /**
                 * Field indicates busy model state (e.g. server calculation or validation). When Model is busy it is
                 * supposed to be disabled for user's input
                 */
                isBusy : false,
                /**
                 * Field indicates whether this quantity is required (cannot be null)
                 */
                Required: false,
                /**
                 * By defaults no assuming value is specified
                 */
                AssumedValue: null,
                /**
                 * Default value
                 */
                DefaultValue: {Value: '', Unit: null},
                /**
                 * By defaults no units specified as array
                 */
                Units: null,
                /**
                 * Default property name
                 */
                PropertyName: null
            });
            /**
             * Modify Units collection if not set
             */
            if (_.isNull(settings.Units)){
                settings.Units = {};
                settings.Units[settings.DefaultValue.Unit] = {};
            }
            /**
             * Add precision to every Unit measure in Units collection
             */
            _.each(settings.Units, function(value, key, list){
                if (_.isUndefined(value.precision))
                    value.precision = -1;
            });
            this.set({
                PropertyName : settings.PropertyName,
                Units: settings.Units,
                Value: settings.DefaultValue.Value,
                Unit:  settings.DefaultValue.Unit,
                AssumedValue: settings.AssumedValue,
                getValueConverter : settings.getValueConverter,
                Required: settings.Required
            });
            /**
             * Creating the structure for selecting measurements, because rivets can only iterate arrays, not objects
             */
            this.set('unitsAsArray', _.map(options.Units, function(value, key, list) { return { 'measure': key }; }));
            /**
             * Attach handler on unit change
             */
            this.on('change:Unit', this.unitChanged, this);
            /**
             * Attach pre-validation on value change
             */
            this.on('change:Value change:Unit', this.preValidate, this);
        },
        unitChanged: function() {
            var previous    = this.previousAttributes();
            /**
             * if no previous unit is selected - return
             *
             * This occurs if during the initialization of model there were no Value & Unit passing
             */
            if (_.isNull(previous.Unit)) return;
            var json        = this.toJSON();
            var oldValue    = json.Value;
            // Blocking the widget during recalculating a value
            this.set('isBusy', true );
            // Convert value
            var convertFunction = json.getValueConverter(
                json.PropertyName, previous.Unit, json.Unit);
            // Set the new value
            this.set('Value', this.toPrecision(
                convertFunction(oldValue),
                json.Units[json.Unit].precision
            ));
            // Unblocking the widget
            this.set('isBusy', false);
        },
        /**
         * Returns specified Value with precision.
         *
         * @param value Value to be evaluated with specified precision
         * @param toPrecision Precision indicated in decimal places, -1 implies no limit
         */
        toPrecision: function(value, toPrecision){
            var newValue = parseFloat(value);
            if (_.isNaN(newValue)) return null; //if value is empty string
            if (_.isNumber(toPrecision) &&
                toPrecision >= 0)
                newValue = newValue.toFixed(toPrecision);
            return newValue;
        },
        /**
         * Pre-validates model state. Changes empty value to Assumed if Required is true. Also perform replacement of
         * non-digital symbols in user input and format the input to specified precision.
         */
        preValidate: function(){
            var json = this.toJSON();
            var precision = _.isNull(json.Unit) ? -1 : json.Units[json.Unit].precision;
            var currentValue = this.toPrecision(
                    /**
                     * Remove anything which is not a digit, comma or dot. Also replace dot by comma
                     */
                    (' '+json.Value).replace(/([^0-9.,-])/g, '').replace(',','.'),
                    precision
                );
            if (json.Value != currentValue){ //if the values are different (and they can be of different types)
                return this.set('Value', currentValue), null; // set the value and return
            }
            // if pre-validation passed - go to validation
            this.validate();
        },
        /**
         * Gets min value for json representation of model
         * @param json
         */
        getMinValue:function(json){
            if (_.isUndefined(json.Unit)) return undefined;
            if (_.isUndefined(json.Units[json.Unit])) return undefined;
            if (_.isUndefined(json.Units[json.Unit].minValue)) return undefined;
            return json.Units[json.Unit].minValue;
        },
        /**
         * Gets max value for json representation of model
         * @param json
         */
        getMaxValue:function(json){
            if (_.isUndefined(json.Unit)) return undefined;
            if (_.isUndefined(json.Units[json.Unit])) return undefined;
            if (_.isUndefined(json.Units[json.Unit].maxValue)) return undefined;
            return json.Units[json.Unit].maxValue;
        },
        /**
         * Validates model
         */
        validate:function(){
            var json = this.toJSON();
            if (json.Required){
                //if field is required
                if (_.isNull(json.Value)){
                    //check for null value
                    return this.trigger('invalid', this, 'Value should be specified');
                }
                if (_.isNull(json.Unit)){
                    return this.trigger('invalid', this, 'Measure should be specified');
                }
            }
            //if value is required or some value has been specified
            if (json.Required || !_.isNull(json.Value)) {
                var minValue = this.getMinValue(json),
                    maxValue = this.getMaxValue(json);
                //check for existence of minimal possible value
                if (!_.isUndefined(minValue)) {
                    if (json.Value < minValue) {
                        return this.trigger('invalid', this, 'Value should not be less than ' + json.Units[json.Unit].minValue);
                    }
                }
                //check for existence of maximal possible value
                if (!_.isUndefined(maxValue)) {
                    if (json.Value > maxValue) {
                        return this.trigger('invalid', this, 'Value should not be greater than ' + json.Units[json.Unit].maxValue);
                    }
                }
            }
            return this.trigger('valid');
        },
        /**
         * Gets assumed value for model's current unit measure, with precision points
         * @return {Number}
         */
        getAssumedValue: function(){
            var json = this.toJSON(),
                assumedValue = json.AssumedValue;
            if (_.isNull(assumedValue)) return null; //if no value is set - just exit
            //if no default value is provided, but assumed value is specified - return assumed value
            if (_.isNull(json.Unit)) return assumedValue.Value;
            //if current unit measure is the same as assumed unit measure
            if (json.Unit == assumedValue.Unit)
                return assumedValue.Value;
            var convertFunction = json.getValueConverter(
                json.PropertyName, assumedValue.Unit, json.Unit);
            var newValue = convertFunction(assumedValue.Value),
                precision = json.Units[json.Unit].precision;
            return this.toPrecision(newValue, json.Units[json.Unit].precision);
        },
        /**
         *  indicates whether there is error or not
         */
        isError: false
    });

    SiberianEHR.MeasuredUnit.View = SiberianEHR.BindingView.extend({
        templateName: 'measured-unit',
        initialize:function(options){
            this.model.on('change:isBusy',  this.blockWidgetIfModelIsBusy, this); // Block UI while the model is busy
            this.model.on('valid', this.clearError, this);
            this.model.on('invalid', this.showError, this);
        },
        /**
         * Blocks model from user input when model is busy doing recalculation
         */
        blockWidgetIfModelIsBusy: function(){
            if (this.model.get('isBusy'))
                this.blockWidget();
            else
                this.unblockWidget();
        },
        /**
         * Clears the validation error state
         */
        clearError: function(){
            this.$el.find('.help-inline').text('');// clear error text
            this.$el.children('.control-group').removeClass('error');
        },
        /**
         * Show validation error
         * @param {SiberianEHR.MeasuredUnit} model - Model
         * @param {string} error - text of error message
         */
        showError: function(model, error){
            this.$el.find('.help-inline').text(error);
            this.$el.children('.control-group').addClass('error');
        }
    });

    /**
     * Returns current value of object
     * @param model
     * @returns {*} magnitude as object like { Value: 'value', Unit: 'unit' }
     */
    SiberianEHR.MeasuredUnit.serialize = function(model){
        var json = model.toJSON();
        return {
            Value: json.Value,
            Unit: json.Unit
        };
    };

    /**
     * Returns a model based on specified json object
     * @param json {} object like { Value: 'value', Unit: 'unit' }
     * @returns {SiberianEHR.MeasuredUnit.Model}
     */
    SiberianEHR.MeasuredUnit.deserialize = function(json){
        return new SiberianEHR.MeasuredUnit.Model( { DefaultValue: json } );
    };

    $.fn.measuredUnit = function (options) {
        var model = new SiberianEHR.MeasuredUnit.Model(options);

        return this.each(function () {
            var $el = $(this),
                view = new SiberianEHR.MeasuredUnit.View({
                    el: $el,
                    model: model
            });
            view.render();
            $el.data('view', view);
        });
    };
}(window.jQuery);
