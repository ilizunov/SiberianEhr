(function($){
    $(function() {
        if ($.blockUI) {
            $.blockUI.defaults.css.theme = true;
            $.blockUI.defaults.overlayCSS = {
                backgroundColor: 'white',
                opacity:         0.6,
                cursor:          'wait'
            };
            $.blockUI.defaults.message = "";
        }
    });
})(jQuery);