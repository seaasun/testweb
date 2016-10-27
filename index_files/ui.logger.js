/*
* Herems jQuery Logger @VERSION V0.2
* 
* Author CZhu 
*
* Depends:
*	jQuery 1.2+
*/
(function($) {
    var LOG_LEVEL = {
        DEBUG: { LEVEL: 1, NAME: 'DEBUG' },
        INFO: { LEVEL: 2, NAME: 'INFO' },
        WARN: { LEVEL: 3, NAME: 'WARN' },
        ERROR: { LEVEL: 4, NAME: 'ERROR' }
    }

    $.logger = {};

    $.logger.log_level = LOG_LEVEL;

    $.logger.defaults = {
        LogLevel: LOG_LEVEL.ERROR,
        DebugMode: false,
        TraceMethod: false
    };

    $.logger.info = function() {
        //var args = (arguments.length > 1) ? Array.prototype.join.call(arguments, " ") : arguments[0];
        Logger(arguments, LOG_LEVEL.INFO);
    };

    $.logger.debug = function() {
        //var args = (arguments.length > 1) ? Array.prototype.join.call(arguments, " ") : arguments[0];
        Logger(arguments, LOG_LEVEL.DEBUG);
    };

    $.logger.warn = function() {
        //var args = (arguments.length > 1) ? Array.prototype.join.call(arguments, " ") : arguments[0];
        Logger(arguments, LOG_LEVEL.WARN);
    };

    $.logger.error = function() {
        //var args = (arguments.length > 1) ? Array.prototype.join.call(arguments, " ") : arguments[0];
        Logger(arguments, LOG_LEVEL.ERROR);
    };

    $.logger.AspectObject = function(objname) {
        if ($.logger.defaults.TraceMethod == false) return;

        var obj = eval(objname);
        var props = [];
        for (var p in obj) {
            if (typeof (obj[p]) == "function") {
                props.push(p);
            } else {
                // props += p + "=" + obj[p] + "\t";
            }
        }
        actsAsAspect(objname, obj);
        for (var i = 0; i < props.length; i++) {
            obj.wrapper(props[i], null);
        }

    };

    var Logger = function(args, pLevel) {
        if (pLevel.LEVEL < $.logger.defaults.LogLevel.LEVEL) return;

        // if window.console not exists, and DebugMode is true, we will show the message in div
        if (!window.console || !console) {
            if ($.logger.defaults.DebugMode == true) {
                documentLogger(args, pLevel);
            }
            return;
        }

        // if console exists, we will show the message on firebug
        if (window.console || console.firebug) {
            if (pLevel == LOG_LEVEL.INFO) {
                console.info(new Date(), pLevel.NAME, args);
            } else if (pLevel == LOG_LEVEL.DEBUG) {
                console.debug(new Date(), pLevel.NAME, args);
            } else if (pLevel == LOG_LEVEL.WARN) {
                console.warn(new Date(), pLevel.NAME, args);
            } else if (pLevel == LOG_LEVEL.ERROR) {
                console.error(new Date(), pLevel.NAME, args);
            } else {
                console.log(args);
            }

        }

    };

    var documentLogger = function(args, pLevel) {
        if (jQuery('#logger_consoler_div').length == 0) {
            jQuery('<div id="logger_consoler_div" style="border: 1px solid #ff0000; background-color: #fff; max-height: 200px; height:200px; overflow-y:auto;"></div>').appendTo("body");
        }

        var msg = (args.length > 1) ? Array.prototype.join.call(args, " ") : args[0];
        if (msg.message) {
            msg = msg.message;
        }
        jQuery('<span>' + new Date() + ' ' + pLevel.NAME + ' ' + msg + '</span><br/>').appendTo('#logger_consoler_div');
    };

    function actsAsAspect(objname, object) {
        object.objectname = objname;
        object.wrapper = function(method, f) {
            var original = eval("this." + method);
            this[method] = function() {
                $.logger.info(this.objectname, method, 'Start', arguments);
                var result = original.apply(this, arguments);
                $.logger.info(this.objectname, method, 'End', arguments);
                return result;
            };
        };
    };

})(jQuery);
