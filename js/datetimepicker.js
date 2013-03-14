!function ($) {

    'use strict';

    /**
     * Namespace for DateTimePicker widget
     * @namespace SiberianEHR.DateTimePicker
     */
    SiberianEHR.DateTimePicker = {}; // adds widget namespace

    /**
     * Model of DateTimePicker
     * @class SiberianEHR.DateTimePicker.Model
     */
    SiberianEHR.DateTimePicker.Model = Backbone.Model.extend({
        /**
         * Backbone model initialization method
         * @method
         * @name SiberianEHR.DateTimePicker.Model#initialize
         * @param {Object} options - options which are passed from pluging call, like $('#mu1').dateTimePicker({options})
         */
        initialize: function(options) {
            var settings = {}, date;
            if (!_.isUndefined(options.Magnitude)){
                date = moment.utc(SiberianEHR.DateTimePicker.Consts._startOfDays).add(options.Magnitude,'seconds');
            }else if(!_.isUndefined(options.Value)){
                date = moment.utc(SiberianEHR.DateTimePicker.Consts._startOfDays).add(
                        moment.utc(options.Value, 'YYYY-MM-DDTHH:mm:ss.SSS').
                            diff(SiberianEHR.DateTimePicker.Consts._startOfDays, 'seconds'),
                    'seconds');
            }else { date = moment(SiberianEHR.DateTimePicker.Consts._startOfDays); }
            var formatReader = new SiberianEHR.DateTimeFormatReader();
            var format = formatReader.readDateFormat(options.format);
            _.defaults(options, {
                localDateFormat : 'DD-MM-YYYY' //russian date format
            });
            _.extend(settings,
                format,
                {
                    Value : date,
                    Magnitude: options.Magnitude,
                    dateFormat: format.dateFormat, // constraint
                    inputDateFormat: null, //date format provided by bootstrap-datepicker
                    localDateFormat: options.localDateFormat//custom date format
                },
                {
                    Year    : format.hasYear ? date.year() : 1,
                    Month   : format.hasMonth ? date.month() : 0,
                    Day     : format.hasDay ? date.date(): 1,
                    Hour    : format.hasHour ? date.hour(): 0,
                    Minute  : format.hasMinute ? date.minute(): 0,
                    Second  : format.hasSecond ? date.second(): 0,
                    Millisecond: format.hasMillisecond ? date.milliseconds() : 0
                }
            );
            this.set(settings);
            // Renew Value and Magnitude
            this.recalculateDate();
            // attach events on date change
            this.on('change:Year change:Month change:Day', this.recalculateDate, this);
            this.on('change:Year change:Month change:Day', this.preValidate, this);
        },
        /**
         * Gets value of selected date as ISO8601 string. Used in rivetjs.
         * @method
         * @name SiberianEHR.DateTimePicker.Model#rv_getValue
         * @return {String} Value of selected date as ISO8601 string
         */
        rv_getValue: function(){
            return this.get('Value').format();
        },
        /**
         * @method
         * @name SiberianEHR.DateTimePicker.Model#getDateValue
         * @return {string} gets date in a format 'localDateFormat' as specified in options in {@link SiberianEHR.DateTimePicker.Model#initialize}
         */
        getDateValue: function(){
            var format = '',
                json = this.toJSON(),
                localDateFormatParts = json.localDateFormat.split('-'),
                fparts = null;
            if (_.isNull(json.inputDateFormat)){
                fparts = [];
                if (json.hasYear) fparts.push('yyyy');
                if (json.hasMonth) fparts.push('mm');
                if (json.hasDay) fparts.push('dd');
            }
            else
            {
                fparts = json.inputDateFormat.parts.slice();
            }
            _.each(localDateFormatParts, function(element, index, list){
                var el = element.toLowerCase();//FIXME
                if (_.contains(fparts, el)){
                    if (format !== '')
                        format += '-';
                    format += el.toUpperCase();
                }
            });
            return this.get('Value').format(format);
        },
        /**
         * @method
         * @name SiberianEHR.DateTimePicker.Model#getTimeValue
         * @todo Not yet implemented
         * @return {string} Time in specified format
         */
        getTimeValue: function(){
            return this.get('Value').format(this.get('timeFormat'));
        },
        /**
         * Sets a date from manual input, and also changes a format of this date.
         * @param {Date} date
         * @param {Object} format
         * @method
         * @name SiberianEHR.DateTimePicker.Model#setDate
         */
        setDate: function(date, format){
            var json = this.toJSON();
            var m = moment.utc(date);
            this.set({
                Year    : (json.hasYear ? m.year() : 1),
                Month   : (json.hasMonth ? m.month() : 0),
                Day     : (json.hasDay ? m.date(): 1),
                inputDateFormat: format
            });
        },
        /**
         * @method
         * @name SiberianEHR.DateTimePicker.Model#setTime
         * @todo Not yet implemented
         * @param time
         */
        setTime: function(time){
            var json = this.toJSON();
            var m = moment.utc(time, 'hh:mm:ss');
            this.set({
                Hour: json.hasHour ? m.hour() : 0,
                Minute: json.hasMinute ? m.minute() : 0,
                Second: json.hasSecond ? m.second() : 0
            });
        },
        /**
         * Recalculates Magnitude due to models properties as Year, Month etc. into number of seconds since 01.01.0001T00:00:00.000
         * Value - ISO8601 string representation of Magnitude
         * @method
         * @name SiberianEHR.DateTimePicker.Model#recalculateDate
         */
        recalculateDate: function(){
            var json = this.toJSON();
            var m = moment.utc([parseInt(json.Year), parseInt(json.Month), parseInt(json.Day),
                parseInt(json.Hour), parseInt(json.Minute), parseInt(json.Second), json.Millisecond]);
            this.set('Value', m);
            this.set('Magnitude', m.diff(SiberianEHR.DateTimePicker.Consts._startOfDays, 'milliseconds')/1000);
        },
        /**
         * In this case no pre-validation is needed, just a wrapper to {@link SiberianEHR.DateTimePicker.Model#validate}
         * @method
         * @name SiberianEHR.DateTimePicker.Model#preValidate
         */
        preValidate: function(){
            //no pre-validation required, because we use ready component to hold input
            this.validate();
        },
        /**
         * Triggers 'valid' or 'invalid' events
         * @method
         * @name SiberianEHR.DateTimePicker.Model#
         * @return {null}
         */
        validate: function(){
            var json = this.toJSON();
            /**
             * Date input validation
             */
            if (json.hasYear && json.isRequiredYear){
                //if year is required, but doesn't exist in selected date format we should trigger an invalid event
                if (!_.contains(
                    json.inputDateFormat.parts.slice(), //copying an array
                    'yyyy')){
                    return this.trigger('invalid', this, 'Year should be selected');
                }
            }
            if (json.hasMonth && json.isRequiredMonth){
                //if year is required, but doesn't exist in selected date format we should trigger an invalid event
                if (!_.contains(
                    json.inputDateFormat.parts.slice(), //copying an array
                    'mm')
                    ){
                    return this.trigger('invalid', this, 'Month should be selected');
                }
            }
            if (json.hasDay && json.isRequiredDay){
                //if year is required, but doesn't exist in selected date format we should trigger an invalid event
                if (!_.contains(
                    json.inputDateFormat.parts.slice(), //copying an array
                    'dd')
                    ){
                    return this.trigger('invalid', this, 'Day should be selected');
                }
            }
            return this.trigger('valid');
        }
    });

    /**
     * De-serializes model from json
     *
     * @name SiberianEHR.DateTimePicker.deserialize
     * @function
     * @param json {Object} json object like {format:{}, Magnitude:date_in_seconds_since_01_01_0001} or {format:{}, Value: 'ISO8601 datetime string'}
     * @return {Object} Deserialized [SiberianEHR.DateTimePicker.Model]{@link SiberianEHR.DateTimePicker.Model}
     */
    SiberianEHR.DateTimePicker.deserialize = function(json){
        var model;
        model = new SiberianEHR.DateTimePicker.Model({
            format:json.format,
            Magnitude:json.Magnitude,
            Value: json.Value
        });
        return model;
    }

    /**
     * Serializes model of [SiberianEHR.DateTimePicker.Model]{@link SiberianEHR.DateTimePicker.Model}
     * @function
     * @name SiberianEHR.DateTimePicker.serialize
     * @param model {SiberianEHR.DateTimePicker.Model} model to serialize
     * @return {Object} Contains 2 key-value pairs - Value - ISO8601 string and corresponding Magnitude
     */
    SiberianEHR.DateTimePicker.serialize = function(model){
        var json = model.toJSON();
        return {
            Value: moment.utc(json.Value).format(),
            Magnitude: json.Magnitude,
            format: json.format
        };
    }

    /**
     * Widget constants.
     * @name SiberianEHR.DateTimePicker.Consts
     * @type {Object}
     */
    SiberianEHR.DateTimePicker.Consts = {
        _startOfDays : moment.utc([1, 0, 1, 0, 0, 0, 0, 0]) // 0001-01-01 0:00 +0:00
    };

    /**
     * @class SiberianEHR.DateTimePicker.View
     * @classdesc View of SiberianEHR.DateTimePicker widget
     */
    SiberianEHR.DateTimePicker.View = SiberianEHR.BindingView.extend({
        /**
         * @name SiberianEHR.DateTimePicker.View#templateName
         * @property {string} name of the Handlebars JST template {@link JST}
         */
        templateName: 'datetime-picker',
        /**
         * Events to be handled in view
         */
        events: {
            //'change input': 'onInputChange'
        },
        /**
         * Initializes a view.
         * @param {Object} options Contains 'el' - element, where to render view and 'model' - corresponding model
         * @name SiberianEHR.DateTimePicker.View#initialize
         * @method
         */
        initialize:function(options){
            //call parent initialization method
            SiberianEHR.BindingView.prototype.initialize.call(this,options);
            this.initializeWidget();
        },
        /**
         * Initializes bootstap-datepicker and bootstrap-timepicker due to formats
         * @name SiberianEHR.DateTimePicker.View#initializeWidget
         * @method
         * @private
         */
        initializeWidget:function(){
            this.$el.find('.datepicker').datepicker({
                autoclose : true,
                startView : this.options.format.hasDay ? 'month' : this.options.format.hasMonth ? 'year' : 'decade',
                minViewMode : this.options.format.hasDay ? 'days' : this.options.format.hasMonth ? 'months' : 'years',
                format: this.options.format.getDateFormatForDatePicker(this.options.localDateFormat)
            }).on('changeDate', {model: this.model}, this.onDateChanged);
            this.$el.find('.bootstrap-timepicker').timepicker({
                minuteStep: 1,
                showMinutes: this.options.format.hasMinute, //TODO - no such option
                showSeconds: this.options.format.hasSecond,
                showMeridian: false
            }).on('changeTime.timepicker', function(e) {
                    this.model.setTime(e.time.value);
                });
        },
        /**
         * Date changed handler
         * @name SiberianEHR.DateTimePicker.View#onDateChanged
         * @method
         * @private
         * @param e {Event} Object {date: Date, format: String}. Typed date format in lowercase like 'mm-yyyy'.
         */
        onDateChanged: function(e){
            e.data.model.setDate(e.date, e.format);
        },
        /**
         * Clears the validation error state
         * @method
         * @name SiberianEHR.DateTimePicker.View#clearError
         */
        clearError: function(){
            this.$el.find('.control-group.date').removeClass('error');
            this.$el.find('.control-group.date span.error-message').text('');
        },
        /**
         * Show validation error
         * @param {SiberianEHR.DateTimePicker} model - Model
         * @param {string} error - text of error message
         * @method
         * @name SiberianEHR.DateTimePicker.View#showError
         */
        showError: function(model, error){
            this.$el.find('.control-group.date').addClass('error');
            this.$el.find('.control-group.date span.error-message').text(error);
            this.$el.find('.datepicker').datepicker('setValue');
        },
        /**
         * Gets (if nothing passed) or sets model using provided json
         * @param json
         * @return {Object|null} Serialized version of model like {Magnitude: 'magnitude value', Value: 'ISO8601 string' }
         * @method
         * @name SiberianEHR.DateTimePicker.View#value
         */
        value: function(json){
            if (_.isObject(json)){
                this.model = SiberianEHR.DateTimePicker.deserialize(json);
                this.initialize();
                this.render();
            }else //serialize
                return SiberianEHR.DateTimePicker.serialize(this.model);
        }
    });

    /**
     * @type {Object} methods, that can be invoked through jQuery plugin interface
     */
    var methods = {
        /**
         * Wrapper for [SiberianEHR.DateTimePicker.View -> value function]{@link SiberianEHR.DateTimePicker.View#value}.
         * @param {Object|null} json
         * @return {Object|null} See {@link SiberianEHR.DateTimePicker.View#value}
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
            var formatReader = new SiberianEHR.DateTimeFormatReader();
            var format = formatReader.readDateFormat(options.format);
            var model = new SiberianEHR.DateTimePicker.Model(options);
            return this.each(function () {
                var $el = $(this),
                    view = new SiberianEHR.DateTimePicker.View({
                        el: $el,
                        model: model,
                        format: format,
                        localDateFormat: options.localDateFormat
                    });
            });
        },
        /**
         * Allows an access to view
         * @method
         * @name methods#widget
         * @return {SiberianEHR.DateTimePicker.View}
         */
        widget: function(){
            return this.data('view');
        }
    };

    /**
     * @function
     * @name dateTimePicker
     * @param {Object|string} options
     * @return {*}
     */
    $.fn.dateTimePicker = function (options) {
        if (methods[options] && _.isFunction(methods[options])) {
            return methods[options].apply(this, Array.prototype.slice.call( arguments, 1 ));
        } else if (_.isObject(options) || _.isUndefined(options) || _.isNull(options)) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' + options + ' does not exist on SiberianEHR.MeasuredUnit' );
        }
    };
}(window.jQuery);
