/**
 * Root namespace for SiberianEHR
 * @namespace SiberianEHR
 */
var SiberianEHR = {};

/**
 * Root namespace for SiberianEHR templates
 * @namespace JST
 */
var JST = {};

/**
 * @classdesc Root class for all SiberianEHR views with bindings
 * @class BindingView
 */
SiberianEHR.BindingView = Backbone.View.extend({
    initialize: function (options) {
        if (this.clearError && _.isFunction(this.clearError))
            this.model.on('valid', this.clearError, this);
        if (this.showError && _.isFunction(this.showError))
            this.model.on('invalid', this.showError, this);
        if (_.isUndefined(this.value) || !_.isFunction(this.value)){
            $.error('Error. There is no implementation of value(json) function');
        }
        this.render(); //renders a view
        this.$el.data('view', this); //and sets view
    },

    /**
     * Renders HTML content into element.
     * @name BindingView#render
     * @method
     */
    render: function () {
        this.$el.html(this.getTemplate()(this.getContext()));
        this.setupBindings();
    },

    /**
     * Returns handlebars compiled template
     *
     * @name BindingView#getTemplate
     * @method
     * @returns Template function, ready to compile context to HTML
     */
    getTemplate: function () {
        return Handlebars.compile(JST[this.templateName]);
    },

    /**
     * Return model (if a view has an own one) as JSON
     *
     * @name BindingView#getContext
     * @method
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
     *
     * @name BindingView#setupBindings
     * @method
     */
    setupBindings: function () {
        this.rivets = rivets.bind(this.el, {model: this.model});
    },

    /**
     * Blocks widget from user's editing
     *
     * @name BindingView#blockWidget
     * @method
     */
    blockWidget: function(){
        this.$el.block();
    },

    /**
     * Unblock widget from user's editing
     *
     * @name BindingView#unblockWidget
     * @method
     */
    unblockWidget: function(){
        this.$el.unblock();
    }
});

/**
 * Date and time format reader class.
 *
 * Allows to read ISO8601-like format (YYYY-MM-DDThh:mm:ss[.mmm]) with constraints of requirements.
 *
 * @example
 * Every part of this string can be replaced with '??' - not required, but being able to specify or 'XX' -
 *      this part of date (and smaller parts) are unable to specify.
 * Note that if the month (it could be a year actually, month is chosen only as an example) is not required - this fact
 * means that day and smaller parts of datetime will not be parsed and format like 'YYYY-??-something' will be read like
 * 'YYYY-??-XXTxx:xx:xx'.
 *
 * @class DateTimeFormatReader
 */
SiberianEHR.DateTimeFormatReader = function(){};
_.extend(SiberianEHR.DateTimeFormatReader.prototype, {
    /**
     * @name DateTimeFormatReader#readDateFormat
     * @method
     * @param {string} dateTimeFormat - ISO8601-like string. YYYY-MM-DDThh:mm:ss[.mmm]
     *
     * @return {Object}
     */
    readDateFormat : function(dateTimeFormat){
        var format = {
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
            var format = {
                hasYear: false,
                isRequiredYear: false,
                dateFormat: 'YYYY'
            };
            if (s == 'XXXX')
                return null;
            format.hasYear = true;
            if (s == 'YYYY')
                format.isRequiredYear = true;
            return format;
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
            if (_.isUndefined(s) || (s.length == 0)) return null;
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
            if (_.isUndefined(s) || (s.length == 0)) return null;
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
            if (_.isUndefined(s) || (s.length == 0)) return null;
            var parts = s.split('.');
            if (parts[0] == 'XX')
                return null;
            format.hasSecond = true;
            if (parts[0] == 'SS')
                format.isRequiredSecond = true;
            if (parts.length == 1) return format;
            if (parts[1] == 'XXX') return format;
            format.hasMillisecond = true;
            format.timeFormat = 'HH:mm:ss.SSS';
            if (parts[1] == 'SSS') format.isRequiredMillisecond = true;
            return format;
        })(timeFormat[2]));
        return format;
    }
});

/**
 * Configure rivets for using with Backbone.js
 */
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

/**
 * Adds new 'data-placeholder' attribute to rivets.js
 * @param el DOM element
 * @param value Value to be set as placeholder
 */
rivets.binders.placeholder = function(el, value) {
    el.placeholder = value
};
