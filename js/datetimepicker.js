!function ($) {

    "use strict";

    SiberianEHR.DateTimePicker = {}; // adds widget namespace

    SiberianEHR.DateTimePicker.Model = Backbone.Model.extend({
        initialize: function(options) {
            var settings = {},
                date = moment.utc(SiberianEHR.DateTimePicker.Consts._startOfDays).add(options.Magnitude,'seconds');
            _.extend(settings,
                options.format,
                {
                    Value : date,
                    dateFormat: options.format.dateFormat // Constraint
                },
                {
                    Year    : options.format.hasYear ? date.year() : 1,
                    Month   : options.format.hasMonth ? date.month() : 0,
                    Day     : options.format.hasDay ? date.date(): 1,
                    Hour    : options.format.hasHour ? date.hour(): 0,
                    Minute  : options.format.hasMinute ? date.minute(): 0,
                    Second  : options.format.hasSecond ? date.second(): 0,
                    Millisecond: options.format.hasMillisecond ? date.milliseconds() : 0
                }
            );
            this.set(settings);
            // Renew Value and Magnitude
            this.recalculate();
            this.on('change', this.recalculate, this);
            this.on('change', this.preValidate, this);
        },
        /**
         * Gets value of selected date as ISO8601 string
         * @return {String} Value of selected date as ISO8601 string
         */
        getValue: function(){
            return this.get('Value').format();
        },
        getDateValue: function(){
            return this.get('Value').format(this.get('dateFormat').toUpperCase());
        },
        getTimeValue: function(){
            return this.get('Value').format(this.get('timeFormat'));
        },
        /**
         * Recalculates date and magnitude
         */
        getDate: function(){
            return this.get('Value').format('yyyy-mm-dd');
        },
        setDate: function(date){
            var json = this.toJSON();
            var m = moment.utc(date);
            this.set({
                Year    : json.hasYear ? m.year() : 1,
                Month   : json.hasMonth ? m.month() : 0,
                Day     : json.hasDay ? m.date(): 1
            });
        },
        setTime: function(time){
            var json = this.toJSON();
            var m = moment.utc(time, "hh:mm:ss");
            this.set({
                Hour: json.hasHour ? m.hour() : 0,
                Minute: json.hasMinute ? m.minute() : 0,
                Second: json.hasSecond ? m.second() : 0
            });
        },
        recalculate: function(){
            var json = this.toJSON();
            var m = moment.utc([parseInt(json.Year), parseInt(json.Month), parseInt(json.Day),
                parseInt(json.Hour), parseInt(json.Minute), parseInt(json.Second), json.Millisecond]);
            this.set('Value', m);
            this.set('Magnitude', m.diff(SiberianEHR.DateTimePicker.Consts._startOfDays, 'milliseconds')/1000);
        },
        preValidate: function(){
            //TODO pre-validation
            // if pre-validation passed - go to validation
            this.validate();
        },
        /**
         * Validates model
         */
        validate: function(){
            //TODO validation
            //return this.trigger("invalid", this, "Value should be specified");
            //this.set('isError', false); //this won't cause re-validation because no {validation: true} is specified
        },
        defaults: {
            isError: false
        }        
    });

    /**
     * De-serializes model from json
     * @param json {Object}
     * @return {SiberianEHR.DateTimePicker.Model}
     */
    SiberianEHR.DateTimePicker.deserialize = function(json){
        return new SiberianEHR.DateTimePicker.Model({
            format: json.format,
            Magnitude: json.Magnitude
        });
    }

    /**
     * Serializes model of SiberianEHR.DateTimePicker.Model
     *
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

    SiberianEHR.DateTimePicker.Consts = {
        _startOfDays : moment.utc([1, 0, 1, 0, 0, 0, 0, 0]) // 0001-01-01 0:00 +0:00
    };

    SiberianEHR.DateTimePicker.View = SiberianEHR.BindingView.extend({
        templateName: 'datetime-picker',
        events:{ },
        initialize:function(options){
            this.model.on('change:isBusy',  this.blockWidgetIfModelIsBusy, this); // Block UI while the model is busy
            this.model.on('change:isError', this.clearError, this);
            this.model.on('invalid', this.showError, this);
        },
        /**
         * Clears the validation error state if model has isError=false
         */
        clearError: function(){
            if (this.model.get('isError')) return; // if isError state is true - do nothing
            //TODO hide error state
        },
        /**
         * Show validation error
         * @param {SiberianEHR.DateTimePicker} model - Model
         * @param {string} error - text of error message
         */
        showError: function(model, error){
            //TODO show error
        }
    });

    $.fn.dateTimePicker = function (options) {
        var formatReader = new SiberianEHR.DateTimeFormatReader();
        var format = formatReader.readDateFormat(options.format);

        var model = new SiberianEHR.DateTimePicker.Model({
            format: format,
            Magnitude: options.Magnitude
        });

        return this.each(function () {
            var $el = $(this),
                view = new SiberianEHR.DateTimePicker.View({
                    el: $el,
                    model: model
                });
            view.render();
            $el.data('view', view);
            $el.find('#date input').datepicker({
                autoclose : true,
                startView : format.hasDay ? 'month' : format.hasMonth ? 'year' : 'decade',
                minViewMode : format.hasDay ? 'days' : format.hasMonth ? 'months' : 'years',
                format: format.dateFormat
            }).on('changeDate', function(e){
                view.model.setDate(e.date.toString());
            });
            $el.find('#time input').timepicker({
                minuteStep: 1,
                showMinutes: format.hasMinute, //FIXME - no such option
                showSeconds: format.hasSecond,
                showMeridian: false
            }).on('changeTime.timepicker', function(e) {
                view.model.setTime(e.time.value);
            });;
        });
    };
}(window.jQuery);
