!function ($) {

    "use strict";

    SiberianEHR.MeasuredUnit = Backbone.Model.extend({
        initialize: function(options) {
            /* Convention: Uppercase server variables */
            if (typeof options === 'object'){
                this.set({
                    PropertyName : options.PropertyName,
                    Units: options.Units,
                    Value: options.Value,
                    Unit:  options.Unit,
                    AssumedValue: options.AssumedValue,
                    DefaultValue: options.DefaultValue,
                    getValueConverter : options.getValueConverter
                });
            }

            /**
             * Creating the structure for selecting measurements, because rivets can only iterate arrays, not objects
             */
            var a, unitsAsArray = [];
            for (a in options.Units){
                if (options.Units.hasOwnProperty(a)){
                    unitsAsArray.push({measure: a});
                }
            }
            this.set('unitsAsArray', unitsAsArray);

            this.on('change:Unit', this.unitChanged, this);
        },
        unitChanged: function() {
            var previous = this.previousAttributes();
            if (typeof previous.Unit === 'undefined' ||
                typeof previous.Value === 'undefined') return; // if units was not set in model initialization
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
        /**
         * Gets assumed value for model's current unit measure, with precision points
         * @return {Number}
         */
        getAssumedValue: function(){
            var json = this.toJSON(),
                assumedValue = json.AssumedValue;

            if (typeof  assumedValue === 'undefined')
                return null;
            //if current unit measure is the same as assumed unit measure
            if (json.Unit == assumedValue.Unit)
                return assumedValue.Value;

            var convertFunction = json.getValueConverter(
                json.PropertyName, assumedValue.Unit, json.Unit);
            var newValue = convertFunction(assumedValue.Value),
                precision = json.Units[json.Unit].precision;

            if (_.isNumber(precision) &&
                precision >= 0)
                newValue = newValue.toFixed(precision);
            return newValue;
        },
        /**
         *  indicates whether there is error or not
         */
        isError: false
    });

    SiberianEHR.MeasuredUnitView = SiberianEHR.BindingView.extend({
        templateName: 'measured-unit',
        initialize:function(options){
            this.model.on('change:isBusy', this.blockWidgetIfModelIsBusy, this); // Block UI while the model is busy
            this.model.on('change:Unit', this.checkPrecision, this);
            this.model.on('change:Value', this.validate, this);
            this.Required = options.Required || false;
        },
        events: {
            'change input': 'validate'
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
        checkPrecision: function(model, value){
            var currentValue = this.model.get('Value');
            currentValue = (' '+currentValue).replace(/([^0-9.,])/g, '').replace(',','.');
            currentValue = parseFloat(currentValue);
            if (isNaN(currentValue)) {
                this.model.set('Value', this.model.getAssumedValue());
                return;
            }
            var seletedUnit = this.model.get('Units')[this.model.get('Unit')];
            var precision = seletedUnit.precision ? seletedUnit.precision : -1;
            if (precision >= 0)
                this.model.set('Value', currentValue.toFixed(precision));
        },
        validate: function(){
            this.clearError();
            var inputField = this.$el.find('input[name=Value]');
            // if the DV quantity is required, but value is not specified
            if ((this.Required === true) &&
                (inputField.val().length == 0)){
                // checking whether assumed value is specified
                if (typeof this.model.get('AssumedValue') !== 'undefined'){
                    //if it is, let's set it in model
                    return this.model.set('Value',this.model.getAssumedValue());
                }else{
                    this.showError('Value should be set');  //else, we show an error
                    return;
                }
            }
            this.checkPrecision();//remove everything that not numbers, dot or comma
        },
        /**
         * Clears the validation error state
         */
        clearError: function(){
            this.$el.find('.help-inline').text('');
            this.$el.children('.control-group').removeClass('error');
            this.model.set('isError',false);
        },
        /**
         * Show validation error
         * @param {string} error - text of error message
         */
        showError: function(error){
            this.$el.find('.help-inline').text(error);
            this.$el.children('.control-group').addClass('error');
            this.model.set('isError',true);
        }
    });


    $.fn.measuredUnit = function (options) {
        var settings = _.extend({
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
            isBusy : false
        }, options || {});

        var model = new SiberianEHR.MeasuredUnit(settings);

        return this.each(function () {
            var $el = $(this),
                view = new SiberianEHR.MeasuredUnitView({
                    el: $el,
                    model: model,
                    Required: options.Required
            });

            view.render();
            // TODO: handle if data already exists
            $el.data('view', view);
        });
    };
}(window.jQuery);
