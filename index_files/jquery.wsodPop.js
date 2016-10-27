if (!ZECCO) {
    //global vars
    var ZECCO = {
        popup: null, //to recode any popup
        defaultEvt: ''
    };

    /*try {
        if (WSOD_URL_PREFIX) {
            ZECCO.domain = WSOD_URL_PREFIX;
        }
    }
    catch (e) {
        ZECCO.domain = 'http://research.zecco.com/';
    }*/

    //event system
    var ZeccoEvents = {};
    ZeccoEvents.addListener = function(name, handler) {
        if (arguments.length == 1) {
            var o = arguments[0];
            o = o instanceof Array ? o : [o];
            for (var i = 0; i < o.length; i++) {
                $.bind(o[i].name, o[i].handler);
                this[o[i].name] = o[i].handler;
            }
        }
        else {
            $.bind(name, handler);
            this[name] = handler;
        }
    };

    ZeccoEvents.removeListener = function(name) {
        if (this[name]) {
            $.unbind(name, this.name);
            this[name] = undefined;
        }
    };

    ZeccoEvents.fireListeners = function(name, data) {
        $.trigger(name, data);
    };

    //JQuery methods
    $.create = function(tag, attributes, children) {
        var $el = $('<' + tag + ' />');
        if (attributes) $el.attr(attributes);
        if (children) {
            if ($.isArray(children)) {
                $(children).appendTo($el);
            } else {
                $el.append(children);
            }
        }
        return $el;
    };

    /**
    * Bind a custom event. (Binds it onto the window)
    */
    $.bind = function() {
        var w = $(window);
        w.bind.apply(w, arguments);
    };
    /**
    * Trigger a custom event (Triggers it on the window)
    */
    $.trigger = function() {
        var w = $(window);
        w.trigger.apply(w, arguments);
    };
    /**
    * Unbind a custom event (Unbinds it from the window)
    */
    $.unbind = function() {
        var w = $(window);
        w.unbind.apply(w, arguments);
    };

}
;
ZECCO.hermespopup = null;

/**
* Popup
* @author Morgan Smaller(v1.0)
* @author Shuanglin Wang(v2.0)
* @version 2.0 (JQuery)
*/

//Popup is abstruct class, need be extended
var HermesPopup = function(option) {
    this.close = option && option.close;
    this.shadow = option && option.shadow;
    this.sharkfin = option && option.sharkfin;
    this.fixedposition = option && option.fixedposition;
    this.smokeScreen = option && option.smokeScreen;

    this.$el = null; //start element
    this.$content = null;
    this.$view = null;
    this.contentWidth = null;
    this.contentHeight = null;
    this.popupWidth = null;
    this.popupHeight = null;
    this.top = null;
    this.left = null;

    this.offsetSetting = null; //option.offset.left: 10px...)
    this.positions = (option && option.positions) ? option.positions : null; //(option.positions.left, right, top....)

    this.sharkfinLength = { width: 20, height: 37 };
    this.skin = (option && option.skin) ? option.skin : "";
}

HermesPopup.prototype.start = function() {
    //todo: make sure it is jquery style
    if (this.smokeScreen) common.SmokeScreen(true);

    this.setContent();
}

//this function should be called after content loaded
HermesPopup.prototype.onload = function($content) {
    this.$content = $content;
    this.setContentSize();
    this.setPosition();
}

//it is a abstract method shold be accamplished by sub-class
HermesPopup.prototype.setContent = function() {
    throw (new Error('HermesPopup.setContent() is not accomplished.'));
}

HermesPopup.prototype.setContentSize = function() {
    var size = this.getSize(this.$content);
    this.contentWidth = size.width;
    this.contentHeight = size.height;

    this.popupWidth = this.contentWidth + 16;
    this.popupHeight = this.contentHeight + 41;

    if (document.all && !window.opera && !window.XMLHttpRequest) this.contentWidth += 3;
}

