!function ($) {

    'use strict';

    /**
     * Namespace for MeasuredUnit widget
     * @namespace SiberianEHR.MeasuredUnit
     */
    SiberianEHR.MeasuredUnit = {};

    /**
     * Model of measured unit
     * @class SiberianEHR.MeasuredUnit.MeasuredUnitModel
     */
    SiberianEHR.MeasuredUnit.MeasuredUnitModel = Backbone.Model.extend({
        /**
         * Backbone model initialization method
         * @method
         * @name SiberianEHR.MeasuredUnit.MeasuredUnitModel#initialize
         * @param {Object} options - options which are passed from plugin call, like $('#mu1').measuredUnit({options})
         */
        initialize: function(options) {
            var settings = _.defaults(options, {
                getValueConverter: function (property, fromUnit, toUnit){
                    //if not implemented in options - when called there will be an exception
                    throw new Error('Not implemented');
                },
                Required: false,    // Field indicates whether this quantity is required (cannot be null)
                AssumedValue: new SiberianEHR.Types.DV_Quantity(), //By defaults no assuming value is specified
                DefaultValue: new SiberianEHR.Types.DV_Quantity(), //Default value, passed from widget call
                Units: null,        //By defaults no units specified as array
                PropertyName: null, //Default property name
                isBusy : false      //Field indicates busy model state (e.g. server calculation or validation). When Model is busy it is supposed to be disabled for user's input
            });
            /**
             * Modify Units collection if not set
             */
            if (_.isNull(settings.Units)){
                settings.Units = {};
                settings.Units[settings.DefaultValue.units] = {};
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
                Value: settings.DefaultValue.magnitude, //current value
                Unit:  settings.DefaultValue.units,     //current unit value
                AssumedValue: settings.AssumedValue,
                getValueConverter : settings.getValueConverter,
                Required: settings.Required
            });
            this.setupComputed(options);
            /**
             * Attach handler on unit change
             */
            this.on('change:Unit', this.unitChanged, this);
            /**
             * Attach pre-validation on value change
             */
            this.on('change:Value change:Unit', this.preValidate, this);
        },
        /**
         * Setup model computed properties. In particular model it is 'rv_unitsAsArray' - units to get the rivets binding
         *
         * @method
         * @name SiberianEHR.MeasuredUnit.MeasuredUnitModel#setupComputed
         * @param {Object} options - the same options as passed in {@link SiberianEHR.MeasuredUnit.MeasuredUnitModel#initialize}
         */
        setupComputed: function(options){
            /**
             * Creating the structure for selecting measurements, because rivets can only iterate arrays, not objects
             */
            this.set('rv_unitsAsArray', _.map(options.Units, function(value, key, list) { return { 'measure': key }; }));
        },
        /**
         * Event handler for unit changing. Locks widget from user input, converts value to new unit measure and
         * modifies the value according to specified precision.
         * @method
         * @name SiberianEHR.MeasuredUnit.MeasuredUnitModel#unitChanged
         */
        unitChanged: function() {
            var previous    = this.previousAttributes();
            /**
             * if no previous unit is selected - return
             *
             * This occurs if during the initialization of model there were no Value & Unit passing
             */
            if (_.isNull(previous.Unit) || _.isNull(previous.Value)) return;
            var json        = this.toJSON();
            /** In case we clear values */
            if (_.isNull(json.Value) && _.isNull(json.Unit)) return;
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
         * @method
         * @name SiberianEHR.MeasuredUnit.MeasuredUnitModel#toPrecision
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
         * @method
         * @name SiberianEHR.MeasuredUnit.MeasuredUnitModel#preValidate
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
         * @method
         * @name SiberianEHR.MeasuredUnit.MeasuredUnitModel#getMinValue
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
         * @method
         * @name SiberianEHR.MeasuredUnit.MeasuredUnitModel#getMaxValue
         */
        getMaxValue:function(json){
            if (_.isUndefined(json.Unit)) return undefined;
            if (_.isUndefined(json.Units[json.Unit])) return undefined;
            if (_.isUndefined(json.Units[json.Unit].maxValue)) return undefined;
            return json.Units[json.Unit].maxValue;
        },
        /**
         * Validates model. If model is not valid - triggers 'invalid' event, otherwise 'valid' event
         * @method
         * @name SiberianEHR.MeasuredUnit.MeasuredUnitModel#validate
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
         * @method
         * @name SiberianEHR.MeasuredUnit.MeasuredUnitModel#getAssumedValue
         */
        getAssumedValue: function(){
            var json = this.toJSON(),
                assumedValue = json.AssumedValue;
            if (_.isNull(assumedValue.units)) return null; //if no value is set - just exit
            //if no default value is provided, but assumed value is specified - return assumed value
            if (_.isNull(json.Unit) || (json.Unit==='')) return assumedValue.magnitude;
            //if current unit measure is the same as assumed unit measure
            if (json.Unit == assumedValue.units)
                return assumedValue.magnitude;
            var convertFunction = json.getValueConverter(
                json.PropertyName, assumedValue.units, json.Unit);
            var newValue = convertFunction(assumedValue.magnitude),
                precision = json.Units[json.Unit].precision;
            return this.toPrecision(newValue, json.Units[json.Unit].precision);
        }
    });

    /**
     * @classdesc View of measured unit widget
     * @class SiberianEHR.MeasuredUnit.MeasuredUnitView
     */
    SiberianEHR.MeasuredUnit.MeasuredUnitView = SiberianEHR.BindingView.extend({
        /**
         * @name SiberianEHR.MeasuredUnit.MeasuredUnitView#templateName
         * @property {string} name of the Handlebars JST template {@link JST}
         */
        templateName: 'measured-unit',
        /**
         * Initializes a view. Attaches widget blocking to 'isBusy' model property.
         * @param {Object} options Contains 'el' - element, where to render view and 'model' - corresponding model
         * @name SiberianEHR.MeasuredUnit.MeasuredUnitView#initialize
         * @method
         */
        initialize:function(options){
            this.model.on('change:isBusy',  this.blockWidgetIfModelIsBusy, this); // Block UI while the model is busy
            //call parent initialization method
            SiberianEHR.BindingView.prototype.initialize.call(this,options);
        },
        /**
         * Blocks model from user input when model is busy doing recalculation
         * @name SiberianEHR.MeasuredUnit.MeasuredUnitView#blockWidgetIfModelIsBusy
         * @method
         */
        blockWidgetIfModelIsBusy: function(){
            if (this.model.get('isBusy'))
                this.blockWidget();
            else
                this.unblockWidget();
        },
        /**
         * Clears the validation error state
         * @method
         * @name SiberianEHR.MeasuredUnit.MeasuredUnitView#clearError
         */
        clearError: function(){
            this.$el.find('.help-inline').text('');// clear error text
            this.$el.children('.control-group').removeClass('error');
        },
        /**
         * Show validation error
         * @param {SiberianEHR.MeasuredUnit} model - Model
         * @param {string} error - text of error message
         * @method
         * @name SiberianEHR.MeasuredUnit.MeasuredUnitView#showError
         */
        showError: function(model, error){
            this.$el.find('.help-inline').text(error);
            this.$el.children('.control-group').addClass('error');
        },
        /**
         * Gets (if nothing passed) or sets model using provided json
         * @param json
         * @return {Object|null} Serialized version of model like {Unit: 'unit measure value', Value: 'Magnitude' }
         * @method
         * @name SiberianEHR.MeasuredUnit.MeasuredUnitView#value
         */
        value: function(json){
            if (_.isObject(json)){
                var model = SiberianEHR.MeasuredUnit.deserialize(json);
                this.model = model;
                this.initialize();
                this.render();
            }else //serialize
                return SiberianEHR.MeasuredUnit.serialize(this.model);
        }
    });

    /**
     * Returns current value of object
     * @param {SiberianEHR.MeasuredUnit.MeasuredUnitModel} model
     * @return {Object} magnitude as object like { Value: 'value', Unit: 'unit' }
     * @name SiberianEHR.MeasuredUnit.serialize
     * @function
     */
    SiberianEHR.MeasuredUnit.serialize = function(model){
        var json = model.toJSON();
        if (json.Value === '')
            json.Value = json.Unit = null;
        return new SiberianEHR.Types.DV_Quantity({
            magnitude: json.Value,
            units: json.Unit,
            precision: json.precision
        });
    };

    /**
     * Returns a model based on specified json object
     * @param {Object} json object like { Value: 'value', Unit: 'unit' }
     * @return {SiberianEHR.MeasuredUnit.MeasuredUnitModel}
     * @name SiberianEHR.MeasuredUnit.deserialize
     * @function
     */
    SiberianEHR.MeasuredUnit.deserialize = function(dvQuantity){
        return new SiberianEHR.MeasuredUnit.MeasuredUnitModel( { DefaultValue: dvQuantity } );
    };

    /**
     * @type {Object} methods, that can be invoked through jQuery plugin interface
     */
    var methods = {
        /**
         * Wrapper for [SiberianEHR.MeasuredUnit.MeasuredUnitView -> value function]{@link SiberianEHR.MeasuredUnit.MeasuredUnitView#value}.
         * @param {Object|null} json
         * @return {Object|null} See {@link SiberianEHR.MeasuredUnit.MeasuredUnitView#value}
         * @name methods#value
         * @method
         */
        value: function(json){
            return this.data('view').value(json);
        },
        /**
         * @param {Object|string} options
         * @method
         * @name methods#init
         * @return For every filtered instance creates and attaches a widget
         */
        init: function(options){
            var model;
            //if we passed an object as options - we want to create a new widget[s], and bind them to model
            if (_.isObject(options))
                model = new SiberianEHR.MeasuredUnit.MeasuredUnitModel(options);
            return this.each(function () {
                var $el = $(this),
                    view = new SiberianEHR.MeasuredUnit.MeasuredUnitView({
                        el: $el,
                        model: model
                    });
            });
        },
        /**
         * Allows an access to view
         * @method
         * @name methods#widget
         * @return {SiberianEHR.MeasuredUnit.MeasuredUnitView}
         */
        widget: function(){
            return this.data('view');
        }
    };

    /**
     * @name SiberianEHR.MeasuredUnit.Widget
     * @param {Object} options {el: jQuery element, other options to be passed to widget}
     * @returns {SiberianEHR.MeasuredUnit.MeasuredUnitView}
     * @constructor
     */
    SiberianEHR.MeasuredUnit.Widget = function(options){
        options.el.measuredUnit(options);
        return options.el.measuredUnit('widget');
    }

    /**
     * @function
     * @name measuredUnit
     * @param {Object|string} options
     * @return {*}
     */
    $.fn.measuredUnit = function (options) {
        if (methods[options] && _.isFunction(methods[options])) {
            return methods[options].apply(this, Array.prototype.slice.call( arguments, 1 ));
        } else if (_.isObject(options) || _.isUndefined(options) || _.isNull(options)) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' + options + ' does not exist on SiberianEHR.MeasuredUnit' );
        }
    };
}(window.jQuery);
