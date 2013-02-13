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
SiberianEHR.DateTimeFormatReader.prototype.readDateFormat = function(dateTimeFormat){
    var format = {
        hasCentury: false,
        hasYear: false,
        hasMonth: false,
        hasDay: false,
        hasHour: false,
        hasMinute: false,
        hasSecond: false,
        hasMillisecond: false,
        hasTimeZone: false,
        /**
         * Compact form means 20050809T183142+0330
         * Non-compact form means 2005-08-09T18:31:42+03:30
         */
        isCompactForm: false
    };
    if (dateTimeFormat == 'YYYY-MM'){
        format.hasCentury = format.hasYear = format.hasMonth = true;
    }
    return format;
};

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