HermesPopup.prototype.setPosition = function() {
    var $p = $('body');
    var boundLeft = $p.offset().left;
    var boundTop = $p.offset().top;
    var boundRight = $p.offset().left + $p.width();
    var boundBottom = $p.offset().top + $p.height();

    var sWidth = this.sharkfin ? this.sharkfinLength.width : 0;
    var sHeight = this.sharkfin ? this.sharkfinLength.height : 0;

    var left = this.$el.offset().left + this.$el.width() / 2 - sWidth;
    var right = this.$el.offset().left + this.$el.width() / 2 + sWidth - this.popupWidth;
    var top = this.$el.offset().top + this.$el.height() + sHeight;
    var bottom = this.$el.offset().top - sHeight - this.popupHeight;

    if (this.$el && !this.fixedposition) {
        this.left = left;
        this.top = top;
        this.fin = "leftTop";

        var inBottom = (this.top + this.popupHeight > boundBottom) ? true : false;
        var inRight = (this.left + this.popupWidth > boundRight) ? true : false;

        if (!inRight && inBottom) {
            this.top = bottom;
            this.fin = "leftBottom"
        }

        if (inRight && !inBottom) {
            this.left = right;
            this.fin = "rightTop"
        }

        if (inRight && inBottom) {
            this.left = right;
            this.top = bottom;
            this.fin = "rightBottom"
        }

    } else if (this.fixedposition && this.positions == null) {
        this.left = boundLeft + $p.width() / 2 - this.popupWidth / 2;
        this.top = boundTop + $p.offset().top;
    } else if (this.fixedposition && this.positions != null) {
        if (this.positions == "leftBottom") {
            this.left = right;  // right;
            this.top = top; // top - this.popupHeight / 2;
        } else if (this.positions == "rightBottom") {
            this.left = left;  //left;
            this.top = top;  //top - this.popupHeight / 2;
        }
        //others todo
    }
}

HermesPopup.prototype.getContentWrapper = function() {
    return $('<div class="popup" style="position: static;"></div>')
					.append(
						$('<div class="box" style="position: static"></div>')
						.append($(
							'<table class="boxtable" style="border:0px;" cellspacing="0" cellpadding="0" >' +
	        			        '<tr class="boxTop">' +
	        				        '<td class="left lfloat"></td>' +
	        				        '<td class=""></td>' +
	        				        '<td class="right rfloat"></td>' +
	        			        '</tr>' +
	        			        '<tr class="boxBody">' +
	        				        '<td class="bodyleft"></td>' +
	        				        '<td class="bodyMiddle"><div class="blockMiddle"></div></td>' +
	        				        '<td class="bodyright"></td>' +
	        			        '</tr>' +
	        			        '<tr class="boxBottom">' +
	        				        '<td class="left lfloat"></td>' +
	        				        '<td class=""></td>' +
	        				        '<td class="right rfloat"></td>' +
	        			        '</tr>' +
	        		        '</table>')
						)
					);
}

HermesPopup.prototype.draw = function() {
    var self = this;

    if (this.smokeScreen) common.SmokeScreen(false);

    //make sure just one popup at one time
    if (ZECCO.hermespopup) {
        ZECCO.hermespopup.hide();
        ZECCO.hermespopup = null;
    }
    ZECCO.hermespopup = this;



    var $popwrapper = this.getContentWrapper();

    this.$view = $('<div class="HermesPopup blockHermes ' + this.skin + '" style="position: absolute; top: ' + this.top + 'px; left: ' + this.left + 'px;"></div>')
				.append(
					$popwrapper
				);

    var msg = this.$content;
    if (msg && typeof msg != 'string' && (msg.parentNode || msg.jquery)) {
        var node = msg.jquery ? msg[0] : msg;
        var data = {};
        this.$el.data('HermesPopup.history', data);
        data.el = node;
        data.parent = node.parentNode;
        data.display = node.style.display;
        data.position = node.style.position;
        if (data.parent)
            data.parent.removeChild(node);
    }

    this.$view.find(".blockMiddle").append(msg);

    $('body').append(this.$view);

    //if (document.all && !window.opera && !window.XMLHttpRequest) {
    //    $('.popup .middle').width(this.contentWidth - 3);
    //}

    if (this.sharkfin) {
        $('<div class="' + this.fin + 'Fin"></div>').insertBefore('.popup .box');
    }

    if (this.close) {
        $popwrapper.append(
			$('<div class="closeBtn"></div>')
			.click(function() {
			    self.hide();
			})
		)
    }

    if (this.shadow) {
        this.drawShadow()
    }

    if ($.fn.bgiframe) { this.$view.bgiframe(); }

    setTimeout(
		function() {
		    $('body').children().not('.HermesPopup').click(self.clickBodyHandler = function(evt) {
		        self.hide(evt, $(this));
		    });
		},
		1
	);

    //we can't stop the event propagation, because click
    //this label to show options should close another options
    //evt.stopPropagation();
}

