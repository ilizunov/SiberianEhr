!function ($) {

    "use strict";

    SiberianEHR.DateTimePicker = Backbone.Model.extend({
        initialize: function(options) {
            var formatReader = new SiberianEHR.DateTimeFormatReader();
            // overwrite format
            options.format = formatReader.readDateFormat(options.format);
            // parse date
            options.date   = moment(options.datetime);
            var settings = _.defaults(options, {
                //TODO defaults
            });
            this.set({
                format  : options.format,
                date    : options.date,
                Year    : options.date.year(),
                Month   : options.date.month()
                //TODO initialization
            });
            // Set months array for rivets
            //FIXME - does not work
            var bb = moment().lang();
            var aa = _.each(bb.months, function(value, key, list){
                return {
                    monthNumber: key,
                    monthName: value
                };
            });
            this.set(
                {
                    ri_MonthsArray: aa
                });
            //TODO onchange binding to preValidate
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
            //this.$el.find('.help-inline').text('');// clear error text
            //this.$el.children('.control-group').removeClass('error');
        },
        /**
         * Show validation error
         * @param {SiberianEHR.DateTimePicker} model - Model
         * @param {string} error - text of error message
         */
        showError: function(model, error){
            //TODO show error
            //this.$el.find('.help-inline').text(error);
            //this.$el.children('.control-group').addClass('error');
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
