// create static common object
ni.RegisterNameSpace("framework");
framework.common = {
    // Follow two google maps api's value can be initialized from backend on system loading
    GoogleMapApiUrl: "http://www.google.com/jsapi?key=ABQIAAAA4-00ew_HZza0QvKLDq5olxSSZ92LGgjjFKGdD9bfcXcrg6UhsxQqWNeRA8SlgaftoAJgUU3I1d-J7A",
    GoogleMapApiVersion: "3",

    // SiteRootPath
    SiteRootPath: "",

    IsRegisteredSite: false,
    WMSUrl: "http://mapserivce-aws.usadatadev.com/wms/GetFeature.ashx?",
    IsWMSEnable: false,
    extraWmsLayer: null,


    // clude added for reminding
    // when we use jquery 1.4.2, there is a issue when converting datetime string
    // on jquery 1.3.x it use "eval" to convert json string to local object, it can solve string like: "DateTime": new Date(1212144267000)
    // on jquery 1.4.x, it will directly use brower's JSON function to parse, if this function exist, it can not parse the datetime string we mentioned before
    // so when use jquery 1.4.x , we need set dataType to "text", and use "eval" to convert json string to object by our self. Issue: performance is not good
    // when we use jquery 1.3.x, we can directly set the dataType to "json"
    Ajax: function(paramters) {
        var defaultOpts = {
            type: "POST",
            contentType: "application/json",
            url: "",
            data: {},
            dataType: 'text',
            waitingElement: null,
            success: null,
            error: null,
            before: null,
            async: true
        };
        var setting = jQuery.extend({}, defaultOpts, paramters);
        // replace the url if the url is an absolute path
        if (setting.url.substr(0, 1) == "/") {
            setting.url = framework.common.SiteRootPath + setting.url;
        }

        jQuery.ajax({
            type: setting.type,
            contentType: setting.contentType,
            url: setting.url,
            data: jQuery.toJSON(setting.data),
            dataType: setting.dataType,
            async: setting.async,
            dataFilter: function(data, type) {
                return data.replace(/"\\\/(Date\([0-9-]+\))\\\/"/gi, 'new $1');
            },
            beforeSend: function(data) {
                if (setting.waitingElement != null) {
                    framework.ui.showWaiting(setting.waitingElement, true);
                }

                if (setting.before != null) {
                    setting.before();
                }
            },
            success: function(result) {
                if (setting.waitingElement != null) {
                    framework.ui.showWaiting(setting.waitingElement, false);
                }

                result = eval('(' + result + ')');
                //result = jQuery.evalJSON(result);
                if (setting.success != null) {
                    setting.success(result.d);
                }
            },
            error: function(result) {
                if (setting.waitingElement != null) {
                    framework.ui.showWaiting(setting.waitingElement, false);
                }

                if (setting.error != null) {
                    setting.error(result);
                }
            }
        });
    },

    sortJson: function(jsonObjects, sortBy, direction, convertTypeFun) {

        if (jsonObjects == null) {
            return;
        }

        var intDirection = "asc" == direction ? 1 : -1;
        var fn = function(r1, r2) {
            var v1, v2;
            var tmpArr = sortBy.split(".");
            v1 = r1[tmpArr[0]];
            v2 = r2[tmpArr[0]];
            for (i = 1; i < tmpArr.length; i++) {
                v1 = v1[tmpArr[i]];
                v2 = v2[tmpArr[i]];
            }
            if (convertTypeFun != null && typeof (convertTypeFun) == "function") {
                v1 = convertTypeFun(v1);
                v2 = convertTypeFun(v2);
            }
            var result = (v1 > v2) ? 1 : ((v1 < v2) ? -1 : 0);
            return intDirection * result;
        };

        jsonObjects.sort(fn);
    },

    getProperty: function(obj, property) {
        if (property != null && property != window.undefined && property != '') {
            return obj[property]
        } else {
            return obj;
        }
    },

    /**
    * common function for getting parameter value from query string
    * @method getQueryStringParameter
    * @param name : parameter name
    */
    getQueryStringParameter: function(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null)
            return "";
        else
            return results[1];
    },

    formatMoney: function(object, precision) {
        if (object == null) {
            return '$0.00';
        }

        if (precision == null || precision == window.undefined) {
            precision = 2;
        }

        if (object >= 0) {
            return "$" + framework.common.formatNumber(object, precision);
        }
        else {
            return "-$" + framework.common.formatNumber(Math.abs(object), precision);
        }

    },

    formatPrice: function(object, precision) {
        if (precision == null || precision == window.undefined) {
            precision = 4;
        }

        /*
        var objStr = object.toString();
        var index = objStr.lastIndexOf('.');
        if (index > -1) {
        var len = objStr.length - index - 1;
        precision = precision > len ? (len <= 2 ? 2 : len) : precision;
        }
        */

        return framework.common.formatMoney(object, precision)
    },

    formatDate: function(object, format) {
        if (object == null) {
            return '';
        }
        else {
            if (format == null || format == window.undefined) {
                format = "m/d/Y h:ia";
            }
            return Ext.util.Format.date(object, format);
        }
    },

    /**
    * common function for getting parameter value from query string
    * @method formatNumber
    * @param name : object
    */
    formatNumber: function(object, precision) {
        if (object == null) {
            return 0;
        }
        else {
            var fmt = '0,000';
            if (precision == null || precision == window.undefined) {
                precision = 0;
            }
            if (precision > 0) {
                fmt = '0,000.' + '00000'.substring(0, precision);
            } else {
                fmt = '0,000';
            }

            if (object < 0) {
                return "-" + Ext.util.Format.number(Math.abs(object), fmt);
            } else {
                return Ext.util.Format.number(object, fmt);
            }
        }
    },

    formatCreditCard: function(object) {
        if (object == null || object.length <= 12)
            return object.toString();

        return "xxxx-xxxx-xxxx-" + object.substring(12, object.length);
    },

    formatHtml: function(object) {
        return object.replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    },

    StopEvent: function(e) {
        if (e.preventDefault != null) {
            e.preventDefault();
        }
        if (e.stopPropagation != null) {
            e.stopPropagation();
        }
        e.cancelBubble = true;
    },
    IsEnterKeyDown: function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code != 13) {
            return false;
        } else {
            return true;
        }
    },
    LogClickEvent: function(step, order, message) {
        if (!page.global.LogEvent) {
            return;
        }
        var OrderStep = entity.lookup.OrderStep.getByCode(step);
        var stepMessage = OrderStep == null ? step : OrderStep.DisplayName;
        framework.common.Ajax({
            url: "PlaceOrder.aspx/LogClickEvent",

            data: { step: stepMessage, order: order, message: message, listType: page.placeorder.currentDataSource },
            async: true
        });
    },

    GoogleMap: {
        CallBack: null,
        LoadMapApi: function(callback) {
            framework.common.GoogleMap.CallBack = callback;

            // var gmapUrl = framework.common.GoogleMapApiUrl;
            // if (document.location.protocol == 'https:') {
            // 	gmapUrl = gmapUrl.replace("http://", "https://");
            // }
            // $.getScript(String.format("{0}&callback={1}", gmapUrl, "framework.common.GoogleMap.AfterLoadMapApi"));
            google.load("maps", framework.common.GoogleMapApiVersion, { "other_params": framework.common.GoogleMapApiUrl, "callback": framework.common.GoogleMap.CallBack });


        },

        AfterLoadMapApi: function() {
            //load specific version.
            google.load("maps", framework.common.GoogleMapApiVersion, { "other_params": framework.common.GoogleMapApiUrl, "callback": framework.common.GoogleMap.CallBack });
        }



    },

    InitAutocomplete: function(input, callback) {
        var options = {
            componentRestrictions: { country: 'us' }
        };
        var autocomplete = new google.maps.places.Autocomplete(input, options);

        var currentCaller = this;

        google.maps.event.addListener(autocomplete, 'place_changed', function() {

            var place = autocomplete.getPlace();

            if (place.geometry && place.geometry.location) {
                if (callback && typeof callback == "function") {
                    callback.apply(currentCaller, []);
                }

            }

        });

    },

    InitZipCodeAutocomplete: function(targetInput) {
        jQuery("#" + targetInput).autocomplete("PlaceOrder.aspx/SearchZip", {
            dataType: "json",
            minchar: 1,
            selectFirst: false,
            parse: function(data) {
                var rows = [];
                var data = data.d.DataSource;
                if (data != null) {
                    for (var i = 0; i < data.length; i++) {
                        rows[rows.length] = {
                            data: data[i],
                            value: data[i],
                            result: data[i]
                        };
                    }
                }
                return rows;
            },
            formatItem: function(item, i, max) {
                var obj = "<div id='item" + i + "'>" + item + "</div>";
                return obj;
            }
        });
    },

    LoadGoogleJSApi: function() {
        if (typeof (google) != 'object' || typeof (google.load) != 'function') {
            var url = document.location.protocol + '//www.google.com/jsapi';
            jQuery.getScript(url);

        }
    },
    LoadGoogleJSApiWithCallback: function(callback) {
        if (typeof (google) != 'object' || typeof (google.load) != 'function') {
            var url = document.location.protocol + '//www.google.com/jsapi';
            jQuery.getScript(url, callback);

        }
    },
    addLayer: function(layer_name, layer_title, isdefault, map) {

        var wmsUrl = framework.common.WMSUrl;
        var wmsLayer = framework.common.createWMSTileLayer(wmsUrl, layer_name, null, "image/png", null, null, null, .5, map);

        if (framework.common.extraWmsLayer != undefined) {
            map.overlayMapTypes.clear();
        }
        //jack.xin
        framework.common.extraWmsLayer = wmsLayer;
        //map.overlayMapTypes.insertAt(0, framework.common.extraWmsLayer);
        map.overlayMapTypes.setAt(0, framework.common.extraWmsLayer);
    },

    createWMSTileLayer: function(wmsUrl, wmsLayers, wmsStyles, wmsFormat, wmsVersion, wmsBgColor, wmsSrs, opacity, map) {

        var imgMapTypeOptions =
        {
            getTileUrl: framework.common.CustomGetTileUrl,
            tileSize: new google.maps.Size(256, 256),
            isPng: true,
            maxZoom: 19,
            getOpacity: opacity
        };
        var tile = new google.maps.ImageMapType(imgMapTypeOptions);
        //tile.setOpacity(imgMapTypeOptions.getOpacity);
        imgMapTypeOptions.myLayers = wmsLayers;
        imgMapTypeOptions.myStyles = (wmsStyles ? wmsStyles : "");
        imgMapTypeOptions.myFormat = (wmsFormat ? wmsFormat : "image/gif");
        imgMapTypeOptions.myVersion = (wmsVersion ? wmsVersion : "1.1.1");
        imgMapTypeOptions.myBgColor = (wmsBgColor ? wmsBgColor : "0xFFFFFF");
        imgMapTypeOptions.myBaseURL = wmsUrl;
        imgMapTypeOptions.map = map;
        //        tile.getTileUrl = imgMapTypeOptions.getTileUrl;
        if (imgMapTypeOptions.getOpacity) { tile.getOpacity = function() { return imgMapTypeOptions.getOpacity; } }
        return tile;

    },



    CustomGetTileUrl: function(a, b, c) {

        if (typeof (window['this.myMercZoomLevel']) == "undefined") this.myMercZoomLevel = 0;
        if (typeof (window['this.myStyles']) == "undefined") this.myStyles = "RedBorder";

        //cover the pixel to LatLng
        var proj = this.map.getProjection();
        var zfactor = Math.pow(2, b);
        var lUL = proj.fromPointToLatLng(new google.maps.Point(a.x * 256 / zfactor, (a.y + 1) * 256 / zfactor));
        var lLR = proj.fromPointToLatLng(new google.maps.Point((a.x + 1) * 256 / zfactor, a.y * 256 / zfactor));

        var lSRS = "EPSG:4326";
        var lBbox = lUL.lng() + "," + lUL.lat() + "," + lLR.lng() + "," + lLR.lat();
        var lURL = this.myBaseURL;

        lURL += "&REQUEST=GetMap";
        lURL += "&SERVICE=WMS";
        lURL += "&VERSION=" + this.myVersion;
        lURL += "&LAYERS=" + this.myLayers;
        lURL += "&STYLES=" + this.myStyles;
        lURL += "&FORMAT=" + this.myFormat;
        lURL += "&BGCOLOR=" + this.myBgColor;
        lURL += "&TRANSPARENT=TRUE";
        lURL += "&SRS=" + lSRS;
        lURL += "&BBOX=" + lBbox;
        lURL += "&WIDTH=256";
        lURL += "&HEIGHT=256";
        lURL += "&reaspect=false";
        //console.log(lURL);

        return lURL;

    },

    // type: zip or crid, overlays: an object that contains the polygons
    // geosToShow, an array that contains the zips or crids, 
    // map, the map, callback, the function to handle the result 
    ShowGeoElements: function(type, geos, overlays, geosToShow, map, callback) {
        var mapGetDataUrl;
        _.each(geos, function(geo) {
            mapGetDataUrl = page.global.MapGetDataUrl + String.format("type={0}&{0}={1}&callback=?", type, geo);
            $.get(mapGetDataUrl, function(data) {
                var id = data.id;
                //                if (!_.has(overlays, id)) {
                //                    callback(id, data.data, map);
                //                    // All set, let's zoom and center the map
                //                    if (geosToShow.length >= geos.length) {
                //                        zoomMapToElements(overlays, map);
                //                    }
                //                }
                callback(id, data.data, map);
                // All set, let's zoom and center the map
                if (geosToShow.length >= geos.length) {
                    framework.common.ZoomMapToElements(overlays, map);
                }
            }, "json");
        });
    },

    SearchAddressWithAddress: function(elMap, address, radius, callback) {
        if (String.IsNullOrEmpty(address)) {
            elMap.jmap('ClearMap');
            return;
        }

        elMap.jmap('SearchAddress', {
            'query': address,
            'returnType': 'getLocations'
        }, function(result, options) {

            //var valid = Mapifies.SearchCode(result.Status.code);
            var valid = Mapifies.SearchCode(options);
            if (valid.success) {
                // jQuery.each(result.Placemark, function(i, point) {

                var validAddresses = new Array();
                //var placeMarks = result.Placemark;
                var placeMarks = result;
                var position = 0;
                //				for (var i = 0; i < placeMarks.length; i++) {
                //					if (uc.geo.radius.IsValidAddress(placeMarks[i].AddressDetails.Accuracy)) {
                //						validAddresses[position++] = placeMarks[i];
                //					}
                //				}
                var point;
                if (validAddresses.length > 0) {
                    point = validAddresses[0];
                } else {
                    point = result[0];
                }
                var thisMap = Mapifies.MapObjects.Get(elMap);
                var mapZoom = null;
                if (String.IsNullOrEmpty(radius)) {
                    mapZoom = 15;
                }

                //thisMap.clearOverlays();
                elMap.jmap('ClearMap');
                elMap.jmap('MoveTo', {
                    'mapCenter': [point.geometry.location.lat(), point.geometry.location.lng()],
                    'mapZoom': mapZoom
                });
                if (!String.IsNullOrEmpty(radius)) {
                    elMap.jmap('AddRoundCircleOverlay', {
                        'mapCenter': [point.geometry.location.lat(), point.geometry.location.lng()],
                        'radius': radius
                    });
                }
                elMap.jmap('AddMarker', {
                    'pointLatLng': [point.geometry.location.lat(), point.geometry.location.lng()],
                    'pointIcon': 'themes/default/assets/images/gmap/mm_20_blue.png',
                    'pointTitle': point.address
                });

                //				var radiusAddress = new entity.OrderAddress();
                //				radiusAddress.AddrUsageType = 2; // AddressType.SEARCH_CENTER_ADDRESS;
                //				radiusAddress.AddressName = address;
                //				radiusAddress.Latitude = point.Point.coordinates[1]; //.toFixed(6);
                //				radiusAddress.Longitude = point.Point.coordinates[0]; //.toFixed(6);
                //				radiusAddress.AddressLine = address;
                //				radiusAddress.Radius = radius;
                //				uc.geo.radius.CurrentAddress = radiusAddress;

                //				framework.ui.ShowMarkers(uc.geo.radius.RadiusAddresses, elMap);
                //				//uc.geo.radius.ShowTargetAddresses(uc.geo.radius.RadiusAddresses);
                //				// show more address if exist
                //				uc.geo.radius.ShowMoreAddresses(validAddresses);

                //                uc.geo.radius.WarnIfAddressAccuracyIsMatched(point.address, point.AddressDetails.Accuracy);

                if (typeof callback == 'function') {
                    callback(new google.maps.LatLng(point.geometry.location.lat(), point.geometry.location.lng()), radius);
                }

                // });
            } else {
                elMap.jmap('ClearMap');

            }

        });
        return false;
    },

    DecodePaths: function(obj) {
        return google.maps.geometry.encoding.decodePath(obj);
    },


    ZoomMapToElements: function(overlays, map) {
        // This is a dirty job, we have to iterate each polygon, and then each polyline, and then each point of it to extend the bounds
        if (_.isEmpty(overlays)) {
            return;
        }
        var latlngbounds = new google.maps.LatLngBounds();
        _.each(overlays, function(mp, i) {
            _.each(mp, function(p) {
                //latlngbounds.extend(p.getBounds().getSouthWest());
                //latlngbounds.extend(p.getBounds().getNorthEast());
                for (var i = 0; i < p.getPaths().b[0].b.length; i++) {
                    latlngbounds.extend(p.getPaths().b[0].b[i]);
                }

            });
        });
        //console.log("Setting center and zoom level...");
        //map.setCenter(latlngbounds.getCenter(), map.getBoundsZoomLevel(latlngbounds));
        map.setCenter(latlngbounds.getCenter());
        map.fitBounds(latlngbounds);
    },

    LoadJS: function(url) {
        if (!String.IsNullOrEmpty(url)) {
            jQuery.getScript(url);
        }
    },

    LeftPad: function(target, padChar, maxLength) {
        var result = "";
        if (target == null) {
            result = "";
        } else {
            result = new String(target);
        }
        if (result.length >= maxLength) {
            return result.substr(0, maxLength);
        }
        var pad = framework.common.GetPad(result, padChar, maxLength);
        return pad + result;
    },

    GetPad: function(target, padChar, maxLength) {
        if (String.IsNullOrEmpty(padChar)) {
            padChar = " ";
        }
        if (padChar.length > 1) {
            padChar = padChar.substr(0, 1);
        }
        if (maxLength < 0) {
            maxLength = 0;
        }
        if (target.length >= maxLength) {
            return "";
        }
        var diffLength = maxLength - target.length;
        var pad = "";
        for (var i = 0; i < diffLength; i++) {
            pad = pad + padChar;
        }
        return pad;
    },

    IsAbsoluteLink: function(link) {
        var absoluteLinkReg = new RegExp("^(http://)|(https://)", "i");
        return absoluteLinkReg.test(link);
    },

    ShowDialogWithLink: function(element, width, height) {
        var dialogLink = jQuery(element).attr("target_href");
        if (String.IsNullOrEmpty(dialogLink)) {
            return false;
        }

        var link = "";
        if (framework.common.IsAbsoluteLink(dialogLink)) {
            link = dialogLink;
        } else {
            link = framework.common.SiteRootPath + dialogLink;
        }
        //$.fn.colorbox({ href: link, iframe: true, width: 1250, height: 800, opacity: 0.5, scrolling: true });
        $.fn.colorbox({ href: link, iframe: true, width: width, height: height, opacity: 0.5, scrolling: true });
        return false;

    },

    // test the value is a number with the specified length
    IsNumber: function(value, length) {
        if (String.IsNullOrEmpty(value) || length < 1) {
            return false;
        }
        var regE = String.format("^[0-9]{{0}}$", length);
        var reg = new RegExp(regE, "i");
        return reg.test(value);
    },

    Log: function(startTime, message) {
        var consumedTime = (new Date()).getTime() - startTime.getTime();
        //console.log(message + " consumed " + consumedTime + " milliseconds");
    }

};

