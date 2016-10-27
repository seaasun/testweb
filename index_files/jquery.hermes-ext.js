/*
* Trigger Buttonfor jQuery - trigger click event when press enter key
*
* Copyright (c) Zecco
*
* $Date: 2009-09-24 00:09:43 +0800 $
*/

(function($) {
    // jQuery.fn object
    $.fn.triggerbutton = function() {
        this.each(function() {
            var $el = $(this);
            var data = $el.data('triggerbutton.keypress');
            if (this.nodeName.toLowerCase() == "input" && $el.attr("triggerbutton") 
                && (data == null || data == window.undefined) ) {
                $el.bind("keypress", function(e) {
                    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
                    // allow enter/return key (only when in an input box)
                    if (key == 13) {
                        $("#" + $el.attr("triggerbutton")).trigger("click");
                    }
                });

                $el.data('triggerbutton.keypress', true)
            }
        });
    }
})(jQuery);


/*
* Trigger Disable jQuery - trigger disable label property when disable a widget
*
* Copyright (c) Zecco
*
* $Date: 2010-01-08 00:09:43 +0800 $
*/

(function($) {
    // jQuery.fn object
    $.fn.SetDisable = function() {
        this.each(function() {
            var $el = $(this);
            if (this.nodeName.toLowerCase() == "input" && $el.hasClass("ui-spinner-input")) {
                $el.spinner("disable");
            } else {
                $el.attr('disabled', true);
            }

            if ($el.attr("titlelabel")) {
                $("#" + $el.attr("titlelabel")).addClass("label-disabled");
            }
        });
    }

    // jQuery.fn object
    $.fn.SetEnable = function() {
        this.each(function() {
            var $el = $(this);
            if (this.nodeName.toLowerCase() == "input" && $el.hasClass("ui-spinner-input")) {
                $el.spinner("enable");
            } else {
                $el.removeAttr("disabled");
            }

            if ($el.attr("titlelabel")) {
                $("#" + $el.attr("titlelabel")).removeClass("label-disabled");
            }
        });
    }

    // jQuery.fn object
//    $.fn.SetDefaultText = function(options) {
//        var defaultOpts = {
//            text: "",
//            css: "#666"
//        };

//        var setting = jQuery.extend({}, defaultOpts, options);

//        this.each(function() {
//            var $el = $(this);
//            if (this.nodeName.toLowerCase() == "input") {
//                $el.attr('defaulttext',setting.text).val
//                $el.bind("focus", function() {
//                    
//                });
//                this.$input = $("#" + o.inputId).attr('maxlength', 64).attr('alt', this.defaultSearchTxt).val(this.firstShownTxt).css('color', '#999');
//            } else {
//                $el.removeAttr("disabled");
//            }

//            if ($el.attr("titlelabel")) {
//                $("#" + $el.attr("titlelabel")).removeClass("label-disabled");
//            }
//        });
//    }

})(jQuery);