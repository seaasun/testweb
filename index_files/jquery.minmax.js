/*
* Flexigrid for jQuery - Set Min/Max Height
*
* Copyright (c) Zecco
*
* $Date: 2009-02-17 00:09:43 +0800 (Tue, 14 Jul 2008) $
*/

(function($) {
    // jQuery.fn object
    $.fn.minmax = function() {
        //settings = $.extend({}, $.fn.minmax.defaults, settings);
        //this function is only for the browser which not support min/max css stylke
        var nativeBrowser = true;
        if ($.browser.msie && $.browser.version < 7) {
            nativeBrowser = false;
        }
        if (nativeBrowser == true) {
            return 0;
        }

        this.each(function() {
            // Get the min/max constraints of the current element.
            var constraint = {
                'min-width': calculate(this, 'min-width'),
                'max-width': calculate(this, 'max-width'),
                'min-height': calculate(this, 'min-height'),
                'max-height': calculate(this, 'max-height')
            };

            // Determine its current width and height.
            var width = this.offsetWidth;
            //var height = this.offsetHeight;
            var height = this.scrollHeight;

            var newWidth = width;
            var newHeight = height;

            // If the element is wider than its max-width...
            if (constraint['max-width'] != window.undefined
             && newWidth > constraint['max-width'])
                newWidth = constraint['max-width'];

            // If the element is/is now thinner than its min-width...
            if (constraint['min-width'] != window.undefined
             && newWidth < constraint['min-width'])
                newWidth = constraint['min-width'];

            // If the element is taller than its max-height...
            if (constraint['max-height'] != window.undefined
             && newHeight > constraint['max-height'])
                newHeight = constraint['max-height'];

            // If the element is/is now shorter than its min-height...
            if (constraint['min-height'] != window.undefined
             && newHeight < constraint['min-height'])
                newHeight = constraint['min-height'];

            // Update the proportions of the current element as required.
            if (newWidth != width)
                $(this).css('width', newWidth);
            if (newHeight > height) {
                $(this).css('height', newHeight);
            } else if (newHeight < height) {
                $(this).css('height', newHeight);
                //reset table width
                $(this).find('table:eq(0)').each(function() {
                    var w = newWidth - 17;
                    $(this).css('width', w);
                })
            } else {
                $(this).css("height", 'auto');
            }
        });


    }

    // Calculate the computed numeric value of a CSS length value.
    function calculate(obj, p) {
        var raw = $(obj).css(p);

        // Nothing in, nothing out.
        if (raw == window.undefined || raw == 'auto')
            return window.undefined;

        var result;

        // Is it a percentage value?
        result = raw.match(/^\+?(\d*(?:\.\d+)?)%$/);
        if (result) {
            return Math.round(
                Number(
                    (
                        /width$/.test(p) ? $(obj).parent().get(0).offsetWidth
                                         : $(obj).parent().get(0).offsetHeight
                    )
                    * result[1]
                    / 100
                )
            );
        }


        // Is it a straight pixel value?
        result = raw.match(/^\+?(\d*(?:\.\d+)?)(?:px)?$/);
        if (result) {
            return Number(result[1]);
        }


        // Garbage in, nothing out.
        return window.undefined;
    }

})(jQuery);