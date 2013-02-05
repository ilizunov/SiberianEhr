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