framework.common.iPad = {
    IsIpad: function() {
        //return false;
        //return (navigator.userAgent.match(new RegExp("iPad", "i")) != null);

        return navigator.userAgent.match(/iPad/i)
		    || navigator.userAgent.match(/iPhone/i);
        //return true;

    },

    addMaskToList: function(id) {

        // check if it's need to add mask for list
        if (!framework.common.iPad.IsIpad()) {
            return;
        }
        /**
        var targetId = id;
        var $el = $('#' + targetId);
        var top = $el.offset().top;
        var left = $el.offset().left;
        var width = $el.width() + 10;
        var height = $el.height();
        // check if the div mask exists or not
        var maskDivs = jQuery("div[target_id=" + targetId + "]");

		var outerDivId = id + "_outer";

		var outerDiv = jQuery("#" + outerDiv);
        if (outerDiv.length < 1) {
        var listOuterHtml = '<div id="' + outerDivId + '" class="list_mask_outer"></div>';
        $el.wrap(listOuterHtml);
        }

		$maskdiv = null;
        if (maskDivs.length > 0) {
        var maskdivArr = [
        '<div target_id="', targetId, '" onclick="javascript:framework.common.iPad.clickMaskToShowList(this)" class="list_mask_div">',
        '</div>'].join('');

			$maskdiv = $(maskdivArr);

			$el.after($maskdiv);
        } else {
        $maskdiv = maskDivs;
        }

		framework.common.iPad.fillOptionsToMask($el, $maskdiv);

		$el.focusout(function() {
        var id = this.id;
        var $maskdiv = $("div[target_id='" + id + "']");
        framework.common.iPad.fillOptionsToMask($(this), $maskdiv);
        });

		$el.bind("DOMSubtreeModified", function() {
        var id = this.id;
        var $maskdiv = $("div[target_id='" + id + "']");
        framework.common.iPad.fillOptionsToMask($(this), $maskdiv);
        });
        **/

        var _listOuterHtml = '<div class="list_mask_outer"></div>';
        var _maskDivHtml = '<div target_id="' + id + '" onclick="javascript:framework.common.iPad.clickMaskToShowList(this);" class="list_mask_div"></div>';

        var $el = $('#' + id);
        $maskdiv = $(_maskDivHtml);
        var $table = framework.common.iPad.generateListTextToTable($el[0]);
        $maskdiv.append($table);

        $el.wrap(_listOuterHtml).parent().append($maskdiv);

        $el.focusout(function() {
            framework.common.iPad.fillOptionsToMask(this);
        });

        //		$el.bind("DOMSubtreeModified", function() {

        //			framework.common.iPad.fillOptionsToMask(this);
        //		});


        //		$el.bind("change", function() {
        //			framework.common.iPad.fillOptionsToMask(this);
        //		});
    },

    fillOptionsToMask: function(el) {
        /**
        var $contentHtml = $("<table style='width:100%'></table>");
        var options = source.find('option');
        options.each(function(i, option) {
        var strTRTD = "<tr><td>";
        if ($(option).attr("selected") == true) {
        strTRTD = "<tr class='list_mask_hightlight'><td>";
        }
        $contentHtml.append($(strTRTD + $(this).val() + "</td></tr>"));
        });
        target.empty().append($contentHtml);
        **/
        var $maskdiv = $("div[target_id='" + el.id + "']");
        var $table = framework.common.iPad.generateListTextToTable(el);
        $maskdiv.empty().append($table);

    },

    generateListTextToTable: function(el) {
        $el = $(el);
        var $contentHtml = $('<table style="width:100%"></table>');
        var options = $el.find('option');
        options.each(function(i, option) {
            var strTRTD = '<tr><td>';
            if ($(option).attr("selected") == true) {
                strTRTD = '<tr class="list_mask_hightlight"><td>';
            }
            var line_html = strTRTD + $(this).text() + '</td></tr>';
            $contentHtml.append(line_html);
        });

        return $contentHtml;
    },

    clickMaskToShowList: function(el) {
        var targetId = $(el).attr("target_id");
        $('#' + targetId).trigger("focus");
    },

    refreshMask: function(id) {
        if (framework.common.iPad.IsIpad()) {
            var el = $('#' + id)[0];
            framework.common.iPad.fillOptionsToMask(el);
        }
    }
};

jQuery.fn.extend({
    setMask: function(options) {
        //skip mask for iPad
        if (framework.common.iPad.IsIpad()) {
            return $(this);
        }
        return $.mask.set(this, options);
    }
});