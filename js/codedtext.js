!function ($) {

    'use strict';

    /**
     * Namespace for CodedText widget
     * @namespace SiberianEHR.CodedText
     */
    SiberianEHR.CodedText = {};

    /**
     * Model of DVCodedText
     * @class SiberianEHR.CodedText.CodedTextModel
     */
    SiberianEHR.CodedText.CodedTextModel = Backbone.Model.extend({
        /**
         * Backbone model initialization method
         * @method
         * @name SiberianEHR.CodedText.CodedTextModel#initialize
         * @param {Object} options - options which are passed from plugin call, like $('#ct1').codedText({options})
         */
        initialize: function(options) {
            var settings = _.defaults(options, {
                Dictionary: {},
                Required: false
            });
            this.set(settings);
            this.on('change:Value', this.preValidate, this);
        },
        /**
         * Gets text for current value by its ID
         * @method
         * @name SiberianEHR.CodedText.CodedTextModel#getTextById
         * @param value
         * @returns {string} Text corresponding to selected value
         */
        getTextById:function(value){
            var json = this.toJSON(), result;
            if (_.isUndefined(value))
                value = json.Value;
            result = _.findWhere(json.Dictionary, {id: value});
            return result.text;
        },
        /**
         * Clears model stored value
         * @method
         * @name SiberianEHR.CodedText.CodedTextModel#clearValue
         */
        clearValue:function(){
            var json = this.toJSON();
            if (!_.isUndefined(json.AssumedValue)){
                this.set({Value: json.AssumedValue});
            }else{
                this.set({Value: null});
            }
        },
        /**
         * Pre-validates model. Here we can pre-modify stored value (remove some characters etc.)
         * @method
         * @name SiberianEHR.CodedText.CodedTextModel#preValidate
         */
        preValidate: function(){
            this.validate();
        },
        /**
         * Validates model. If model is not valid - triggers 'invalid' event, otherwise 'valid' event
         * @method
         * @name SiberianEHR.CodedText.CodedTextModel#validate
         */
        validate:function(){
            var json = this.toJSON();
            if ((json.Required === true) && (json.Value === ''))
                return this.trigger('invalid', this, 'Value should be specified');
            return this.trigger('valid');
        }
    });

    /**
     * @classdesc View of DVCodedText widget
     * @class SiberianEHR.CodedText.CodedTextView
     */
    SiberianEHR.CodedText.CodedTextView = SiberianEHR.BindingView.extend({
        /**
         * @name SiberianEHR.CodedText.CodedTextView#templateName
         * @property {string} name of the Handlebars JST template {@link JST}
         */
        templateName: 'coded-text',

        /**
         * @name SiberianEHR.CodedText.CodedTextView#events
         * @property {object} key-value pairs to attach events
         */
        events: {
            'click a.remove': 'clearValue'
        },
        /**
         * Event handler for clearing value. Triggers when clear button is pressed.
         * @name SiberianEHR.CodedText.CodedTextView#clearValue
         * @method
         */
        clearValue: function(){
            this.model.clearValue();
            this.$el.find('.select2').select2('val', null);
        },

        /**
         * Initializes a view. Attaches widget blocking to 'isBusy' model property.
         * @param {Object} options Contains 'el' - element, where to render view and 'model' - corresponding model
         * @name SiberianEHR.CodedText.CodedTextView#initialize
         * @method
         */
        initialize:function(options){
            this.model.on('change',  this.blockWidgetIfModelIsBusy, this); // Block UI while the model is busy
            //call parent initialization method
            SiberianEHR.BindingView.prototype.initialize.call(this,options);
            this.initializeWidget();
        },

        /**
         * Clears the validation error state
         * @method
         * @name SiberianEHR.CodedText.CodedTextView#clearError
         */
        clearError: function(){
            this.$el.find('.help-inline').text('');// clear error text
            this.$el.children('.control-group').removeClass('error');
        },

        /**
         * Show validation error
         * @param {SiberianEHR.CodedText} model - Model
         * @param {string} error - text of error message
         * @method
         * @name SiberianEHR.CodedText.CodedTextView#showError
         */
        showError: function(model, error){
            this.$el.find('.help-inline').text(error);
            this.$el.children('.control-group').addClass('error');
        },

        /**
         * Gets (if nothing passed) or sets model using provided json
         * @param json
         * @return {Object|null} Serialized version of model like TODO {Unit: 'unit measure value', Value: 'Magnitude' }
         * @method
         * @name SiberianEHR.CodedText.CodedTextView#value
         */
        value: function(json){
            if (_.isObject(json)){
                var model = SiberianEHR.CodedText.deserialize(json);
                this.model = model;
                this.initialize();
                this.render();
            }else //serialize
                return SiberianEHR.CodedText.serialize(this.model);
        },

        /**
         * Initializes select2 element
         * @name SiberianEHR.CodedText.CodedTextView#initializeWidget
         * @method
         * @private
         */
        initializeWidget:function(){
            var json = this.model.toJSON(),
                preload_data = json.Dictionary,
                settings = {
                    width: 'off',
                    query: function (query){
                        var data = {results: []};
                        $.each(preload_data, function(){
                            if(query.term.length == 0 || this.text.toUpperCase().indexOf(query.term.toUpperCase()) >= 0 ){
                                data.results.push({id: this.id, text: this.text});
                            }
                        });
                        if (query.term.length > 0)
                            data.results.push({id: query.term, text: query.term});
                        query.callback(data);
                    },
                    data: preload_data,
                    initSelection : function (element, callback) {
                        var data = _.findWhere(preload_data, {id: element.val()});
                        callback(data);
                    }
                };
            if (!_.isUndefined(json.AssumedValue)){
                settings.placeholder = this.model.getTextById(json.AssumedValue);
            }
            this.$el.find('.select2').select2(settings).on('change', {model: this.model}, this.onValueChanged);
            if (!_.isUndefined(json.Value)){
                this.$el.find('.select2').select2('val', json.Value);
            }
        },
        onValueChanged:function(e){
            e.data.model.set('Value', e.val);
        }
    });

    /**
     * Returns current value of object
     * @param {SiberianEHR.CodedText.CodedTextModel} model
     * @return {Object} magnitude as object like { Value: 'value', Unit: 'unit' }
     * @name SiberianEHR.CodedText.serialize
     * @function
     */
    SiberianEHR.CodedText.serialize = function(model){
        var json = model.toJSON();
        return {
            Value: json.Value,
            Dictionary: json.Dictionary,
            AssumedValue: json.AssumedValue,
            Required: json.Required
        };
    };

    /**
     * Returns a model based on specified json object
     * @param {Object} json object like { Value: 'value', Unit: 'unit' }
     * @return {SiberianEHR.CodedText.CodedTextModel}
     * @name SiberianEHR.CodedText.deserialize
     * @function
     */
    SiberianEHR.CodedText.deserialize = function(json){
        return new SiberianEHR.CodedText.CodedTextModel(json);
    };

    /**
     * @type {Object} methods, that can be invoked through jQuery plugin interface
     */
    var methods = {
        /**
         * Wrapper for [SiberianEHR.CodedText.CodedTextView -> value function]{@link SiberianEHR.CodedText.CodedTextView#value}.
         * @param {Object|null} json
         * @return {Object|null} See {@link SiberianEHR.CodedText.CodedTextView#value}
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
                model = new SiberianEHR.CodedText.CodedTextModel(options);
            return this.each(function () {
                var $el = $(this),
                    view = new SiberianEHR.CodedText.CodedTextView({
                        el: $el,
                        model: model
                    });
            });
        },
        /**
         * Allows an access to view
         * @method
         * @name methods#widget
         * @return {SiberianEHR.CodedText.CodedTextView}
         */
        widget: function(){
            return this.data('view');
        }
    };

    /**
     * @function
     * @name codedText
     * @param {Object|string} options
     * @return {*}
     */
    $.fn.codedText = function (options) {
        if (methods[options] && _.isFunction(methods[options])) {
            return methods[options].apply(this, Array.prototype.slice.call( arguments, 1 ));
        } else if (_.isObject(options) || _.isUndefined(options) || _.isNull(options)) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' + options + ' does not exist on SiberianEHR.CodedText' );
        }
    };
}(window.jQuery);
