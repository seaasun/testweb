ni.RegisterNameSpace("uc");
uc.result = {
    UserPriceList: null,
    GlobalPriceList: null,
    Promotion: null,
    HasExisted2DReport: false,
    InterestingAvailble: null,
    MetaDataPriceList: null,
    RewardsFromDollar: 0,
    RewardsToPoint: 0,
    HasRewardsPoint: false,
    IsInputPrice: false,
    MinimumOrderAmount: 0,
    RewardsPoint: 0,
    BonusPoint: 0,
    StartTime: null,
    PassPay_For_DebitCard: false,
    IsInit4InfoPackage: false,
    MobileMinQty: 9000,
    FacebkMinQty: 10000,

    // Initial Step Setting
    InitStepSetting: function(order) {
        var step = page.placeorder.orderflow || new entity.OrderFlow();
        step.CurrentStep = entity.enums.OrderStep.ListQuote;
        step.StepTitle = "";
        step.StepDescription = "";

        $("#payment_bill_FirstName").hide();
        $("#payment_bill_LastName").hide();
        if (page.placeorder.IsInputPrice == true) {
            $("#payment_bill_FirstName").show();
            $("#payment_bill_LastName").show();
        }
        step.StepButtonsStatus = entity.enums.StepButtons.Back | entity.enums.StepButtons.SaveCount;
        step.StepButtonsEvent = [
			{ ButtonKey: entity.enums.StepButtons.Back, ButtonEvent: uc.result.Click_Back },
			{ ButtonKey: entity.enums.StepButtons.SaveCount, ButtonEvent: uc.result.Click_SaveCount }
		   ];
        if (page.placeorder.isOrderQuoteEnabled) {
            step.StepButtonsStatus = step.StepButtonsStatus | entity.enums.StepButtons.OrderQuote;
            step.StepButtonsEvent.push({ ButtonKey: entity.enums.StepButtons.OrderQuote, ButtonEvent: uc.result.DoOrderQuote });
        }
        if (page.placeorder.IsPlaceOrderEnabled) {
            //step.StepButtonsStatus = step.StepButtonsStatus | entity.enums.StepButtons.Next;
            step.StepButtonsStatus = step.StepButtonsStatus | entity.enums.StepButtons.PlaceOrder;
            step.StepButtonsEvent.push({ ButtonKey: entity.enums.StepButtons.PlaceOrder, ButtonEvent: uc.payment.ProcessOrder });
        }

        return step;
        // framework.listener.FireListener(framework.listener.LISTENER_INIT_STEP, step);
    },

    Init: function() {
        page.placeorder.order.CurrentStep = entity.enums.OrderStep.ListQuote;
        // ToDo: moving follow codes, use orderflow object and fire the init step listener
        var step = uc.result.InitStepSetting();
        uc.payment.SetErrorMessage(false, "");
        framework.listener.FireListener(framework.listener.LISTENER_INIT_STEP, step);

        jQuery("#demoBreakdown").addClass("hidden");
        $("input[type=radio][id ^= results_listusage_multitime_]").removeAttr("disabled");
        // $("#results_listusage_onetime").removeAttr("disabled");
        var tip = "<img alt='' src='Themes/default/assets/images/spinner2.gif' />";
        jQuery("#ct_results_geos").html(tip);
        jQuery("#ct_results_audience").html("");
        jQuery("#ct_results_occupant").html("");
        jQuery("#result_info_order_price_value").numeric();
        //$("#link_more_about").colorbox({ iframe: true, width: 840, height: 600, opacity: 0.5 });
        $("#link_need_other_result").colorbox({ iframe: true, width: 840, height: 600, opacity: 0.5 });
        $("#link_save_count_top").colorbox({ iframe: true, width: 840, height: 600, opacity: 0.5 });
        $("#link_save_count_bottom").colorbox({ iframe: true, width: 840, height: 600, opacity: 0.5 });

        jQuery('#payment_ValidateSummay').addClass("hidden");
        jQuery('#ct_result_list_format').addClass("hidden");
        //add 2014-2-8
        jQuery("[name='mobile_btn']").removeClass("hidden");

        jQuery("#order_step_header_mobile input[type='checkbox']").removeAttr("checked");

        uc.result.IsDisplay4InfoPlaceOrderBtn(false);

        if (page.placeorder.currentDataSource == entity.enums.DataSourceType.Consumer) {
            $("#advise_list_with_email").addClass("advise_list_with_email_area");
        } else {
            $("#advise_list_with_email").removeClass("advise_list_with_email_area");
        }

        //comment it if test
        uc.result.GetOrder();

        var year = (new Date()).getFullYear() + 1;
        jQuery("#payment_bill_year").val(year);

        //uc.result.CheckInterestingItems();
        //del scroll-x

        if (document.getElementById("adjustdiv1") != null & document.getElementById("adjustdt1") != null) {

            if (jQuery.browser.msie) {
                if (document.getElementById("adjustdiv1").scrollWidth != document.getElementById("adjustdiv1").clientWidth)
                    document.getElementById("adjustdt1").width = document.getElementById("adjustdiv1").clientWidth;

            }

            else {
                document.getElementById("adjustdt1").width = document.getElementById("adjustdiv1").scrollWidth;

            }
        }

        jQuery('#result_help_mailinglabels').attr('secondaryKey', entity.lookup.DataSource.getByCode(page.placeorder.order.ListType).DisplayName);


        jQuery("[grp='nothx']").bind("click", function() {
            $.colorbox.close();
        });

        $('.ylist3 > li > a').click(function(event) {
            event.preventDefault();
            $(this).siblings('.bd').slideToggle('fast');
        });

        $("#ct_results_campaigns_warn").html("").addClass("hidden");

        jQuery("#order_step_header_mobile input[type='checkbox']").bind("change", function() {
            var $this = jQuery(this);
            if ($this.is(":checked")) {
                //check the box
                jQuery("#order_step_header_mobile div[master='" + $this.val() + "']").removeClass("hidden");
            }
            else {
                //uncheck the box
                jQuery("#order_step_header_mobile div[master='" + $this.val() + "']").addClass("hidden");

                if ($this.val() == 1) {
                    uc.result.ClearMobileAdInformation();
                }
                else if ($this.val() == 2) {
                    uc.result.ClearFacebookAdInformation();
                }
            }
        });

        var itemSelector = "#order_step_header_mobile input[type='radio'][name='mobileitems']";

        jQuery(itemSelector).live("change", function() {
            uc.result.Click_Change_Mobile_Go(jQuery(itemSelector + ":checked").val());
        });

        var mobileItemSelector = "#mobile_only_order_content input[type='radio'][name='mobileitems']";

        jQuery(mobileItemSelector).live("change", function() {
            uc.result.Click_Change_Mobile_Go(jQuery(mobileItemSelector + ":checked").val());
        });

        jQuery("#ct_results_fbapply").bind("click", function() {
            var fbacct = jQuery("#ct_results_fbacct").val();

            if (!fbacct) {
                $.colorbox({ html: "<span >please enter your facebook account</span>", width: 200, height: 150, opacity: 0.5, scrolling: false });
            }
            else {
                var o = page.placeorder.order;
                o.OrderThirdPartyAccount = [];

                var orderThirdPartyAccount = new Object();
                orderThirdPartyAccount.OrderId = 0;
                orderThirdPartyAccount.AccountType = 0;
                orderThirdPartyAccount.AccountId = fbacct;
                orderThirdPartyAccount.CampaignCode = 0;
                orderThirdPartyAccount.Status = 40;
                orderThirdPartyAccount.Id = 0;
                o.OrderThirdPartyAccount.push(orderThirdPartyAccount);

                $.colorbox({ html: "<span>Thank you. When you complete this list order we will also send this list to Facebook.</span><p>Approximately 30 minutes after this order is placed, you will be able to build a campaign within your Facebook Ad Account to reach this same audience.</p>", width: 300, height: 200, opacity: 0.5, scrolling: false });
            }
        });

        if (document.getElementById("adjustdiv1") != null) {
            document.getElementById("adjustdiv1").style = "height:190px;overflow:scroll";
        };

        uc.result.GetPaymentCardType();
        //add by erik.wang @20150921
        //show the notify me
        if (page.placeorder.isNeedNotifyMe) {
            $("#div_is_need_notify_me").removeClass("hidden");
        } else {
            $("#div_is_need_notify_me").addClass("hidden");
        }

        if (page.global.isMyAcxiomSite) {
            $("#asterisk_before").addClass("hidden");
            $("#asterisk_after").removeClass("hidden");
        } else {
            $("#asterisk_before").removeClass("hidden");
            $("#asterisk_after").addClass("hidden");
        }

    },

    GetPaymentCardType: function() {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetCardTypeBySite",
            data: {},
            success: function(result) {
                if (result.DataSource != "") {
                    $("#sp_payment_cardType").html(result.DataSource);
                }
            },
            error: function(rep) {
                alert("Get card type error.");
            }
        });
    },

    MobilePackages: {
        Packages: [],

        getPackageById: function(id) {
            for (var i = 0; i < uc.result.MobilePackages.Packages.length; i++) {
                if (uc.result.MobilePackages.Packages[i].Id == id) {
                    return uc.result.MobilePackages.Packages[i];
                }
            }
        }
    },


    GetOrder: function() {
        jQuery("#ct_right_detail_panel").addClass("hidden");
        jQuery("#result_error").addClass("hidden");
        if (page.placeorder.currentDataSource == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
            $("#ct_result_list_usage").addClass("hidden");

        }
        uc.result.StartTime = new Date();
        uc.result.IsInit4InfoPackage = false;
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetOrderAndPriceList",
            data: { listtype: 10 },
            success: function(result) {
                if (result.ResultFlag == true) {
                    if (page.placeorder.order.CurrentStep != entity.enums.OrderStep.ListQuote) {
                        return;
                    }
                    framework.common.Log(uc.result.StartTime, "Call GetOrderAndPriceList");
                    uc.result.StartTime = new Date();
                    page.placeorder.order = result.DataSource.Order;
                    page.placeorder.order.CurrentStep = entity.enums.OrderStep.ListQuote;
                    page.placeorder.order.MobilePackages = result.DataSource.MobilePackages;

                    uc.payment.FillPaymentMethod(page.placeorder.order.PaymentMethod);

                    uc.payment.IsContactAddressComplete = result.DataSource.IsContactAddressComplete;

                    uc.result.UserPriceList = result.DataSource.UserPriceList;
                    uc.result.GlobalPriceList = result.DataSource.GlobalPriceList;
                    uc.result.Promotion = result.DataSource.Promotion;
                    uc.result.MetaDataPriceList = result.DataSource.BizMetadataPricing;

                    //set the rewards points info
                    uc.result.RewardsFromDollar = result.DataSource.RewardsFromDollar;
                    uc.result.RewardsToPoint = result.DataSource.RewardsToPoint;
                    uc.result.HasRewardsPoint = result.DataSource.HasRewardsPoint;

                    uc.result.isNeedReplaceMobileAndFacebook = result.DataSource.isNeedReplaceMobileAndFacebook;
                    OrderHelper.CaculatePrice(page.placeorder.order, uc.result.UserPriceList, uc.result.GlobalPriceList, uc.result.Promotion, uc.result.MetaDataPriceList);

                    uc.result.IsInputPrice = result.DataSource.IsInputPrice;
                    page.placeorder.IsInputPrice = result.DataSource.IsInputPrice;

                    uc.result.MinimumOrderAmount = uc.result.UserPriceList == null ? 50 : uc.result.UserPriceList.MinElementsCharge;

                    if (page.placeorder.order.ListType == 50) {
                        uc.result.Render_Geos_Html_Occupant(page.placeorder.order);
                    } else {
                        uc.result.Render_Geos_Html(page.placeorder.order);
                    }

                    if (page.placeorder.order.GeoType == entity.enums.GeoType.Radius
                        || page.placeorder.order.GeoType == entity.enums.GeoType.Closex
						|| page.placeorder.order.GeoType == entity.enums.GeoType.Polygon
						|| page.placeorder.order.GeoType == entity.enums.GeoType.AcxiomMultiRadius
		                || page.placeorder.order.GeoType == entity.enums.GeoType.AcxiomZipRadius
		                || page.placeorder.order.GeoType == entity.enums.GeoType.ZipMap
						) {
                        if (page.placeorder.order.ListType == 50) {
                            $("#leftContainer").css("max-height", 1050);
                        } else {
                            $("#leftContainer").css("height", null);
                            $("#leftContainer").css("max-height", 1550);
                        }

                    }
                    else {
                        $("#leftContainer").css("max-height", 1250);
                    }
                    uc.result.RenderListUsageHtml();
                    uc.result.RenderOrderPriceInfo();


                    if (page.placeorder.order.TotalAvailableQty >= page.placeorder.minQuantityOfOrder) {
                        $("#ct_right_detail_panel").removeClass("hidden");
                    }

                    //show suppression order

                    if ((page.placeorder.order.OrderSuppressions != undefined && page.placeorder.order.OrderSuppressions.length > 0)
                    || (page.placeorder.order.CustomSuppressions != undefined && page.placeorder.order.CustomSuppressions.length > 0)
                    || (page.placeorder.order.SaveCountSuppressions != undefined && page.placeorder.order.SaveCountSuppressions.length > 0)) {
                        $("#suppressionOrders").removeClass("hidden");
                        if (page.placeorder.order.SaveCountSuppressions != undefined && page.placeorder.order.SaveCountSuppressions.length > 0) {
                            $("#ShowSuppressionOrders").html("View Suppressed Counts&nbsp;&#187;");
                            $("#suppressionContainerTitle").text("Suppression Counts");
                        }
                    }

                    var step = uc.result.InitStepSetting();
                    framework.listener.FireListener(framework.listener.LISTENER_INIT_STEP, step);
                    framework.common.Log(uc.result.StartTime, "Render result with order and price");

                    uc.result.SetDemoBreakdown(result.DataSource.Breakdown, page.placeorder.order);

                    if (page.placeorder.order.ListType == entity.enums.DataSourceType.InfoUSAConsumer
                        || page.placeorder.order.ListType == entity.enums.DataSourceType.InfoUSABusiness
                       ) {

                        if (page.placeorder.isCountReportEnbaled) {
                            jQuery("#infoUSACountReport").removeClass("hidden");
                        }
                    }

                    /*display special links*/
                    var special1Ids = ["#demoBreakdown", "#twoDimensionalReport"];
                    var special2Ids = ["#infoUSACountReport", "#suppressionOrders"];

                    jQuery(special1Ids).each(function(i, item) {
                        if (!jQuery(item).hasClass("hidden")) {
                            jQuery("#special_links1").removeClass("hidden");
                        } else {
                            jQuery(item).parent("td.results_target_audience").addClass("hidden");
                        }
                    });

                    jQuery(special2Ids).each(function(i, item) {
                        if (!jQuery(item).hasClass("hidden")) {
                            jQuery("#special_links2").removeClass("hidden");
                        } else {
                            jQuery(item).parent("td.results_target_audience").addClass("hidden");
                        }
                    });
                    /*End*/
                    uc.result.IsReachMobileCampaignQuantities();
                    uc.result.Render4InfoPackagePopUp();
                    uc.payment.GetOrder();
                    
                    if(page.placeorder.isMultiCount){
                        jQuery(".order_step_buttons").find("a[buttonname='order_stepbt_savecount']").addClass("hidden");
                    }
                    else{
                        jQuery(".order_step_buttons").find("a[buttonname='order_stepbt_savecount']").removeClass("hidden");
                    }

                }

            },
            error: function(rep) {
                if (page.placeorder.order.CurrentStep != entity.enums.OrderStep.ListQuote) {
                    return;
                }
                uc.result.Show_Error("Unfortunately, the system is unable to process your request. Our technical support specialists have been notified. Thank you for your patience while we work to resolve the error.");
            }
        });
    },

    IsDisplay4InfoPlaceOrderBtn: function(isDisplay) {
        if (page.placeorder.IsPlaceOrderEnabled == false) {
            return;
        }
        if (isDisplay) {
            jQuery("#placeOrderButton4Info").removeClass("hidden");
            jQuery(".order_step_buttons").find("a[buttonname='order_stepbt_placeorder']").addClass("hidden");
        } else {
            jQuery("#placeOrderButton4Info").addClass("hidden");
            jQuery(".order_step_buttons").find("a[buttonname='order_stepbt_placeorder']").removeClass("hidden");
        }
    },

    IsReachMobileCampaignQuantities: function() {
        if (page.placeorder.order.ListType == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
            if (page.placeorder.order.TotalAvailableQty < uc.result.MobileMinQty) {
                $("#result_error").removeClass("hidden");
                $("#result_error").html("Mobile campaigns require a minimum of 9,000 records. Please consider either expanding the geographic area or refining the parameters of your target audience by clicking the appropriate Edit Selections link. Thank you.");
            } else {
                $("#result_error").removeClass("hidden");
                $("#result_error").html("");
            }
        } else {
            return;
        }
    },

    GetOrderGeos: function() {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetOrderGeos",
            data: { async: false },
            success: function(result) {
                if (result.ResultFlag == true) {
                    page.placeorder.order.OrderGeos = result.DataSource;
                    uc.result.RendeGeoDetails(page.placeorder.order);
                }

            },
            error: function(rep) {
                uc.result.Show_Error("Unfortunately, the system is unable to process your request. Our technical support specialists have been notified. Thank you for your patience while we work to resolve the error.");
            }
        });
    },


    RenderOrderPriceInfo: function() {
        var order = page.placeorder.order;
        if (order.MailLabelsCount == 0) {
            $("#results_nolabel")[0].checked = true;
            $("#ct_results_sendlabels_count").attr("disabled", true);
            $("#results_needlabels_ocr_line").addClass("hidden");
        } else {
            $("#ct_results_sendlabels_count").val(order.MailLabelsCount);
            $("#results_sendlabels")[0].checked = true;
            $("#ct_results_sendlabels_count").removeAttr("disabled");
            $("#results_needlabels_ocr_line").removeClass("hidden");
        }

        $("#results_listusage_multitime_" + order.ListUsage)[0].checked = true;


        if (uc.result.HasRewardsPoint && uc.result.RewardsFromDollar != 0 && uc.result.RewardsToPoint != 0) {
            uc.result.RewardsPoint = order.TotalEstmCost / uc.result.RewardsFromDollar * uc.result.RewardsToPoint;

            if (order.PromotionPointType != undefined && order.PromotionPointValue > 0) {
                if (order.PromotionPointType == entity.enums.PromotionType.XNUMBER_OF_POINT) {
                    order.PromotionPoint = uc.result.RewardsPoint * order.PromotionPointValue - uc.result.RewardsPoint;
                    uc.result.RewardsPoint = uc.result.RewardsPoint * order.PromotionPointValue;
                }
                else if (order.PromotionPointType == entity.enums.PromotionType.NUMBER_OF_POINT) {
                    order.PromotionPoint = order.PromotionPointValue;
                    uc.result.RewardsPoint = uc.result.RewardsPoint + order.PromotionPointValue;
                }
            }

            if (order.PromotionAmount > 0) {
                uc.result.BonusPoint = (order.TotalEstmCost + order.PromotionAmount) / uc.result.RewardsFromDollar * uc.result.RewardsToPoint;
            }
            else {
                uc.result.BonusPoint = 0;
            }
        }
        uc.result.RenderListUsageHtmlPrice(order);
        uc.result.RenderOrderPriceDiffInfo(order);


        $("#ct_results_geos input[type='text'][rowtype='total']").val(order.TotalDesiredQty);

        uc.payment.RenderOrderDetails();

        uc.result.SetInteresting();
        uc.result.CheckPayment_IfNeeded();

        framework.listener.FireListener(framework.listener.LISTENER_UPDATE_RESULTS_ORDER);



    },

    RenderListUsageHtml: function() {
        var userListMultiplePrice = uc.result.UserPriceList.ListMultiplePrice;
        $("#ct_list_usage_container").setTemplateElement("ct_list_usage_template");
        $("#ct_list_usage_container").processTemplate(userListMultiplePrice);
    },

    RenderListUsageHtmlPrice: function(order) {
        var userListMultiplePrice = uc.result.UserPriceList.ListMultiplePrice;
        // clone order first
        var orderJson = jQuery.toJSON(order);
        var clonedOrder = jQuery.evalJSON(orderJson);
        order.ListUsage = entity.enums.ListUsageType.OneTimes;
        OrderHelper.CaculatePrice(order, uc.result.UserPriceList, uc.result.GlobalPriceList, uc.result.Promotion, uc.result.MetaDataPriceList);
        for (var i = 0; i < userListMultiplePrice.length; i++) {
            // Render the difference between Multiple price and single price
            var mutlitpleDiff = 0;
            var labelDiff = 0;
            clonedOrder.ListUsage = userListMultiplePrice[i].MultipleId;
            OrderHelper.CaculatePrice(clonedOrder, uc.result.UserPriceList, uc.result.GlobalPriceList, uc.result.Promotion, uc.result.MetaDataPriceList);

            mutlitpleDiff = (clonedOrder.ListUsage > 1 ? 1 : -1) * (clonedOrder.TotalEstmCost - order.TotalEstmCost);
            $('#results_listusage_pricediff_' + userListMultiplePrice[i].MultipleId).removeClass("hidden").html("(" + "+" + framework.common.formatMoney(mutlitpleDiff) + ")");
        }

        order.ListUsage = Number(jQuery("input[name='results_listusages']:checked").attr("data-mul"));
        OrderHelper.CaculatePrice(order, uc.result.UserPriceList, uc.result.GlobalPriceList, uc.result.Promotion, uc.result.MetaDataPriceList);

    },
    /**Jenny xiao_20140319 start**/
    ClearMobileAdInformation: function() {
        uc.result.SetMobileAdInformation(true);
        uc.result.RenderSelectedMobilePackage();
    },
    ClearFacebookAdInformation: function() {
        jQuery("#ct_results_fbacct").val("");
        page.placeorder.order.OrderThirdPartyAccount = [];
    },

    SetMobileAdInformation: function(isClear) {
        if (isClear) {
            if (page.placeorder.order.ListType == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
                page.placeorder.order.MobilePackageId = 2;
                uc.result.SetMobileAdInformation(false);
            } else {
                page.placeorder.order.MobilePackageId = 0;
                if (OrderHelper.CheckPromotCode(page.placeorder.order) && (uc.result.Promotion.PromotionType == entity.enums.PromotionType.DOLLAR_MOBILE_LIST_BOTH || uc.result.Promotion.PromotionType == entity.enums.PromotionType.PERCENT_OFF_MOBILE_LIST_BOTH)) {
                    OrderHelper.CaculatePromotion(page.placeorder.order, uc.result.UserPriceList, uc.result.Promotion);
                }
                page.placeorder.order.MobilePackageCharge = 0;
                page.placeorder.order.MobilePackageName = "";
                page.placeorder.order.Duration = 0;
                page.placeorder.order.MobilePackageViewCount = 0;
                page.placeorder.order.Chose4Info = false;
            }
        } else {
            if (page.placeorder.order.MobilePackageId > 0) {
                var pack = uc.result.MobilePackages.getPackageById(page.placeorder.order.MobilePackageId);
                page.placeorder.order.MobilePackageId = pack.Id;
                //                page.placeorder.order.MobilePackageCharge = pack.Cost;
                if (OrderHelper.CheckPromotCode(page.placeorder.order) && (uc.result.Promotion.PromotionType == entity.enums.PromotionType.DOLLAR_MOBILE_LIST_BOTH || uc.result.Promotion.PromotionType == entity.enums.PromotionType.PERCENT_OFF_MOBILE_LIST_BOTH)) {
                    OrderHelper.CaculatePromotion(page.placeorder.order, uc.result.UserPriceList, uc.result.Promotion);
                } else {
                    OrderHelper.CaculateMobilePackageCharge(page.placeorder.order, uc.result.Promotion);
                }
                page.placeorder.order.Duration = pack.Duration;
                page.placeorder.order.MobilePackageName = pack.Name;
                page.placeorder.order.MobilePackageViewCount = pack.ViewCount;
                page.placeorder.order.Chose4Info = true;
            }
        }
    },

    PaymentCheckDigitalFileQty: function() {

        var o = page.placeorder.order;

        if (o.ListType != entity.enums.DataSourceType.Consumer && o.ListType != entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
            return true;
        }


        var digitalFileQty = 0;

        if (o.ListType == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
            digitalFileQty = o.TotalAvailableQty;

            if (digitalFileQty < uc.result.MobileMinQty) {
                uc.result.Show_Error("The mobile ad campaign is not available, please relax the conditions.");
                return false;
            }
        }
        else {
            digitalFileQty = Math.min(o.TotalDesiredQty * 3, o.TotalAvailableQty);

            var mobileChose = $("#order_step_header_mobile input#mobileads").is(":checked");
            var facebkChose = $("#order_step_header_mobile input#facebookleads").is(":checked");

            if (mobileChose) {
                if (digitalFileQty < uc.result.MobileMinQty) {
                    uc.result.Show_Error("The mobile ad campaign is not available, please relax the conditions.");
                    return false;
                }
                else if (!o.Chose4Info || !o.MobilePackageId) {
                    uc.result.Show_Error("A mobile campaign should be chosen.");
                    return false;
                }
            }


            if (facebkChose) {
                if (digitalFileQty <= uc.result.FacebkMinQty) {
                    uc.result.Show_Error("The facebook campaign is not available, please relax the conditions.");
                    return false;
                }
                else if (!o.OrderThirdPartyAccount || o.OrderThirdPartyAccount.length == 0) {
                    uc.result.Show_Error("please enter your Facebook advertiser ID.");
                    return false;
                }
            }
        }

        return true;
    },


    ChangeNumberRender4InfoPackage: function() {

        uc.result.SetInteresting();

        if (!page.placeorder.order.MobilePackages) {
            page.placeorder.order.Chose4Info = false;
            uc.result.ShowWarning_MobileAndFacebkWidget(100);
            return;
        }
        var digitalFileQty = 0;
        if (page.placeorder.order.ListType == entity.enums.DataSourceType.Consumer) {
            digitalFileQty = Math.min(page.placeorder.order.TotalDesiredQty * 3, page.placeorder.order.TotalAvailableQty);
        }
        else if (page.placeorder.order.ListType == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
            digitalFileQty = page.placeorder.order.TotalAvailableQty;
        }
        else {
            return;
        }

        OrderHelper.CaculatePackage(page.placeorder.order, digitalFileQty);

        uc.result.ShowWarning_MobileAndFacebkWidget(digitalFileQty);

        uc.result.RenderSelectedMobilePackage();
    },

    DisplayMobileOperate: function(isDisplay) {
        if (page.placeorder.order.ListType == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
            $("#mobile_info_operate_message").html("Please note this order will appear as 4INFO on your statement.");
        }
        else {
            $("#mobile_info_operate_message").html("Please note the List (Acxiom) and Mobile Ad Campaign (4INFO) will appear as separate charges on your credit card statement.");
        }
        if (isDisplay) {
            $("div[id^='mobile_info_operate']").removeClass("hidden");
            $("#payment_interesting").addClass("hidden");
        } else {
            $("div[id^='mobile_info_operate']").addClass("hidden");
            uc.result.SetInteresting();
        }
    },


    SetInteresting: function() {
        if (!uc.result.isNeedReplaceMobileAndFacebook) {
            if (Math.min(page.placeorder.order.TotalAvailableQty, page.placeorder.order.TotalDesiredQty) >= uc.result.FacebkMinQty) {
                jQuery("#payment_interesting").removeClass("hidden");
            }
            else {
                jQuery("#payment_interesting").addClass("hidden");
            }
        } else {
            if (Math.min(page.placeorder.order.TotalAvailableQty, page.placeorder.order.TotalDesiredQty) >= 1000) {
                jQuery("#payment_interesting").removeClass("hidden");
            }
            else {
                jQuery("#payment_interesting").addClass("hidden");
            }
        }
    },

    Click_Change_Mobile_Go: function(id) {
        page.placeorder.order.MobilePackageId = parseInt(id);
        uc.result.RenderSelectedMobilePackage();
    },

    DisplayOrderMobileInfo: function(data) {
        if (page.placeorder.order.ListType == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
            jQuery("#mobile_only_order_content").setTemplateElement("ct_result_campaigns_template", null, { filter_data: false });
            jQuery("#mobile_only_order_content").processTemplate(data);

            var order = page.placeorder.order;
            jQuery("input[type='radio'][name='mobileitems']").eq(order.MobilePackageId - 1).attr("checked", "checked");
        }

    },

    RenderSelectedMobilePackage: function() {
        if (page.placeorder.order.MobilePackageId > 0) {

            uc.payment.ChangePaymentMethod(true);
            uc.result.DisplayMobileOperate(true);
            uc.result.SetMobileAdInformation(false);

        } else {
            uc.payment.ChangePaymentMethod(false);
            uc.result.DisplayMobileOperate(false);
            uc.result.SetMobileAdInformation(true);
        }

        uc.payment.RenderOrderDetails(page.placeorder.order);
        uc.payment.RenderPaymentDetail();

        framework.listener.FireListener(framework.listener.LISTENER_UPDATE_RESULTS_ORDER);
    },

    InitMobileAndFacebkWidget2: function() {
        var order = page.placeorder.order;

        jQuery("#order_step_header_mobile").addClass("hidden");
        jQuery("#ct_results_mobile_content").html("");
        jQuery("#order_step_header_mobile_2").addClass("hidden");

        if (!uc.result.isNeedReplaceMobileAndFacebook) {

            if (order.MobilePackages && order.MobilePackages.length > 0) {
                jQuery("#ct_results_mobile_content").setTemplateElement("ct_result_campaigns_template", null, { filter_data: false });
                jQuery("#ct_results_mobile_content").processTemplate(order.MobilePackages);
            }

            if (order.ListType == entity.enums.DataSourceType.Consumer && !page.placeorder.isMultiCount) {

                if (page.placeorder.ConsumerListType == 1) {
                    jQuery("#ct_results_campaigna input[id=mobileads]").attr("checked", "checked");
                    jQuery("#ct_results_campaigna input[id=mobileads]").trigger("change");
                }
                else if (page.placeorder.ConsumerListType == 2) {
                    jQuery("#ct_results_campaignb input[id=facebookleads]").attr("checked", "checked");
                    jQuery("#ct_results_campaignb input[id=facebookleads]").trigger("change");
                }
                else if (page.placeorder.ConsumerListType == 3) {
                    jQuery("#ct_results_campaigna input[id=mobileads]").attr("checked", "checked");
                    jQuery("#ct_results_campaignb input[id=facebookleads]").attr("checked", "checked");
                    jQuery("#ct_results_campaigna input[id=mobileads]").trigger("change");
                    jQuery("#ct_results_campaignb input[id=facebookleads]").trigger("change");
                }

                jQuery("#order_step_header_mobile").removeClass("hidden");
            }
        } else {
            if (order.ListType == entity.enums.DataSourceType.Consumer && Math.min(page.placeorder.order.TotalAvailableQty, page.placeorder.order.TotalDesiredQty) >= 3000 && !page.placeorder.isMultiCount) {
                jQuery("#order_step_header_mobile_2").removeClass("hidden");
            }
        }
    },

    ShowWarning_MobileAndFacebkWidget: function(digitalFileQty) {
        if (page.placeorder.order.ListType != entity.enums.DataSourceType.Consumer || page.placeorder.isMultiCount) {
            return;
        }

        $("#result_mobile_upsell_error").html("").addClass("hidden");
        $("#order_step_header_mobile input[type='checkbox'][name='ct_results_campaigns_option']").removeAttr("disabled");
        $("#ct_results_campaignb [id='ct_results_fbacct']").removeAttr("disabled");


        var o = page.placeorder.order;
        var warn = "";

        if (digitalFileQty < uc.result.MobileMinQty) {
            uc.result.SetMobileAdInformation(true); //#5899 - Mobile Campaign issue on MAP add by lisa at 2015/09/02

            //$("#order_step_header_mobile_2").addClass("hidden");
            if (page.placeorder.ConsumerListType == 0) {
                $("#order_step_header_mobile").addClass("hidden");
            }
            else {
                warn = "A minimum of 9,000 records is required for Facebook and Mobile campaigns.";

                $("#order_step_header_mobile input[type='checkbox'][name='ct_results_campaigns_option']").removeAttr("checked").trigger("change").attr("disabled", true);
            }
        }
        else if (digitalFileQty >= uc.result.MobileMinQty && digitalFileQty <= uc.result.FacebkMinQty) {
            warn = "A minimum of 10,000 records is required for Facebook campaigns.";

            $("#ct_results_campaignb input[type='checkbox'][id='facebookleads']").removeAttr("checked").trigger("change").attr("disabled", true);
            $("#ct_results_campaignb [id='ct_results_fbacct']").removeAttr("checked").attr("disabled", true);
        }
        //#5899 - Mobile Campaign issue on MAP add by lisa at 2015/09/02
        else if (digitalFileQty >= uc.result.FacebkMinQty && !uc.result.isNeedReplaceMobileAndFacebook) {
            $("#order_step_header_mobile").removeClass("hidden");
            var itemSelector = "#order_step_header_mobile input[type='radio'][name='mobileitems']";
            var _id = jQuery(itemSelector + ":checked").val();
            if (o.MobilePackages && o.MobilePackages.length > 0) {
                jQuery("#ct_results_mobile_content").setTemplateElement("ct_result_campaigns_template", null, { filter_data: false });
                jQuery("#ct_results_mobile_content").processTemplate(o.MobilePackages);
                $("#order_step_header_mobile input[type='radio'][name='mobileitems'][value='" + _id + "']").attr("checked", true);
            }

            page.placeorder.order.MobilePackageId = parseInt(_id);
            uc.result.SetMobileAdInformation(false);

        }

        if (digitalFileQty >= uc.result.MobileMinQty && uc.result.isNeedReplaceMobileAndFacebook) {
            $("#order_step_header_mobile_2").removeClass("hidden");
        } else {
            $("#order_step_header_mobile_2").addClass("hidden");
        }

        if (warn.length > 0) {
            $("#result_mobile_upsell_error").html(warn).removeClass("hidden");
        }

    },


    Render4InfoPackagePopUp: function() {

        uc.result.SetInteresting();

        uc.result.InitMobileAndFacebkWidget2();

        if (!page.placeorder.order.MobilePackages) {
            page.placeorder.order.Chose4Info = false;
            uc.result.ShowWarning_MobileAndFacebkWidget(100);
            return;
        }

        uc.result.MobilePackages.Packages = page.placeorder.order.MobilePackages;

        var digitalFileQty = 0;
        if (page.placeorder.order.ListType == entity.enums.DataSourceType.Consumer) {
            digitalFileQty = Math.min(page.placeorder.order.TotalDesiredQty * 3, page.placeorder.order.TotalAvailableQty);
        }
        else if (page.placeorder.order.ListType == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
            digitalFileQty = page.placeorder.order.TotalAvailableQty;

            uc.result.IsDisplay4InfoPlaceOrderBtn(true);
        }
        else {
            return;
        }
        OrderHelper.CaculatePackage(page.placeorder.order, digitalFileQty);

        uc.result.ShowWarning_MobileAndFacebkWidget(digitalFileQty);

        if (digitalFileQty < uc.result.MobileMinQty) {
            if (page.placeorder.order.ListType == entity.enums.DataSourceType.Consumer) {
                uc.result.IsDisplay4InfoPlaceOrderBtn(false);
            }
            else if (page.placeorder.order.ListType == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
                jQuery("#result_mobile_only_standalone").removeClass("hidden");
            }
            uc.result.ClearMobileAdInformation();
            uc.result.ClearFacebookAdInformation();
            uc.payment.ChangePaymentMethod(false);
            uc.payment.GetOrder();
            return;
        }
        else if (digitalFileQty >= uc.result.MobileMinQty) {

            uc.result.IsDisplay4InfoPlaceOrderBtn(true);

            if (page.placeorder.order.ListType == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
                jQuery("#result_mobile_only_standalone").removeClass("hidden");
                if (page.placeorder.order.MobilePackageId == undefined || page.placeorder.order.MobilePackageId == 0) {
                    page.placeorder.order.MobilePackageId = 2;
                }
            }
            uc.result.RenderSelectedMobilePackage();

        }


    },

    RenderOrderPriceDiffInfo: function(order) {
        // Render the difference between Multiple price and single price
        var mutlitpleDiff = 0;
        var labelDiff = 0;

        // clone order first
        var orderJson = jQuery.toJSON(order);
        var clonedOrder = jQuery.evalJSON(orderJson);
        //        if (order.ListUsage == 1) {
        //            clonedOrder.ListUsage = Number(jQuery("input[name='results_listusages']:checked").attr("data-mul"));
        //        } else {
        //            clonedOrder.ListUsage = 1;
        //        }
        //        OrderHelper.CaculatePrice(clonedOrder, uc.result.UserPriceList, uc.result.GlobalPriceList, uc.result.Promotion, uc.result.MetaDataPriceList);

        //        mutlitpleDiff = (clonedOrder.ListUsage > 1 ? 1 : -1) * (clonedOrder.TotalEstmCost - order.TotalEstmCost);


        //clonedOrder.ListUsage = order.ListUsage;
        if (order.MailLabelsCount == 0) {
            clonedOrder.MailLabelsCount = 1;
        } else {
            clonedOrder.MailLabelsCount = 0;
        }
        OrderHelper.CaculatePrice(clonedOrder, uc.result.UserPriceList, uc.result.GlobalPriceList, uc.result.Promotion, uc.result.MetaDataPriceList);

        labelDiff = (clonedOrder.MailLabelsCount > 0 ? 1 : -1) * (clonedOrder.TotalEstmCost - order.TotalEstmCost);


        //  $('#results_listusage_pricediff_' + order.ListUsage).removeClass("hidden").html("(" + framework.common.formatMoney(mutlitpleDiff) + ")");
        $('#results_labels_pricediff').removeClass("hidden").html("(" + framework.common.formatMoney(labelDiff) + ")");

    },

    ListUsageSelection: function() {
        var order = page.placeorder.order;
        var needLabels = (jQuery("input[name='results_needlabels']:checked").val() == '1');
        var $select = $("#ct_results_sendlabels_count");

        $("#ct_result_list_format_tip").html("");

        if (needLabels) {
            order.MailLabelsCount = $select.val();
            $select.removeAttr("disabled");

            if (order.MailLabelsCount >= 2) {
                $("#results_listusage_multitime_" + order.ListUsage)[0].checked = true;
                $("#results_listusage_multitime_" + order.ListUsage).attr("disabled", true);
                //$("#results_listusage_onetime").attr("disabled", true);
                $("#ct_result_list_usage").addClass("graytext");
                $("#ct_result_list_format_tip").html("Selecting labels requires that the multiple use option be selected.");
            } else {
                $("#ct_result_list_usage").removeClass("graytext");
            }
        } else {
            order.MailLabelsCount = 0;
            $select.val("1");
            $select.attr("disabled", true);
        }

        order.ListUsage = Number(jQuery("input[name='results_listusages']:checked").attr("data-mul"));
        uc.result.UserPriceList.MultiplePrice = Number(jQuery("input[name='results_listusages']:checked").val());
        uc.result.GlobalPriceList.MultiplePrice = Number(jQuery("input[name='results_listusages']:checked").val());
        OrderHelper.CaculatePrice(order, uc.result.UserPriceList, uc.result.GlobalPriceList, uc.result.Promotion, uc.result.MetaDataPriceList);

        uc.result.RenderOrderPriceInfo();

    },

    Promotion_Change_KeyDown: function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code != 13) {
            return false;
        }

        if (e.preventDefault != null) {
            e.preventDefault();
        }
        if (e.stopPropagation != null) {
            e.stopPropagation();
        }
        e.cancelBubble = true;
        uc.result.Promotion_Change();
        return false;
    },

    Promotion_Change: function(promotion) {


        if (promotion == null) {
            var order = page.placeorder.order;
            var pcode = jQuery('#results_info_promocode').val(); //Dmpkge3
            order.PromoCode = pcode;
            if (String.IsNullOrEmpty(pcode)) {
                order.PromoCode = null;
                uc.result.Promotion = null;
                OrderHelper.CaculatePromotion(order, uc.result.UserPriceList, null);
                uc.result.RenderOrderPriceInfo();
                //uc.result.CheckPayment_IfNeeded();
                return;
            } else {
                framework.common.Ajax({
                    url: "PlaceOrder.aspx/GetPromotion",
                    data: { promotionCode: pcode, listtype: order.ListType },
                    success: function(result) {
                        if (result.ResultFlag == true && result.DataSource != null) {
                            uc.result.Promotion = result.DataSource;
                            order.PromoCode = pcode;
                            OrderHelper.CaculatePromotion(order, uc.result.UserPriceList, uc.result.Promotion);
                            uc.result.RenderOrderPriceInfo();
                        } else {
                            order.PromoCode = null;
                            OrderHelper.CaculatePromotion(order, uc.result.UserPriceList, null);
                            uc.result.RenderOrderPriceInfo();
                        }
                        //uc.result.CheckPayment_IfNeeded();

                    },
                    error: function(rep) {
                    }
                });
            }

        }
        else {
            var order = page.placeorder.order;
            uc.result.Promotion = promotion;
            order.PromoCode = promotion.PromotionCode;
            OrderHelper.CaculatePromotion(order, uc.result.UserPriceList, uc.result.Promotion);
            uc.result.RenderOrderPriceInfo();
        }
    },

    CheckPayment_IfNeeded: function() {
        var order = page.placeorder.order;

        uc.result.PassPay_For_DebitCard = false;

        if (order.PaymentMethod == entity.enums.PaymentMethod.CreditCard) {
            if (uc.result.Promotion && uc.result.Promotion.PromotionType == entity.enums.PromotionType.DEBIT_CARD) {
                if (order.TotalEstmCost > 0) {
                    jQuery('#payment_bill_creditcard').removeClass("hidden");
                }
                else {
                    jQuery('#payment_bill_creditcard').addClass("hidden");
                    uc.result.PassPay_For_DebitCard = true;
                }
            }
            else {
                jQuery('#payment_bill_creditcard').removeClass("hidden");
            }

        }
    },

    GeoQty_Change: function(element) {
        var order = page.placeorder.order;
        var $e = $(element);
        var index = $e.attr("rowindex");
        var value = Number($e.val());
        var maxValue = Number($e.attr("max"));
        if (value > maxValue) {
            value = maxValue;
            $e.val(value);
        }
        if ((order.TotalDesiredQty - order.OrderGeos[index].DesiredQty + value) < page.placeorder.minQuantityOfOrder) {
            uc.result.Show_Error(String.format(" The quantity that you entered is less than the minimum quantity of {0}.", page.placeorder.minQuantityOfOrder));
            $e.parent().parent().find("input[type='checkbox']").attr("checked", "checked");
            $e.val(order.OrderGeos[index].DesiredQty);
            return;
        }
        else {
            uc.result.Clear_Error();
        }

        var $chks = $(element).parent().parent().find("input[type='checkbox']");
        $chks[0].checked = value > 0;

        order.OrderGeos[index].DesiredQty = value;

        OrderHelper.SetGeoDetailsDesiredByDetail(order.OrderGeos[index], value);
        OrderHelper.RecaculateTotalQty(order);
        OrderHelper.CaculatePrice(order, uc.result.UserPriceList, uc.result.GlobalPriceList, uc.result.Promotion, uc.result.MetaDataPriceList);

        uc.result.RenderOrderPriceInfo();
        //TODO:JENNY
        uc.result.ChangeNumberRender4InfoPackage();
    },

    GeoQty_CheckBox: function(element) {
        var $txt = $(element).parent().parent().find("input[type='text'][rowtype='geo']");
        if ($(element)[0].checked == true) {
            $txt.val($txt.attr("max"));
        } else {
            $txt.val(0);
        }

        uc.result.GeoQty_Change($txt[0]);

    },

    /********************radius detail crrt change ***************************/
    GeoTotalQtyRaduis_Change: function(element) {
        var order = page.placeorder.order;
        var $e = $(element);
        if (isNaN($e.val())) {
            $e.val(order.TotalDesiredQty);
            uc.result.Show_Error(" The quantity that you entered is invalid.");
            return;
        }
        var value = Number($e.val());
        var maxValue = Number($e.attr("max"));
        if (value > maxValue) {
            value = maxValue;
            $e.val(value);
        }
        if (value < 100) {
            $e.val(order.TotalDesiredQty);
            uc.result.Show_Error(" The quantity that you entered is less than the minimum quantity of 100.");
            return;
        } else {
            uc.result.Clear_Error();
        }

        var percent = value / maxValue;
        var lostValue = maxValue - value;
        var desired;
        for (var i = 0; i < order.OrderGeos.length; i++) {
            //			if (lostValue <= 0) {
            //				break;
            //			}
            if (jQuery.isArray(order.OrderGeos[i].OrderGeoDetails) && order.OrderGeos[i].OrderGeoDetails.length > 0) {
                for (var j = 0; j < order.OrderGeos[i].OrderGeoDetails.length; j++) {
                    desired = Math.round(order.OrderGeos[i].OrderGeoDetails[j].AvailableQty * percent);
                    order.OrderGeos[i].OrderGeoDetails[j].DesiredQty = desired;
                    lostValue = lostValue - (order.OrderGeos[i].OrderGeoDetails[j].AvailableQty - order.OrderGeos[i].OrderGeoDetails[j].DesiredQty);

                    //					if (lostValue <= 0) {
                    //						break;
                    //					}
                }
            }
        }

        //Rever the value to help calculate
        lostValue = 0 - lostValue;
        if (lostValue != 0) {
            for (var i = 0; i < order.OrderGeos.length; i++) {
                if (jQuery.isArray(order.OrderGeos[i].OrderGeoDetails) && order.OrderGeos[i].OrderGeoDetails.length > 0) {
                    for (var j = 0; j < order.OrderGeos[i].OrderGeoDetails.length; j++) {
                        if (lostValue == 0) break;

                        var newValue = order.OrderGeos[i].OrderGeoDetails[j].DesiredQty + lostValue;
                        if (newValue < 0 || newValue > order.OrderGeos[i].OrderGeoDetails[j].AvailableQty) {
                            if (order.OrderGeos[i].OrderGeoDetails[j].DesiredQty != order.OrderGeos[i].OrderGeoDetails[j].AvailableQty) {
                                if (lostValue > 0) {
                                    lostValue = lostValue - (order.OrderGeos[i].OrderGeoDetails[j].AvailableQty - order.OrderGeos[i].OrderGeoDetails[j].DesiredQty);
                                    order.OrderGeos[i].OrderGeoDetails[j].DesiredQty = order.OrderGeos[i].OrderGeoDetails[j].AvailableQty;
                                }
                                else if (lostValue < 0) {
                                    lostValue = lostValue + order.OrderGeos[i].OrderGeoDetails[j].DesiredQty;
                                    order.OrderGeos[i].OrderGeoDetails[j].DesiredQty = 0;
                                }
                            }
                        } else {
                            order.OrderGeos[i].OrderGeoDetails[j].DesiredQty = newValue;
                            lostValue = 0;
                            break;
                        }
                    }
                }
            }
        }

        $.each(order.OrderGeos, function(index, value) {
            order.OrderGeos[index].DesiredQty = 0;
            $.each(order.OrderGeos[index].OrderGeoDetails, function(index2, value2) {
                order.OrderGeos[index].DesiredQty += value2.DesiredQty
            });
        });

        OrderHelper.RecaculateTotalQty(order);
        OrderHelper.CaculatePrice(order, uc.result.UserPriceList, uc.result.GlobalPriceList, uc.result.Promotion, uc.result.MetaDataPriceList);

        uc.result.RenderDetailPriceInfoRaduis(order);
        uc.result.RenderOrderPriceInfo();


    },
    GeoDetailQty_Change_Radius: function(element) {

        var order = page.placeorder.order;
        var $e = $(element);
        var index = Number($e.attr("subrowkey"));
        var geoindex = Number($e.attr("geoindex"));
        var value = Number($e.val());
        var maxValue = Number($e.attr("max"));
        if (value > maxValue) {
            value = maxValue;
            $e.val(value);
        }

        var geodetail = order.OrderGeos[geoindex].OrderGeoDetails[index];

        geodetail.DesiredQty = value;

        OrderHelper.RecaculateTotalGeoQty(order, geoindex);
        OrderHelper.CaculatePrice(order, uc.result.UserPriceList, uc.result.GlobalPriceList, uc.result.Promotion, uc.result.MetaDataPriceList);

        uc.result.RenderOrderPriceInfo();

        framework.common.Ajax({
            url: "PlaceOrder.aspx/UpdateDesiredQtyOfOrderGeoDetails",
            data: { geoIndex: geoindex,
            geoDetailsIndex: index,
            DesiredQty: value
            },
            success: function(result) {

            },
            error: function(rep) {
                alert("update Desired Qty error.");
            }
        });
        
    },

    
    GeoDetailQty_CheckBox_Radius: function(element) {
        var $txt = $(element).parent().parent().find("input[type='text'][rowtype='geo']");
        if ($(element)[0].checked == true) {
            $txt.val($txt.attr("max"));
        } else {
            $txt.val(0);
        }

        uc.result.GeoDetailQty_Change_Radius($txt[0]);

    },

    /***************************************************************************/

    GeoDetailQty_Change: function(element) {
        var order = page.placeorder.order;
        var $e = $(element);
        var index = Number($e.attr("rowindex"));
        var geoindex = Number($e.attr("geoindex"));
        var qtytype = $e.attr("qtytype");
        var value = Number($e.val());
        var maxValue = Number($e.attr("max"));
        if (value > maxValue) {
            value = maxValue;
            $e.val(value);
        }

        var geodetail = order.OrderGeos[geoindex].OrderGeoDetails[index];

        if (qtytype == "Home") {
            geodetail.DesiredQtyHome = value;
        } else if (qtytype == "Apts") {
            geodetail.DesiredQtyApt = value;
        } else if (qtytype == "Buss") {
            geodetail.DesiredQtyBuss = value;
        } else if (qtytype == "Total") {
            if (value == 0) {
                geodetail.DesiredQtyHome = 0;
                geodetail.DesiredQtyApt = 0;
                geodetail.DesiredQtyBuss = 0;
            } else {
                geodetail.DesiredQtyHome = geodetail.AvailableQtyHome;
                geodetail.DesiredQtyApt = geodetail.AvailableQtyApt;
                geodetail.DesiredQtyBuss = geodetail.AvailableQtyBuss;
            }
        }

        geodetail.DesiredQty = geodetail.DesiredQtyHome + geodetail.DesiredQtyApt + geodetail.DesiredQtyBuss;

        OrderHelper.RecaculateTotalGeoQty(order, geoindex);
        OrderHelper.CaculatePrice(order, uc.result.UserPriceList, uc.result.GlobalPriceList, uc.result.Promotion, uc.result.MetaDataPriceList);


        uc.result.Update_GeoDetail_Row_Html(order, geoindex, index);
        uc.result.Update_Geo_Row_Html(order, geoindex);

        uc.result.RenderOrderPriceInfo();
    },

    GeoDetailQty_CheckBox: function(element) {
        var $txt = $(element).parent().next();
        if ($(element)[0].checked == true) {
            $txt.val($txt.attr("max"));
        } else {
            $txt.val(0);
        }

        uc.result.GeoDetailQty_Change($txt[0]);

    },

    Geo_Detail_Expand: function(geoIndex, element) {
        var order = page.placeorder.order;
        var $detailContainer = $('#result_occu_geo_detail_row' + geoIndex);
        $detailContainer.parent().toggleClass("hidden");

        if ($detailContainer.parent().hasClass("hidden") == false) {
            uc.result.Render_GeoDetails_Html(order, geoIndex);
            $(element).find("#expandImg").attr("src", "usadata/images/btn_minus_sign.gif");
        } else {
            $(element).find("#expandImg").attr("src", "usadata/images/btn_plus_sign.gif");
        }
    },
    Google_Map_Element: null,
    Render_goog_map: function(element) {
        uc.result.Google_Map_Element = element;
        // Initialize Google Map
        var mapzoom = page.placeorder.order.GeoType == entity.enums.GeoType.Radius ? 12 : 13;
        if (page.placeorder.order.GeoType == entity.enums.GeoType.ZipMap) {
            mapzoom = 10;
        }
        framework.common.GoogleMap.LoadMapApi(
			function() {
			    //add this code to dynamic load google geometry api
			    var circle = new google.maps.Circle();
			    element.jmap('init', { 'mapCenter': page.placeorder.MapCenter, 'mapZoom': mapzoom, 'mapEnableScrollZoom': true }, function() { uc.result.Load_Google_Map_Js(); });
			}
		);


    },

    AddLayer: function(element) {
        if (framework.common.IsWMSEnable && page.placeorder.order.GeoType == entity.enums.GeoType.ZipMap) {
            var layerName = page.placeorder.order.RadiusTypeChoice == entity.enums.RadiusTypeChoice.CRRT ? "CR" : "ZIP";
            framework.common.addLayer(layerName, layerName, 1, Mapifies.MapObjects.Get(uc.result.Google_Map_Element));
            if (page.placeorder.order.SearchAddresses.length > 0) {
                var lastAddress = page.placeorder.order.SearchAddresses[0];
                uc.result.Google_Map_Element.jmap('MoveTo', {
                    'mapCenter': [lastAddress.Latitude, lastAddress.Longitude]
                });
            }
        }
    },


    Load_Google_Map_Js: function() {
        var element = uc.result.Google_Map_Element;
        //For goog map
        var elMap = element; //jQuery('#geo_result_raduisMap');
        var order = page.placeorder.order;
        if (order.SearchAddresses.length > 0 && order.GeoType != entity.enums.GeoType.ZipMap) {
            if (order.TargetType == entity.enums.GeoType.ACXIOM_CloseX) {
                order.SearchAddresses[0].Radius = order.MaxRadius;
                order.SearchAddresses[0].AddressName = order.SearchAddresses[0].AddressLine;
            }
            framework.ui.ShowMarkers(order.SearchAddresses, elMap, false);
            var lastAddress = order.SearchAddresses[order.SearchAddresses.length - 1];
            elMap.jmap('MoveTo', {
                'mapCenter': [lastAddress.Latitude, lastAddress.Longitude]
            });
        }
        uc.result.AddLayer(element);

        if (order.GeoType == entity.enums.GeoType.ZipMap && order.OrderGeos != null) {
            var geos = [];
            uc.result.Overlays = new Object();
            jQuery.each(order.OrderGeos, function(i, data) {
                geos.push(data.GeoKeyDesc);
            });
            uc.geo.radius.MapZips = [];
            var zipType = page.placeorder.order.RadiusTypeChoice == entity.enums.RadiusTypeChoice.CRRT ? "crid" : "zip";
            framework.common.ShowGeoElements(zipType, geos, uc.result.Overlays, uc.result.MapZips, Mapifies.MapObjects.Get(element), uc.result.AddGeoElement);
        }

    },


    Overlays: null,
    MapZips: [],

    AddGeoElement: function(id, data, map) {
        var polygons = new Array();
        _.each(data, function(polygon) {
            var polylines = new Array();
            _.each(polygon, function(polyline) {
                polylines.push(
				{ points: polyline.encodedPoints,
				    levels: polyline.encodedLevels,
				    opacity: 0.8,
				    weight: 2,
				    numLevels: 18,
				    zoomFactor: 2
				}
			);
            });
            //Draw the polygon overlay on map
            /*var p = new GPolygon.fromEncoded({
            polylines: polylines,
            fill: true,
            color: "#0000ff",
            outline: true
            }, { clickable: false });
            p.click = false;
            */

            //Erik Wang 20121016
            //draw an empty circle ---- begin
            var circleOptions = {
                center: new google.maps.LatLng(0, 0),
                strokeWeight: 2,
                strokeOpacity: 1,
                fillOpacity: 0.25,
                map: map,
                radius: 100,
                clickable: false
            };
            var circle = new google.maps.Circle(circleOptions);
            circle.setMap(null);
            //draw an empty circle ---- end

            var polygonLayerOptions = {
                strokeColor: "#0000ff",
                strokeWeight: 2,
                strokeOpacity: 1,
                fillColor: "#0000ff",
                fillOpacity: 0.4,
                map: map,
                paths: google.maps.geometry.encoding.decodePath(polylines[0].points),
                clickable: false
            };
            var p = new google.maps.Polygon(polygonLayerOptions);

            polygons.push(p);
        });
        uc.result.Overlays[id] = polygons;
        if (!String.IsNullOrEmpty(id)) {
            uc.result.MapZips.push(id);
        }
    },

    /*******************************************************/
    Render_Geos_Html: function(order) {

        var disable;
        if (order.TotalAvailableQty < page.placeorder.minQuantityOfOrder) {
            $("#tdSearch_bottom").addClass("hidden");
            //$("#ct_right_detail_panel").addClass("hidden");
            disable = "disabled";
            jQuery("td[attr='search_result_button']").addClass("hidden");
        } else {
            //$("#ct_right_detail_panel").removeClass("hidden");
            $("#tdSearch_bottom").removeClass("hidden");
            if (jQuery("td[attr='search_result_button']").hasClass("hidden")) {
                jQuery("td[attr='search_result_button']").removeClass("hidden");
            }
            disable = "";
        }

        //$("#ct_result_demographics").addClass("hidden");

        // attach the template
        $("#ct_results_geos").setTemplateElement("ct_results_geos_template");
        $("#ct_results_geos").setParam("disable", disable);

        // process the template
        $("#ct_results_geos").processTemplate(order);

        if (page.placeorder.order.GeoType == entity.enums.GeoType.Radius || page.placeorder.order.GeoType == entity.enums.GeoType.Closex || page.placeorder.order.GeoType == entity.enums.GeoType.Polygon
		    || page.placeorder.order.GeoType == entity.enums.GeoType.MultiRadius || page.placeorder.order.GeoType == entity.enums.GeoType.MultiClosex
		    || page.placeorder.order.GeoType == entity.enums.GeoType.AcxiomMultiRadius
		    || page.placeorder.order.GeoType == entity.enums.GeoType.AcxiomZipRadius
		    || page.placeorder.order.GeoType == entity.enums.GeoType.ZipMap

		    ) {

            if (!page.placeorder.IsShowOrderGeoDetailQuantity) {
                jQuery("#ct_result_raduis_address_table tr[attr='detail']").addClass("hidden");
                jQuery("#ct_result_raduis_address_table #raduis_hide_detail").addClass("hidden");
                jQuery("#ct_result_raduis_address_table #raduis_show_detail").addClass("hidden");
            }

            uc.result.Render_goog_map(jQuery('#geo_result_raduisMap'));

            $("#ct_results_geos input[type='text'][rowtype='total']").setMask('9999999999').bind("change", function(e) {
                //uc.result.GeoTotalQtyRaduis_Change(this);
                uc.result.GeoTotalQtyChange(this);
            }).bind("keydown", function(e) {
                if (!framework.common.IsEnterKeyDown(e)) {
                    return true;
                }
                framework.common.StopEvent(e);

                //uc.result.GeoTotalQtyRaduis_Change(this);
                uc.result.GeoTotalQtyChange(this);
                return false;
            });

            jQuery("#ct_result_radius_div").jScrollTouch();
        } else {
            if (!page.placeorder.IsShowOrderGeoDetailQuantity) {
                jQuery("#adjustdt1 tr[attr='detail']").addClass("hidden");
            }
            $("#ct_results_geos input[type='text'][rowtype='total']").setMask('9999999999').bind("change", function(e) {
                //uc.result.GeoTotalQty_Change(this);
                if (page.placeorder.IsValassisZip(order)) {
                    uc.result.GeoTotalQtyRaduis_Change(this);
                } else {

                    uc.result.GeoTotalQtyChange(this);
                }
            }).bind("keydown", function(e) {
                if (!framework.common.IsEnterKeyDown(e)) {
                    return true;
                }
                framework.common.StopEvent(e);

                //uc.result.GeoTotalQty_Change(this);
                if (page.placeorder.IsValassisZip(order)) {
                    uc.result.GeoTotalQtyRaduis_Change(this);
                } else {

                    uc.result.GeoTotalQtyChange(this);
                }
                return false;
            })
            jQuery("#adjustdiv1").jScrollTouch();

        }

        uc.result.RendeGeoDetails(order);

        // attach the template
        $("#ct_results_audience").setTemplateElement("ct_results_audience_template");
        // process the template
        $("#ct_results_audience").processTemplate(order);

        $('#ct_results_audience_panel').jScrollTouch();


        //#6149 - do reporting for radius around an address and closest records to an address with outputting city state and distance  by lisa at 2016/03/10
        //page.placeorder.order.GeoType == entity.enums.GeoType.Radius
        //    && (page.placeorder.order.RadiusTypeChoice == entity.enums.RadiusTypeChoice.ZIP4
        //        || page.placeorder.order.RadiusTypeChoice == entity.enums.RadiusTypeChoice.ATUO)
        //   || page.placeorder.order.GeoType == entity.enums.GeoType.Closex && page.placeorder.order.RadiusTypeChoice == entity.enums.RadiusTypeChoice.UNKNOWN
        if (page.placeorder.order.GeoType == entity.enums.GeoType.Radius && page.placeorder.order.SeeBreakDown == true && page.placeorder.currentDataSource == entity.enums.DataSourceType.Consumer) {
            //show see report
            jQuery("[name='span_seereport']").removeClass("hidden");
        } else {
            //hide see report
            jQuery("[name='span_seereport']").addClass("hidden");
        }
        
        if(page.placeorder.isMultiCount) {
            $("#ct_results_audience").addClass("hidden");
        }
        else {
            $("#ct_results_audience").removeClass("hidden");
        }

    },

    RendeGeoDetails: function(order) {
        if (order.OrderGeos.length < 1) {
            return;
        }
        if (order.ListType == entity.enums.DataSourceType.InfoUSAConsumer || order.ListType == entity.enums.DataSourceType.InfoUSABusiness) {
            return;
        }

        var maskOfGeo = '<div class="orderGeoDetails"></div>';
        $maskOfGeo = $(maskOfGeo);
        $maskOfGeo.setTemplateElement("ct_result_geo_details_template");
        //$("#ct_result_radius_div").setParam("disable", disable);
        // process the template
        $maskOfGeo.processTemplate(order);

        jQuery(".geoDetails").replaceWith($maskOfGeo.html());
        if (order.GeoType == entity.enums.GeoType.Radius || order.GeoType == entity.enums.GeoType.MultiRadius
           || order.GeoType == entity.enums.GeoType.Closex || order.GeoType == entity.enums.GeoType.MultiClosex
           || order.GeoType == entity.enums.GeoType.Polygon
           || order.GeoType == entity.enums.GeoType.ZipMap
           || page.placeorder.IsValassisZip(order)
           ) {
            $("#ct_results_geos input[type='text'][rowtype='geo']").setMask('9999999999').bind("change", function(e) {
                uc.result.GeoDetailQty_Change_Radius(this);
            }).bind("keydown", function(e) {
                if (!framework.common.IsEnterKeyDown(e)) {
                    return true;
                }
                framework.common.StopEvent(e);

                uc.result.GeoDetailQty_Change_Radius(this);
                return false;
            });

            $("#ct_results_geos input[type='checkbox'][rowtype='geo']").bind("click", function(e) {
                uc.result.GeoDetailQty_CheckBox_Radius(this);
            });
            if (!page.placeorder.IsValassisZip(order)) {
                jQuery("#ct_result_raduis_address_table #raduis_hide_detail").removeClass("hidden");
                jQuery("#ct_result_raduis_address_table #raduis_show_detail").addClass("hidden");
            }
            //uc.result.Show_Detail();
        } else {
            $("#ct_results_geos input[type='text'][rowtype='geo']").setMask('9999999999').bind("change", function(e) {
                uc.result.GeoQty_Change(this);
            }).bind("keydown", function(e) {
                if (!framework.common.IsEnterKeyDown(e)) {
                    return true;
                }
                framework.common.StopEvent(e);

                uc.result.GeoQty_Change(this);
                return false;
            });

            $("#ct_results_geos input[type='checkbox'][rowtype='geo']").bind("click", function(e) {
                uc.result.GeoQty_CheckBox(this);
            });
        }
    },



    GeoTotalQtyChange: function(element) {
        var order = page.placeorder.order;
        var $e = $(element);
        var value = Number($e.val());
        var maxValue = Number($e.attr("max"));
        if (value > maxValue) {
            value = maxValue;
            $e.val(value);
        }
        if (value < page.placeorder.minQuantityOfOrder) {
            $e.val(order.TotalDesiredQty);
            uc.result.Show_Error(String.format(" The quantity that you entered is less than the minimum quantity of {0}.", page.placeorder.minQuantityOfOrder));
            return;
        } else {
            uc.result.Clear_Error();
        }
        if (order.OrderGeos.length < 1) {
            framework.common.Ajax({
                url: "PlaceOrder.aspx/RedistributeOrderTotalQty",
                data: { totalDesiredQty: value },
                success: function(result) {
                    if (result.ResultFlag == true) {
                        order.TotalDesiredQty = value;
                        uc.result.UpdateOrderAndPrice(order);
                    }
                },
                waitingElement: "ct_results"
            });
        } else {
            var percent = value / maxValue;
            var lostValue = maxValue - value;
            var desired;
            for (var i = 0; i < order.OrderGeos.length; i++) {
                if (jQuery.isArray(order.OrderGeos[i].OrderGeoDetails) && order.OrderGeos[i].OrderGeoDetails.length > 0) {
                    for (var j = 0; j < order.OrderGeos[i].OrderGeoDetails.length; j++) {
                        desired = Math.round(order.OrderGeos[i].OrderGeoDetails[j].AvailableQty * percent);
                        order.OrderGeos[i].OrderGeoDetails[j].DesiredQty = desired;
                        lostValue = lostValue - (order.OrderGeos[i].OrderGeoDetails[j].AvailableQty - order.OrderGeos[i].OrderGeoDetails[j].DesiredQty);
                    }
                }
            }

            //Rever the value to help calculate
            lostValue = 0 - lostValue;
            if (lostValue != 0) {
                for (var i = 0; i < order.OrderGeos.length; i++) {
                    if (jQuery.isArray(order.OrderGeos[i].OrderGeoDetails) && order.OrderGeos[i].OrderGeoDetails.length > 0) {
                        for (var j = 0; j < order.OrderGeos[i].OrderGeoDetails.length; j++) {
                            if (lostValue == 0) break;

                            var newValue = order.OrderGeos[i].OrderGeoDetails[j].DesiredQty + lostValue;
                            if (newValue < 0 || newValue > order.OrderGeos[i].OrderGeoDetails[j].AvailableQty) {
                                if (order.OrderGeos[i].OrderGeoDetails[j].DesiredQty != order.OrderGeos[i].OrderGeoDetails[j].AvailableQty) {
                                    if (lostValue > 0) {
                                        lostValue = lostValue - (order.OrderGeos[i].OrderGeoDetails[j].AvailableQty - order.OrderGeos[i].OrderGeoDetails[j].DesiredQty);
                                        order.OrderGeos[i].OrderGeoDetails[j].DesiredQty = order.OrderGeos[i].OrderGeoDetails[j].AvailableQty;
                                    }
                                    else if (lostValue < 0) {
                                        lostValue = lostValue + order.OrderGeos[i].OrderGeoDetails[j].DesiredQty;
                                        order.OrderGeos[i].OrderGeoDetails[j].DesiredQty = 0;
                                    }
                                }
                            } else {
                                order.OrderGeos[i].OrderGeoDetails[j].DesiredQty = newValue;
                                lostValue = 0;
                                break;
                            }
                        }
                    }
                }
            }

            //order.OrderGeos[index].DesiredQty = value;
            $.each(order.OrderGeos, function(index, value) {
                order.OrderGeos[index].DesiredQty = 0;
                $.each(order.OrderGeos[index].OrderGeoDetails, function(index2, value2) {
                    order.OrderGeos[index].DesiredQty += value2.DesiredQty
                });
            });
            uc.result.UpdateOrderAndPrice(order);
        }

    },

    UpdateOrderAndPrice: function(order) {
        OrderHelper.RecaculateTotalQty(order);
        OrderHelper.CaculatePrice(order, uc.result.UserPriceList, uc.result.GlobalPriceList, uc.result.Promotion, uc.result.MetaDataPriceList);

        if (order.GeoType == entity.enums.GeoType.Radius || order.GeoType == entity.enums.GeoType.Closex || order.GeoType == entity.enums.GeoType.Polygon
		    || order.GeoType == entity.enums.GeoType.MultiRadius || order.GeoType == entity.enums.GeoType.MultiClosex) {
            uc.result.RenderDetailPriceInfoRaduis(order);
        } else {
            uc.result.RenderDetailPriceInfo(order);
        }
        uc.result.RenderOrderPriceInfo();
        //TODO:JENNY
        uc.result.ChangeNumberRender4InfoPackage();
    },


    RenderDetailPriceInfo: function(order) {
        var $parent = $("#ct_results_geos");
        for (i = 0; i < order.OrderGeos.length; i++) {
            $parent.find("input[type='text'][rowtype='geo'][rowindex='" + i + "']").val(order.OrderGeos[i].DesiredQty);
            if (order.OrderGeos[i].DesiredQty == 0) {
                $parent.find("input[type='checkbox'][rowtype='geo'][rowindex='" + i + "']").attr("checked", false);
            }
            else {
                $parent.find("input[type='checkbox'][rowtype='geo'][rowindex='" + i + "']").attr("checked", true);
            }
        }

    },
    RenderDetailPriceInfoRaduis: function(order) {
        var $inputs = $("#ct_results_geos tr[attr='detail']");

        $inputs.each(function(i, item) {
            var $item = $(item);
            var $desigredQty = $item.find("input[type='text'][rowtype='geo']"); // $item.find("span[rowtype='geo']");
            var $chk = $item.find("input[type='checkbox']");
            var row = $desigredQty.attr("rowkey");
            var subrow = $desigredQty.attr("subrowkey");

            $desigredQty.val(order.OrderGeos[row].OrderGeoDetails[subrow].DesiredQty);
            if (order.OrderGeos[row].OrderGeoDetails[subrow].DesiredQty == 0) {
                $chk.attr("checked", false);
            }
            else {
                $chk.attr("checked", true);
            }
        });

    },

    Render_Geos_Html_Occupant: function(order) {

        if (order.TotalAvailableQty < page.placeorder.minQuantityOfOrder) {
            $("#tdSearch_bottom").addClass("hidden");
            //$("#ct_right_detail_panel").addClass("hidden");
            jQuery("td[attr='search_result_button']").addClass("hidden");
        } else {
            //$("#ct_right_detail_panel").removeClass("hidden");
            $("#tdSearch_bottom").removeClass("hidden");
            if (jQuery("td[attr='search_result_button']").hasClass("hidden")) {
                jQuery("td[attr='search_result_button']").removeClass("hidden");
            }
        }


        //$("#ct_result_demographics").removeClass("hidden");

        // attach the template
        $("#ct_results_geos").setTemplateElement("ct_results_geos_occupant_template");

        // process the template
        $("#ct_results_geos").processTemplate(order);

        if (page.placeorder.order.GeoType == entity.enums.GeoType.Radius || page.placeorder.order.GeoType == entity.enums.GeoType.Closex
		    || page.placeorder.order.GeoType == entity.enums.GeoType.MultiRadius || page.placeorder.order.GeoType == entity.enums.GeoType.MultiClosex
		    || page.placeorder.order.GeoType == entity.enums.GeoType.ZipMap) {
            uc.result.Render_goog_map(jQuery("#geo_result_raduisMap_occupant"));
        }
        // attach the template
        $("#ct_results_occupant").setTemplateElement("ct_results_geodetails_occupant_template");
        $("#ct_results_occupant").processTemplate(order);


        $("#ct_results_occupant [type='checkbox'][rowtype='geo']").bind("click", function(e) {
            $e = $(this);
            var index = $e.attr("rowindex");
            var qtytype = $e.attr("qtytype");

            var chk = $e[0].checked;

            var geo = order.OrderGeos[index];
            geo.DesiredQtyHome = 0;
            geo.DesiredQtyApt = 0;
            geo.DesiredQtyBuss = 0;

            $.each(geo.OrderGeoDetails, function(index, value) {
                if (qtytype == "Home") {
                    geo.OrderGeoDetails[index].DesiredQtyHome = chk ? geo.OrderGeoDetails[index].AvailableQtyHome : 0;
                } else if (qtytype == "Apts") {
                    geo.OrderGeoDetails[index].DesiredQtyApt = chk ? geo.OrderGeoDetails[index].AvailableQtyApt : 0;
                } else if (qtytype == "Buss") {
                    geo.OrderGeoDetails[index].DesiredQtyBuss = chk ? geo.OrderGeoDetails[index].AvailableQtyBuss : 0;
                } else if (qtytype == "Total") {
                    geo.OrderGeoDetails[index].DesiredQtyHome = chk ? geo.OrderGeoDetails[index].AvailableQtyHome : 0;
                    geo.OrderGeoDetails[index].DesiredQtyApt = chk ? geo.OrderGeoDetails[index].AvailableQtyApt : 0;
                    geo.OrderGeoDetails[index].DesiredQtyBuss = chk ? geo.OrderGeoDetails[index].AvailableQtyBuss : 0;
                }

                geo.OrderGeoDetails[index].DesiredQty = geo.OrderGeoDetails[index].DesiredQtyHome + geo.OrderGeoDetails[index].DesiredQtyApt + geo.OrderGeoDetails[index].DesiredQtyBuss;

            });

            OrderHelper.RecaculateTotalGeoQty(order, index);

            uc.result.Update_Geo_Row_Html(order, index);

            var $detailContainer = $('#result_occu_geo_detail_row' + index).html("");
            if ($detailContainer.parent().hasClass("hidden") == false) {
                uc.result.Render_GeoDetails_Html(order, index);
            }

            OrderHelper.CaculatePrice(order, uc.result.UserPriceList, uc.result.GlobalPriceList, uc.result.Promotion, uc.result.MetaDataPriceList);

            uc.result.RenderOrderPriceInfo();

            //TODO:JENNY
            uc.result.ChangeNumberRender4InfoPackage();

        });

    },

    Render_GeoDetails_Html: function(order, geoindex) {
        var orderGeo = order.OrderGeos[geoindex];
        orderGeo.index = geoindex;
        var $detailContainer = $('#result_occu_geo_detail_row' + geoindex);
        if ($detailContainer.html() == "") {
            $detailContainer.setTemplateElement("ct_results_geodetails_template");
            $detailContainer.processTemplate(orderGeo);

            $detailContainer.find("input[type='text'][rowtype='geo']").setMask('9999999').bind("change", function(e) {
                uc.result.GeoDetailQty_Change(this);
            }).bind("keydown", function(e) {
                if (!framework.common.IsEnterKeyDown(e)) {
                    return true;
                }
                framework.common.StopEvent(e);

                uc.result.GeoDetailQty_Change(this);
                return false;
            });
            $detailContainer.find("input[type='checkbox']").bind("click", function(e) {
                uc.result.GeoDetailQty_CheckBox(this);
            });
        }

    },

    Update_Total_Row_Html: function(order) {
        $chks = $("#results_occu_total_row input[type='checkbox']");
        $chks[0].checked = order.DesiredQtyHome > 0;
        $chks[1].checked = order.DesiredQtyApt > 0;
        $chks[2].checked = order.DesiredQtyBuss > 0;


        $spans = $("#results_occu_total_row span[rowtype='total']");
        $spans[0].innerHTML = order.DesiredQtyHome;
        $spans[1].innerHTML = order.DesiredQtyApt;
        $spans[2].innerHTML = order.DesiredQtyBuss;
        $spans[3].innerHTML = order.TotalDesiredQty;
    },

    Update_Geo_Row_Html: function(order, geoindex) {
        var geo = order.OrderGeos[geoindex];
        $chks = $("#ct_results_occupant input[rowtype='geo'][rowindex='" + geoindex + "']");
        $chks[0].checked = geo.DesiredQtyHome > 0;
        $chks[1].checked = geo.DesiredQtyApt > 0;
        $chks[2].checked = geo.DesiredQtyBuss > 0;
        $chks[3].checked = geo.DesiredQty > 0;

        $spans = $("#ct_results_occupant span[rowtype='geo'][rowindex='" + geoindex + "']");
        $spans[0].innerHTML = geo.DesiredQtyHome;
        $spans[1].innerHTML = geo.DesiredQtyApt;
        $spans[2].innerHTML = geo.DesiredQtyBuss;
        $spans[3].innerHTML = geo.DesiredQty;

        uc.result.Update_Total_Row_Html(order);
    },

    Update_GeoDetail_Row_Html: function(order, geoindex, geodetailindex) {
        var geodetail = order.OrderGeos[geoindex].OrderGeoDetails[geodetailindex];
        var $detailContainer = $('#result_occu_geo_detail_row' + geoindex);

        $chks = $detailContainer.find("input[type='checkbox'][rowindex='" + geodetailindex + "']");
        $chks[0].checked = geodetail.DesiredQtyHome > 0;
        $chks[1].checked = geodetail.DesiredQtyApt > 0;
        $chks[2].checked = geodetail.DesiredQtyBuss > 0;
        $chks[3].checked = geodetail.DesiredQty > 0;

        $inputs = $detailContainer.find("input[type='text'][rowindex='" + geodetailindex + "']");
        $inputs[0].value = geodetail.DesiredQtyHome;
        $inputs[1].value = geodetail.DesiredQtyApt;
        $inputs[2].value = geodetail.DesiredQtyBuss;
        $inputs[3].value = geodetail.DesiredQty;

        $spans = $detailContainer.find("span[rowindex='" + geodetailindex + "']");
        $spans[0].innerHTML = geodetail.DesiredQty;
    },

    GetOrderAddress: function(orderAddresses, addressName) {
        if (orderAddresses == null || String.IsNullOrEmpty(addressName)) {
            return null;
        }
        var address = null;
        for (var i in orderAddresses) {
            address = orderAddresses[i];
            if (address.AddressName == addressName) {
                return address;
            }
        }
    },

    ResetMiles: function() {
        var elements = [];
        if (page.placeorder.order.ListType != entity.enums.DataSourceType.Occupant)
            elements = $("#ct_results_geos input[attr='geo_result_miles']");
        else {
            elements = $("#ct_results_geos input[attr='geo_result_occupant_miles']");
        }
        var element = null;
        var radiusUnit = framework.ui.GetRadiusUnitDesc(page.placeorder.RadiusUnit);
        for (var i = 0; i < elements.length; i++) {
            element = elements[i];
            var miles = element.value;
            if (isNaN(Number(miles)) || miles <= 0 || miles > 200) {
                uc.result.Show_Error(String.format("The radius must be between 0.1 {0} to 200.0 {0}.", radiusUnit));
                return;
            }
        }
        //		if (page.placeorder.order == null || page.placeorder.order.OrderAddresses == null || page.placeorder.order.OrderAddresses.length < 1) {
        //			uc.result.Show_Error("The address is ");
        //			return;
        //		}

        // the originalOrder object does not exist when coming from saved list count
        if (page.placeorder.originalOrder == null) {
            page.placeorder.originalOrder = page.placeorder.order;
        }
        var address = null;
        var addressName = null;
        var radius = null;
        var geos = [];
        for (var i = 0; i < elements.length; i++) {
            element = elements[i];
            addressName = element.attributes["address"].value;
            radius = element.value;
            address = uc.result.GetOrderAddress(page.placeorder.order.OrderAddresses, addressName);
            var ageo = new entity.OrderGeo();
            var geoKeyCode = null;
            if (address != null) {
                address.Radius = radius;
                geoKeyCode = String.format("{0}:{1}:{2}:{3}", address.Longitude, address.Latitude, address.Radius, page.placeorder.order.UmCode);
                //address.AddrSearchString = address.Longitude + ":" + address.Latitude + ":" + radius + ":" + address.AddrUsageType;
                address.AddrSearchString = geoKeyCode;
                address.GeoKeyCode = geoKeyCode;
                ageo.GeoKeyCode = geoKeyCode;
                ageo.AddressLine = geoKeyCode;
                ageo.GeoKeyDesc = address.AddressName;
                geos.push(ageo);
            }
        }
        page.placeorder.order.OrderGeos = geos;
        page.placeorder.ClearRedundantForSubmitOrder(page.placeorder.order);


        framework.common.Ajax({
            url: "PlaceOrder.aspx/SubmitOrder",
            data: { order: page.placeorder.order },
            success: function(result) {
                if (result.ResultFlag == true) {
                    page.placeorder.order = result.DataSource;

                    //TODO: not a good way for setting it here, should create another class for stroing order step but not order object
                    page.placeorder.order.NextStep = entity.enums.OrderStep.PollCount;
                    page.placeorder.GoNext();
                    // setTimeout(function() { uc.pollcount.CheckPollingStatus(result.DataSource.RequestId); }, 1000);
                }

            },
            error: function(rep) {
            }
        });

    },


    Click_SaveCount: function() {
        uc.savecount.Init();
        page.placeorder.TrackOrderPathGAEvent("Step 3 - Save Count","Save Count Button");
        framework.ui.ShowDialog('ct_results_save_count', { appendForm: true, hermesTheme: true, fixedOnScroll: false });
    },

    Click_RequirePromotion: function() {
        framework.ui.ShowDialog('ct_results_promocode_popup');
    },

    Click_AnotherFormat: function() {
        framework.ui.ShowDialog('ct_results_need_other_format_popup');
    },

    Click_MoreAboutUseage: function() {
        framework.ui.ShowDialog('ct_result_more_about_useage');
    },

    Click_EditSelections_Geo: function() {
        var o = page.placeorder.order;
        //framework.common.LogClickEvent("Click Edit Selections link", jQuery.toJSON(o), "Click_EditSelections_Geo.");
        page.placeorder.order.NextStep = entity.enums.OrderStep.Geo;
        page.placeorder.ClearRedundantForSubmitOrder(page.placeorder.order);
        page.placeorder.GoNext({ gotoresult: true });
    },

    Click_EditSelections_Demo: function() {
        page.placeorder.order.NextStep = entity.enums.OrderStep.Demo;
        page.placeorder.ClearRedundantForSubmitOrder(page.placeorder.order);
        page.placeorder.GoNext();
    },

    CheckInputPrice: function(inputPrice) {
        if (String.IsNullOrEmpty(inputPrice) || Number(inputPrice) < page.placeorder.order.GoodsCost) {
            return false;
        }
        return true;
    },

    Click_Next: function() {
        uc.result.Clear_Error();

        var o = page.placeorder.order;
        o.ListUsage = Number(jQuery("input[name='results_listusages']:checked").attr("data-mul"));

        if (o.TotalDesiredQty < page.placeorder.minQuantityOfOrder) {
            uc.result.Show_Error(String.format(" The quantity that you desired is less than the minimum quantity of {0}.", page.placeorder.minQuantityOfOrder));
            return;
        };
        if (page.placeorder.IsInputPrice) {
            var inputPrice = jQuery("#result_info_order_price_value").val();
            if (!uc.result.CheckInputPrice(inputPrice)) {
                uc.result.Show_Error(String.format("The order price your entered is empty or less than the cost price {0}.", framework.common.formatPrice(page.placeorder.order.GoodsCost, 4)));
                return;
            } else {
                page.placeorder.order.RetailCost = page.placeorder.order.TotalEstmCost;
                page.placeorder.order.TotalEstmCost = Number(inputPrice);
            }
        }

        // don't submit order with quantity
        //
        page.placeorder.order.NextStep = entity.enums.OrderStep.Payment;
        page.placeorder.GoNext();
    },

    Click_Back: function() {
        page.placeorder.ClearRedundantForSubmitOrder(page.placeorder.order);
        page.placeorder.TrackOrderPathGAEvent("Step 3 - Count","Count Back Button");
        page.placeorder.GoBack();
    },

    Hide_Detail: function() {
        jQuery("#ct_result_raduis_address_table tr[attr='detail']").addClass("hidden");
        jQuery("#ct_result_raduis_address_table #raduis_hide_detail").addClass("hidden");
        jQuery("#ct_result_raduis_address_table #raduis_show_detail").removeClass("hidden");
    },

    Show_Detail: function() {
        if (page.placeorder.order.OrderGeos.length < 1) {
            jQuery(".geoDetails").removeClass("hidden");
            uc.result.GetOrderGeos();
        } else {
            jQuery("#ct_result_raduis_address_table tr[attr='detail']").removeClass("hidden");
            jQuery("#ct_result_raduis_address_table #raduis_hide_detail").removeClass("hidden");
            jQuery("#ct_result_raduis_address_table #raduis_show_detail").addClass("hidden");
        }
    },

    Show_Error: function(msg) {
        jQuery("#result_error").removeClass("hidden");
        jQuery("#result_error").html(msg);
        setTimeout(function() { uc.result.Clear_Error(); }, 10000);
    },

    Clear_Error: function() {
        jQuery("#result_error").addClass("hidden");
        jQuery("#result_error").html("");
    },

    CheckDemobreakdown: function() {
        var order = page.placeorder.order;
        jQuery("#demoBreakdown").addClass("hidden");
        jQuery("#twoDimensionalReport").addClass("hidden");
        if (order == null || order.ListType == entity.enums.DataSourceType.Occupant) {
            return;
        }
        uc.result.StartTime = new Date();
        if (page.placeorder.isTwoDimensionalMatrixEnabled || page.placeorder.isDemoBreakdownEnabled) {
            framework.common.Ajax({
                url: "PlaceOrder.aspx/IsExistingDemoBreakdown",
                //data: { order: order },
                data: {},
                success: function(result) {
                    if (result.ResultFlag == true) {
                        if (result.DataSource.Exists) {
                            if (page.placeorder.isTwoDimensionalMatrixEnabled
							&& (page.placeorder.order.GeoType != entity.enums.GeoType.Radius
								&& page.placeorder.order.GeoType != entity.enums.GeoType.ZipRadius
								&& page.placeorder.order.GeoType != entity.enums.GeoType.Polygon
								&& page.placeorder.order.GeoType != entity.enums.GeoType.Closex
							   )) {
                                jQuery("#twoDimensionalReport").removeClass("hidden");
                            }
                            if (page.placeorder.isDemoBreakdownEnabled) {
                                jQuery("#ToShowBreakdownLink").attr("sid", order.ListModuleSessionId);
                                jQuery("#demoBreakdown").removeClass("hidden");
                            }
                        }
                    }
                    framework.common.Log(uc.result.StartTime, "Check if existing demo breakdown");
                },
                error: function(rep) {
                    jQuery("#demoBreakdown").addClass("hidden");
                }
            });
        }
    },

    ShowDemobreakdown: function(obj) {
        var sid = $(obj).attr("sid");
        $.fn.colorbox({ href: String.format("OC/ShowCountBreakdown.aspx?sid={0}", sid), iframe: true, width: 540, height: 600, opacity: 0.5, scrolling: true });
        return false;
    },

    ShowDemoBreakdownAndGeoDetails: function(obj) {
        //#6149 - do reporting for radius around an address and closest records to an address with outputting city state and distance  by lisa at 2016/03/09
        var sid = page.placeorder.order.ListModuleSessionId;

        $.fn.colorbox({ href: String.format("OC/ShowCountBreakdownAndDetailReport.aspx?sid={0}", sid), iframe: true, width: 640, height: 600, opacity: 0.5, scrolling: false });
        return false;
    },

    SetDemoBreakdown: function(breakdown, order) {
        jQuery("#demoBreakdown").addClass("hidden");
        jQuery("#twoDimensionalReport").addClass("hidden");
        if (breakdown == null || order == null || order.ListType == entity.enums.DataSourceType.Occupant) {
            return;
        }
        if (breakdown.Exists) {
            if (page.placeorder.isTwoDimensionalMatrixEnabled
							&& (page.placeorder.order.GeoType != entity.enums.GeoType.Radius
								&& page.placeorder.order.GeoType != entity.enums.GeoType.ZipRadius
								&& page.placeorder.order.GeoType != entity.enums.GeoType.Polygon
								&& page.placeorder.order.GeoType != entity.enums.GeoType.Closex
							   )) {
                jQuery("#twoDimensionalReport").removeClass("hidden");
            }
            if (page.placeorder.isDemoBreakdownEnabled) {
                jQuery("#ToShowBreakdownLink").attr("sid", order.ListModuleSessionId);
                jQuery("#demoBreakdown").removeClass("hidden");
            }
        }
    },


    ShowGeoAndDemoForTwoDimensionalReport: function() {
        var order = page.placeorder.order;
        uc.result.SelectsValue.clear();
        if (order.OrderGeos == null || order.OrderGeos.length < 1) {
            uc.result.GetOrderGeos();
        }
        uc.result.bindCriteriaForTwoDimensionalReport();
        //uc.result.SelectsValue.AvailableDemos = order.OrderSelectedDemos;
        uc.result.SelectsValue.AvailableGeos = order.OrderGeos;
        jQuery("#twoDimensionalReportResult").removeClass("hidden");
        jQuery("#twoDimensionalMessageDiv").addClass("hidden");

        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetDemosFromDemoBreakdown",
            data: { order: page.placeorder.order },
            success: function(result) {
                if (result.ResultFlag == true) {
                    uc.result.SelectsValue.AvailableDemos = result.DataSource.SelectedCategories;
                    $("#TwoDimensionalReportGeo").setTemplateElement("GeoOfTwoDimensionalReport");
                    $("#TwoDimensionalReportGeo").processTemplate(order);
                    $("#TwoDimensionalReportDemo").setTemplateElement("DemoCategoryFromTwoDimensionalReport");
                    $("#TwoDimensionalReportDemo").processTemplate(result.DataSource);
                    $("#TargetEmail").val(result.DataSource.TargetEmail);
                    framework.ui.ShowDialog('TwoDimensionalMatrixReportContainer');
                }

            },
            error: function(rep) {
                alert("Two dimensional report is not available for the selections you have made.");
            },
            waitingElement: "ct_results"
        });

    },

    ShowSuppressionOrders: function() {
        var order = page.placeorder.order;
        var dataPriorSuppression = order.OrderSuppressions;
        var dataCustomerSuppression = order.CustomSuppressions;
        var dataCountSuppression = order.SaveCountSuppressions;

        var totalCount = 0;

        //sort the data
        framework.common.sortJson(dataPriorSuppression, "OriginalOrderId", "desc", null);
        framework.common.sortJson(dataCustomerSuppression, "OrderDate", "desc", null);
        framework.common.sortJson(dataCountSuppression, "OriginalOrderId", "desc", null);

        jQuery("#divSuppressionOrder").removeClass("hidden");

        if (dataPriorSuppression != undefined && dataPriorSuppression.length > 0) {
            totalCount = totalCount + dataPriorSuppression.length;

            jQuery("#divpriorOrderSuppression").removeClass("hidden");
            jQuery("#priorOrderSuppressionContainer").removeClass("hidden");

            $("#priorOrderSuppressionContainer").setTemplateElement("priorOrderSuppression");
            $("#priorOrderSuppressionContainer").processTemplate(dataPriorSuppression);
        }
        else {
            jQuery("#divpriorOrderSuppression").addClass("hidden");
            jQuery("#priorOrderSuppressionContainer").addClass("hidden");
        }

        if (dataCustomerSuppression != undefined && dataCustomerSuppression.length > 0) {
            totalCount = totalCount + dataCustomerSuppression.length;

            jQuery("#divcustomerOrderSuppression").removeClass("hidden");
            jQuery("#customerOrderSuppressionContainer").removeClass("hidden");

            $("#customerOrderSuppressionContainer").setTemplateElement("customerOrderSuppression");
            $("#customerOrderSuppressionContainer").processTemplate(dataCustomerSuppression);
        }
        else {
            jQuery("#divcustomerOrderSuppression").addClass("hidden");
            jQuery("#customerOrderSuppressionContainer").addClass("hidden");
        }

        if (dataCountSuppression != undefined && dataCountSuppression.length > 0) {
            totalCount = totalCount + dataCountSuppression.length;

            jQuery("#divcountOrderSuppression").removeClass("hidden");
            jQuery("#countOrderSuppressionContainer").removeClass("hidden");

            $("#countOrderSuppressionContainer").setTemplateElement("countOrderSuppression");
            $("#countOrderSuppressionContainer").processTemplate(dataCountSuppression);
        }
        else {
            jQuery("#divcountOrderSuppression").addClass("hidden");
            jQuery("#countOrderSuppressionContainer").addClass("hidden");
        }

        if (totalCount > 20) {
            jQuery("#SuppressionOrderContainer").attr("style", "width:400px; height:400px;");
            jQuery("#divSuppressionOrders").attr("style", "overflow-y:auto;height:360px;");
        }
        else {
            jQuery("#SuppressionOrderContainer").attr("style", "width:400px;");
        }

        framework.ui.ShowDialog('SuppressionOrderContainer');

    },

    addGeoCriteriaForTwoDimensionalReport: function() {
        var geoKeyCode = jQuery('#TwoDimensionalReportGeo').val();
        var selectedGeo = jQuery('#TwoDimensionalReportGeo option:selected');
        var geoKeyDesc = selectedGeo.attr("desc");
        if (String.IsNullOrEmpty(geoKeyCode) && geoKeyDesc == "All") {
            uc.result.addAllGeosForTwoDimensionalReport();
        } else if (!String.IsNullOrEmpty(geoKeyCode)) {
            uc.result.SelectsValue.addGeo(geoKeyCode, geoKeyDesc);
        }
        uc.result.bindCriteriaForTwoDimensionalReport();
    },

    addAllGeosForTwoDimensionalReport: function() {
        jQuery.each(uc.result.SelectsValue.AvailableGeos, function(index, element) {
            uc.result.SelectsValue.addGeo(element.GeoKeyCode, element.GeoKeyDesc);
        });
    },

    removeGeoCriteriaForTwoDimensionalReport: function() {
        var geoKeyCode = jQuery('#TwoDimensionalReportGeo').val();
        if (String.IsNullOrEmpty(geoKeyCode)) return;
        var selectedGeo = jQuery('#TwoDimensionalReportGeo option:selected');
        uc.result.SelectsValue.removeGeo(geoKeyCode);
        uc.result.bindCriteriaForTwoDimensionalReport();
    },

    // add demo detail as criteria
    addDemoCriteriaForTwoDimensionalReport: function() {
        var attributeValue = jQuery('#TwoDimensionalReportDemo').val();
        if (String.IsNullOrEmpty(attributeValue)) return;
        var selectedDemo = jQuery('#TwoDimensionalReportDemo option:selected');
        var valueName = selectedDemo.attr("valuename");
        var attrName = selectedDemo.attr("attrname");
        var columnName = selectedDemo.attr("columnname");
        var sortSeq = selectedDemo.attr("sortseq");
        uc.result.SelectsValue.addDemo(columnName, attrName, attributeValue, valueName, sortSeq);
        uc.result.bindCriteriaForTwoDimensionalReport();
    },

    addDemoCategoryCriteriaForTwoDimensionalReport: function() {
        var columnName = jQuery('#TwoDimensionalReportDemo').val();
        if (String.IsNullOrEmpty(columnName)) return;
        var selectedDemo = jQuery('#TwoDimensionalReportDemo option:selected');
        var attrName = selectedDemo.attr("attrname");

        uc.result.SelectsValue.addDemoCategory(columnName, attrName);
        uc.result.bindCriteriaForTwoDimensionalReport();
    },

    removeDemoCriteriaForTwoDimensionalReport: function() {
        var attributeValue = jQuery('#TwoDimensionalReportDemo').val();
        if (String.IsNullOrEmpty(attributeValue)) return;
        var selectedDemo = jQuery('#TwoDimensionalReportDemo option:selected');
        var valueName = selectedDemo.attr("valuename");
        var columnName = selectedDemo.attr("columnname");
        uc.result.SelectsValue.removeDemo(columnName, attributeValue);
        uc.result.bindCriteriaForTwoDimensionalReport();
    },

    removeCriteriaForTwoDimensionalReport: function() {
        var selectedCriteria = jQuery('#criteria option:selected');
        jQuery.each(selectedCriteria, function() {
            var element = jQuery(this);
            var datatype = element.attr("datatype");
            var value = element.val();
            if (datatype == "geo") {
                if (String.IsNullOrEmpty(value)) {
                    uc.result.SelectsValue.SelectedGeos = [];
                } else {
                    uc.result.SelectsValue.removeGeo(value);
                }
            } else if (datatype == "demo") {
                if (String.IsNullOrEmpty(value)) {
                    uc.result.SelectsValue.SelectedDemos = [];
                } else {
                    uc.result.SelectsValue.removeDemoCategory(value);
                }
            }
        });
        uc.result.bindCriteriaForTwoDimensionalReport();
    },

    bindCriteriaForTwoDimensionalReport: function() {
        var criteria = jQuery("#criteria");
        criteria.html("");
        var info = "";
        var optionFormat = "<option style='{0}' value='{1}' datatype='{3}'>{2}</option>";
        if (uc.result.SelectsValue.SelectedGeos.length > 0) {
            info = String.format(optionFormat, "", "", "Rows:", "geo");
            info = info + String.format(optionFormat, "margin-left: 10px;", "", "Geography", "geo");

            jQuery.each(uc.result.SelectsValue.SelectedGeos, function(i, geo) {
                info = info + String.format(optionFormat, "margin-left:20px;", geo.GeoKeyCode, geo.GeoKeyDesc, "geo");

            });
        }

        if (uc.result.SelectsValue.SelectedDemos.length > 0) {
            info = info + String.format(optionFormat, "", "", "Columns:", "demo");

            jQuery.each(uc.result.SelectsValue.SelectedDemos, function(i, demo) {
                info = info + String.format(optionFormat, "margin-left:20px;", demo.ColumnName, demo.AttributeName, "demo");
            });
        }
        criteria.html(info);

    },

    Submit2DReportRequest: function() {
        var desc = jQuery("#searchDescription").val();
        var targetEmail = jQuery("#TargetEmail").val();
        if (String.IsNullOrEmpty(targetEmail)) {
            alert("Please enter the email address");
            return;
        }
        var selectedDemos = [];
        if (uc.result.SelectsValue.SelectedDemos.length < 1) {
            selectedDemos = uc.result.SelectsValue.AvailableDemos;
        } else {
            selectedDemos = uc.result.SelectsValue.SelectedDemos;
        }
        var selectedGeos = [];
        if (uc.result.SelectsValue.SelectedGeos.length < 1) {
            selectedGeos = uc.result.SelectsValue.AvailableGeos;
        } else {
            selectedGeos = uc.result.SelectsValue.SelectedGeos;
        }
        framework.common.Ajax({
            url: "PlaceOrder.aspx/Submit2DReportConditions",
            data: { order: page.placeorder.order,
                demoCategories: selectedDemos,
                geos: selectedGeos,
                desc: desc,
                delimiterOfEmails: ",",
                targetEmail: targetEmail
            },
            success: function(result) {
                if (result.ResultFlag == true) {
                    //framework.ui.CloseDialog();
                    jQuery("#recipients").html(targetEmail);
                    jQuery("#twoDimensionalReportResult").addClass("hidden");
                    jQuery("#twoDimensionalMessageDiv").removeClass("hidden");
                }

            },
            error: function(rep) {
                alert("Fail to submit two dimensional report request");
            },
            waitingElement: "TwoDimensionalMatrixReportContainer"
        });

    },

    ClearFields: function() {
        uc.result.SelectsValue.clearSelected();
        uc.result.bindCriteriaForTwoDimensionalReport();
    },

    PopUpRenderFacebook: function() {
        //uc.result.ClearMobileAdInformation();
        // $.fn.colorbox({ href: "https://www.facebook.com/business/a/directmail", iframe: true, width: 700, height: 900, opacity: 0.5, scrolling: false });
        $.fn.colorbox({ href: "help/facebook.htm", iframe: true, width: 920, height: 700, opacity: 0.5, scrolling: true });
        // $.fn.colorbox({ inline: true, href: "#testfacebook", width: 1050, height: 700, opacity: 0.5, scrolling: true });
    },

    PopUpRenderNewMobile: function() {
        $.fn.colorbox({ href: "help/MobileAd.htm", iframe: true, width: 920, height: 700, opacity: 0.5, scrolling: true });
    },

    GetExcelReport: function() {
        var desc = jQuery("#searchDescription").val();
        var selectedDemos = [];
        if (uc.result.SelectsValue.SelectedDemos.length < 1) {
            selectedDemos = uc.result.SelectsValue.AvailableDemos;
        } else {
            selectedDemos = uc.result.SelectsValue.SelectedDemos;
        }
        var selectedGeos = [];
        if (uc.result.SelectsValue.SelectedGeos.length < 1) {
            selectedGeos = uc.result.SelectsValue.AvailableGeos;
        } else {
            selectedGeos = uc.result.SelectsValue.SelectedGeos;
        }
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GenerateTwoDimensionalMatrixForExcel",
            data: { demoCategories: selectedDemos,
                geos: selectedGeos,
                desc: desc
            },
            success: function(result) {
                if (result.ResultFlag == true) {
                    window.location.href = result.DataSource;
                } else {
                    alert(result.ResultMessage);
                }

            },
            error: function(rep) {
                alert("Fail to download report");
            },
            waitingElement: "TwoDimensionalMatrixReportContainer"
        });
    },

    SelectsValue: {

        SelectedDemos: [],
        SelectedGeos: [],
        AvailableDemos: [],
        AvailableGeos: [],

        addDemoCategory: function(columnname, attrname) {
            //var selectedDemos = page.placeorder.order.OrderSelectedDemos;
            var selectedDemos = uc.result.SelectsValue.AvailableDemos;
            var demoCategory = jQuery.grep(selectedDemos, function(category) {
                if (category.ColumnName == columnname) {
                    jQuery.each(category.Values, function(index, element) {
                        //var demoValue = $(this);
                        uc.result.SelectsValue.addDemo(category.ColumnName, attrname, element.AttributeValue, element.AttributeValueName, index);
                    });
                }
            });
        },

        addDemo: function(columnname, attrname, value, name, sortseq) {
            var demo = new entity.SelectedDemoCategory();
            var exists = false;
            for (var i = 0; i < uc.result.SelectsValue.SelectedDemos.length; i++) {
                if (uc.result.SelectsValue.SelectedDemos[i].ColumnName == columnname) {
                    demo = uc.result.SelectsValue.SelectedDemos[i];
                    exists = true;
                    break;
                }
            }
            demo.ColumnName = columnname;
            demo.AttributeName = attrname;
            var seq = sortseq || 0;
            demo.addValue(value, name, seq);

            if (!exists) {
                //uc.result.SelectsValue.SelectedDemos.push(demo);
                uc.result.SelectsValue.SelectedDemos = [];
                uc.result.SelectsValue.SelectedDemos.push(demo);
                //framework.common.sortJson(uc.result.SelectsValue.SelectedDemos, "AttributeName", "asc");
            }
        },

        removeDemo: function(columnname, attrvalue) {
            uc.result.SelectsValue.SelectedDemos = $.grep(uc.result.SelectsValue.SelectedDemos, function(cat) {
                if (cat.ColumnName == columnname) {
                    cat.removeValue(attrvalue);
                    if (cat.Values.length == 0) {
                        return false;
                    }
                }

                return true;
            });
        },

        removeDemoCategory: function(columnname) {
            uc.result.SelectsValue.SelectedDemos = $.grep(uc.result.SelectsValue.SelectedDemos, function(cat) {
                if (cat.ColumnName == columnname) {
                    return false;
                }

                return true;
            });
        },

        addGeo: function(geoKeyCode, geoKeyDesc) {
            var orderGeo = new entity.OrderGeo();
            orderGeo.GeoKeyCode = geoKeyCode;
            orderGeo.GeoKeyDesc = geoKeyDesc;
            var exists = false;
            for (var i = 0; i < uc.result.SelectsValue.SelectedGeos.length; i++) {
                if (uc.result.SelectsValue.SelectedGeos[i].GeoKeyCode == geoKeyCode) {
                    orderGeo = uc.result.SelectsValue.SelectedGeos[i];
                    exists = true;
                }
            }
            if (!exists) {
                uc.result.SelectsValue.SelectedGeos.push(orderGeo);
                framework.common.sortJson(uc.result.SelectsValue.SelectedGeos, "GeoKeyDesc", "asc");
            }
        },

        removeGeo: function(geoKeyCode) {
            uc.result.SelectsValue.SelectedGeos = $.grep(uc.result.SelectsValue.SelectedGeos, function(geo) {
                return geo.GeoKeyCode != geoKeyCode;
            });
        },

        clearSelected: function() {
            uc.result.SelectsValue.SelectedGeos = [];
            uc.result.SelectsValue.SelectedDemos = [];

        },

        clear: function() {
            uc.result.SelectsValue.SelectedGeos = [];
            uc.result.SelectsValue.SelectedDemos = [];
            uc.result.SelectsValue.AvailableDemos = [];
            uc.result.SelectsValue.AvailableGeos = [];
        }
    },

    CalculateCost: function() {
        jQuery("#results_info_of_cost_of_goods").addClass("hidden");
        if (page.placeorder.isDLGReseller) {
            jQuery("#TotalPriceHeader").html("Recommended Price:");
            var order = page.placeorder.order;
            framework.common.Ajax({
                url: "PlaceOrder.aspx/getCostOfOrders",
                data: { order: order },
                success: function(result) {
                    if (result.ResultFlag == true) {
                        jQuery("#results_info_cost_of_goods").html(framework.common.formatMoney(result.DataSource.CostOfOrder));
                        jQuery("#results_info_projected_profit").html(framework.common.formatMoney(result.DataSource.Profit));
                        jQuery("#results_info_of_cost_of_goods").removeClass("hidden");
                    }

                },
                error: function(rep) {
                }
            });
        }

    },


    DoOrderQuote: function() {
        uc.result.Clear_Error();
        page.placeorder.TrackOrderPathGAEvent("Step 3 - Send Quote","Send Quote Button");
        var order = page.placeorder.order;
        framework.common.Ajax({
            url: "PlaceOrder.aspx/IsOrderQuoteAvailable",
            data: {
                order: order
            },
            success: function(result) {
                if (result.ResultFlag == true) {
                    if (result.DataSource.OrderExisted && result.DataSource.OrderAvailable) {
                        $.fn.colorbox({ href: "Dialogs/OrderQuote.aspx", iframe: true, width: 750, height: 830, opacity: 0.5, scrolling: true });
                    } else {
                        uc.result.Show_Error("In order to \"Send Quote\", please first \"Save Count\".");
                    }
                }

            },
            error: function(rep) {

            },
            waitingElement: 'ct_main_panel'
        });
        return false;

    },

    NailPoint: function(element) {
        var addressName = jQuery(element).attr("address");
        if (String.IsNullOrEmpty(addressName)) {
            return;
        }
        var o = page.placeorder.order;
        var address = null;
        var anAddress = null;
        for (var i in o.SearchAddresses) {
            anAddress = o.SearchAddresses[i];
            if (anAddress.AddressName == addressName) {
                address = anAddress;
                break;
            }
        }
        if (address != null) {
            uc.result.Google_Map_Element.jmap('ClearMap');
            if (page.placeorder.order.GeoType != entity.enums.GeoType.Polygon) {
                var radiusValue = Number(address.Radius);
                if (radiusValue > 0) {
                    uc.result.Google_Map_Element.jmap('AddRoundGroundOverlay', {
                        'mapCenter': [address.Latitude, address.Longitude],
                        'radius': address.Radius
                    });
                }
            } else {
                var points = uc.geo.radius.ParsePoints(address.AddrSearchString);
                uc.geo.radius.DrawPolygon(uc.result.Google_Map_Element, points);
            }
            uc.result.Google_Map_Element.jmap('AddMarker', {
                'pointLatLng': [address.Latitude, address.Longitude],
                'pointIcon': 'themes/default/assets/images/gmap/mm_20_blue.png',
                'pointTitle': address.AddressName
            });
            uc.result.Google_Map_Element.jmap('MoveTo', {
                'mapCenter': [address.Latitude, address.Longitude]
            });
        }
    },



    RequestCountReport: function() {
        uc.result.ShowRequestCountReportMessage(null, false);
        var recipients = jQuery("#countReportRecipient").val().trim();
        var recipientCC = jQuery("#countReportRecipientCC").val().trim();
        var reportName = jQuery("#countReportName").val().trim();
        if (String.IsNullOrEmpty(recipients)) {
            uc.result.ShowRequestCountReportMessage("Please set target email.", true);
            return;
        }
        if (String.IsNullOrEmpty(reportName)) {
            uc.result.ShowRequestCountReportMessage("Please name this count.", true);
            return;
        }
        var order = page.placeorder.order;
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetCountReport",
            data: {
                recipient: recipients,
                recipientCC: recipientCC,
                reportName: reportName
            },
            success: function(result) {
                if (result.ResultFlag == true) {
                    uc.result.ShowRequestCountReportMessage("The request to get count report has been sent successfully.", true);
                } else {
                    uc.result.ShowRequestCountReportMessage("Fail to send request to get count report, please try again.", true);
                }

            },
            error: function(rep) {
                uc.result.ShowRequestCountReportMessage("Fail to send request to get count report, please try again.", true);
            },
            waitingElement: 'getCountReportDiv'
        });
        return false;

    },

    ShowRequestCountReportMessage: function(message, show) {
        var item = jQuery("#countReportMessage");
        if (!show) {
            item.html("");
            item.addClass("hidden");
        } else {
            item.html(message);
            item.removeClass("hidden");
        }
    },

    ShowRequestCountReport: function() {
        framework.ui.ShowDialog("InfoUSACountReports");
    }
};

//ie6,7 can't convert object in the parent page to JSON string correctly, 
//so we create functions here to convert between JSON string and object
var toJSONOrder = function() {
    return jQuery.toJSON(page.placeorder.order);
}
var evalJSONOrder = function(json) {
    page.placeorder.order = jQuery.evalJSON(json);
}