HermesPopup.prototype.drawShadow = function() {
    //var size = this.getSize(this.$view);
    size = {
        width: this.popupWidth,
        height: this.popupHeight
    };

    var $shadow = $('<div class="WSODHoverShadowContainer"/>');

    for (var i = 1; i < 6; i++) {
        $shadow.append(
			$('<div class="WSODHoverShadowLayer" />')
			.css({
			    opacity: 0.055 * i,
			    width: size.width,
			    height: size.height - 1,
			    top: 6 - i,
			    left: 6 - i
			})
		);
    }

    this.$view.find('.popwrapper').before($shadow);
}

HermesPopup.prototype.hide = function() {
    this.$view.remove();
    this.hideLoading();

    this.remove();
    ZECCO.hermespopup = null;

    $('body').children().not('.HermesPopup').unbind('click', this.clickBodyHandler);
}

HermesPopup.prototype.remove = function() {
    var data = this.$el.data('HermesPopup.history');

    //this.$el.each(function(i, o) {
    //    // remove via DOM calls so we don't lose event handlers
    //    if (this.parentNode)
    //        this.parentNode.removeChild(this);
    //});

    if (data && data.el) {
        data.el.style.display = data.display;
        data.el.style.position = data.position;
        if (data.parent)
            data.parent.appendChild(data.el);
        $(data.el).removeData('HermesPopup.history');
    }

}

HermesPopup.prototype.getSize = function($dom) {
    //if the height of content is set
    if (this.contentHeight)
        return {
            width: this.contentWidth,
            height: this.contentHeight
        };

    var $tempDom = $dom.clone();

    $('body').append($tempDom.css({ top: '-5000px', position: 'absolute', display:'block' }));

    var size = {
        width: $tempDom.width(),
        height: $tempDom.height()
    };

    $tempDom.remove();

    return size;
}

HermesPopup.prototype.showLoading = function($container) {
    var pos = $container.offset();
    var width = $container.outerWidth(true);
    var height = $container.outerHeight(true);

    var html = [
		'<div id="loading_Icon" style="width: ', width, 'px;height: ', height, 'px;top: ', pos.top, 'px;left: ', pos.left, 'px;" class="wsodLoadingIndicator">',
			'<img style="position:absolute; left: ', width / 2 - 15, 'px;top:', height / 2 - 15, 'px;" src="/zecco/research/resources/images/loading/preloadSpinner.gif" />',
		'</div>'].join('');

    $('body').append($(html));
};

HermesPopup.prototype.hideLoading = function($container) {
    $('#loading_Icon').remove();
};


var HermesMiniTip = function(el) {
    this.$el = $(el);
    this.contentHeight = 1;
    this.contentWidth = 1;
}

HermesMiniTip.prototype = new HermesPopup({ close: true, shadow: false, sharkfin: false, fixedposition: false });

HermesMiniTip.prototype.setContent = function() {
    var self = this;

    var targetId = self.$el.attr("targetContentId");
    $content = $('#' + targetId);
    self.onload($content);
    self.draw();
}


var PositionTip = function(el) {
    this.$el = $(el);
    this.contentHeight = 1; // this value is not necessay, just for performance purpose
    this.contentWidth = 194; // this value is not necessay, just for performance purpose
}

PositionTip.prototype = new HermesPopup({ close: false, shadow: false, sharkfin: false, fixedposition: true, positions: "leftBottom" });

PositionTip.prototype.getContentWrapper = function() {
    return $('<div class="popup" style="position: static;"></div>')
					.append(
						$('<div class="box" style="position: static"></div>')
						.append(
						    $('<div class="boxContent"><div class="blockMiddle"></div></div>')
						)
					);
}

PositionTip.prototype.setContent = function() {
    var self = this;

    var targetId = self.$el.attr("targetContentId");
    $content = $('#' + targetId);
    self.onload($content);
    self.draw();
}

var StrategyTip = function(el) {
    this.$el = $(el);
    this.contentHeight = 1;
    this.contentWidth = 1;
}

StrategyTip.prototype = new HermesPopup({ close: true, shadow: false, sharkfin: false, fixedposition: false, skin: 'blockStrategy' });

StrategyTip.prototype.getContentWrapper = function() {
    return $('<div class="popup" style="position: static;"></div>')
					.append(
						$('<div class="box" style="position: static"></div>')
						.append(
						    $('<div class="boxContent"><div class="blockMiddle"></div></div>')
						)
					);
}

StrategyTip.prototype.setContent = function() {
    var self = this;

    var targetId = self.$el.attr("targetContentId");
    $content = $('#' + targetId);
    self.onload($content);
    self.draw();
}

StrategyTip.prototype.setPosition = function() {
    this.left = this.$el.offset().left;
    this.top = this.$el.offset().top + this.$el.height();
}