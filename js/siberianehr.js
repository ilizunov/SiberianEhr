var SiberianEHR = {};
var JST = {};


SiberianEHR.BindingView = Backbone.View.extend({
    initialize: function (options) {
        // initialize me!
    },

    /**
     * Renders HTML content into element.
     */
    render: function () {
        this.$el.html(this.getTemplate()(this.getContext()));
        this.setupBindings();
    },
    /**
     * @returns Template function, ready to compile conetxt to HTML
     */
    getTemplate: function () {
        return Handlebars.compile(JST[this.templateName]);
    },

    /**
     *
     * @returns model's JSON data
     */
    getContext: function () {
        if (this.hasOwnProperty('model')) {
            return this.model.toJSON();
        }
        return {};
    },
    /**
     * Bind rivets.js bindings to ready DOM
     * Save Rivets view in rivets attribute.
     */
    setupBindings: function () {
        this.rivets = rivets.bind(this.el, {model: this.model});
    },

    /**
     * Blocks widget from user's editing
     */
    blockWidget: function(){
        this.$el.block();
    },

    /**
     * Unblock widget from user's editing
     */
    unblockWidget: function(){
        this.$el.unblock();
    }
});

SiberianEHR.DateTimeFormatReader = function(){};
_.extend(SiberianEHR.DateTimeFormatReader.prototype, {
    readDateFormat : function(dateTimeFormat){
        var format = {
            hasCentury: false,
            isRequiredCentury: false,
            hasYear: false,
            isRequiredYear: false,
            hasMonth: false,
            isRequiredMonth: false,
            hasDay: false,
            isRequiredDay: false,
            hasHour: false,
            isRequiredHour: false,
            hasMinute: false,
            isRequiredMinute: false,
            hasSecond: false,
            isRequiredSecond: false,
            hasMillisecond: false,
            isRequiredMillisecond: false,
            hasTimeZone: false,
            isRequiredTimeZone: false,
            dateFormat: '',
            timeFormat: '',
            /**
             * Returns date format for bootstrap-datepicker (lowercase yyyy-mm-dd).
             * @return {String}
             */
            getDateFormatForDatePicker: function(format){
                if (!_.isUndefined(format))
                    return format.toLowerCase();
                return this.dateFormat.toLowerCase();
            }
        };
        //YYYY-MM-DDThh:mm:ss[.mmm]
        var dateFormat = dateTimeFormat.substr(0, 10).toUpperCase().split('-');
        /**
         * Parse Year
         */
        _.extend(format, (function(s){
            if (s == 'YYYY')
                return {
                    hasCentury: true,
                    hasYear: true,
                    dateFormat: 'YYYY'
                };
            return null;
        })(dateFormat[0]));
        /**
         * Parse Month
         */
        _.extend(format, (function(s){
            var format = {
                hasMonth: false,
                isRequiredMonth: false,
                dateFormat: 'YYYY-MM'
            };
            if (s == 'XX')
                return null;
            format.hasMonth = true;
            if (s == 'MM')
                format.isRequiredMonth = true;
            return format;
        })(dateFormat[1]));
        /**
         * Parse Day
         */
        _.extend(format, (function(s){
            var format = {
                hasDay: false,
                isRequiredDay: false,
                dateFormat: 'YYYY-MM-DD'
            };
            if (s == 'XX')
                return null;
            format.hasDay = true;
            if (s == 'DD')
                format.isRequiredDay = true;
            return format;
        })(dateFormat[2]));
        //Returns format
        var timeFormat = dateTimeFormat.substr(11).toUpperCase().split(':');
        /**
         * Parse Hour
         */
        _.extend(format, (function(s){
            var format = {
                hasHour: false,
                isRequiredHour: false,
                timeFormat: 'HH' // time format corresponding to momentjs
            };
            if (s == 'XX')
                return null;
            format.hasHour = true;
            if (s == 'HH')
                format.isRequiredHour = true;
            return format;
        })(timeFormat[0]));
        /**
         * Parse Minute
         */
        _.extend(format, (function(s){
            var format = {
                hasMinute: false,
                isRequiredMinute: false,
                timeFormat: 'HH:mm'
            };
            if (s == 'XX')
                return null;
            format.hasMinute = true;
            if (s == 'MM')
                format.isRequiredMinute = true;
            return format;
        })(timeFormat[1]));
        /**
         * Parse Second and Millisecond
         */
        _.extend(format, (function(s){
            var format = {
                hasSecond: false,
                isRequiredSecond: false,
                hasMillisecond: false,
                isRequiredMillisecond: false,
                timeFormat: 'HH:mm:ss'
            };
            var parts = s.split('.');
            if (parts[0] == 'XX')
                return null;
            format.hasSecond = true;
            if (parts[0] == 'SS')
                format.isRequiredSecond = true;
            if (parts.length == 1) return format;
            if (parts[1] == 'XXX') return format;
            format.hasMillisecond = true;
            if (parts[1] == 'MMM') format.isRequiredMillisecond = true;

            return format;
        })(timeFormat[2]));
        return format;
    }
});

rivets.configure({
    adapter: {
        subscribe: function (obj, keypath, callback) {
            callback.wrapped = function (m, v) {
                callback(v)
            };
            obj.on('change:' + keypath, callback.wrapped);
        },
        unsubscribe: function (obj, keypath, callback) {
            obj.off('change:' + keypath, callback.wrapped);
        },
        read: function (obj, keypath) {
            return obj.get(keypath);
        },
        publish: function (obj, keypath, value) {
            obj.set(keypath, value);
        }
    }
});

rivets.binders.placeholder = function(el, value) {
    el.placeholder = value
};
