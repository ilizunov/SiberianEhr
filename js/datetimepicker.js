!function ($) {

    'use strict';

    SiberianEHR.DateTimePicker = {}; // adds widget namespace

    SiberianEHR.DateTimePicker.Model = Backbone.Model.extend({
        initialize: function(options) {
            var settings = {},
                date = moment.utc(SiberianEHR.DateTimePicker.Consts._startOfDays).add(options.Magnitude,'seconds');
            _.extend(settings,
                options.format,
                {
                    Value : date,
                    dateFormat: options.format.dateFormat, // constraint
                    inputDateFormat: '' //date format provided by bootstrap-datepicker
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
            this.recalculateDate();
            this.on('change:Year change:Month change:Day', this.recalculateDate, this);
            this.on('change:Year change:Month change:Day', this.preValidate, this);
        },
        /**
         * Gets value of selected date as ISO8601 string
         * @return {String} Value of selected date as ISO8601 string
         */
        ri_getValue: function(){
            return this.get('Value').format();
        },
        getDateValue: function(){
            return this.get('Value').format(this.get('dateFormat'));
        },
        getTimeValue: function(){
            return this.get('Value').format(this.get('timeFormat'));
        },
        setDate: function(date, format){
            var json = this.toJSON();
            var m = moment.utc(date); //, format.parts.slice().join('-') //TODO
            //alert(date+":"+format);
            this.set({
                Year    : json.hasYear ? m.year() : 1,
                Month   : json.hasMonth ? m.month() : 0,
                Day     : json.hasDay ? m.date(): 1,
                inputDateFormat: format
            });
        },
        setTime: function(time){
            var json = this.toJSON();
            var m = moment.utc(time, 'hh:mm:ss');
            this.set({
                Hour: json.hasHour ? m.hour() : 0,
                Minute: json.hasMinute ? m.minute() : 0,
                Second: json.hasSecond ? m.second() : 0
            });
        },
        recalculateDate: function(){
            var json = this.toJSON();
            var m = moment.utc([parseInt(json.Year), parseInt(json.Month), parseInt(json.Day),
                parseInt(json.Hour), parseInt(json.Minute), parseInt(json.Second), json.Millisecond]);
            this.set('Value', m);
            this.set('Magnitude', m.diff(SiberianEHR.DateTimePicker.Consts._startOfDays, 'milliseconds')/1000);
        },
        preValidate: function(){
            //no pre-validation required, because we use ready component to hold input
            this.validate();
        },
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
            return this.trigger('valid');
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
            this.model.on('valid', this.clearError, this);
            this.model.on('invalid', this.showError, this);
        },
        /**
         * Clears the validation error state
         */
        clearError: function(){
            this.$el.find('.control-group.date').removeClass('error');
            this.$el.find('.control-group.date span.error-message').text('');
        },
        /**
         * Show validation error
         * @param {SiberianEHR.DateTimePicker} model - Model
         * @param {string} error - text of error message
         */
        showError: function(model, error){
            this.$el.find('.control-group.date').addClass('error');
            this.$el.find('.control-group.date span.error-message').text(error);
            this.$el.find('.datepicker').datepicker('setValue');
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
            $el.find('.datepicker').datepicker({
                autoclose : true,
                startView : format.hasDay ? 'month' : format.hasMonth ? 'year' : 'decade',
                minViewMode : format.hasDay ? 'days' : format.hasMonth ? 'months' : 'years',
                format: format.getDateFormatForDatePicker()
            }).on('changeDate', function(e){
                view.model.setDate(e.date, e.format);
            });
            $el.find('.bootstrap-timepicker').timepicker({
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
