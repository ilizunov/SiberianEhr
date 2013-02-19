!function ($) {

    "use strict";

    SiberianEHR.DateTimePicker = Backbone.Model.extend({
        initialize: function(options) {
            var formatReader = new SiberianEHR.DateTimeFormatReader();
            var settings = {},
                date = moment(options.datetime);
            _.extend(settings, formatReader.readDateFormat(options.format),
                {
                    date : date
                },
                {
                    Year    : date.year(),
                    Month   : date.month(),
                    Day     : date.date()
                });
            // Set months array for rivets
            this.set(settings);
            this.set({
                ri_MonthsArray: _.map(moment().lang()._months, function(element, index, list){
                    return {
                        monthNumber: index,
                        monthName: element
                    };
                })
            });
            // Set years array for rivets
            this.set({
                ri_YearsArray:_.map(_.range(settings.Year-5, settings.Year+5), function(element, index, list){
                    return {
                        yearName: element
                    };
                })
            });
            /**
             * Recalculate number of days
             */
            this.recalculateDays();
            //and also bind this recalculation on changing month or year
            this.on('change:Year change:Month', this.recalculateDays, this);
            this.on('change:Year change:Month change:Day', this.preValidate, this);
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
        },
        /**
         *  indicates whether there is error or not
         */
        isError: false
    });

    SiberianEHR.DateTimePickerView = SiberianEHR.BindingView.extend({
        templateName: 'datetime-picker',
        events:{
            "click #monthPickerPartControl #add":          "addMonth",
            "click #monthPickerPartControl #remove":       "removeMonth",
            "click #dayPickerPartControl #add":            "addDay",
            "click #dayPickerPartControl #remove":         "removeDay"
        },
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
        },
        /**
         * When clicked on adding a month
         */
        addMonth: function(){
            this.model.set({
                hasMonth: true
            });
        },
        /**
         * When clicked on removing a month
         */
        removeMonth: function(){
            this.model.set({
                hasMonth:false,
                hasDay:false
            });
        },
        /**
         * When clicked on adding a day
         */
        addDay: function(){
            this.model.set({hasDay: true});
        },
        /**
         * When clicked on removing a day
         */
        removeDay: function(){
            this.model.set({hasDay: false});
        }
    });

    $.fn.dateTimePicker = function (options) {
        var model = new SiberianEHR.DateTimePicker(options);

        return this.each(function () {
            var $el = $(this),
                view = new SiberianEHR.DateTimePickerView({
                    el: $el,
                    model: model
                });
            view.render();
            $el.data('view', view);
        });
    };
}(window.jQuery);