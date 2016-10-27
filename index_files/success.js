ni.RegisterNameSpace("uc");
uc.success = {
    // Initial Step Setting
    InitStepSetting: function(order) {
        var step = page.placeorder.orderflow || new entity.OrderFlow();
        step.CurrentStep = entity.enums.OrderStep.Success;
        step.StepTitle = "";
        step.StepDescription = "";
        step.StepButtonsStatus = entity.enums.StepButtons.PlaceAnotherOrder | entity.enums.StepButtons.PrintOrder;
        step.StepButtonsEvent = [
			{ ButtonKey: entity.enums.StepButtons.PrintOrder, ButtonEvent: uc.success.printOrder }
		];
        return step;
    },

    Init: function() {

        page.placeorder.order.CurrentStep = entity.enums.OrderStep.Success;

        // ToDo: moving follow codes, use orderflow object and fire the init step listener
        var step = uc.success.InitStepSetting();
        framework.listener.FireListener(framework.listener.LISTENER_INIT_STEP, step);

        uc.success.LoadOrder();
        if (!page.placeorder.IsShowOrderGeoDetailQuantity) {
            jQuery("#geographyDetailsTable td[attr='selectedQuantity']").addClass("hidden");
        }
        $("#PriorVersion").addClass("hidden");

        if (!$("#order_step_header_mobile").hasClass("hidden")) {
            $("#order_step_header_mobile").addClass("hidden");
        }

        if (!framework.common.IsRegisteredSite && page.global.isMyAcxiomPartnerUSite) {
            $("#order_success_time_period").text("(Mon-Fri, 9am-6pm EST)");
            $("#order_success_fulfill_name").text("Orders");
            $("#order_success_fulfill_time").addClass("hidden");
        }

        if (framework.common.IsRegisteredSite && page.global.isMyAcxiomSite) {
            $("#order_success_time_period").text("(Mon-Fri, 9am-6pm EST)");
            $("#order_success_fulfill_name").text("Orders");
            $("#order_success_fulfill_time").addClass("hidden");
        }

        $("#ordersuccess_mobile_standalone").addClass("hidden");

        if (page.placeorder.order.Chose4Info) {
            if (page.placeorder.order.ListType == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
                $("#ordersuccess_mobile_standalone").removeClass("hidden");
                $("#ordersuccess_orderdetails").removeAttr("style");
            }
        }
        else {
            $("#ordersuccess_orderdetails").removeAttr("style");
        }

        $("#ordersuccess_footer").removeClass("hidden");
        $("#ct_ordersucess_header").removeClass("hidden");
        if (page.placeorder.order.ListType == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
            $("#ordersuccess_footer").addClass("hidden");
            //$("#ct_ordersucess_header").addClass("hidden");
            //$(".sucess_mobile_line").addClass("hidden");
        } else {
            $(".sucess_mobile_line").removeClass("hidden");
        }

        //load google analytics js code. jack.xin 2012-07-25
        uc.success.Load_Google_Analytics_Js();

        //load google analytics code #5068 richer.fang 2014-04-25
        uc.success.LoadGoogleAnalyticsJsCode();
    },

    //load google analytics js code. jack.xin 2012-07-25
    Load_Google_Analytics_Js: function() {

        $.getScript("//www.googleadservices.com/pagead/conversion.js");

        $("#Success_Google_Analytics_Js")[0].innerHTML =
			"<script type=\"text/javascript\">" +
            "try {" +
                "var google_conversion_id = 1072646300;" +
                "var google_conversion_language = \"en_US\";" +
                "var google_conversion_format = \"1\";" +
                "var google_conversion_color = \"ffffff\";" +
                "var google_conversion_label = \"n1cpCO2NPhCckb3_Aw\";" +
                "var google_conversion_value = 10;" +
            "} catch (err) { }" +
			"<\/script>" +
			"<noscript>" +
			"<div style=\"display:inline;\">" +
                "<img height=1 width=1 style=\"border-style:none;\" alt='' src='https://www.googleadservices.com/pagead/conversion/1072646300/?value=10&amp;label=n1cpCO2NPhCckb3_Aw&amp;guid=ON&amp;script=0' />" +
            "</div>"
        "</noscript>;";

    },

    LoadGoogleAnalyticsJsCode: function() {
        var order = page.placeorder.order;
        var totalCharge = null;
        var stringHtml = null;
        var orderCharge = null;
        var stringEndHtml = null;
        var Quantites = order.TotalDesiredQty;
        var unitPrice = null;
        var mobileUnitPrice = null;
        var orderDoamin = window.location.hostname.toLowerCase().substring(window.location.hostname.toLowerCase().indexOf('.') + 1, window.location.hostname.toLowerCase().length);

        if (order.ListType == entity.enums.DataSourceType.Consumer && order.Chose4Info == true) {
            orderCharge = order.OrderCharge;
            totalCharge = Math.round((order.TotalEstmCost + order.MobilePackageCharge) * 100) / 100;
            unitPrice = Math.round((orderCharge / Quantites) * 100000) / 100000;
            mobileUnitPrice = Math.round(((order.MobilePackageCharge) / Quantites) * 100000) / 100000;
        } else if (order.ListType == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
            totalCharge = Math.round((order.MobilePackageCharge) * 100) / 100;
            orderCharge = Math.round((order.MobilePackageCharge) * 100) / 100;
            unitPrice = Math.round((totalCharge / Quantites) * 100000) / 100000
        } else {
            totalCharge = Math.round((order.TotalEstmCost) * 100) / 100;
            orderCharge = Math.round((order.OrderCharge) * 100) / 100;
            unitPrice = Math.round((totalCharge / Quantites) * 100000) / 100000;
        }

        //        var _gaq = _gaq || [];
        //        _gaq.push(['_setAccount', 'UA-51233316-1']);
        //        if (order.PaymentMethod != entity.enums.PaymentMethod.MonthlyBilling) {
        //            if (order.ListType == entity.enums.DataSourceType.Consumer && order.Chose4Info == true) {
        //                _gaq.push(['_trackPageview']); _gaq.push(['_addTrans', "'" + order.OrderCode + "'", "'" + page.global.SiteName + "'", "'" + totalCharge + "'", '0.00', "'" + order.ShippingCharge + "'", "'" + order.OrderContactInformation.City + "'", "'" + order.OrderContactInformation.State + "'", "'" + order.OrderContactInformation.CountryCode + "'"]);
        //                _gaq.push(['_addItem', "'" + order.OrderCode + "'", "'" + uc.success.FormatItemCode(order.ListType) + "'", "'" + entity.lookup.DataSource.getByCode(order.ListType).Code + "'", 'New Prospects', "'" + orderCharge + "'", "'" + order.TotalDesiredQty + "'"]);
        //                _gaq.push(['_addItem', "'" + order.OrderCode + "'", 'MC', 'Mobile Campaign', 'New Prospects', "'" + order.MobilePackageCharge + "'", "'" + order.TotalDesiredQty + "'"]);
        //            } else {
        //                _gaq.push(['_trackPageview']); _gaq.push(['_addTrans', "'" + order.OrderCode + "'", "'" + page.global.SiteName + "'", "'" + totalCharge + "'", '0.00', "'" + order.ShippingCharge + "'", "'" + order.OrderContactInformation.City + "'", "'" + order.OrderContactInformation.State + "'", "'" + order.OrderContactInformation.CountryCode + "'"]);
        //                _gaq.push(['_addItem', "'" + order.OrderCode + "'", "'" + uc.success.FormatItemCode(order.ListType) + "'", "'" + entity.lookup.DataSource.getByCode(order.ListType).Code + "'", 'New Prospects', "'" + orderCharge + "'", "'" + order.TotalDesiredQty + "'"]);
        //            }
        //        } else {
        //            if (order.ListType == entity.enums.DataSourceType.Consumer && order.Chose4Info == true) {
        //                _gaq.push(['_trackPageview']); _gaq.push(['_addTrans', "'" + order.OrderCode + "'", "'" + page.global.SiteName + "'", "'" + totalCharge + "'", '0.00', "'" + order.ShippingCharge + "'"]);
        //                _gaq.push(['_addItem', "'" + order.OrderCode + "'", "'" + uc.success.FormatItemCode(order.ListType) + "'", "'" + entity.lookup.DataSource.getByCode(order.ListType).Code + "'", 'New Prospects', "'" + orderCharge + "'", "'" + order.TotalDesiredQty + "'"]);
        //                _gaq.push(['_addItem', "'" + order.OrderCode + "'", 'MC', 'Mobile Campaign', 'New Prospects', "'" + order.MobilePackageCharge + "'", "'" + order.TotalDesiredQty + "'"]);
        //            } else {
        //                _gaq.push(['_trackPageview']); _gaq.push(['_addTrans', "'" + order.OrderCode + "'", "'" + page.global.SiteName + "'", "'" + totalCharge + "'", '0.00', "'" + order.ShippingCharge + "'"]);
        //                _gaq.push(['_addItem', "'" + order.OrderCode + "'", "'" + uc.success.FormatItemCode(order.ListType) + "'", "'" + entity.lookup.DataSource.getByCode(order.ListType).Code + "'", 'New Prospects', "'" + orderCharge + "'", "'" + order.TotalDesiredQty + "'"]);
        //            }
        //        }
        //        _gaq.push(['_trackTrans']);
        //        
        //        (function() {
        //            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        //            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        //            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        //        })();
        (function(i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function() {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date(); a = s.createElement(o),
        m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', '__gaTracker');
        if (page.placeorder.GoogleAnalyticsCodeAccount != null) {
            __gaTracker('create', page.placeorder.GoogleAnalyticsCodeAccount, orderDoamin);
        }
        else {
            __gaTracker('create', 'UA-51233316-1', 'myacxiompartner.com');
        }
        __gaTracker('send', 'pageview');
        __gaTracker('require', 'ecommerce', 'ecommerce.js');
        __gaTracker('ecommerce:addTransaction', { 'id': order.OrderCode, 'affiliation': page.global.SiteName, 'revenue': totalCharge, 'shipping': order.ShippingCharge, 'tax': '0.00' });
        __gaTracker('ecommerce:addItem', { 'id': order.OrderCode, 'name': entity.lookup.DataSource.getByCode(order.ListType).DisplayName, 'sku': uc.success.FormatItemCode(order.ListType), 'category': 'Mailing Lists', 'price': unitPrice, 'quantity': Quantites });
        if (order.ListType == entity.enums.DataSourceType.Consumer && order.Chose4Info == true) {
            __gaTracker('ecommerce:addItem', { 'id': order.OrderCode, 'name': 'Mobile Advertising', 'sku': 'MA', 'category': 'Mailing Lists', 'price': mobileUnitPrice, 'quantity': Quantites });
        }
        //else if (order.ListType == entity.enums.DataSourceType.Consumer && facebookOrder!="") {
        //__gaTracker('ecommerce:addItem', { 'id': order.OrderCode, 'name': 'Facebook Advertising', 'sku': 'MA', 'category': 'Mailing Lists', 'price': 0, 'quantity': Quantites });
        // }
        __gaTracker('ecommerce:send');
    },

    FormatItemCode: function(listType) {
        var format = '';
        switch (listType) {
            case 10:
                format = 'CL';
                break;
            case 20:
                format = 'BL';
                break;
            case 30:
                format = 'NHL';
                break;
            case 40:
                format = 'NM';
                break;
            case 50:
                format = 'ROL';
                break;
            case 60:
                format = 'NH';
                break;
            case 70:
                format = 'CML';
                break;
            case 80:
                format = 'CL';
                break;
            case 90:
                format = 'B';
                break;
            case 100:
                format = 'CC';
                break;
            case 110:
                format = 'ICL';
                break;
            case 120:
                format = 'BL';
                break;
            case 130:
                format = 'O/SL';
                break;
            case 140:
                format = 'RO';
                break;
            case 150:
                format = 'ICL';
                break;
            case 160:
                format = 'IBL';
                break;
            case 170:
                format = 'IBL';
                break;
            case 180:
                format = 'BL';
                break;
            case 190:
                format = 'MC';
                break;

        }
        return format;
    },

    LoadOrder: function() {
        var order = page.placeorder.order;
        //jQuery('#ordersuccess_orderid').html(order.OrderCode);
        //jQuery('#ordersuccess_email').html(order.OrderContactInformation.Email);
        framework.ui.ReplaceEmail("SenderEmail", page.global.SenderEmail);
        jQuery("#ordersuccess_contact_mail").html(page.global.ContactEmail);
        jQuery("#ordersuccess_contact_mail").attr("href", "mailto:" + page.global.ContactEmail);
        jQuery("#ordersuccess_sender_email").html(page.global.SenderEmail);
        jQuery("#ordersuccess_sender_email").attr("href", "mailto:" + page.global.SenderEmail);

        var headerMsg = "";

        if (page.placeorder.StepSuccessDesc) {
            headerMsg = String.format(page.placeorder.StepSuccessDesc, order.OrderCode, order.OrderContactInformation.Email, page.global.PhoneNumber);

            jQuery("#ordersuccess_footer").addClass("hidden");
            jQuery("#ct_ordersucess_header").html(headerMsg);
        }
        else {
            var formatMsg = "<p>Thank You! Your Order Number is <b>{0}</b>. </p><p>A confirmation email with your receipt has been sent to {1}. {2} is currently being processed. When it is complete, <span id='order_success_fulfill_time'>typically within 30 minutes, </span>you will receive a second email with links to retrieve your list in MS Excel and comma-delimited text format. {3}</p>";

            var yourOrderPhrase = "Your order";

            if (!order.OrderThirdPartyAccount || order.OrderThirdPartyAccount.length == 0) {
                page.placeorder.FacebkText = "";
            }

            if (order.ListType == entity.enums.DataSourceType.Consumer && order.Chose4Info) {

                formatMsg += "<p>To add a banner and launch your mobile campaign, choose My Mobile Campaigns within the \"account\" menu above.</p>";

                yourOrderPhrase = "The list portion of your order";

                jQuery("#ordersuccess_footer_Ad").removeClass("hidden");
            }

            headerMsg = String.format(formatMsg, order.OrderCode, order.OrderContactInformation.Email, yourOrderPhrase, page.placeorder.FacebkText);

            jQuery("#ct_ordersucess_header").html(headerMsg);
            jQuery("#ordersuccess_footer").removeClass("hidden");

        }

        jQuery("[grp='usereml']").html(order.OrderContactInformation.Email);

        // attach the template
        $("#ordersuccess_orderdetails").setTemplateElement("ordersuccess_blue_sucess_template");
        // process the template
        $("#ordersuccess_orderdetails").processTemplate(order);

        //if (page.placeorder.currentDataSource == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
        jQuery("#ordersuccess_orderdetails table:first").addClass("mobile_table");
        //}

        jQuery("#targetAudienceDiv").jScrollTouch();
        jQuery("#targetAudienceOccupantDiv").jScrollTouch();
        jQuery("#geographyDetailsDiv").jScrollTouch();

        var step = entity.enums.OrderStep.Success;
    },

    printOrder: function() {
        $("#ct_ordersuccess").jqprint();
    }
};
