// set sunday as first day of a week.
Date.firstDayOfWeek = 0;
framework.ui = {
    renderDropDownList: function(arg) {

        var DropDownListDefaultSetting = {
            ElementId: null,
            DataSource: null,
            ValueField: "Code",
            TextField: "DisplayName",
            SelectValue: null
        };

        var setting = jQuery.extend({}, DropDownListDefaultSetting, arg);
        if (setting.SelectValue == null && setting.DataSource != null && setting.DataSource.length > 0) {
            setting.SelectValue = framework.common.getProperty(setting.DataSource[0], setting.ValueField);
        }
        var templatestring = '';
        for (var i = 0; i < setting.DataSource.length; i++) {
            var valueField = framework.common.getProperty(setting.DataSource[i], setting.ValueField);
            var textField = framework.common.getProperty(setting.DataSource[i], setting.TextField);
            if (valueField == setting.SelectValue) {
                templatestring = templatestring + '<option value="' + valueField + '" selected="selected">' + textField + '</option>';
            }
            else {
                templatestring = templatestring + '<option value="' + valueField + '">' + textField + '</option>';
            }
        }

        return templatestring;
    },

    //for acxiom start
    renderDropDownListAcxiom: function(arg) {

        var DropDownListDefaultSetting = {
            ElementId: null,
            DataSource: null,
            ValueField: "Code",
            HasBlank: false,
            TextField: "DisplayName",
            SelectValue: null
        };

        var setting = jQuery.extend({}, DropDownListDefaultSetting, arg);

        if (setting.SelectValue == null) {
            if (setting.HasBlank) {
                setting.SelectValue = "";
            } else {
                if (setting.DataSource != null && setting.DataSource.length > 0) {
                    setting.SelectValue = framework.common.getProperty(setting.DataSource[0], setting.ValueField);
                }
            }
        }
        var templatestring = '';
        for (var i = 0; i < setting.DataSource.length; i++) {
            var valueField = framework.common.getProperty(setting.DataSource[i], setting.ValueField);
            var textField = framework.common.getProperty(setting.DataSource[i], setting.TextField);
            if (valueField.toString() == setting.SelectValue.toString()) {
                templatestring = templatestring + '<option value="' + valueField + '" selected="selected">' + textField + '</option>';
            }
            else {
                templatestring = templatestring + '<option value="' + valueField + '">' + textField + '</option>';
            }
        }
        if (setting.HasBlank) {
            if (setting.SelectValue == "") {
                var emptyOption = '<option value="" selected="selected">-- Choose One --</option>';
            }
            else {
                var emptyOption = '<option value="">-- Choose One --</option>';
            }
            templatestring = emptyOption + templatestring;
        }
        if (setting.ElementId != null) {
            $("#" + setting.ElementId).html(templatestring);
        }

        return templatestring;
    },

    fillDropDownListAcxiom: function(arg) {
        var DropDownListDefaultSetting = {
            ElementId: null,
            DataSource: null,
            ValueField: "Code",
            TextField: "DisplayName",
            SelectValue: null,
            Attributes: null,
            EmptyValueSetting: null, //{ValueField: 'xxx', TextField: ''}
            Index: null //specify index name
        };

        var setting = jQuery.extend({}, DropDownListDefaultSetting, arg);
        if (setting.ElementId != null && setting.DataSource != null && setting.DataSource.length > 0) {
            var attr_template = '';
            if (setting.Attributes != null) {
                for (var attr in setting.Attributes) {
                    var attrvalue = setting.Attributes[attr];
                    attr_template += (attr + "='{$T.record." + attrvalue + "}'");
                }
            }

            if (setting.Index != null) {
                attr_template += (setting.Index + "={$T.record$index}");
            }

            template = "{#foreach $T as record}<option value='{$T.record." + setting.ValueField + "}'" + attr_template + " >{$T.record." + setting.TextField + "}</option>{#/for}";

            // check whether need to add empty selection
            if (setting.EmptyValueSetting != null) {
                var emptyOption = "<option value='" + setting.EmptyValueSetting.ValueField + "'>" + setting.EmptyValueSetting.TextField + "</option>";
                template = emptyOption + template;
            }

            // process template
            var $e = $('#' + setting.ElementId);
            $e.setTemplate(template);
            $e.processTemplate(setting.DataSource);

            // set default selected value
            if (setting.SelectValue != null) {
                $e.attr("value", setting.SelectValue);

            } else {
                //To solve the unexpected error in ie6 
                //hack for ie6
                try {
                    $e.attr("value", framework.common.getProperty(setting.DataSource[0], setting.ValueField));
                }
                catch (ex) {
                    if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.indexOf("MSIE 6.0") > 0) {
                        //do nothing
                    } else {
                        throw ex;
                    }
                }
            }
        }
        if (framework.common.iPad.IsIpad()) {
            jQuery("#" + setting.ElementId + "[multiple] option:selected").removeAttr("selected");
        }
        framework.common.iPad.refreshMask(setting.ElementId);
    },
    ReplaceAttr: function(className, attrName, value) {
        var elements = jQuery("." + className);
        elements.attr(attrName, value);
    },
    //    ShowMarkersAcxiom: function(addresses, elMap) {
    //        if (addresses == null || addresses.length == 0) {
    //            return;
    //        }
    //        for (var i = 0; i < addresses.length; i++) {
    //            elMap.jmap('AddMarker', {
    //                'pointLatLng': [addresses[i].Latitude, addresses[i].Longitude],
    //                'pointIcon': 'themes/default/assets/images/gmap/mm_20_blue.png',
    //                'pointTitle': addresses[i].AddressName
    //            });
    //        }

    //    },
    ScrollToElement: function(id) {
        var top = $("#" + id).offset().top - 100;
        scrollTo(0, top);
    },

    //end 



    fillDropDownList: function(arg) {
        var DropDownListDefaultSetting = {
            ElementId: null,
            DataSource: null,
            ValueField: "Code",
            TextField: "DisplayName",
            SelectValue: null,
            Attributes: null,
            EmptyValueSetting: null //{ValueField: 'xxx', TextField: ''}
        };

        var setting = jQuery.extend({}, DropDownListDefaultSetting, arg);
        if (setting.ElementId != null && setting.DataSource != null && setting.DataSource.length > 0) {
            var attr_template = '';
            if (setting.Attributes != null) {
                for (var attr in setting.Attributes) {
                    var attrvalue = setting.Attributes[attr];
                    attr_template += (attr + "='{$T.record." + attrvalue + "}'");
                }
            }

            template = "{#foreach $T as record}<option value='{$T.record." + setting.ValueField + "}'" + attr_template + " >{$T.record." + setting.TextField + "}</option>{#/for}";

            // check whether need to add empty selection
            if (setting.EmptyValueSetting != null) {
                var emptyOption = "<option value='" + setting.EmptyValueSetting.ValueField + "'>" + setting.EmptyValueSetting.TextField + "</option>";
                template = emptyOption + template;
            }

            // process template
            var $e = $('#' + setting.ElementId);
            $e.setTemplate(template);
            $e.processTemplate(setting.DataSource);

            // set default selected value
            if (setting.SelectValue != null) {
                $e.attr("value", setting.SelectValue);

            } else {
                //To solve the unexpected error in ie6 
                //hack for ie6
                try {
                    $e.attr("value", framework.common.getProperty(setting.DataSource[0], setting.ValueField));
                }
                catch (ex) {
                    if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.indexOf("MSIE 6.0") > 0) {
                        //do nothing
                    } else {
                        throw ex;
                    }
                }
            }
        }
        if (framework.common.iPad.IsIpad()) {
            jQuery("#" + setting.ElementId + "[multiple] option:selected").removeAttr("selected");
        }
        framework.common.iPad.refreshMask(setting.ElementId);
    },

    showWaiting: function(id, isShow) {
        var messageHtml = "<img alt='Waiting..' src='" + framework.common.SiteRootPath + "/themes/default/assets/images/spinner2.gif' />";
        var defaultOpts = {
            message: messageHtml,
            css: { cursor: "default", border: '0px solid #aaa', opacity: 1, backgroundColor: 'transparent', left: '48%', top: '48%' },
            overlayCSS: { opacity: 0.2, backgroundColor: '#ccc' },
            showOverlay: true,
            centerY: true,
            centerX: true,
            fadeIn: 0
        }
        // show full waiting
        if (id == null) {
            if (isShow) {
                jQuery.blockUI(defaultOpts);
            } else {
                jQuery.unblockUI({ fadeOut: 0 });
            }
        } else {
            // show waiting on element
            var selector = '#' + id;
            if (isShow) {
                jQuery(selector).block(defaultOpts);
            } else {
                jQuery(selector).unblock();
            }
        }
    },

    ShowDialog: function(id, opts) {
        var defaultOpts = {
            message: $('#' + id),
            css: { cursor: "default", border: '0px solid #aaa', top: '25%' },
            hermesTheme: true,
            overlayCSS: { cursor: "default", opacity: 0.0 },
            fadeIn: 0,
            fadeOut: 0,
            focusInput: false,
            appendForm: false
        };

        var setting = jQuery.extend({}, defaultOpts, opts);

        jQuery.blockUI(setting);
    },

    ShowWindowDialog: function(url, width, height, opts) {
        var iframeWrapper = '<iframe src="{0}" style="width:{1}px; height: {2}px;" frameborder="no" border="0" scrolling="no"></iframe>';
        var msg = String.format(iframeWrapper, url, width, height);
        var defaultOpts = {
            message: msg,
            css: { cursor: "default", border: '0px solid #aaa', top: '25%' },
            hermesTheme: true,
            overlayCSS: { cursor: "default", opacity: 0.0 },
            fadeIn: 0,
            fadeOut: 0
        };
        var setting = jQuery.extend({}, defaultOpts, opts);
        jQuery.blockUI(setting);
    },

    CloseDialog: function(opts) {
        var defaultOpts = {
            fadeIn: 0,
            fadeOut: 0
        };
        var setting = jQuery.extend({}, defaultOpts, opts);
        jQuery.unblockUI(setting);
    },

    AddCloseDialogEvent: function(func) {
        var closeBtn = jQuery('.blockPage .closeBtn');
        closeBtn.click(function() {
            // zecco.hermes.framework.ui.CloseDialog();
            func();
        })
    },

    InitializeTooltip: function(selector, opts) {
        var defaultOpts = {
            positions: 'top',
            fill: '#FFFFEA',
            strokeStyle: '#B7B7B7',
            spikeLength: 8,
            spikeGirth: 8,
            padding: 8,
            cornerRadius: 0,
            trigger: "click",
            clickAnywhereToClose: true,
            closeWhenOthersOpen: true,
            shadowshadow: false,
            hoverIntentOpts: {
                interval: 0,
                timeout: 0
            }
        };

        var setting = jQuery.extend({}, defaultOpts, opts);
        jQuery(selector).bt(setting);
    },

    ReplaceText: function(className, text) {
        jQuery("." + className).text(text);
    },

    ReplaceEmail: function(className, email) {
        var elements = jQuery("." + className);
        elements.attr("href", "mailto:" + email);
        elements.html(email);
    },


    ReplaceTargetEmail: function(element, placeholder, email) {
        if (element.length < 1) {
            return
        }
        element.attr("href", "mailto:" + email);
        var outerHtml = "<div></div>";
        var outerElemnt = jQuery(outerHtml).append(element.clone());

        var elementHtml = outerElemnt.html();
        var reg = new RegExp(placeholder, "g");
        var subsitutedHtml = elementHtml.replace(reg, email);
        element.before(subsitutedHtml);
        element.remove();
    },

    CustomizeSiteInfo: function() {
        $(".topFirstLi").addClass("hidden");
        if (!String.IsNullOrEmpty(page.global.User_FullName.trim())) {
            $("#topUserName").html(page.global.User_FullName + " (Log Out)");
            $("#topUserName_V4").html(page.global.User_FullName);
            $("#topUserName_V5").html(page.global.User_FullName);
            $("#topUserName_sl360").html(page.global.User_FullName);
            $(".topFirstLi").removeClass("hidden");
        }
        if (String.IsNullOrEmpty(page.global.CustomizedInfoBySite)) {
            return;
        }
        jQuery("#customizedInfoForSite").html(page.global.CustomizedInfoBySite);
        jQuery("#customizedInfoForSite2").html(page.global.CustomizedInfoBySite);

    },

    ShowVideo: function(element) {
        var targetHref = jQuery(element).attr("target_href");
        $.fn.colorbox({ href: targetHref, iframe: true, width: 900, height: 580, opacity: 0.5, scrolling: false, overlayClose: false });
    },

    ShowMarkers: function(addresses, elMap, isPolygonEditable) {
        if (addresses == null || addresses.length == 0) {
            return;
        }
        for (var i = 0; i < addresses.length; i++) {
            if (page.placeorder.order.GeoType != entity.enums.GeoType.Polygon) {
                var radiusValue = Number(addresses[i].Radius);
                if (radiusValue > 0) {
                    elMap.jmap('AddRoundGroundOverlay', {
                        'mapCenter': [addresses[i].Latitude, addresses[i].Longitude],
                        'radius': addresses[i].Radius
                    });
                }
            } else {
                var points = uc.geo.radius.ParsePoints(addresses[i].AddrSearchString);
                uc.geo.radius.DrawPolygon(elMap, points, isPolygonEditable);
            }
            if (addresses[i].AddressName != "") {
                elMap.jmap('AddMarker', {
                    'pointLatLng': [addresses[i].Latitude, addresses[i].Longitude],
                    'pointIcon': 'themes/default/assets/images/gmap/mm_20_blue.png',
                    'pointTitle': addresses[i].AddressName
                });
            }
        }

    },

    GetRadiusUnitDesc: function(radiusUnit) {
        var radiusUnitDesc = "mile(s)";
        if (radiusUnit == entity.enums.UmCodeType.KM) {
            radiusUnitDesc = "kilometer(s)";
        }
        return radiusUnitDesc;
    }

}