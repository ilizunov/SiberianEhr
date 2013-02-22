!function ($) {

    "use strict";

    SiberianEHR.DateTimePicker = {}; // adds widget namespace

    SiberianEHR.DateTimePicker.Model = Backbone.Model.extend({
        initialize: function(options) {
            var formatReader = new SiberianEHR.DateTimeFormatReader();
            var format = formatReader.readDateFormat(options.format);
            var settings = {},
                date = moment.utc(SiberianEHR.DateTimePicker.Consts._startOfDays).add(options.Magnitude,'seconds');
            _.extend(settings, format,
                {
                    Value : date,
                    format: format // Constraint
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
            this.recalculate();
            // Set available hours array
            this.set({
                ri_HoursArray:_.map(_.range(0, 24),function(element, index, list){
                    return {
                        hourNumber: element
                    };
                }),
                // Set minutes array
                ri_MinutesArray:_.map(_.range(0, 60),function(element, index, list){
                    return {
                        minuteNumber: element
                    };
                }),
                // Set minutes array
                ri_SecondsArray:_.map(_.range(0, 60),function(element, index, list){
                    return {
                        secondNumber: element
                    };
                }),
                // Set months array for rivets
                ri_MonthsArray: _.map(moment().lang()._months, function(element, index, list){
                    return {
                        monthNumber: index,
                        monthName: element
                    };
                }),
                // Set years array for rivets
                ri_YearsArray:_.map(_.range(settings.Year-5, settings.Year+5), function(element, index, list){
                    return {
                        yearName: element
                    };
                })
            });
            // Recalculate number of days
            this.recalculateDays();
            //and also bind this recalculation on changing month or year
            this.on('change:Year change:Month', this.recalculateDays, this);
            //TODO UTC
            this.on('change:Year change:Month change:Day change:Hour change:Minute change:Second change:Millisecond', this.preValidate, this);
        },
        /**
         * Gets value of selected date as ISO8601 string
         * @return {String} Value of selected date as ISO8601 string
         */
        getValue: function(){
            return this.get('date').format();
        },
        /**
         * Recalculates date and magnitude
         */
        recalculate: function(){
            var json = this.toJSON();
            //TODO UTC
            var m = moment([parseInt(json.Year), parseInt(json.Month), parseInt(json.Day),
                parseInt(json.Hour), parseInt(json.Minute), parseInt(json.Second), json.Millisecond]);
            this.set('date', m);
            this.set('Magnitude', m.diff(SiberianEHR.DateTimePicker.Consts._startOfDays, 'milliseconds')/1000);
        },
        /**
         * When year or month is changed, we have to recalculate the number of days in current month
         */
        recalculateDays: function(){
            var json = this.toJSON();
            this.set({
                ri_DaysArray: _.map(_.range(1,moment([json.Year, json.Month]).daysInMonth()+1), function(element, index, list){
                    return {DayNumber: element};
                })
            });
        },
        preValidate: function(){
            //TODO pre-validation
            // if pre-validation passed - go to validation
            this.validate();
        },
        /**
         * Validates model
         */
        validate:function(){
            //TODO validation
            //return this.trigger("invalid", this, "Value should be specified");
            //this.set('isError', false); //this won't cause re-validation because no {validation: true} is specified
            this.recalculate();
        },
        /**
         *  indicates whether there is error or not
         */
        isError: false
    });

    /**
     * Deserializes model from json
     * @param json {Object}
     * @return {SiberianEHR.DateTimePicker.Model}
     */
    SiberianEHR.DateTimePicker.deserialize = function(json){
        //TODO
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
            Value: moment(json.Value).format(),
            Magnitude: json.Magnitude,
            format: json.format
        };
    }

    SiberianEHR.DateTimePicker.Consts = {
        _startOfDays : moment([1, 1, 1, 0, 0, 0, 0, 0]) // 0001-01-01 0:00 +0:00
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
        var model = new SiberianEHR.DateTimePicker.Model(options);

        return this.each(function () {
            var $el = $(this),
                view = new SiberianEHR.DateTimePicker.View({
                    el: $el,
                    model: model
                });
            view.render();
            $el.data('view', view);
        });
    };
}(window.jQuery);
