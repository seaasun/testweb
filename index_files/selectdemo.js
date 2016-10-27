
ni.RegisterNameSpace("uc.demo");
uc.demo = {
    // Initial Step Setting
    InitStepSetting: function(order) {
        var step = page.placeorder.orderflow || new entity.OrderFlow();
        step.CurrentStep = entity.enums.OrderStep.Demo;
        step.StepTitle = "";
        step.StepDescription = "";
        step.StepButtonsStatus = entity.enums.StepButtons.Back | entity.enums.StepButtons.Next;
        step.StepButtonsEvent = [
            { ButtonKey: entity.enums.StepButtons.Next, ButtonEvent: uc.demo.Click_Next },
            { ButtonKey: entity.enums.StepButtons.Back, ButtonEvent: uc.demo.Click_Back }
        ];
        

        return step;
        // framework.listener.FireListener(framework.listener.LISTENER_INIT_STEP, step);
    },

    mappingChars: [], //an array to hold what character maps to another character
    GetMappingChars: function() {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetMappingChars",
            data: {},
            success: function(result) {
                if (result.ResultFlag == true) {
                    var mappingChars = result.DataSource;
                    if (mappingChars != null) {
                        for (var i = 0; i < mappingChars.length; i++) {
                            var mappingChar = mappingChars[i];
                            uc.demo.mappingChars.push({ Key: mappingChar.Key, Value: mappingChar.Value });
                        }
                    }
                }
            },
            error: function(rep) {
                framework.common.LogClickEvent(String.format("Fail to get mapping characters."));
            }
        });
    },

    SetMappingChars: function(mappingChars) {
        if (mappingChars != null) {
            for (var i = 0; i < mappingChars.length; i++) {
                var mappingChar = mappingChars[i];
                uc.demo.mappingChars.push({ Key: mappingChar.Key, Value: mappingChar.Value });
            }
        }
    },

    IsInit: false,
    listTypeMatch: "",

    Init: function() {
        var o = page.placeorder.order;
        o.CurrentStep = entity.enums.OrderStep.Demo;

        var step = uc.demo.InitStepSetting();
        framework.listener.FireListener(framework.listener.LISTENER_INIT_STEP, step);

        jQuery('#ct_demo').fadeIn(1000);
        jQuery('#ct_step_demo').removeClass("hidden");

        uc.demo.listTypeMatch = String.format("[listtype*=',{0},']", o.ListType);

        //#6390 - Remove upload suppression option from all data source except Consumer on map
        if (page.global.isMyAcxiomSite && o.ListType == entity.enums.DataSourceType.Consumer) {
            jQuery('#whole_customer_file_suppression').removeClass("hidden");
            jQuery('#customsupp_pan').removeClass("hidden");
        } else if (!page.global.isMyAcxiomSite) {
            jQuery('#whole_customer_file_suppression').removeClass("hidden");
            jQuery('#customsupp_pan').removeClass("hidden");
        }

        if (o.ListType == entity.enums.DataSourceType.Occupant) {
            jQuery('#ct_demo_stdatasource').addClass("hidden");
            jQuery('#ct_demo_occupant').removeClass("hidden");
        } else {
            if (!uc.demo.IsInit) {
                uc.demo.suppression.AutoLoadSuppression();
                uc.demo.IsInit = true;
            }
            jQuery('#ct_demo_stdatasource').removeClass("hidden");
            jQuery('#ct_demo_occupant').addClass("hidden");

            if (!framework.common.IsRegisteredSite) {
                if (o.ListType == entity.enums.DataSourceType.Business) {
                    jQuery("#demoOptionsHeader").html("Additional Selections");
                }
            }
            jQuery('#demo_options_variables_input input[type="text"]').setMask('99999999');
            jQuery('#demo_lifestyle_variables_input input[type="text"]').setMask('99999999');

            // hide all tabs in the first place,then show available tabs
            $("#ct_demo_ul li").addClass("hidden");

            //page.placeorder.Enable_DomainSuppression = true;
            if (framework.common.IsRegisteredSite || uc.demo.AllowCustomDomainSuppression()) {
                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='suppressionHeader']").removeClass("hidden");
            }

            //#5890 - Recommendation MAP Changes
            //if (!framework.common.IsRegisteredSite && page.global.isMyAcxiomPartnerUSite) {
            //$("#demoOptionsHeader").attr("href", "#demo_p_all");
            //$("#lifeStyleHeader a").attr("href", "#demo_p_all_lifestyle");
            //}
            //Recommendation MAP add view all audience propensity
            if (!framework.common.IsRegisteredSite && (page.global.isMyAcxiomPartnerUSite || page.global.isDatabilitiesUSite)) {
                $("#view_all_audience_propensity").removeClass("hidden");
            }

            $("#more_demo_help_phone").text(page.global.PhoneNumber);

            $("#more_demo_help").click(function() {
                framework.ui.ShowDialog('more_demo_help_panel', { fixedOnScroll: false, appendForm: true, css: { cursor: "default", top: '55%', left: '30%', border: '0px solid #aaa'} });
            });

            $("#ct_demo_tabs").tabs({
                select: function(event, ui) {
                    var ordIndex = $(ui.tab).attr("ord");
                    uc.demo.SelectTab(parseInt(ordIndex));

                }
            });
            uc.demo.CheckIfLifeStyleAndQuickpickExist();
            //tony 2015-04-28 5700
            uc.demo.LoadPostSupPhone();
            //uc.demo.SetAllHouseHoldsAndPhoneOption(o.ListType);
            //uc.demo.SetPhoneOptions(o.ListType);

            // Load From Order
            uc.demo.LoadFromOrder();

            //Load mapping characters for pandora
            //uc.demo.GetMappingChars();

            jQuery('#select_all_households').attr('secondaryKey', entity.lookup.DataSource.getByCode(page.placeorder.order.ListType).DisplayName);
            jQuery('#i_select_all_households').attr('secondaryKey', entity.lookup.DataSource.getByCode(page.placeorder.order.ListType).DisplayName);
            jQuery('#define_target_audience').attr('secondaryKey', entity.lookup.DataSource.getByCode(page.placeorder.order.ListType).DisplayName);
            jQuery('#i_define_target_audience').attr('secondaryKey', entity.lookup.DataSource.getByCode(page.placeorder.order.ListType).DisplayName);
            jQuery('#define_target_audience_tab').attr('secondaryKey', entity.lookup.DataSource.getByCode(page.placeorder.order.ListType).DisplayName);
            jQuery('#i_define_target_audience_tab').attr('secondaryKey', entity.lookup.DataSource.getByCode(page.placeorder.order.ListType).DisplayName);

            if (page.placeorder.isMultiCount) {
                $("#ct_demo").addClass("hidden");
                $("#ct_demo_multi_counts").removeClass("hidden");

                uc.demo.multicount.Init();

                $(".order_step_buttons").find("a[buttonname='order_stepbt_back']").addClass("hidden");
            }
            else {
                $("#ct_demo").removeClass("hidden");
                $("#ct_demo_multi_counts").addClass("hidden");
                $(".order_step_buttons").find("a[buttonname='order_stepbt_back']").removeClass("hidden");
            }         
            
        }
    },

    InitSelect: function(outdiv, appender, selectId) {
        var outer = $("#" + outdiv);
        var appender = $("#" + appender);
        var r = $("#" + selectId);
        appender.css("width", r.outerWidth());
        //$("#demo_propensity_appender").css("width", $('#demo_propensity').outerWidth());
        r.css('width', outer.outerWidth());
        outer.scroll(function() {
            r.css('width', $(this).outerWidth() + $(this).scrollLeft());
        });
    },

    AllowCustomDomainSuppression: function() {
        var allow = false;
        allow = !framework.common.IsRegisteredSite && page.placeorder.Enable_DomainSuppression && page.placeorder.Allow_CustomDomainSuppression;
        return allow;
    },

    SetDemoTabs: function(order) {

        $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id!='quickPickupHeader'][id!='suppressionHeader'][id!='lifeStyleHeader'][id!='liAudiencePropensity'][id!='liCharitableGiving'][id!='liMarketClarity'][id!='liMarketStreet'][id!='liFocusMarket']").removeClass("hidden");
        if (!uc.demo.CharitableGivingExisted && page.placeorder.demoTabActive == "8") {
            page.placeorder.demoTabActive = "";
        }
        if (!uc.demo.AnicoTabsExisted && page.placeorder.demoTabActive == "9") {
            page.placeorder.demoTabActive = "";
        }

        var index = page.placeorder.demoTabActive == "" ? entity.enums.DemoTab.DemoOptions : page.placeorder.demoTabActive;
        if (order.ListType == entity.enums.DataSourceType.Business || order.ListType == entity.enums.DataSourceType.InfoUSABusiness || (order.ListType == entity.enums.DataSourceType.Compass && !page.placeorder.Enable_AN_BusinessQP && !uc.demo.AnicoTabsExisted)) {
            index = entity.enums.DemoTab.BusinessType;
        };

        if (order.ListType == entity.enums.DataSourceType.Compass && page.placeorder.Enable_AN_BusinessQP) {
            $("#ct_demo_tabs ul li[id='businessQpHeader']").addClass("hidden");
            $("#ct_demo_tabs ul li[id='businessTypeHeader']").addClass("hidden");
        }

        if (order.ListType == entity.enums.DataSourceType.Compass && page.placeorder.Enable_AN_BusinessQP && !uc.demo.AnicoTabsExisted) {
            index = entity.enums.DemoTab.QuickPicks;
        }

        var aList = $("#ct_demo_ul a");
        for (var i = 0; i < aList.length; i++) {
            if (parseInt($(aList[i]).attr('ord')) == index) {
                $("#ct_demo_tabs").tabs("option", "selected", i);
                uc.demo.SelectTab(index);
                break;

            }
        }

        $("#ct_demo_ul").removeClass("hidden");

        //Audience Propensities
        if (order.ListType == entity.enums.DataSourceType.Consumer) {
            if ($("#liAudiencePropensity").css("display") != "none") {
                jQuery('a[href="#demo_p_options"]').html("Demographics");
                jQuery('a[href="#demo_p_lifestyle"]').html("Interests & Purchasing");
            }
        }

        //#5890 - Recommendation MAP Changes
        //if the site is myacxiompartner unregister site
        //if (!framework.common.IsRegisteredSite && page.global.isMyAcxiomPartnerUSite) {
        //    jQuery("#demoOptionsHeader").html("Selection Options");
        //}

        if (!framework.common.IsRegisteredSite && !page.global.isMyAcxiomPartnerUSite && !page.global.isDatabilitiesUSite) {
            $("#ct_demo_tabs ul li[id='liAudiencePropensity']").addClass("hidden");
        }
    },

    SetPhoneOptions: function(phoneOptions) {
        if (phoneOptions.AvailablePhoneOptions != null && phoneOptions.AvailablePhoneOptions.length > 0) {
            uc.demo.ShowPhoneOption("demo_po_nothing", false, "");
            uc.demo.ShowPhoneOption("demo_po_available", false, "");
            uc.demo.ShowPhoneOption("demo_po_records", false, "");
            jQuery.each(phoneOptions.AvailablePhoneOptions, function(i, phoneOption) {
                var element = jQuery("input[type='radio'][name='demo-phoneoption'][value=" + phoneOption.SettingValue + "]");
                var elementId = element.attr("id");
                uc.demo.ShowPhoneOption(elementId, true, phoneOption.SettingDesc);
            });

            if (phoneOptions.DefaultCheckedPhoneOption != entity.enums.PhoneOption.None) {
                //                if (phoneOptions.DefaultCheckedPhoneOption == entity.enums.PhoneOption.PhoneNumberWithAvailable && jQuery("#demo_po_records_sup_on").attr("checked") == "checked") {
                //                    jQuery("input[type='radio'][name='demo-phoneoption'][value=" + entity.enums.PhoneOption.PhoneNumberOnly + "]").attr("checked", true);
                //                } else {
                //                    jQuery("input[type='radio'][name='demo-phoneoption'][value=" + phoneOptions.DefaultCheckedPhoneOption + "]").attr("checked", true);
                //                }
                jQuery("input[type='radio'][name='demo-phoneoption'][value=" + phoneOptions.DefaultCheckedPhoneOption + "]").attr("checked", true);
            }
        }
    },
    //tony 20150617 5700
    SetPostSupPhone: function(order) {
        // $("input[type='radio'][name='demo-phoneoption'][value=" + order.phoneOptions + "]").click();
        //            for (var i = 0; i < order.SelectedDemoCategory.length; i++) {
        //                if (order.SelectedDemoCategory[i].ColumnName == "PostSupPhone" && entity.enums.PhoneOption.PhoneNumberWithAvailable) {
        //                    if (order.SelectedDemoCategory[i].Values.length > 1) {
        //                        $("[name='demo_po_available']").removeClass("hidden");
        //                        $("input[name='demo-phoneoption-sup'][id='demo_po_records_sup_on'][value=" + order.SelectedDemoCategory[i].Values[0].AttributeValue + " ]").prop("checked", true);
        //                    } else {
        //                    $("[name='demo_po_records']").removeClass("hidden");
        //                    $("input[name='demo-phoneoption-sup'][id='demo_po_available_sup_on'][value=" + order.SelectedDemoCategory[i].Values[0].AttributeValue + " ]").prop("checked", true);
        //                    }
        //                }
        //            }
        if (typeof (order.OrderSelectedDemos) != "undefined" && order.OrderSelectedDemos != null) {
            for (var i = 0; i < order.OrderSelectedDemos.length; i++) {
                if (order.OrderSelectedDemos[i].ColumnName == "PostSupPhone") {
                    if (order.PhoneOption == entity.enums.PhoneOption.PhoneNumberWithAvailable) {
                        $("[name='demo_po_available']").removeClass("hidden");
                        $("input[name='demo-phoneoption-sup'][id='demo_po_available_sup_on'][value=" + order.OrderSelectedDemos[i].Values[0].AttributeValue + " ]").prop("checked", true);
                    }
                    if (order.PhoneOption == entity.enums.PhoneOption.PhoneNumberOnly) {
                        $("[name='demo_po_records']").removeClass("hidden");
                        $("input[name='demo-phoneoption-sup'][id='demo_po_records_sup_on'][value=" + order.OrderSelectedDemos[i].Values[0].AttributeValue + " ]").prop("checked", true);
                        $("input[name='demo-phoneoption-sup'][id='demo_po_records_sup_on'][value=" + order.OrderSelectedDemos[i].Values[1].AttributeValue + " ]").prop("checked", true);
                    }
                }
            }
        }


    },

    /*
    SetPhoneOptions: function(listType) {
    framework.common.Ajax({
    url: "PlaceOrder.aspx/GetAvailablePhoneOptions",
    data: { listType: listType },
    success: function(result) {
    if (result.ResultFlag == true) {
    if (result.DataSource.AvailablePhoneOptions != null && result.DataSource.AvailablePhoneOptions.length > 0) {
    uc.demo.ShowPhoneOption("demo_po_nothing", false, "");
    uc.demo.ShowPhoneOption("demo_po_available", false, "");
    uc.demo.ShowPhoneOption("demo_po_records", false, "");
    jQuery.each(result.DataSource.AvailablePhoneOptions, function(i, phoneOption) {
    var element = jQuery("input[type='radio'][name='demo-phoneoption'][value=" + phoneOption.SettingValue + "]");
    var elementId = element.attr("id");
    uc.demo.ShowPhoneOption(elementId, true, phoneOption.SettingDesc);
    });

                        if (result.DataSource.DefaultCheckedPhoneOption != entity.enums.PhoneOption.None) {
    jQuery("input[type='radio'][name='demo-phoneoption'][value=" + result.DataSource.DefaultCheckedPhoneOption + "]").attr("checked", true);
    }
    }
    }
    },
    error: function(rep) {
    framework.common.LogClickEvent(String.format("Fail to get available phone option for list type {0}", listType), "", rep == null ? "Fail to get available phone option" : rep.responseText);
    }
    });
    },
    */
    ShowPhoneOption: function(elementId, isShow, phoneOptionDesc) {
        if (isShow) {
            jQuery("#" + elementId).removeClass("hidden");
            jQuery("#" + elementId + "_label").removeClass("hidden");
            if (!String.IsNullOrEmpty(phoneOptionDesc)) {
                jQuery("#" + elementId + "_label").html(phoneOptionDesc);
            }
        } else {
            jQuery("#" + elementId).addClass("hidden");
            jQuery("#" + elementId + "_label").addClass("hidden");
        }
    },

    LoadFromOrder: function() {
        var o = page.placeorder.order;

        // ToDo: no need to copy category one by one, we just add object prototype to it
        // ToDo: not bind the select demos from order on myacxiom partner unregister site
        // ToDo: bind the selected demos of order from get count 
        if (!page.global.isMyAcxiomPartnerUSite) {
            if (o.OrderSelectedDemos != null && o.OrderSelectedDemos.length > 0) {
                uc.demo.SelectsValue.SelectedDemos = [];
                for (var i = 0; i < o.OrderSelectedDemos.length; i++) {
                    var demo = new entity.SelectedDemoCategory();
                    demo.ColumnName = o.OrderSelectedDemos[i].ColumnName;
                    demo.AttributeName = o.OrderSelectedDemos[i].AttributeName;
                    demo.DemoCategoryType = o.OrderSelectedDemos[i].DemoCategoryType;
                    demo.Values = o.OrderSelectedDemos[i].Values;
                    uc.demo.SelectsValue.SelectedDemos.push(demo);
                }
            }
        } else {
            if (page.placeorder.order.OrderId != undefined && page.placeorder.order.OrderId > 0) {
                if (o.OrderSelectedDemos != null && o.OrderSelectedDemos.length > 0) {
                    uc.demo.SelectsValue.SelectedDemos = [];
                    for (var i = 0; i < o.OrderSelectedDemos.length; i++) {
                        var demo = new entity.SelectedDemoCategory();
                        demo.ColumnName = o.OrderSelectedDemos[i].ColumnName;
                        demo.AttributeName = o.OrderSelectedDemos[i].AttributeName;
                        //demo.DemoCategoryType = 3;
                        //if (o.OrderSelectedDemos[i].ColumnName == "Quick Pick") {
                        //  demo.DemoCategoryType = 2;
                        //}
                        demo.DemoCategoryType = o.OrderSelectedDemos[i].DemoCategoryType;
                        demo.Values = o.OrderSelectedDemos[i].Values;
                        uc.demo.SelectsValue.SelectedDemos.push(demo);
                    }
                }
            }
        }
        // set check options
        if (o.ListType == entity.enums.DataSourceType.Occupant) {
            if (o.TargetOption & entity.enums.TargetOption.Homes == entity.enums.TargetOption.Homes) {
                jQuery("#chkIncludeHomes").attr("checked", "checked");
            } else {
                jQuery("#chkIncludeHomes").removeAttr("checked");
            }

            if (o.TargetOption & entity.enums.TargetOption.Homes == entity.enums.TargetOption.Apartments) {
                jQuery("#chkIncludeApartments").attr("checked", "checked");
            } else {
                jQuery("#chkIncludeApartments").removeAttr("checked");
            }

            if (o.TargetOption & entity.enums.TargetOption.Homes == entity.enums.TargetOption.Businesses) {
                jQuery("#chkIncludeBusinesses").attr("checked", "checked");
            } else {
                jQuery("#chkIncludeBusinesses").removeAttr("checked");
            }

            if (o.RouteOption & entity.enums.RouteOption.Carrier == entity.enums.RouteOption.Carrier) {
                jQuery("#chkIncludeCarrierRoutes").attr("checked", "checked");
            } else {
                jQuery("#chkIncludeCarrierRoutes").removeAttr("checked");
            }

            if (o.RouteOption & entity.enums.RouteOption.PoBoxes == entity.enums.RouteOption.PoBoxes) {
                jQuery("#chkIncludePostOfficeBoxes").attr("checked", "checked");
            } else {
                jQuery("#chkIncludePostOfficeBoxes").removeAttr("checked");
            }

            if (o.RouteOption & entity.enums.RouteOption.Rural == entity.enums.RouteOption.Rural) {
                jQuery("#chkIncludeRuralRoutes").attr("checked", "checked");
            } else {
                jQuery("#chkIncludeRuralRoutes").removeAttr("checked");
            }

            if (o.ContactNameOption == 1) {
                jQuery("#chkIncludeContactNames").attr("checked", "checked");
            } else {
                jQuery("#chkIncludeContactNames").removeAttr("checked");
            }
        }
        if (o.ListType == entity.enums.DataSourceType.Consumer) {
            uc.demo.SetPostSupPhone(o);
        }
        var demoPhoneOptions = jQuery("input[type='radio'][name='demo-phoneoption']");
        if (o.PhoneOption != entity.enums.PhoneOption.None) {
            //5700 tony 20150616
            demoPhoneOptions.filter(String.format("[value={0}]", o.PhoneOption)).attr("checked", true);
        }
        //jQuery("input[type='radio'][name='demo-phoneoption']").val(o.PhoneOption);
        jQuery("#demo_selectall")[0].checked = (o.DemoType == entity.enums.DemoType.All);
        uc.demo.AllHouseholds_Click();
    },

    IsDemoLoaded: false,
    IsLifeStyleLoaded: false,
    IsIndustryTreeLoaded: false,
    IsQuickPickupLoaded: false,
    IsPropensityLoaded: false,
    IsSearchInited: false,
    IsCharitableGivingLoaded: false,
    IsMarketClarityLoaded: false,
    IsMarketStreetLoaded: false,
    IsFocusMarketLoaded: false,

    MarketClarityQuickPicks: [],
    MarketStreetQuickPicks: [],
    FocusMarketDemoValues: [],

    IsMarketClarityLoadedAll: false,
    IsMarketStreetLoadedAll: false,
    IsFocusMarketLoadedAll: false,

    SelectTab: function(index) {
        uc.demo.SetErrorMessage(false);
        $('#ct_demo_panels').addClass("hidden");
        $('#ct_industry_panels').addClass("hidden");
        $('#ct_suppression_panels').addClass("hidden");
        $('#ct_demo_quickpickup_panels').addClass("hidden");
        jQuery("#ct_my_quickpick").addClass("hidden");
        $("#ct_demo_charitable_giving").addClass("hidden");

        $("#ct_demo_marketclarity_panels").addClass("hidden");
        $("#ct_demo_marketstreet_panels").addClass("hidden");
        $("#ct_demo_focusmarket_panels").addClass("hidden");
        if (page.placeorder.order.ListType == entity.enums.DataSourceType.Compass && page.placeorder.demoTabActive && page.placeorder.demoTabActive == "9") {
            $('#ct_demo_selectall').addClass("hidden");
        }
        else {
            $('#ct_demo_selectall').removeClass("hidden");
        }
        $('#ct_demo_anico_mc_selectall').addClass("hidden");
        $('#ct_demo_anico_ms_selectall').addClass("hidden");
        $('#ct_demo_anico_fm_selectall').addClass("hidden");

        if (page.placeorder.currentDataSource == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
            $('#ct_demo_phoneoption').addClass("hidden");
        } else {
            if(page.placeorder.order.ListType == entity.enums.DataSourceType.InfoUSA_Consumer || page.placeorder.order.ListType == entity.enums.DataSourceType.InfoUSA_Business){
                $("#ct_demo_phoneoption").addClass("hidden");
            }
            else{
                $("#ct_demo_phoneoption").removeClass("hidden");
            }
        }
        
        

        //$('#ct_autosuggestion_panels').addClass("hidden");

        switch (index) {
            case entity.enums.DemoTab.DemoOptions:
                $('#ct_demo_panels').removeClass("hidden");
                if (!uc.demo.IsDemoLoaded) {
                    //#5890 - Recommendation MAP Changes
                    //if (!framework.common.IsRegisteredSite && page.global.isMyAcxiomPartnerUSite) {
                    //    uc.demo.LoadAllDemoAttributes();
                    //} else {
                    uc.demo.LoadDemoCategory();
                    //}
                    //uc.demo.LoadDemoCategorys("demo_options_category", 1, "demo_options_variables", "demo_options_variables_input", "demo_options_input_label");
                    uc.demo.IsDemoLoaded = true;
                }
                if (framework.common.IsRegisteredSite) {
                    jQuery("#ct_my_quickpick").removeClass("hidden");
                }
                break;
            case entity.enums.DemoTab.LifeStyle:
                $('#ct_demo_panels').removeClass("hidden");
                if (!uc.demo.IsLifeStyleLoaded) {
                    //#5890 - Recommendation MAP Changes
                    //if (!framework.common.IsRegisteredSite && page.global.isMyAcxiomPartnerUSite) {
                    //    uc.demo.LoadAllDemoCategory();
                    //} else {
                    uc.demo.LoadLifeStypeCategory();
                    //}
                    //uc.demo.LoadDemoCategorys("demo_lifestyle_category", 2, "demo_lifestyle_variables", "demo_lifestyle_variables_input", "demo_lifestyle_input_label");
                    uc.demo.IsLifeStyleLoaded = true;
                }
                if (framework.common.IsRegisteredSite) {
                    jQuery("#ct_my_quickpick").removeClass("hidden");
                }
                break;
            case entity.enums.DemoTab.Propensities:
                $('#ct_demo_panels').removeClass("hidden");
                if (!uc.demo.IsPropensityLoaded) {
                    //uc.demo.LoadDemoCategorys("demo_lifestyle_category", 2, "demo_lifestyle_variables", "demo_lifestyle_variables_input", "demo_lifestyle_input_label");
                    uc.demo.LoadPropensities();
                    uc.demo.IsPropensityLoaded = true;
                }
                if (framework.common.IsRegisteredSite) {
                    jQuery("#ct_my_quickpick").removeClass("hidden");
                }
                break;
            case entity.enums.DemoTab.QuickPicks:
                $('#ct_demo_quickpickup_panels').removeClass("hidden");
                if (!uc.demo.IsQuickPickupLoaded) {
                    uc.demo.LoadQuickPicks();
                    uc.demo.IsQuickPickupLoaded = true;
                }
                break;
            case entity.enums.DemoTab.BusinessQuickPicks:
                $('#ct_industry_panels').removeClass("hidden");
                uc.demo.LoadBusinessQuickPicks();
                if (framework.common.IsRegisteredSite) {
                    jQuery("#ct_my_quickpick").removeClass("hidden");
                }
                break;
            case entity.enums.DemoTab.BusinessType:
                $('#ct_industry_panels').removeClass("hidden");
                uc.demo.LoadIndustryTree();
                if (framework.common.IsRegisteredSite) {
                    jQuery("#ct_my_quickpick").removeClass("hidden");
                }
                break;
            case entity.enums.DemoTab.Suppression:
                $('#ct_suppression_panels').removeClass("hidden");
                $('#ct_demo_selectall').addClass("hidden");
                //$('#ct_demo_phoneoption').addClass("hidden");
                uc.demo.suppression.Init();
                break;
            case entity.enums.DemoTab.AutoSuggestion:
                $('#ct_demo_selectall').addClass("hidden");
                //$('#demo_search_result_select').html("");
                if (!uc.demo.IsSearchInited) {
                    uc.demo.autoSuggestionInit();
                    uc.demo.IsSearchInited = true;
                }
                break;
            case entity.enums.DemoTab.CharitableGiving:
                $('#ct_demo_charitable_giving').removeClass("hidden");
                if (!uc.demo.IsCharitableGivingLoaded) {
                    uc.demo.LoadCharitableGivings();
                    uc.demo.IsCharitableGivingLoaded = true;
                }
                break;
            case entity.enums.DemoTab.MarketClarity:
                $('#ct_demo_marketclarity_panels').removeClass("hidden");
                $('#ct_demo_anico_mc_selectall').removeClass("hidden");
                $('#ct_demo_anico_ms_selectall').addClass("hidden");
                $('#ct_demo_anico_fm_selectall').addClass("hidden");
                $('#ct_demo_selectall').addClass("hidden");
                if (!uc.demo.IsMarketClarityLoaded) {
                    uc.demo.LoadMarketClarityQuickPicks();
                    uc.demo.IsMarketClarityLoaded = true;
                }
                break;
            case entity.enums.DemoTab.MarketStreet:
                $('#ct_demo_marketstreet_panels').removeClass("hidden");
                $('#ct_demo_anico_ms_selectall').removeClass("hidden");
                $('#ct_demo_anico_mc_selectall').addClass("hidden");
                $('#ct_demo_anico_fm_selectall').addClass("hidden");
                $('#ct_demo_selectall').addClass("hidden");
                if (!uc.demo.IsMarketStreetLoaded) {
                    uc.demo.LoadMarketStreetQuickPicks();
                    uc.demo.IsMarketStreetLoaded = true;
                }
                break;
            case entity.enums.DemoTab.FocusMarket:
                $('#ct_demo_focusmarket_panels').removeClass("hidden");
                $('#ct_demo_anico_fm_selectall').removeClass("hidden");
                $('#ct_demo_anico_mc_selectall').addClass("hidden");
                $('#ct_demo_anico_ms_selectall').addClass("hidden");
                $('#ct_demo_selectall').addClass("hidden");
                if (!uc.demo.IsFocusMarketLoaded) {
                    uc.demo.LoadFocusMarketCategory();
                    uc.demo.IsFocusMarketLoaded = true;
                }
                break;
        }
    },

    autoSuggestionInit: function() {
        $('#ct_autosuggestion_panels').removeClass("hidden");
        $(".as-original").removeClass("hidden");
        $(".as-values").val("");

        $("#demo_search_result_select").css("width", $("#demo_search_result_div").outerWidth());
        //$("#demo_search_result_appender").css("width", "");

        var o = page.placeorder.order;
        var listType = o.ListType;
        //var demoCategory = 1; //1: demographic
        var parameters = "";
        parameters = "&ListType=" + listType; //+ "&DemoCategory=" + demoCategory;

        $('#autosuggestion_input_area').html('');
        $('#autosuggestion_input_area').html('<input type="text" name="demo_autosuggestion_input" id="demo_autosuggestion_input" style="width:680px;" />');
        $("#demo_autosuggestion_input").autoSuggest("BA/DemoAutoSuggestion.ashx",
        {
            beforeRetrieve: uc.demo.mappingSpecialCharacters,
            isDuplicateSelection: uc.demo.isDuplicateSelection,
            activeClick: uc.demo.activeClick,
            clearKey: uc.demo.clearKey,
            validateMatchByServerSide: true,
            keyDelay: 1000,
            queryParam: "Keyword",
            extraParams: parameters,
            selectedItemProp: "AttributeValueName",
            selectedValuesProp: "AttributeValue",
            searchObjProps: "AttributeValueName",
            startText: "",
            formatList: uc.demo.AutoSuggestionFormat,
            formatSelection: uc.demo.formatSelection,
            resultsComplete: uc.demo.AddHorizontalScroll,
            matchingResult: uc.demo.CheckMatchingResult
        });
    },

    AddHorizontalScroll: function() {

        $("#demo_search_result_select").css("width", "");
        $("#demo_search_result_appender").css("width", "");
        uc.demo.InitSelect("demo_search_result_div", "demo_search_result_appender", "demo_search_result_select");
    },

    isDuplicateSelection: function(element) {
        //check if the selectItem in result dropdown list has been chosen
        //if so, the variable isDuplicate = true
        //otherwise, isDuplicate = false;
        var ele = $(element);

        var isDuplicate = false;
        var selection_items = $(".as-selections > .as-selection-item");
        selection_items.each(function(index, selection_item) {
            var item = $(selection_item);
            var column_name = item.attr("columnname");
            var attribute_value = item.attr("attributevalue");
            if (column_name == ele.attr("columnname") && attribute_value == ele.attr("attributevalue"))
                isDuplicate = true;
        });

        return isDuplicate;
    },

    activeClick: function(element) {
        //if the group header is clicked,
        //do not render to input text box
        var toActiveClick = false;

        var ele = $(element);
        var isGroup = ele.attr("IsGroup") == 1;
        toActiveClick = !isGroup;

        return toActiveClick;
    },

    clearKey: function(element) {
        return false;
    },

    mappingSpecialCharacters: function(keyword) {
        //convert special characters to the mapping words,eg. $ is money
        //added by michael
        var mappingChars = uc.demo.mappingChars;

        for (var i = 0; i < mappingChars.length; i++) {
            var mappingObj = mappingChars[i];
            var key = mappingObj.Key;
            var value = mappingObj.Value;

            keyword = keyword.replace(new RegExp(key, 'gi'), value);
        }

        return keyword;
    },

    formatSelection: function(data, element) {
        //format the element shown in the input text box
        var ele = $(element);
        ele.attr("columnName", data.ColumnName);
        ele.attr("attributeDesc", data.AttributeName);
        ele.attr("attributeDesc", data.AttributeDesc);
        ele.attr("attributeName", data.AttributeName);
        ele.attr("attributeValue", data.AttributeValue);
        ele.attr("AttributeValueName", data.AttributeValueName);
        ele.attr("demoCategory", data.DemoCategory);
        ele.attr("sortSeq", data.SortSeq);

        //ele.html(data.AttributeValueName);
    },

    AutoSuggestionFormat: function(data, element) {
        //format the display item in the result dropdown list
        var ele = $(element);
        ele.addClass("result-item");
        if (data.IsGroup) {
            ele.attr("columnName", data.ColumnName);
            ele.attr("attributeDesc", data.AttributeDesc);
            ele.attr("demoCategory", data.DemoCategory);
            ele.attr("isGroup", 1);
            ele.addClass("result-item-group");
            ele.css("display", "list-item");
            ele.css("background-color", "#F3F3F3");
            //ele.html("<strong>" + data.AttributeName + "</strong>");
            ele.html(data.AttributeName);
            ele.css("cursor", "default");
            return ele;
        }
        else {
            ele.attr("columnName", data.ColumnName);
            ele.attr("attributeDesc", data.AttributeDesc);
            ele.attr("attributeValue", data.AttributeValue);
            ele.attr("demoCategory", data.DemoCategory);
            ele.attr("sortSeq", data.SortSeq);
            ele.attr("isGroup", 0);
            ele.html("&nbsp;&nbsp;" + data.AttributeValueName);
            return ele;
        }
    },

    CheckMatchingResult: function(matchingCount) {
        if (matchingCount > 0) {
            uc.demo.SetErrorMessage(false);
        } else {
            uc.demo.SetErrorMessage(true, "We could not find a matching result.");
        }
    },

    Click_Next: function() {
        var o = page.placeorder.order;
        //add auto suggestion selected item, added by michael
        uc.demo.addAutoSuggestionSelectedItem();
        o.OrderSelectedDemos = uc.demo.SelectsValue.SelectedDemos;

        //        o.OrderSelectedDemos = uc.demo.SelectsValue.SelectedDemos;
        page.placeorder.ClearRedundantForSubmitOrder(page.placeorder.order);
        uc.demo.Save_Data();
        uc.demo.addPostSupPhone(o);
        var IsValid = uc.demo.DoValidation(o);

        if (IsValid) {
            page.placeorder.TrackOrderPathGAEvent("Step 2 - Demo", "Demo Next Button");
            uc.demo.ClearMinOrMaxValue();
            o.NextStep = entity.enums.OrderStep.PollCount;

            jQuery("#demo_phoneoption_errormsg").html("").addClass("hidden");
            jQuery("#ct_demo_phoneoption").removeClass("basic_color");
            uc.demo.SubmitOrder(o);
        }
    },

    addAutoSuggestionSelectedItem: function() {
        var selectedItems = $(".as-selections > .as-selection-item");
        for (var i = 0; i < selectedItems.length; i++) {
            var item = $(selectedItems[i]);
            uc.demo.SelectsValue.addDemo(item.attr("columnname"), item.attr("attributeName"), item.attr("attributeValue"), item.attr("AttributeValueName"), entity.enums.SelectedDemoType.Demography, item.attr("sortSeq"));
        }
    },
    //tony 5700 2015-05-05
    addPostSupPhone: function(order) {
        var post_sup_phone_on = $("#demo_po_records_sup_no");
        var post_sup_phone = $("input[name='demo-phoneoption-sup']:checked");
        if (post_sup_phone.length > 0) {
            if (order.OrderSelectedDemos != undefined) {
                for (var i = 0; i < order.OrderSelectedDemos.length; i++) {
                    if (order.OrderSelectedDemos[i].ColumnName == "PostSupPhone") {
                        order.OrderSelectedDemos[i].Values.splice(0, 2);
                    }
                }
            }
            if (order.PhoneOption == entity.enums.PhoneOption.PhoneNumberOnly) {
                uc.demo.AddSupDemoCategory(post_sup_phone_on);
            }
            uc.demo.AddSupDemoCategory(post_sup_phone);
        } else {
            if (order.OrderSelectedDemos != undefined) {
                for (var i = 0; i < order.OrderSelectedDemos.length; i++) {
                    if (order.OrderSelectedDemos[i].ColumnName == "PostSupPhone") {
                        // order.OrderSelectedDemos[i].Values.splice(0, 2);
                        //  order.OrderSelectedDemos.splice(i, 1);
                        uc.demo.SelectsValue.SelectedDemos.splice(i, 1);

                    }
                }
            }
        }
    },
    AddSupDemoCategory: function(supPhoneItem) {
        for (var i = 0; i < supPhoneItem.length; i++) {
            uc.demo.SelectsValue.addDemo("PostSupPhone", "DNC Phone", supPhoneItem[i].value, supPhoneItem[i].attributes["attributevaluename"].value, entity.enums.SelectedDemoType.PostSupPhone, "0");
        }
    },
    Click_Back: function() {
        page.placeorder.TrackOrderPathGAEvent("Step 2 - Demo", "Demo Back Button");
        page.placeorder.GoBack();
    },

    DoValidation: function(order) {
        uc.demo.SetErrorMessage(false);
        if (order.ListType == entity.enums.DataSourceType.Occupant) {
            if (order.TargetOption == 0) {
                uc.demo.SetErrorMessage(true, "Please select at least one targeting option.");
                return false;
            }

            if (order.RouteOption == 0) {
                uc.demo.SetErrorMessage(true, "Please select at least one route option.");
                return false;
            }
        } else {

            if (page.placeorder.isMultiCount && order.GeoType == entity.enums.GeoType.MultiCount) {
                if (order.OrderGeos == null || (order.OrderGeos != null && order.OrderGeos.length < 2)) {
                    uc.demo.SetErrorMessage(true, "Please select at least two saved counts.");
                    return false;
                }
            }

            if (order.DemoType != entity.enums.DemoType.All) {
                if (order.OrderSelectedDemos == null || order.OrderSelectedDemos.length == 0) {
                    uc.demo.SetErrorMessage(true, "Please define your target audience.");
                    return false;
                }
                if (order.OrderSelectedDemos.length == 1 && order.OrderSelectedDemos[0].ColumnName == "PostSupPhone") {
                    uc.demo.SetErrorMessage(true, "Please define your target audience.");
                    return false;
                }
            }

            // Check Suppression
            // edit check suppression  2012-12-12 jack
            var currentDate = new Date();
            var minDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDay());

            if (order.SuppressionType == entity.enums.SuppressionType.DATE || order.SuppressionType == entity.enums.SuppressionType.DATE_CUSTOMORDERS || order.SuppressionType == entity.enums.SuppressionType.DATE_CUSTOMDATE) {
                if (order.SuppressionStartDate == null || order.SuppressionEndDate == null
					|| order.SuppressionStartDate < minDate || order.SuppressionStartDate > order.SuppressionEndDate) {
                    uc.demo.SetErrorMessage(true, "Please enter a valid suppression date range.");
                    return false;
                }

                if (order.SuppressionType == entity.enums.SuppressionType.DATE_CUSTOMORDERS) {
                    if (!order.AllCustomSuppressionChecked && (order.CustomSuppressions == null || order.CustomSuppressions.length == 0)) {
                        uc.demo.SetErrorMessage(true, "Please select at least one order for custom suppression.");
                        return false;
                    }
                }

                if (order.SuppressionType == entity.enums.SuppressionType.DATE_CUSTOMDATE) {
                    if (order.CustomSuppressionStartDate == null || order.CustomSuppressionEndDate == null
					|| order.CustomSuppressionStartDate < minDate || order.CustomSuppressionStartDate > order.CustomSuppressionEndDate) {
                        uc.demo.SetErrorMessage(true, "Please enter a valid custom suppression date range.");
                        return false;
                    }
                }
            }

            else if (order.SuppressionType == entity.enums.SuppressionType.ORDERLIST || order.SuppressionType == entity.enums.SuppressionType.ORDERLIST_CUSTOMORDERS || order.SuppressionType == entity.enums.SuppressionType.ORDERLIST_CUSTOMDATE) {
                if (!order.AllSuppressionChecked && (order.OrderSuppressions == null || order.OrderSuppressions.length == 0)) {
                    uc.demo.SetErrorMessage(true, "Please select at least one order for suppression.");
                    return false;
                }

                if (order.SuppressionType == entity.enums.SuppressionType.ORDERLIST_CUSTOMORDERS) {
                    if (!order.AllCustomSuppressionChecked && (order.CustomSuppressions == null || order.CustomSuppressions.length == 0)) {
                        uc.demo.SetErrorMessage(true, "Please select at least one order for custom suppression.");
                        return false;
                    }
                }

                if (order.SuppressionType == entity.enums.SuppressionType.ORDERLIST_CUSTOMDATE) {
                    if (order.CustomSuppressionStartDate == null || order.CustomSuppressionEndDate == null
					|| order.CustomSuppressionStartDate < minDate || order.CustomSuppressionStartDate > order.CustomSuppressionEndDate) {
                        uc.demo.SetErrorMessage(true, "Please enter a valid custom suppression date range.");
                        return false;
                    }
                }
            }

            else if (order.SuppressionType == entity.enums.SuppressionType.CUSTOMDATE) {
                if (order.CustomSuppressionStartDate == null || order.CustomSuppressionEndDate == null
					|| order.CustomSuppressionStartDate < minDate || order.CustomSuppressionStartDate > order.CustomSuppressionEndDate) {
                    uc.demo.SetErrorMessage(true, "Please enter a valid custom suppression date range.");
                    return false;
                }
            }

            else if (order.SuppressionType == entity.enums.SuppressionType.CUSTOMORDER) {
                if (!order.AllCustomSuppressionChecked && (order.CustomSuppressions == null || order.CustomSuppressions.length == 0)) {
                    uc.demo.SetErrorMessage(true, "Please select at least one order for custom suppression.");
                    return false;
                }
            }

            if (jQuery("#demo_suppression_checkbox_prior_order").is(":checked")) {
                var suppressionOption = jQuery("input[type='radio'][name='suppression-option']:checked");

                if (!suppressionOption || suppressionOption.length == 0) {
                    uc.demo.SetErrorMessage(true, "Please select at least one order for suppression.");
                    return false;
                }
            }

            if (jQuery("#demo_suppression_checkbox_customer").is(":checked")) {
                var customOption = jQuery("input[type='radio'][name='custom-suppression-option']:checked");

                if (!customOption || customOption.length == 0) {
                    uc.demo.SetErrorMessage(true, "Please select at least one order for custom suppression.");
                    return false;
                }
            }

            // check phone option
            if (order.PhoneOption == entity.enums.PhoneOption.None && order.GeoType != entity.enums.GeoType.MultiCount 
                && order.ListType != entity.enums.DataSourceType.InfoUSA_Consumer
                && order.ListType != entity.enums.DataSourceType.InfoUSA_Business) {
                jQuery("#demo_phoneoption_errormsg").html("Please select a phone option to continue.").removeClass("hidden");
                jQuery("#ct_demo_phoneoption").addClass("basic_color");

                var offset = jQuery("#ct_demo_phoneoption").offset();
                window.scrollTo(offset.left, offset.top);
                return false;

            }


        }

        return true;
    },

    SubmitOrder: function(order) {
        page.placeorder.originalOrder = order;
        framework.common.Ajax({
            url: "PlaceOrder.aspx/SubmitOrder",
            data: { order: order },
            success: function(result) {
                if (result.ResultFlag == true) {
                    page.placeorder.order = result.DataSource;

                    page.placeorder.order.NextStep = entity.enums.OrderStep.PollCount;
                    page.placeorder.GoNext();
                    // setTimeout(function() { uc.pollcount.CheckPollingStatus(result.DataSource.RequestId); }, 1000);
                } else {
                    uc.demo.SetErrorMessage(true, "Sorry the count you have requested failed to process please go back and try again. If you are still experiencing a problem please call the number on the top right corner of the screen.");
                    framework.common.LogClickEvent("Fail to submit order", "Fail to submit order", "fail to submit order");
                }

            },
            error: function(rep) {
                //uc.demo.SetErrorMessage(true, "Sorry, we're failed to retrieve counts for you, please try again later.");
                uc.demo.SetErrorMessage(true, "Sorry the count you have requested failed to process please go back and try again. If you are still experiencing a problem please call the number on the top right corner of the screen.");
                framework.common.LogClickEvent("Fail to submit order", jQuery.toJSON(order), rep == null ? "fail to submit order" : rep.responseText);
            },
            waitingElement: 'ct_demo'
        });
    },

    Save_Data: function() {
        var o = page.placeorder.order;
        if (o.ListType == entity.enums.DataSourceType.Occupant) {
            //set options for occupant
            //targeting option
            o.TargetOption = 0;
            arr = jQuery("input[type='checkbox'][name='chkTargetingOption']:checked");
            arr.each(function() { o.TargetOption += Number(this.value); });
            //route option
            o.RouteOption = 0;
            arr = jQuery("input[type='checkbox'][name='chkRouteOption']:checked");
            arr.each(function() { o.RouteOption += Number(this.value); });
            //include contact name flag
            o.ContactNameOption = jQuery("input[type='checkbox'][name='chkIncludeContactNames']")[0].checked ? 1 : 0;
        } else {
            //all other datasources except for occupant
            o.DemoType = jQuery("#demo_selectall")[0].checked ? entity.enums.DemoType.All : entity.enums.DemoType.Standard;
            if (jQuery("input[type='radio'][name='demo-phoneoption']:checked").length > 0) {
                o.PhoneOption = jQuery("input[type='radio'][name='demo-phoneoption']:checked").val();
            }
            if (o.PhoneOption == "1") {
                o.PhoneOptionDesc = "No Phones";
            } else if (o.PhoneOption == "2") {
                o.PhoneOptionDesc = "Phones Where Available";
            } else if (o.PhoneOption == "3") {
                o.PhoneOptionDesc = "Only Records With Phones";
            }
            // uc.demo.updatePhoneOption();

            // begin: set suppression options  2012-12-12 jack
            var suppressionOption;
            var checkOption = jQuery("#demo_suppression_checkbox_prior_order");
            if (checkOption.is(":checked")) {
                suppressionOption = jQuery("input[type='radio'][name='suppression-option']:checked").val();
            }

            var customSuppressionOption;
            var checkOption1 = jQuery("#demo_suppression_checkbox_customer");
            if (checkOption1.is(":checked")) {
                customSuppressionOption = jQuery("input[type='radio'][name='custom-suppression-option']:checked").val(); ;
            }

            var saveCountSuppressionOption;
            var checkOption2 = jQuery("#demo_suppression_checkbox_save_count");
            if (checkOption2.is(":checked")) {
                saveCountSuppressionOption = jQuery("input[type='radio'][name='save-count-suppression-option']:checked").val();
            }

            var suppressionType = entity.enums.SuppressionType.NONE;

            if (suppressionOption == entity.enums.SuppressionType.DATE) {
                if (customSuppressionOption == entity.enums.SuppressionType.CUSTOMORDER) {
                    if (saveCountSuppressionOption == entity.enums.SuppressionType.SAVEDCOUNTORDER) {
                        suppressionType = entity.enums.SuppressionType.DATE_CORDER_SORDER;
                    }
                    else if (saveCountSuppressionOption == entity.enums.SuppressionType.SAVEDCOUNTDATA) {
                        suppressionType = entity.enums.SuppressionType.DATE_CORDER_SDATE;
                    }
                    else {
                        suppressionType = entity.enums.SuppressionType.DATE_CUSTOMORDERS;
                    }
                }
                else if (customSuppressionOption == entity.enums.SuppressionType.CUSTOMDATE) {
                    if (saveCountSuppressionOption == entity.enums.SuppressionType.SAVEDCOUNTORDER) {
                        suppressionType = entity.enums.SuppressionType.DATE_CDATE_SORDER;
                    }
                    else if (saveCountSuppressionOption == entity.enums.SuppressionType.SAVEDCOUNTDATA) {
                        suppressionType = entity.enums.SuppressionType.DATE_CDATE_SDATE;
                    }
                    else {
                        suppressionType = entity.enums.SuppressionType.DATE_CUSTOMDATE;
                    }
                }
                else if (saveCountSuppressionOption == entity.enums.SuppressionType.SAVEDCOUNTORDER) {
                    suppressionType = entity.enums.SuppressionType.DATE_SAVEDCOUNTORDER;
                }
                else if (saveCountSuppressionOption == entity.enums.SuppressionType.SAVEDCOUNTDATA) {
                    suppressionType = entity.enums.SuppressionType.DATE_SAVEDCOUNTDATA;
                }
                else {
                    suppressionType = entity.enums.SuppressionType.DATE;
                }

            }

            else if (suppressionOption == entity.enums.SuppressionType.ORDERLIST) {
                if (customSuppressionOption == entity.enums.SuppressionType.CUSTOMORDER) {
                    if (saveCountSuppressionOption == entity.enums.SuppressionType.SAVEDCOUNTORDER) {
                        suppressionType = entity.enums.SuppressionType.OL_CORDER_SORDER;
                    }
                    else if (saveCountSuppressionOption == entity.enums.SuppressionType.SAVEDCOUNTDATA) {
                        suppressionType = entity.enums.SuppressionType.OL_CORDER_SDATE;
                    }
                    else {
                        suppressionType = entity.enums.SuppressionType.ORDERLIST_CUSTOMORDERS;
                    }
                }
                else if (customSuppressionOption == entity.enums.SuppressionType.CUSTOMDATE) {
                    if (saveCountSuppressionOption == entity.enums.SuppressionType.SAVEDCOUNTORDER) {
                        suppressionType = entity.enums.SuppressionType.OL_CDATE_SORDER;
                    }
                    else if (saveCountSuppressionOption == entity.enums.SuppressionType.SAVEDCOUNTDATA) {
                        suppressionType = entity.enums.SuppressionType.OL_CDATE_SDATE;
                    }
                    else {
                        suppressionType = entity.enums.SuppressionType.ORDERLIST_CUSTOMDATE;
                    }
                }
                else if (saveCountSuppressionOption == entity.enums.SuppressionType.SAVEDCOUNTORDER) {
                    suppressionType = entity.enums.SuppressionType.ORDERLIST_SAVEDCOUNTORDER;
                }
                else if (saveCountSuppressionOption == entity.enums.SuppressionType.SAVEDCOUNTDATA) {
                    suppressionType = entity.enums.SuppressionType.ORDERLIST_SAVEDCOUNTDATA;
                }
                else {
                    suppressionType = entity.enums.SuppressionType.ORDERLIST;
                }
            }

            else if (saveCountSuppressionOption == entity.enums.SuppressionType.SAVEDCOUNTDATA) {
                if (customSuppressionOption == entity.enums.SuppressionType.CUSTOMORDER) {
                    suppressionType = entity.enums.SuppressionType.SAVEDCOUNTDATA_CUSTOMORDERS;
                }
                else if (customSuppressionOption == entity.enums.SuppressionType.CUSTOMDATE) {
                    suppressionType = entity.enums.SuppressionType.SAVEDCOUNTDATA_CUSTOMDATE;
                }
                else {
                    suppressionType = entity.enums.SuppressionType.SAVEDCOUNTDATA;
                }
            }
            else if (saveCountSuppressionOption == entity.enums.SuppressionType.SAVEDCOUNTORDER) {
                if (customSuppressionOption == entity.enums.SuppressionType.CUSTOMORDER) {
                    suppressionType = entity.enums.SuppressionType.SAVEDCOUNTORDER_CUSTOMORDERS;
                }
                else if (customSuppressionOption == entity.enums.SuppressionType.CUSTOMDATE) {
                    suppressionType = entity.enums.SuppressionType.SAVEDCOUNTORDER_CUSTOMDATE;
                }
                else {
                    suppressionType = entity.enums.SuppressionType.SAVEDCOUNTORDER;
                }
            }

            else {
                if (customSuppressionOption == entity.enums.SuppressionType.CUSTOMORDER) {
                    suppressionType = entity.enums.SuppressionType.CUSTOMORDER;
                }
                else if (customSuppressionOption == entity.enums.SuppressionType.CUSTOMDATE) {
                    suppressionType = entity.enums.SuppressionType.CUSTOMDATE;
                }
                else {
                    suppressionType = entity.enums.SuppressionType.NONE;
                }
            }

            o.SuppressionType = suppressionType;

            // end: set suppression options  2012-12-12 jack
            if (suppressionType == entity.enums.SuppressionType.DATE || suppressionType == entity.enums.SuppressionType.DATE_CUSTOMORDERS || suppressionType == entity.enums.SuppressionType.DATE_CUSTOMDATE
                || suppressionType == entity.enums.SuppressionType.DATE_SAVEDCOUNTDATA || suppressionType == entity.enums.SuppressionType.DATE_SAVEDCOUNTORDER || suppressionType == entity.enums.SuppressionType.DATE_CDATE_SDATE
                || suppressionType == entity.enums.SuppressionType.DATE_CDATE_SORDER || suppressionType == entity.enums.SuppressionType.DATE_CORDER_SDATE || suppressionType == entity.enums.SuppressionType.DATE_CORDER_SORDER) {

                try {
                    o.SuppressionStartDate = Date.fromString(jQuery('#demo_suppression_range_start').val());
                    o.SuppressionEndDate = Date.fromString(jQuery('#demo_suppression_range_end').val());
                }
                catch (e) {
                    o.SuppressionStartDate = null;
                    o.SuppressionEndDate = null;
                }

                if (suppressionType == entity.enums.SuppressionType.DATE_CUSTOMDATE || suppressionType == entity.enums.SuppressionType.DATE_CDATE_SDATE
                || suppressionType == entity.enums.SuppressionType.DATE_CDATE_SORDER) {
                    try {
                        o.CustomSuppressionStartDate = Date.fromString(jQuery('#custom_suppression_range_start').val());
                        o.CustomSuppressionEndDate = Date.fromString(jQuery('#custom_suppression_range_end').val());
                    }
                    catch (e) {
                        o.CustomSuppressionStartDate = null;
                        o.CustomSuppressionEndDate = null;
                    }
                }

                if (suppressionType == entity.enums.SuppressionType.DATE_SAVEDCOUNTDATA || suppressionType == entity.enums.SuppressionType.DATE_CDATE_SDATE
                || suppressionType == entity.enums.SuppressionType.DATE_CORDER_SDATE) {
                    try {
                        o.SaveCountSuppressionStartDate = Date.fromString(jQuery('#save_count_suppression_range_start').val());
                        o.SaveCountSuppressionEndDate = Date.fromString(jQuery('#save_count_suppression_range_end').val());
                    }
                    catch (e) {
                        o.SaveCountSuppressionStartDate = null;
                        o.SaveCountSuppressionEndDate = null;
                    }
                }


            }

            if (suppressionType == entity.enums.SuppressionType.SAVEDCOUNTDATA || suppressionType == entity.enums.SuppressionType.SAVEDCOUNTDATA_CUSTOMDATE
            || suppressionType == entity.enums.SuppressionType.SAVEDCOUNTDATA_CUSTOMORDERS || suppressionType == entity.enums.SuppressionType.ORDERLIST_SAVEDCOUNTDATA
            || suppressionType == entity.enums.SuppressionType.OL_CDATE_SDATE || suppressionType == entity.enums.SuppressionType.OL_CORDER_SDATE) {
                try {
                    o.SaveCountSuppressionStartDate = Date.fromString(jQuery('#save_count_suppression_range_start').val());
                    o.SaveCountSuppressionEndDate = Date.fromString(jQuery('#save_count_suppression_range_end').val());
                }
                catch (e) {
                    o.SaveCountSuppressionStartDate = null;
                    o.SaveCountSuppressionEndDate = null;
                }

                if (suppressionType == entity.enums.SuppressionType.SAVEDCOUNTDATA_CUSTOMDATE || suppressionType == entity.enums.SuppressionType.OL_CDATE_SDATE) {
                    try {
                        o.CustomSuppressionStartDate = Date.fromString(jQuery('#custom_suppression_range_start').val());
                        o.CustomSuppressionEndDate = Date.fromString(jQuery('#custom_suppression_range_end').val());
                    }
                    catch (e) {
                        o.CustomSuppressionStartDate = null;
                        o.CustomSuppressionEndDate = null;
                    }
                }
            }

            if (suppressionType == entity.enums.SuppressionType.CUSTOMDATE || suppressionType == entity.enums.SuppressionType.ORDERLIST_CUSTOMDATE
                || suppressionType == entity.enums.SuppressionType.SAVEDCOUNTORDER_CUSTOMDATE || suppressionType == entity.enums.SuppressionType.OL_CDATE_SORDER) {
                try {
                    o.CustomSuppressionStartDate = Date.fromString(jQuery('#custom_suppression_range_start').val());
                    o.CustomSuppressionEndDate = Date.fromString(jQuery('#custom_suppression_range_end').val());
                }
                catch (e) {
                    o.CustomSuppressionStartDate = null;
                    o.CustomSuppressionEndDate = null;
                }
            }
        }

        if (uc.demo.AllowCustomDomainSuppression()) {
            o.SuppressionByDomain = jQuery("#suppression_by_domain")[0].checked ? true : false;
        }

        if (o.GeoType == entity.enums.GeoType.MultiCount && o.OrderGeos != null && o.OrderGeos.length > 0) {
            o.DemoType = entity.enums.DemoType.All;
            o.PhoneOption = "1";
            o.PhoneOptionDesc = "No Phones";
        }

        
        if(o.ListType == entity.enums.DataSourceType.InfoUSA_Business || o.ListType == entity.enums.DataSourceType.InfoUSA_Consumer) {
            //o.DemoType = entity.enums.DemoType.All;
            o.PhoneOption = "2";
            o.PhoneOptionDesc = "Phones Where Available";
        }

    },

    BindCategory: function(elementId, demoattributes) {
        var selects = demoattributes;
        var strFormat = "<option columntype='{0}' value='{1}' Title=\"{2}\" attributename=\"{2}\">{3} </option>";
        var templatestring = '';
        for (var i = 0; i < selects.length; i++) {
            templatestring = templatestring + String.format(strFormat,
													selects[i].DemoInputtype,
													selects[i].ColumnName,
													selects[i].AttributeName,
													selects[i].AttributeName,
													selects[i].ValuesCount);
        }
        jQuery('#' + elementId).html(templatestring);
        framework.common.iPad.refreshMask(elementId);
    },

    BindQuickPicks: function(elementId, demoQuickPicks) {
        var selects = demoQuickPicks;
        var strFormat = "<option isQuickPick = {0} Title=\"{1}\" >{2}</option>";
        var templatestring = '';
        for (var i = 0; i < selects.length; i++) {
            templatestring = templatestring + String.format(strFormat,
													true,
													selects[i].CategoryName,
													selects[i].CategoryName);
        }
        var result = jQuery('#' + elementId).html() + templatestring;
        jQuery('#' + elementId).html(result);
    },



    QuickPickupExisted: true,
    LifeStyleCategoryExisted: true,
    LifeStyleAndPickupChecked: false,
    //    DemoOptionExisted: true,
    ExistAudiencePropensity: true,
    CharitableGivingExisted: false,
    AnicoTabsExisted: false,
    CheckIfLifeStyleAndQuickpickExist: function() {
        var o = page.placeorder.order;

        if (!uc.demo.LifeStyleAndPickupChecked) {
            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetDemoOptionsAndQuickPickups",
                data: { listtype: o.ListType, demotype: 2 },
                success: function(result) {
                    if (result.ResultFlag == true) {

                        if (result.DataSource.LifeStyle.length > 0) {
                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='lifeStyleHeader']").removeClass("hidden");
                            uc.demo.LifeStyleCategoryExisted = true;
                        }
                        else {
                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='lifeStyleHeader']").addClass("hidden");
                            uc.demo.LifeStyleCategoryExisted = false;
                        }

                        if (result.DataSource.ExistQuickPicks) {
                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='quickPickupHeader']").removeClass("hidden");
                            uc.demo.QuickPickupExisted = true;
                        }
                        else {
                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='quickPickupHeader']").addClass("hidden");
                            uc.demo.QuickPickupExisted = false;
                        }

                        //                        if (result.DataSource.DemoOptions.length > 0) {
                        //                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='demoHeader']").removeClass("hidden");
                        //                            uc.demo.DemoOptionExisted = true;
                        //                        }
                        //                        else {
                        //                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='demoHeader']").addClass("hidden");
                        //                            uc.demo.DemoOptionExisted = false;
                        //                        }

                        if (result.DataSource.ExistAudiencePropensity) {
                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liAudiencePropensity']").removeClass("hidden");
                            uc.demo.ExistAudiencePropensity = true;
                        }
                        else {
                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liAudiencePropensity']").addClass("hidden");
                            uc.demo.ExistAudiencePropensity = false;
                        }

                        if (result.DataSource.ExistCharitableGiving) {
                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liCharitableGiving']").removeClass("hidden");
                            uc.demo.CharitableGivingExisted = true;
                        }
                        else {
                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liCharitableGiving']").addClass("hidden");
                            uc.demo.CharitableGivingExisted = false;
                        }
                        if (result.DataSource.ExistAnicoTabs) {
                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liMarketClarity']").removeClass("hidden");
                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liMarketStreet']").removeClass("hidden");
                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liFocusMarket']").removeClass("hidden");
                            uc.demo.AnicoTabsExisted = true;
                        }
                        else {
                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liMarketClarity']").addClass("hidden");
                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liMarketStreet']").addClass("hidden");
                            $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liFocusMarket']").addClass("hidden");
                            uc.demo.AnicoTabsExisted = false;
                        }

                    }
                    uc.demo.SetDemoTabs(o);
                    uc.demo.LifeStyleAndPickupChecked = true;

                    uc.demo.SetAllHouseHolds(result.DataSource.AllHouseholdSetting);
                    uc.demo.SetPhoneOptions(result.DataSource.PhoneOptions);
                    uc.demo.SetMappingChars(result.DataSource.PandoraMappingChars);
                },
                error: function(rep) {
                },
                waitingElement: 'ct_demo'
            });

        }
        else {
            if (uc.demo.LifeStyleCategoryExisted) {
                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='lifeStyleHeader']").removeClass("hidden");
            } else {
                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='lifeStyleHeader']").addClass("hidden");
            }

            if (uc.demo.QuickPickupExisted) {
                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='quickPickupHeader']").removeClass("hidden");
            }
            else {
                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='quickPickupHeader']").addClass("hidden");
                uc.demo.QuickPickupExisted = false;
            }

            //            if (uc.demo.DemoOptionExisted) {
            //                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='demoHeader']").removeClass("hidden");
            //            }
            //            else {
            //                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='demoHeader']").addClass("hidden");
            //            }

            if (uc.demo.ExistAudiencePropensity) {
                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liAudiencePropensity']").removeClass("hidden");
            }
            else {
                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liAudiencePropensity']").addClass("hidden");
            }
            if (uc.demo.CharitableGivingExisted) {
                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liCharitableGiving']").removeClass("hidden");
            }
            else {
                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liCharitableGiving']").addClass("hidden");
            }
            if (uc.demo.AnicoTabsExisted) {
                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liMarketClarity']").removeClass("hidden");
                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liMarketStreet']").removeClass("hidden");
                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liFocusMarket']").removeClass("hidden");
            }
            else {
                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liMarketClarity']").addClass("hidden");
                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liMarketStreet']").addClass("hidden");
                $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='liFocusMarket']").addClass("hidden");
            }

            uc.demo.SetDemoTabs(o);
        }

    },


    //    LoadLifeStypeCategory: function() {
    //        var o = page.placeorder.order;
    //        framework.common.Ajax({
    //            url: "PlaceOrder.aspx/GetDemoAttributesList",
    //            data: { listtype: o.ListType, demotype: 2 },
    //            success: function(result) {
    //                if (result.ResultFlag == true) {
    //                    //					framework.ui.fillDropDownList({
    //                    //						ElementId: "demo_lifestyle_category",
    //                    //						DataSource: result.DataSource,
    //                    //						ValueField: "ColumnName",
    //                    //						TextField: "AttributeName",
    //                    //						SelectValue: null,
    //                    //						Attributes: { columntype: 'DemoInputtype' }
    //                    //					});
    //                    uc.demo.BindCategory('demo_lifestyle_category', result.DataSource);
    //                    uc.demo.LoadLifeStyleValues();
    //                }
    //            },
    //            error: function(rep) {
    //            },
    //            waitingElement: 'ct_demo_panels'
    //        });
    //    },

    LoadLifeStyleValues: function() {
        uc.demo.LoadDemoCategoryValues("demo_lifestyle_category", "demo_lifestyle_variables", "demo_lifestyle_variables_input", "demo_lifestyle_input_label");

        //    
        //        var o = page.placeorder.order;
        //        var columnname = jQuery('#demo_lifestyle_category').val();
        //        uc.demo.SetErrorMessage(false);
        //        if (String.IsNullOrEmpty(columnname)) return;

        //        framework.common.Ajax({
        //            url: "PlaceOrder.aspx/GetDemoAttribute",
        //            data: { listtype: o.ListType, columnName: columnname },
        //            success: function(result) {
        //                if (result.ResultFlag == true) {
        //                    switch (result.DataSource.DemoInputtype) {
        //                        case entity.enums.DemoInputType.Listbox:
        //                            jQuery('#demo_lifestyle_variables_input').addClass("hidden");
        //                            jQuery('#demo_lifestyle_variables').removeClass("hidden");
        //                            jQuery('#demo_lifestyle_variables').html("");
        //                            framework.ui.fillDropDownList({
        //                                ElementId: "demo_lifestyle_variables",
        //                                DataSource: result.DataSource.DemoValues,
        //                                ValueField: "AttributeValue",
        //                                TextField: "AttributeValueName",
        //                                SelectValue: null,
        //                                Attributes: { SortSeq: 'SortSeq' }
        //                            });
        //                            break;
        //                        case entity.enums.DemoInputType.InputDate:
        //                        case entity.enums.DemoInputType.InputInteger:
        //                        case entity.enums.DemoInputType.InputMonthyear:
        //                        case entity.enums.DemoInputType.InputYear:
        //                        case entity.enums.DemoInputType.InputMonth:
        //                            jQuery('#demo_lifestyle_variables').addClass("hidden");
        //                            jQuery('#demo_lifestyle_variables_input').removeClass("hidden");
        //                            jQuery('#demo_lifestyle_input_label').html(result.DataSource.DemoValues[0].AttributeValueDesc);
        //                            jQuery('#demo_lifestyle_variables_input input[type="text"]').val('').attr('min', result.DataSource.MinValue || '').attr('max', result.DataSource.MaxValue || '').attr('demoinputtype', result.DataSource.DemoInputtype);
        //                            validateRange = true;
        //                            uc.demo.min = result.DataSource.MinValue;
        //                            uc.demo.max = result.DataSource.MaxValue;
        //                            uc.demo.SetInputBoxMask(result.DataSource.DemoInputtype, jQuery('#demo_lifestyle_variables_input input[type="text"]'));
        //                            break;
        //                    }
        //                }

        //            },
        //            error: function(rep) {
        //            },
        //            waitingElement: 'ct_demo_panels'
        //        });
    },

    //    LoadDemoCategory: function() {
    //        var o = page.placeorder.order;
    //        framework.common.Ajax({
    //            url: "PlaceOrder.aspx/GetDemoAttributesList",
    //            data: { listtype: o.ListType, demotype: 1 },
    //            success: function(result) {
    //                if (result.ResultFlag == true) {
    //                    //					framework.ui.fillDropDownList({
    //                    //						ElementId: "demo_options_category",
    //                    //						DataSource: result.DataSource,
    //                    //						ValueField: "ColumnName",
    //                    //						TextField: "AttributeName",
    //                    //						SelectValue: null,
    //                    //						Attributes: { columntype: 'DemoInputtype' }
    //                    //					});
    //                    uc.demo.BindCategory('demo_options_category', result.DataSource);
    //                    uc.demo.LoadDemoValues();
    //                }
    //            },
    //            error: function(rep) {
    //            },
    //            waitingElement: 'ct_demo_panels'
    //        });
    //    },


    LoadAllDemoCategory: function() {
        var o = page.placeorder.order;
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetAllDemoAttributesList",
            data: { listtype: o.ListType },
            success: function(result) {
                if (result.ResultFlag == true) {
                    framework.ui.fillDropDownList({
                        ElementId: "demo_all_category",
                        DataSource: result.DataSource,
                        ValueField: "CategoryId",
                        TextField: "CategoryName",
                        SelectValue: null
                    });

                }
                $("#demo_all_category option").eq(0).attr("selected", "selected");
                uc.demo.LoadAllDemoAttributes();
            },
            error: function(rep) {
            },
            waitingElement: 'ct_demo_panels'
        });
    },

    LoadDemoCategorys: function(containerId, demoType, variablesId, variableInput, variableInputLabel, callback) {
        var o = page.placeorder.order;
        var waitEl = "ct_demo_panels";
        if (demoType == 20) {
            waitEl = "ct_demo_focusmarket_panels";
        }
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetDemoAttributesList",
            data: { listtype: o.ListType, demotype: demoType },
            success: function(result) {
                if (result.ResultFlag == true) {
                    //					framework.ui.fillDropDownList({
                    //						ElementId: "demo_options_category",
                    //						DataSource: result.DataSource,
                    //						ValueField: "ColumnName",
                    //						TextField: "AttributeName",
                    //						SelectValue: null,
                    //						Attributes: { columntype: 'DemoInputtype' }
                    //					});
                    if (result.DataSource.isQP != undefined && result.DataSource.isQP) {
                        uc.demo.BindCategory(containerId, result.DataSource.demoAttrs);
                        uc.demo.LoadDemoCategoryValues(containerId, variablesId, variableInput, variableInputLabel);
                        if (callback != null) {
                            callback.call();
                        }
                        uc.demo.BindQuickPicks(containerId, result.DataSource.demoQPAttrs);
                        uc.demo.LoadDemoQuickPickItems(containerId, variablesId);

                    } else {
                        uc.demo.BindCategory(containerId, result.DataSource);
                        //uc.demo.LoadDemoValues();
                        uc.demo.LoadDemoCategoryValues(containerId, variablesId, variableInput, variableInputLabel);
                        if (callback != null) {
                            callback.call();
                        }
                    }
                }
            },
            error: function(rep) {
            },
            waitingElement: waitEl
        });
    },

    LoadDemoCategoryValues: function(categoryId, variablesId, variableInput, variableInputLabel) {
        var o = page.placeorder.order;
        var columnname = jQuery('#' + categoryId).val();
        uc.demo.SetErrorMessage(false);
        if (String.IsNullOrEmpty(columnname)) {
            jQuery("#" + variablesId).html("");
            jQuery('#' + variablesId).removeClass("hidden");
            jQuery('#' + variableInput).addClass("hidden");
            return;
        }
        var waitEl = "ct_demo_panels";
        if (categoryId == "demo_focusmarket_category") {
            waitEl = "ct_demo_focusmarket_panels";
        }

        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetDemoAttribute",
            data: { listtype: o.ListType, columnName: columnname },
            success: function(result) {
                if (result.ResultFlag == true) {
                    switch (result.DataSource.DemoInputtype) {
                        case entity.enums.DemoInputType.Listbox:
                        case entity.enums.DemoInputType.RadioSelectBox:
                            jQuery('#' + variableInput).addClass("hidden");
                            jQuery('#' + variablesId).removeClass("hidden");
                            jQuery('#' + variablesId).html("");
                            framework.ui.fillDropDownList({
                                ElementId: variablesId,
                                DataSource: result.DataSource.DemoValues,
                                ValueField: "AttributeValue",
                                TextField: "AttributeValueName",
                                SelectValue: null,
                                Attributes: { SortSeq: 'SortSeq' }
                            });
                            break;
                        case entity.enums.DemoInputType.InputDate:
                        case entity.enums.DemoInputType.InputInteger:
                        case entity.enums.DemoInputType.InputMonthyear:
                        case entity.enums.DemoInputType.InputYear:
                        case entity.enums.DemoInputType.InputMonth:
                        case entity.enums.DemoInputType.InputString:
                            jQuery('#' + variablesId).addClass("hidden");
                            jQuery('#' + variableInput).removeClass("hidden");
                            jQuery('#' + variableInputLabel).html(result.DataSource.DemoValues[0].AttributeValueDesc);
                            jQuery('#' + variableInput + ' input[type="text"]').val('').attr('min', result.DataSource.MinValue || '').attr('max', result.DataSource.MaxValue || '').attr('demoinputtype', result.DataSource.DemoInputtype);
                            if (result.DataSource.MaxValue != null) {
                                jQuery("#demo_propensity_input_maxValue span").html(result.DataSource.MaxValue);
                            } else {
                                jQuery("#demo_propensity_input_maxValue span").html("X");
                                jQuery("#demo_propensity_likely").removeClass("hidden");
                            }
                            validateRange = true;
                            uc.demo.min = result.DataSource.MinValue;
                            uc.demo.max = result.DataSource.MaxValue;
                            uc.demo.SetInputBoxMask(result.DataSource.DemoInputtype, jQuery('#' + variableInput + ' input[type="text"]'));
                            break;

                    }
                }

            },
            error: function(rep) {
            },
            waitingElement: waitEl
        });
    },
    //tony 2015-04-28 5700
    LoadPostSupPhone: function() {
        var o = page.placeorder.order;
        framework.common.Ajax({
            url: "PlaceOrder.aspx/IsPostSupPhoneByUserAndDatasource",
            data: { listtype: o.ListType },
            success: function(result) {
                //alert(result.DataSource.isPostSupPhone);
                if (result.ResultFlag == true) {
                    //  jQuery("#demo_post_sub_phone").removeClass("hidden");
                    jQuery("#demo_is_sup_phone").val(result.DataSource.isPostSupPhone);
                    // alert(jQuery("#demo_is_sup_phone").val());
                    if (result.DataSource.isPostSupPhone) {
                        jQuery("[name='demo-phoneoption']").click(function() {
                            var PhoneOptionValue = jQuery("[name='demo-phoneoption']:checked");
                            jQuery(".demo_po_sup_checkbox").prop("checked", false);
                            jQuery(".demo_checked").addClass("hidden");
                            jQuery("[name='" + PhoneOptionValue.attr("id") + "']").removeClass("hidden");

                        });
                    }
                }
            }
        });
    },
    LoadDemoQuickPickItems: function(categoryId, variablesId) {
        var o = page.placeorder.order;
        var qpCategoryId = jQuery('#' + categoryId).val();
        uc.demo.SetErrorMessage(false);
        if (String.IsNullOrEmpty(qpCategoryId)) {
            jQuery("#" + variablesId).html("");
            jQuery('#' + variablesId).removeClass("hidden");
            return;
        }

        framework.common.Ajax({
            //url: "PlaceOrder.aspx/GetQuickPickDemoAttributes",
            url: "PlaceOrder.aspx/GetQuickPickDemoAttribute",
            data: { listtype: o.ListType },
            success: function(result) {
                if (result.ResultFlag == true) {
                    jQuery('#' + variablesId).removeClass("hidden");
                    jQuery('#' + variablesId).html("");
                    framework.ui.fillDropDownList({
                        ElementId: variablesId,
                        DataSource: result.DataSource,
                        ValueField: "QpId",
                        TextField: "QpName",
                        SelectValue: null
                    });
                }

            },
            error: function(rep) {
            },
            waitingElement: 'ct_demo_panels'
        });
    },

    LoadPropensityValues: function() {
        uc.demo.LoadDemoCategoryValues("demo_propensity", "demo_propensity_variables", "demo_propensity_variables_input", "demo_propensity_input_label");
    },

    LoadAttributesValues: function() {
        if ($("#demo_attributes option:selected").attr("isQuickPick")) {
            uc.demo.LoadDemoQuickPickItems("demo_attributes", "demo_attributes_variables");
        } else {
            uc.demo.LoadDemoCategoryValues("demo_attributes", "demo_attributes_variables", "demo_attributes_variables_input", "demo_attributes_input_label");
        }
    },

    LoadLifeStyleAttributesValues: function() {
        uc.demo.LoadDemoCategoryValues("demo_attributes_ls", "demo_attributes_variables_ls", "demo_attributes_variables_input_ls", "demo_attributes_input_label_ls");
    },

    LoadDemoValues: function() {
        uc.demo.LoadDemoCategoryValues("demo_options_category", "demo_options_variables", "demo_options_variables_input", "demo_options_input_label");

    },
    LoadFocusMarketValues: function() {
        uc.demo.LoadDemoCategoryValues("demo_focusmarket_category", "demo_focusmarket_variables", "demo_focusmarket_variables_input", "demo_focusmarket_input_label");
    },

    LoadPropensities: function() {
        $("#demo_propensity").css("width", "");
        $("#demo_propensity_appender").css("width", "");
        var demoType = $("#demo_propensity_category").val();
        uc.demo.LoadDemoCategorys("demo_propensity", demoType, "demo_propensity_variables", "demo_propensity_variables_input", "demo_propensity_input_label", function() { uc.demo.InitSelect("demo_propensity_div", "demo_propensity_appender", "demo_propensity") });

    },

    LoadDemoCategory: function() {
        $("#demo_options_category").css("width", "");
        $("#demo_p_options_appender").css("width", "");
        uc.demo.LoadDemoCategorys("demo_options_category", 1, "demo_options_variables", "demo_options_variables_input", "demo_options_input_label", function() { uc.demo.InitSelect("demo_p_options_div", "demo_p_options_appender", "demo_options_category") });
    },

    LoadFocusMarketCategory: function() {
        $("#demo_focusmarket_category").css("width", "");
        $("#demo_focusmarket_appender").css("width", "");
        uc.demo.LoadDemoCategorys("demo_focusmarket_category", 20, "demo_focusmarket_variables", "demo_focusmarket_variables_input", "demo_focusmarket_input_label", function() { uc.demo.InitSelect("demo_p_focusmarket_quickpickup_div", "demo_focusmarket_appender", "demo_focusmarket_category") });
    },

    LoadAllDemoAttributes: function() {
        $("#demo_all_category").css("width", "");
        //var demoType = $("#demo_all_category").val();
        //uc.demo.LoadDemoCategorys("demo_attributes", demoType, "demo_attributes_variables", "demo_attributes_variables_input", "demo_attributes_input_label", function() { uc.demo.InitSelect("demo_attributes_div", "demo_p_options_appender", "demo_attributes") });
        uc.demo.LoadDemoCategorys("demo_attributes", 1, "demo_attributes_variables", "demo_attributes_variables_input", "demo_attributes_input_label", function() { uc.demo.InitSelect("demo_attributes_div", "demo_p_options_appender", "demo_attributes") });
    },

    LoadAllLifeStyleAttributes: function() {
        $("#demo_all_category_ls").css("width", "");
        var demoType = $("#demo_all_category_ls").val();
        uc.demo.LoadDemoCategorys("demo_attributes_ls", demoType, "demo_attributes_variables_ls", "demo_attributes_variables_input_ls", "demo_attributes_input_label_ls", function() { uc.demo.InitSelect("demo_attributes_div_ls", "demo_p_options_appender", "demo_attributes_ls") });
    },

    LoadLifeStypeCategory: function() {
        $("#demo_lifestyle_category").css("width", "");
        $("#demo_lifestyle_category_appender").css("width", "");
        uc.demo.LoadDemoCategorys("demo_lifestyle_category", 2, "demo_lifestyle_variables", "demo_lifestyle_variables_input", "demo_lifestyle_input_label", function() { uc.demo.InitSelect("demo_lifestyle_category_div", "demo_lifestyle_category_appender", "demo_lifestyle_category") });
    },

    LoadBusinessQuickPicks: function() {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetBusinessQuickpicks",
            data: { listType: page.placeorder.order.ListType },
            success: function(result) {
                if (result.ResultFlag == true) {
                    if (result.DataSource != null && result.DataSource.length > 0) {

                        template = "{#foreach $T as record} <span class='item'><span>{$T.record.Name}</span>&nbsp; <a href='javascript:void(0);' onclick='javascript:uc.demo.IndustryQuickPickup_AddClick(this); return false;' class='add' id='{$T.record.Id}' code='{$T.record.Code}' desc='{$T.record.Name}'>add</a></span>  {#/for}";
                        var $e = $('#demo_industry_qp_source');
                        $e.setTemplate(template);
                        $e.processTemplate(result.DataSource);
                    }
                }
            },
            error: function(rep) {
            },
            waitingElement: 'ct_industry_panels'
        });

    },

    SearchSICByKeyword: function() {
        if (page.placeorder.order.DemoType == entity.enums.DemoType.All) return;
        //var columnName = jQuery('#demo_options_category').val();
        //var AttrName = jQuery('#demo_options_category option:selected').text();
        var keyword = jQuery('#tbKeyword').val();
        jQuery("#demo_industry_trees").addClass("hidden");
        jQuery("#demo_industry_search_result").addClass("hidden");

        uc.demo.SetErrorMessage(false, "");
        if (keyword == '') {
            jQuery("#demo_industry_trees").removeClass("hidden");
            uc.demo.LoadIndustryTree();
            return;
        }

        jQuery("#demo_industry_search_result").removeClass("hidden");
        framework.common.Ajax({
            url: "PlaceOrder.aspx/SearchSICByKeyword",
            data: { keyword: keyword,
                listType: page.placeorder.order.ListType
            },
            success: function(result) {
                //bind data
                uc.demo.BindSICSearchResult(result);
                //show search result
                //jQuery('#demo_sic_result').removeClass('hidden');
                //bind click event to each result
                //				jQuery('#demo_sic_result a').click(
                //                    function(e) {
                //                    	var industryCode = jQuery(this).attr("value");
                //                    	var industryDesc = jQuery(this).attr("desc");
                //                    	uc.demo.SelectsValue.addDemo(
                //                            columnName,
                //                            AttrName,
                //                            industryCode,                       //value
                //                            industryCode + ' ' + industryDesc,  //name
                //                            entity.enums.SelectedDemoType.Industry);
                //                    	uc.demo.BindSelectsValues();
                //                    	return false;
                //                    }
                //                );
            },
            error: function(rep) {

            },
            waitingElement: 'demo_industry_tree_source'
        });
    },

    GetCurrentTab: function() {
        var selected = $('#ct_demo_tabs').tabs('option', 'selected'); // => 0
    },

    AddSearchDemoTarget: function(columnName, attrName, value, text, sortseq) {
        uc.demo.AddSearchDemoValue(columnName, attrName, value, text, sortseq);
        uc.demo.BindSearchSelectedValues();
        uc.demo.BindSelectsValues();
    },

    RemoveSearchDemoOptions: function() {
        jQuery('#demo_search_selected option:selected').each(function(i, option) {
            var iscategory = $(this).attr("iscategory") == "1" ? true : false;
            var columnname = $(this).attr("columnname");
            var attrvalue = $(this).attr("value");
            var democategory = $(this).attr("democategory");
            uc.demo.SelectsValue.removeDemo(iscategory, columnname, attrvalue, democategory);
            uc.demo.SearchSelectsValue.removeDemo(iscategory, columnname, attrvalue, democategory);
        });
        uc.demo.BindSearchSelectedValues();
        uc.demo.BindSelectsValues();
    },

    RemoveAllSearchDemoOptions: function() {
        jQuery('#demo_search_selected option').each(function(i, option) {
            var columnname = $(this).attr("columnname");
            for (var i = 0; i < uc.demo.SelectsValue.SelectedDemos.length; i++) {
                if (columnname == uc.demo.SelectsValue.SelectedDemos[i].ColumnName) {
                    uc.demo.SelectsValue.SelectedDemos.splice(i, 1);
                }
            }
        });
        uc.demo.SearchSelectsValue.SearchSelectedDemos = [];
        uc.demo.BindSearchSelectedValues();
        uc.demo.BindSelectsValues();
    },

    AddSearchDemoOptions: function() {
        jQuery('#demo_search_result option:selected').each(function(i, option) {
            var isgroup = $(this).attr("isgroup") == "1" ? true : false;
            if (isgroup)
                return;
            var columnName = jQuery(this).attr("columnname");
            var value = jQuery(this).attr("attributevalue");
            var text = jQuery(this).text().trim();
            var attrName = jQuery(this).attr("attributedesc");
            var sortseq = jQuery(this).attr("sortseq");
            uc.demo.AddSearchDemoTarget(columnName, attrName, value, text, sortseq);
        });
    },

    AddDemoToTarget: function() {
        var selected = $('#ct_demo_tabs').tabs('option', 'selected');

        var aList = $("#ct_demo_ul a");
        for (var i = 0; i < aList.length; i++) {
            if (i == selected) {
                selected = parseInt($(aList[i]).attr('ord'));
                break;

            }
        }

        if (selected == entity.enums.DemoTab.DemoOptions) {
            //#5890 - Recommendation MAP Changes
            //if (!framework.common.IsRegisteredSite && page.global.isMyAcxiomPartnerUSite) {
            //    if ($("#demo_attributes option:selected").attr("isQuickPick")) {
            //        uc.demo.AddQuickPickValue("demo_attributes", "demo_attributes_variables");
            //    } else {
            //        uc.demo.AddDemoValue("demo_attributes", "demo_attributes_variables", "demo_attributes_input_lower", "demo_attributes_input_upper");
            //    }
            //} else {
            uc.demo.AddDemoValue("demo_options_category", "demo_options_variables", "demo_options_input_lower", "demo_options_input_upper");
            //}
            //            var columnName = jQuery('#demo_options_category').val();
            //            var $selected = jQuery('#demo_options_category option:selected');
            //            if (String.IsNullOrEmpty(columnName)) return;
            //            var AttrName = $selected.attr("attributename");
            //            var DemoInputtype = Number($selected.attr('columntype'));
            //            if (DemoInputtype == entity.enums.DemoInputType.Listbox) {
            //                jQuery('#demo_options_variables option:selected').each(function(i, option) {
            //                    uc.demo.SelectsValue.addDemo(columnName, AttrName, this.value, this.text, entity.enums.SelectedDemoType.Demography, $(this).attr("sortseq"));
            //                });
            //            }
            //            else if (DemoInputtype == entity.enums.DemoInputType.RadioSelectBox) {
            //                //edit some demo_attributes_values from multi-choice to radio-choice. jack.xin 2012-07-23
            //                uc.demo.SetRadioSelectBox('demo_options_variables', columnName, AttrName, entity.enums.SelectedDemoType.LifeStyle);
            //            }
            //            else {
            //                uc.demo.CheckAndGetInputValue(jQuery('#demo_options_input_lower'), jQuery('#demo_options_input_upper'), columnName, AttrName, entity.enums.SelectedDemoType.Demography);
            //            }
        } else if (selected == entity.enums.DemoTab.LifeStyle) {
            //#5890 - Recommendation MAP Changes
            //if (!framework.common.IsRegisteredSite && page.global.isMyAcxiomPartnerUSite) {
            //    uc.demo.AddDemoValue("demo_attributes_ls", "demo_attributes_variables_ls", "demo_attributes_input_lower_ls", "demo_attributes_input_upper_ls");
            //} else {
            uc.demo.AddDemoValue("demo_lifestyle_category", "demo_lifestyle_variables", "demo_lifestyle_input_lower", "demo_lifestyle_input_upper");
            //}
            //            var columnName = jQuery('#demo_lifestyle_category').val();
            //            var $selected = jQuery('#demo_lifestyle_category option:selected');
            //            if (String.IsNullOrEmpty(columnName)) return;
            //            var AttrName = $selected.attr("attributename");
            //            var DemoInputtype = Number($selected.attr('columntype'));
            //            if (DemoInputtype == entity.enums.DemoInputType.Listbox) {
            //                jQuery('#demo_lifestyle_variables option:selected').each(function(i, option) {
            //                    uc.demo.SelectsValue.addDemo(columnName, AttrName, this.value, this.text, entity.enums.SelectedDemoType.LifeStyle, $(this).attr("sortseq"));
            //                });
            //            }
            //            else if (DemoInputtype == entity.enums.DemoInputType.RadioSelectBox) {
            //                //edit some demo_attributes_values from multi-choice to radio-choice. jack.xin 2012-07-23
            //                uc.demo.SetRadioSelectBox('demo_lifestyle_variables', columnName, AttrName, entity.enums.SelectedDemoType.LifeStyle);
            //            }
            //            else {
            //                uc.demo.CheckAndGetInputValue(jQuery('#demo_lifestyle_input_lower'), jQuery('#demo_lifestyle_input_upper'), columnName, AttrName, entity.enums.SelectedDemoType.LifeStyle);
            //            }
        } else if (selected == entity.enums.DemoTab.Propensities) {
            uc.demo.AddDemoValue("demo_propensity", "demo_propensity_variables", "demo_propensity_input_lower", "demo_propensity_input_upper");
            //            var columnName = jQuery('#demo_lifestyle_category').val();
            //            var $selected = jQuery('#demo_lifestyle_category option:selected');
            //            if (String.IsNullOrEmpty(columnName)) return;
            //            var AttrName = $selected.attr("attributename");
            //            var DemoInputtype = Number($selected.attr('columntype'));
            //            if (DemoInputtype == entity.enums.DemoInputType.Listbox) {
            //                jQuery('#demo_lifestyle_variables option:selected').each(function(i, option) {
            //                    uc.demo.SelectsValue.addDemo(columnName, AttrName, this.value, this.text, entity.enums.SelectedDemoType.LifeStyle, $(this).attr("sortseq"));
            //                });
            //            }
            //            else if (DemoInputtype == entity.enums.DemoInputType.RadioSelectBox) {
            //                //edit some demo_attributes_values from multi-choice to radio-choice. jack.xin 2012-07-23
            //                uc.demo.SetRadioSelectBox('demo_lifestyle_variables', columnName, AttrName, entity.enums.SelectedDemoType.LifeStyle);
            //            }
            //            else {
            //                uc.demo.CheckAndGetInputValue(jQuery('#demo_lifestyle_input_lower'), jQuery('#demo_lifestyle_input_upper'), columnName, AttrName, entity.enums.SelectedDemoType.LifeStyle);
            //            }
        }

        uc.demo.BindSelectsValues();
    },

    AddFocusMarketToTarget: function() {
        //uc.demo.AddDemoValue("demo_focusmarket_category", "demo_focusmarket_variables", "demo_focusmarket_input_lower", "demo_focusmarket_input_upper");
        var columnName = jQuery('#demo_focusmarket_category').val();
        var $selected = jQuery('#demo_focusmarket_category option:selected');
        if (String.IsNullOrEmpty(columnName)) return;
        var AttrName = $selected.attr("attributename");
        var DemoInputtype = Number($selected.attr('columntype'));
        if (DemoInputtype == entity.enums.DemoInputType.Listbox) {
            jQuery('#demo_focusmarket_variables option:selected').each(function(i, option) {
                uc.demo.SelectsValue.addDemo(columnName, AttrName, this.value, this.text, entity.enums.SelectedDemoType.FocusMarket, $(this).attr("sortseq"));
            });
        }

        uc.demo.BindSelectsValues();
    },

    FocusMarket_AddAllClick: function() {
        if (!uc.demo.IsFocusMarketLoadedAll) {
            if (uc.demo.FocusMarketDemoValues.length > 0) {
                LoadAllFoucsMarket();
            }
            else {
                framework.common.Ajax({
                    url: "PlaceOrder.aspx/GetFocusMarketDemoAttribute",
                    data: {},
                    success: function(result) {
                        if (result.ResultFlag == true && result.DataSource) {
                            uc.demo.FocusMarketDemoValues = result.DataSource;
                            LoadAllFoucsMarket();
                        }
                    },
                    error: function(rep) {
                    },
                    waitingElement: "ct_demo_focusmarket_panels"
                });
            }
        }
        else {
            uc.demo.RemoveAllFocusMarketFromTarget();
        }

        function LoadAllFoucsMarket() {
            uc.demo.IsFocusMarketLoadedAll = true;
            $("#ct_demo_anico_fm_selectall a").text("Remove All Focus Market Quick Pick");
            $("#ct_demo_anico_fm_selectall a").attr("title", "Remove All Focus Market Quick Pick");
            for (var i = 0; i < uc.demo.FocusMarketDemoValues.length; i++) {
                var attrName = uc.demo.FocusMarketDemoValues[i].AttributeName;
                var columnName = uc.demo.FocusMarketDemoValues[i].ColumnName;
                for (var j = 0; j < uc.demo.FocusMarketDemoValues[i].DemoValues.length; j++) {
                    var sortSeq = uc.demo.FocusMarketDemoValues[i].DemoValues[j].SortSeq;
                    var demoValue = uc.demo.FocusMarketDemoValues[i].DemoValues[j].AttributeValue;
                    var demoText = uc.demo.FocusMarketDemoValues[i].DemoValues[j].AttributeValueName;
                    uc.demo.SelectsValue.addDemo(columnName, attrName, demoValue, demoText, entity.enums.SelectedDemoType.FocusMarket, sortSeq);
                }
            }
            uc.demo.BindSelectsValues();
        }

    },

    AddDemoValue: function(categoryId, variablesId, inputLowerId, inputUpperId) {
        var columnName = jQuery('#' + categoryId).val();
        var $selected = jQuery('#' + categoryId + ' option:selected');
        if (String.IsNullOrEmpty(columnName)) return;
        var AttrName = $selected.attr("attributename");
        var DemoInputtype = Number($selected.attr('columntype'));
        if (DemoInputtype == entity.enums.DemoInputType.Listbox) {
            jQuery('#' + variablesId + ' option:selected').each(function(i, option) {
                uc.demo.SelectsValue.addDemo(columnName, AttrName, this.value, this.text, entity.enums.SelectedDemoType.Demography, $(this).attr("sortseq"));
            });
        }
        else if (DemoInputtype == entity.enums.DemoInputType.RadioSelectBox) {
            //edit some demo_attributes_values from multi-choice to radio-choice. jack.xin 2012-07-23
            uc.demo.SetRadioSelectBox(variablesId, columnName, AttrName, entity.enums.SelectedDemoType.LifeStyle);
        }
        else {
            uc.demo.CheckAndGetInputValue(jQuery('#' + inputLowerId), jQuery('#' + inputUpperId), columnName, AttrName, entity.enums.SelectedDemoType.Demography);
        }

    },



    AddSearchDemoValue: function(columnName, attrName, value, text, sortseq) {
        uc.demo.SelectsValue.addDemo(columnName, attrName, value, text, entity.enums.SelectedDemoType.Demography, sortseq);
        uc.demo.SearchSelectsValue.addDemo(columnName, attrName, value, text, entity.enums.SelectedDemoType.Demography, sortseq);
    },

    //add radio-choice jack.xin 2012-07-23
    SetRadioSelectBox: function(id, columnName, attrName, selectedDemoType) {
        uc.demo.SetErrorMessage(false);
        var $select_values = jQuery('#' + id + ' option:selected');
        if ($select_values.length > 1) {
            uc.demo.SetErrorMessage(true, "you can only choose one item.");
            return;
        }
        var exists = false;
        var demo = new entity.SelectedDemoCategory();
        for (var i = 0; i < uc.demo.SelectsValue.SelectedDemos.length; i++) {
            if (uc.demo.SelectsValue.SelectedDemos[i].ColumnName == columnName && uc.demo.SelectsValue.SelectedDemos[i].DemoCategoryType == selectedDemoType) {
                demo = uc.demo.SelectsValue.SelectedDemos[i];
                exists = true;
                break;
            }
        }
        if (exists) {
            if (demo.Values.length > 0) {
                uc.demo.SetErrorMessage(true, "you can only choose one item,please delete the selected item to first.");
                return;
            }
        }

        uc.demo.SelectsValue.addDemo(columnName, attrName, $select_values[0].value, $select_values[0].text, selectedDemoType, 0);
    },

    SetInputBoxMask: function(demoInputType, elSelector) {
        switch (demoInputType) {
            case entity.enums.DemoInputType.InputDate:
                elSelector.setMask('99999999');
                break;
            case entity.enums.DemoInputType.InputInteger:
                elSelector.setMask('99999999');
                break;
            case entity.enums.DemoInputType.InputMonthyear:
                elSelector.setMask('999999');
                break;
            case entity.enums.DemoInputType.InputYear:
                elSelector.setMask('9999');
                break;
            case entity.enums.DemoInputType.InputMonth:
                elSelector.setMask('99');
                break;
            default:
                elSelector.setMask('99999999');
                break;
        }
    },

    GetInputedValue: function(el) {
        var result = {
            text: '',
            value: '',
            attributeValue: '',
            attributeName: '',
            message: '',
            isValid: true
        };

        var iText = el.val();
        var demoInputType = Number(el.attr("demoinputtype"));
        switch (demoInputType) {
            case entity.enums.DemoInputType.InputDate:
                if (iText.length != 8) {
                    result.isValid = false;
                    return result;
                }

                var year = Number(iText.substring(0, 4));
                var month = Number(iText.substring(4, 6));
                var day = Number(iText.substring(6, 8));

                if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
                    result.isValid = false;
                    return result;
                }

                result.text = iText;
                result.value = new Date(year, month, day);
                result.attributeValue = result.text;
                result.attributeName = result.text;
                return result;

            case entity.enums.DemoInputType.InputInteger:
                result.text = iText;
                result.value = Number(iText);
                result.attributeValue = Number(iText);
                result.attributeName = Number(iText);
                return result;
            case entity.enums.DemoInputType.InputMonthyear:
                if (iText.length != 6) {
                    result.isValid = false;
                    return result;
                }

                var month = Number(iText.substring(0, 2));
                var year = Number(iText.substring(2, 6));

                if (year < 1000 || year > 9999 || month < 0 || month > 12) {
                    result.isValid = false;
                    return result;
                }

                result.text = iText;
                result.value = Number(year + '' + (month >= 10 ? month : ('0' + month)));
                result.attributeValue = result.value;
                result.attributeName = result.text;
                return result;
            case entity.enums.DemoInputType.InputYear:
                if (iText.length != 4) {
                    result.isValid = false;
                    return result;
                }

                var year = Number(iText);

                if (year < 1000 || year > 9999) {
                    result.isValid = false;
                    return result;
                }

                result.text = iText;
                result.value = Number(year);
                result.attributeValue = result.value;
                result.attributeName = result.text;
                return result;
            case entity.enums.DemoInputType.InputMonth:
                if (iText.length != 2) {
                    result.isValid = false;
                    return result;
                }

                var month = Number(iText);

                if (month < 1 || month > 12) {
                    result.isValid = false;
                    return result;
                }

                result.text = iText;
                result.value = Number(month);
                result.attributeValue = result.value;
                result.attributeName = result.text;
                return result;
            default:
                result.text = iText;
                result.value = iText;
                result.attributeValue = result.value;
                result.attributeName = result.text;
                break;
        }

    },

    CheckAndGetInputValue: function(elLower, elUpper, columnName, AttrName, democategory) {
        uc.demo.SetErrorMessage(false);
        var lowerValue = elLower.val();
        var upperValue = elUpper.val();

        var min = null;
        if (elLower.attr('min') != "") {
            min = Number(elLower.attr('min'));
        };
        var max = null;
        if (elUpper.attr('max') != "") {
            max = Number(elUpper.attr('max'));
        };

        var isValid = true;
        if (lowerValue == "") {
            uc.demo.SetErrorMessage(true, "You must enter a lower value.");
            return;
        }
        if (upperValue == "") {
            uc.demo.SetErrorMessage(true, "You must enter an upper value.");
            return;
        }

        var lowerValueObject = uc.demo.GetInputedValue(elLower);
        if (!lowerValueObject.isValid) {
            uc.demo.SetErrorMessage(true, "You must enter a valid lower value.");
            return;
        }
        var upperValueObject = uc.demo.GetInputedValue(elUpper);
        if (!upperValueObject.isValid) {
            uc.demo.SetErrorMessage(true, "You must enter a valid upper value.");
            return;
        }

        var lowerValue = lowerValueObject.value;
        var upperValue = upperValueObject.value;

        if (isValid) {
            var msg = "";
            if (max != null && min != null) {
                if (max < lowerValue || min > lowerValue) {
                    uc.demo.SetErrorMessage(true, "Lower value must be between " + min + " and " + max);
                    return;
                }
                if (max < upperValue || min > upperValue) {
                    uc.demo.SetErrorMessage(true, "Upper value must be between " + min + " and " + max);
                    return;
                }
            } else if (min != null) {
                if (min > lowerValue) {
                    uc.demo.SetErrorMessage(true, "Lower value must be greater than " + min);
                    return;
                }

                if (min > upperValue) {
                    uc.demo.SetErrorMessage(true, "Upper value must be greater than " + min);
                    return;
                }
            } else if (max != null) {
                if (max < lowerValue) {
                    uc.demo.SetErrorMessage(true, "Lower value must be less than " + max);
                    return;
                }

                if (max < upperValue) {
                    uc.demo.SetErrorMessage(true, "Upper value must be less than " + max);
                    return;
                }
            }
        }

        if (lowerValue > upperValue) {
            uc.demo.SetErrorMessage(true, "Upper value must be greater than Lower value ");
            return;
        }

        //add demo if pass validation
        if (isValid) {
            uc.demo.SelectsValue.addDemo(
						columnName,
						AttrName,
						lowerValueObject.attributeValue + '~' + upperValueObject.attributeValue,    //value
						lowerValueObject.attributeName + ' to ' + upperValueObject.attributeName, //name
						democategory);
        }
    },

    RemoveFromTarget: function() {
        jQuery('#demo_selections option:selected').each(function(i, option) {
            var iscategory = $(this).attr("iscategory") == "1" ? true : false;
            var columnname = $(this).attr("columnname");
            var attrvalue = $(this).attr("value");
            var democategory = $(this).attr("democategory");
            uc.demo.SelectsValue.removeDemo(iscategory, columnname, attrvalue, democategory);

        });

        uc.demo.BindSelectsValues();


    },

    RemoveFocusMarketFromTarget: function() {
        jQuery('#demo_focusmarket_selections option:selected').each(function(i, option) {
            var iscategory = $(this).attr("iscategory") == "1" ? true : false;
            var columnname = $(this).attr("columnname");
            var attrvalue = $(this).attr("value");
            var democategory = $(this).attr("democategory");
            uc.demo.SelectsValue.removeDemo(iscategory, columnname, attrvalue, democategory);

        });

        uc.demo.BindSelectsValues();


    },

    RemoveAllFromTarget: function() {
        uc.demo.SelectsValue.SelectedDemos = [];
        uc.demo.BindSelectsValues();

    },

    RemoveAllFocusMarketFromTarget: function() {
        uc.demo.IsFocusMarketLoadedAll = false;
        $("#ct_demo_anico_fm_selectall a").text("Add All Focus Market Quick Pick");
        $("#ct_demo_anico_fm_selectall a").attr("title", "Add All Focus Market Quick Pick");
        jQuery('#demo_focusmarket_selections option').each(function(i, option) {
            var iscategory = $(this).attr("iscategory") == "1" ? true : false;
            var columnname = $(this).attr("columnname");
            var attrvalue = $(this).attr("value");
            var democategory = $(this).attr("democategory");
            uc.demo.SelectsValue.removeDemo(iscategory, columnname, attrvalue, democategory);

        });

        uc.demo.BindSelectsValues();

    },

    SetAllHouseHolds: function(allHouseholdDesc) {
        if (allHouseholdDesc != null) {
            page.placeorder.AllHouseholdDesc = allHouseholdDesc;
            jQuery('#demo_selectall_label').html(page.placeorder.AllHouseholdDesc.SettingDesc);
            jQuery('#demo_selectall').attr("desc", page.placeorder.AllHouseholdDesc.SettingValue);
        }

    },

    SetAllHouseHoldsAndPhoneOption: function(listType) {
        if (page.placeorder.AllHouseholdDesc == null) {
            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetSelectAllTargetDesc",
                data: { listType: listType },
                success: function(result) {
                    if (result.ResultFlag == true) {
                        page.placeorder.AllHouseholdDesc = result.DataSource;
                        jQuery('#demo_selectall_label').html(page.placeorder.AllHouseholdDesc.SettingDesc);
                        jQuery('#demo_selectall').attr("desc", page.placeorder.AllHouseholdDesc.SettingValue);
                    }
                },
                error: function(rep) {
                    framework.common.LogClickEvent(String.format("Fail to get all households option for list type {0}", listType), "", rep == null ? "Fail to get all households option" : rep.responseText);
                }
            });
        } else {
            jQuery('#demo_selectall_label').html(page.placeorder.AllHouseholdDesc.SettingDesc);
            jQuery('#demo_selectall').attr("desc", page.placeorder.AllHouseholdDesc.SettingValue);
        }

    },

    AllHouseholds_Click: function() {
        var DemoType = jQuery("#demo_selectall")[0].checked ? entity.enums.DemoType.All : entity.enums.DemoType.Standard;
        page.placeorder.order.DemoType = DemoType;
        uc.demo.BindSelectsValues();
        if (DemoType == entity.enums.DemoType.All) {
            jQuery("#ct_demo_panels [group='standarddemo']").attr('disabled', true);
            jQuery("#ct_demo_panels a[group='standarddemo']").addClass('hidden');
            jQuery("#tbKeyword").attr("disabled", true);
            //            jQuery("#ct_demo_focusmarket_panels [group='standarddemo']").attr('disabled', true);
            //            jQuery("#ct_demo_focusmarket_panels a[group='standarddemo']").addClass('hidden');            
        } else {
            jQuery("#ct_demo_panels [group='standarddemo']").removeAttr("disabled");
            jQuery("#ct_demo_panels a[group='standarddemo']").removeClass('hidden');
            jQuery("#tbKeyword").removeAttr("disabled");
            //            jQuery("#ct_demo_focusmarket_panels [group='standarddemo']").removeAttr('disabled');
            //            jQuery("#ct_demo_focusmarket_panels a[group='standarddemo']").removeClass('hidden');   
        }
    },

    BindSelectsValues: function() {
        var o = page.placeorder.order;
        if (o.DemoType == entity.enums.DemoType.All) {
            jQuery("#demo_selectall")[0].checked = true;
            var desc = jQuery("#demo_selectall").attr("desc");
            var str = String.format("<option>{0}</option>", desc);
            jQuery('#demo_selections').html(str);
            jQuery('#demo_industry_tree_target').html(str);
            jQuery('#demo_industry_tree_omit').html("");
            jQuery('#demo_industry_qp_selected').html("");
            jQuery('#demo_qp_selected').html('');
            jQuery('#demo_cg_selected').html('');
            //            jQuery('#demo_marketclarity_qp_selected').html('');
            //            jQuery('#demo_marketstreet_qp_selected').html('');
            //            jQuery('#demo_focusmarket_selections').html(str);
            uc.demo.BindMarketClarity();
            uc.demo.BindMarketStreet();
            uc.demo.BindFocusMarketOption();

        } else {
            jQuery("#demo_selectall")[0].checked = false;
            uc.demo.BindDemoOption();
            uc.demo.BindIndustry(entity.enums.SelectedDemoType.Industry);
            uc.demo.BindIndustry(entity.enums.SelectedDemoType.IndustryOmit);
            uc.demo.BindIndustryQuickPickup();
            uc.demo.BindQuickPickup();
            uc.demo.BindCharitableGiving();
            uc.demo.BindMarketClarity();
            uc.demo.BindMarketStreet();
            uc.demo.BindFocusMarketOption();

        }
    },

    SanNumberPhone: function() {
        $.fn.colorbox({ href: String.format("{0}/help/SanNumberPhone.htm", framework.common.SiteRootPath), iframe: true, width: 600, height: 300, opacity: 0.5, scrolling: false });
        return false;
    },

    BindSearchSelectedValues: function() {
        framework.common.sortJson(uc.demo.SearchSelectsValue.SearchSelectedDemos, "AttributeName", "asc");

        var selects = uc.demo.SearchSelectsValue.SearchSelectedDemos;
        var strFormat = "<option value='{0}' columnname='{1}' democategory='{2}' iscategory='{3}' style='font-weight:{5}'>{4}</option>";
        var templatestring = '';
        for (var i = 0; i < selects.length; i++) {
            if (selects[i].DemoCategoryType == entity.enums.SelectedDemoType.Demography || selects[i].DemoCategoryType == entity.enums.SelectedDemoType.LifeStyle) {
                templatestring = templatestring + String.format(strFormat,
													selects[i].ColumnName,
													selects[i].ColumnName,
													selects[i].DemoCategoryType,
													'1',
													selects[i].AttributeName,
													'bold');

                //set the order for the demo list
                framework.common.sortJson(selects[i].Values, "AttributeValue", "asc");
                for (var j = 0; j < selects[i].Values.length; j++) {
                    templatestring = templatestring + String.format(strFormat,
													selects[i].Values[j].AttributeValue,
													selects[i].ColumnName,
													selects[i].DemoCategoryType,
													'0',
													'&nbsp;&nbsp;' + selects[i].Values[j].AttributeValueName,
													'normal');
                    //'<option value="' + selects[i].Values[j].AttributeValue + '">&nbsp;&nbsp;' + selects[i].Values[j].AttributeValueName + '</option>';
                }
            }
        }
        jQuery('#demo_search_select_box').html(templatestring);
        framework.common.iPad.refreshMask("demo_search_select_box");
    },

    BindDemoOption: function() {
        //set the order for the demo list
        framework.common.sortJson(uc.demo.SelectsValue.SelectedDemos, "AttributeName", "asc");

        var selects = uc.demo.SelectsValue.SelectedDemos;
        var strFormat = "<option value='{0}' columnname='{1}' democategory='{2}' iscategory='{3}' style='font-weight:{5}'>{4}</option>";
        var templatestring = '';
        for (var i = 0; i < selects.length; i++) {
            if (selects[i].DemoCategoryType == entity.enums.SelectedDemoType.Demography || selects[i].DemoCategoryType == entity.enums.SelectedDemoType.LifeStyle) {
                templatestring = templatestring + String.format(strFormat,
													selects[i].ColumnName,
													selects[i].ColumnName,
													selects[i].DemoCategoryType,
													'1',
													selects[i].AttributeName,
													'bold');

                //set the order for the demo list
                framework.common.sortJson(selects[i].Values, "AttributeValue", "asc");
                for (var j = 0; j < selects[i].Values.length; j++) {
                    templatestring = templatestring + String.format(strFormat,
													selects[i].Values[j].AttributeValue,
													selects[i].ColumnName,
													selects[i].DemoCategoryType,
													'0',
													'&nbsp;&nbsp;' + selects[i].Values[j].AttributeValueName,
													'normal');
                    //'<option value="' + selects[i].Values[j].AttributeValue + '">&nbsp;&nbsp;' + selects[i].Values[j].AttributeValueName + '</option>';
                }
            }
            //#5890 - Recommendation MAP Changes
            //            if (page.global.isMyAcxiomPartnerUSite) {
            //                if (selects[i].DemoCategoryType == entity.enums.SelectedDemoType.QuickPickup) {
            //                    for (var t = 0; t < selects[i].Values.length; t++) {
            //                        templatestring = templatestring + String.format(strFormat,
            //                                                        selects[i].Values[t].AttributeValue,
            //                                                        selects[i].ColumnName,
            //                                                        selects[i].DemoCategoryType,
            //                                                        '0',
            //                                                        selects[i].Values[t].AttributeValueName,
            //                                                        'bold');
            //                    }
            //                }
            //            }
        }
        jQuery('#demo_selections').html(templatestring);
        framework.common.iPad.refreshMask("demo_selections");
    },

    BindFocusMarketOption: function() {
        //set the order for the demo list
        framework.common.sortJson(uc.demo.SelectsValue.SelectedDemos, "AttributeName", "asc");

        var selects = uc.demo.SelectsValue.SelectedDemos;
        var strFormat = "<option value='{0}' columnname='{1}' democategory='{2}' iscategory='{3}' style='font-weight:{5}'>{4}</option>";
        var templatestring = '';
        for (var i = 0; i < selects.length; i++) {
            if (selects[i].DemoCategoryType == entity.enums.SelectedDemoType.FocusMarket) {
                templatestring = templatestring + String.format(strFormat,
													selects[i].ColumnName,
													selects[i].ColumnName,
													selects[i].DemoCategoryType,
													'1',
													selects[i].AttributeName,
													'bold');

                //set the order for the demo list
                framework.common.sortJson(selects[i].Values, "SortSeq", "asc");
                for (var j = 0; j < selects[i].Values.length; j++) {
                    templatestring = templatestring + String.format(strFormat,
													selects[i].Values[j].AttributeValue,
													selects[i].ColumnName,
													selects[i].DemoCategoryType,
													'0',
													'&nbsp;&nbsp;' + selects[i].Values[j].AttributeValueName,
													'normal');
                }
            }

        }
        jQuery('#demo_focusmarket_selections').html(templatestring);
        framework.common.iPad.refreshMask("demo_focusmarket_selections");
    },

    BindIndustry: function(democategory) {
        var selects = [];
        var targetElementId = '#demo_industry_tree_target';
        if (democategory == entity.enums.SelectedDemoType.Industry) {
            selects = uc.demo.SelectsValue.GetAddedIndustries();
            targetElementId = '#demo_industry_tree_target';
        } else if (democategory == entity.enums.SelectedDemoType.IndustryOmit) {
            selects = uc.demo.SelectsValue.GetOmitIndustires();
            targetElementId = '#demo_industry_tree_omit'
        }

        var strFormat = "<span class='item'><span>{0}:{1}</span>&nbsp;<a value='{0}' columnname='{2}' democategory='{3}' href='javascript:void(0);' onclick=\"javascript:uc.demo.Industry_RemoveClick(this)\">Remove</a></span>";
        var templatestring = '';
        for (var i = 0; i < selects.length; i++) {
            templatestring += String.format("<span class='header'>{0}</span>", selects[i].AttributeName);
            framework.common.sortJson(selects[i].Values, "AttributeValue", "asc");
            for (var j = 0; j < selects[i].Values.length; j++) {
                templatestring += String.format(strFormat,
												selects[i].Values[j].AttributeValue,
												selects[i].Values[j].AttributeValueName,
												selects[i].ColumnName,
												selects[i].DemoCategoryType);
            }
        }
        jQuery(targetElementId).html(templatestring);
    },

    BindIndustryQuickPickup: function() {
        var selects = uc.demo.SelectsValue.GetSelectedDemoByType(entity.enums.SelectedDemoType.IndustryQuickPickup);
        var targetElementId = '#demo_industry_qp_selected';
        var strFormat = "<span class='item'><span>{0}</span>&nbsp;<a code='{1}' href='javascript:void(0);' onclick=\"javascript:uc.demo.IndustryQuickPickup_RemoveClick(this); return false;\">Remove</a></span>";
        var templatestring = '';
        for (var i = 0; i < selects.length; i++) {
            // templatestring += String.format(strFormat, selects[i].AttributeName, selects[i].ColumnName);
            framework.common.sortJson(selects[i].Values, "AttributeValueName", "asc");
            for (var j = 0; j < selects[i].Values.length; j++) {
                templatestring += String.format(strFormat,
												selects[i].Values[j].AttributeValueName,
												selects[i].Values[j].AttributeValue);
            }
        }
        jQuery(targetElementId).html(templatestring);

    },

    BindQuickPickup: function() {

        var siteQP = uc.demo.SelectsValue.GetSelectedDemoByType(entity.enums.SelectedDemoType.SiteQuickPickup);
        var userQP = uc.demo.SelectsValue.GetSelectedDemoByType(entity.enums.SelectedDemoType.QuickPickup);
        var selects = siteQP.concat(userQP);

        var targetElementId = '#demo_qp_selected';
        var userstr = "<span class='item'><span>{0}</span>&nbsp;<a id='{1}' href='javascript:void(0);' onclick=\"javascript:uc.demo.QuickPickup_RemoveClick(this); return false;\">Remove</a></span>";
        var sitestr = "<span class='item'><span>{0}</span>&nbsp;<a id='{1}' href='javascript:void(0);' onclick=\"javascript:uc.demo.SiteQuickPickup_RemoveClick(this); return false;\">Remove</a></span>";
        var templatestring = '';

        for (var i = 0; i < selects.length; i++) {
            framework.common.sortJson(selects[i].Values, "AttributeValueName", "asc");
            for (var j = 0; j < selects[i].Values.length; j++) {
                templatestring += String.format(selects[i].DemoCategoryType == entity.enums.SelectedDemoType.SiteQuickPickup ? sitestr : userstr,
													selects[i].Values[j].AttributeValueName,
													selects[i].Values[j].AttributeValue);
            }
        }
        jQuery(targetElementId).html(templatestring);

    },

    BindCharitableGiving: function() {
        var cg = uc.demo.SelectsValue.GetSelectedDemoByType(entity.enums.SelectedDemoType.CharitableGiving);
        var targetElementId = '#demo_cg_selected';
        var cgstr = "<span class='item'><span>{0}</span>&nbsp;<a id='{1}' href='javascript:void(0);' onclick=\"javascript:uc.demo.CharitableGiving_RemoveClick(this); return false;\">Remove</a></span>";
        var templatestring = '';

        for (var i = 0; i < cg.length; i++) {
            framework.common.sortJson(cg[i].Values, "AttributeValueName", "asc");
            for (var j = 0; j < cg[i].Values.length; j++) {
                templatestring += String.format(cgstr, cg[i].Values[j].AttributeValueName, cg[i].Values[j].AttributeValue);
            }
        }
        jQuery(targetElementId).html(templatestring);

    },

    BindMarketClarity: function() {
        var cg = uc.demo.SelectsValue.GetSelectedDemoByType(entity.enums.SelectedDemoType.MarketClarity);
        var targetElementId = '#demo_marketclarity_qp_selected';
        var cgstr = "<span class='item'><span>{0}</span>&nbsp;<a id='{1}' href='javascript:void(0);' onclick=\"javascript:uc.demo.MarketClarity_RemoveClick(this); return false;\">Remove</a></span>";
        var templatestring = '';

        for (var i = 0; i < cg.length; i++) {
            framework.common.sortJson(cg[i].Values, "AttributeValueName", "asc");
            for (var j = 0; j < cg[i].Values.length; j++) {
                templatestring += String.format(cgstr, cg[i].Values[j].AttributeValueName, cg[i].Values[j].AttributeValue);
            }
        }
        jQuery(targetElementId).html(templatestring);

    },

    BindMarketStreet: function() {
        var cg = uc.demo.SelectsValue.GetSelectedDemoByType(entity.enums.SelectedDemoType.MarketStreet);
        var targetElementId = '#demo_marketstreet_qp_selected';
        var cgstr = "<span class='item'><span>{0}</span>&nbsp;<a id='{1}' href='javascript:void(0);' onclick=\"javascript:uc.demo.MarketStreet_RemoveClick(this); return false;\">Remove</a></span>";
        var templatestring = '';

        for (var i = 0; i < cg.length; i++) {
            framework.common.sortJson(cg[i].Values, "AttributeValueName", "asc");
            for (var j = 0; j < cg[i].Values.length; j++) {
                templatestring += String.format(cgstr, cg[i].Values[j].AttributeValueName, cg[i].Values[j].AttributeValue);
            }
        }
        jQuery(targetElementId).html(templatestring);

    },

    BindSICSearchResult: function(result) {
        var data = result.DataSource;

        var strFormatGroup = "<strong>{0}</strong>";
        var strFormat = "<span class='renderLink'>{0}:{3} <a href='javascript:void(0)' onclick='javascript:uc.demo.IndustryTree_AddClick(this);' class='add' code='{0}' desc='{1}' category='{2}'>add</a> <a href='javascript:void(0)' onclick='javascript:uc.demo.IndustryTree_OmitClick(this);' class='add'  code='{0}' desc='{1}'  category='{2}'>omit</a></span>";
        var templatestring = '';
        for (var i = 0; i < data.length; i++) {
            if (data[i].IndustryCode == "") {
                templatestring += "<span class='resultGroup'>";
                templatestring += String.format(strFormatGroup,
                                              data[i].IndustryDesc);
                templatestring += "</span>";
            } else {
                var keyword = jQuery('#tbKeyword').val();
                var reg = new RegExp("(" + keyword + ")", "gi");
                var descDisplay = data[i].IndustryDesc.replace(reg, "<span class='keyword'>$1</span>");

                templatestring += String.format(strFormat,
                                          data[i].IndustryCode,
                                          data[i].IndustryDesc,
                                          data[i].TopLevelIndustryCode,
                                          descDisplay);

            }
        }

        jQuery('#demo_industry_search_result').html(templatestring);
    },

    SelectsValue: {

        SelectedDemos: [],
        SelectedIndustries: [],

        addDemo: function(columnname, attrname, value, name, democategory, sortSeq) {
            var demo = new entity.SelectedDemoCategory();
            var exists = false;
            for (var i = 0; i < uc.demo.SelectsValue.SelectedDemos.length; i++) {
                if (uc.demo.SelectsValue.SelectedDemos[i].ColumnName == columnname && uc.demo.SelectsValue.SelectedDemos[i].DemoCategoryType == democategory) {
                    demo = uc.demo.SelectsValue.SelectedDemos[i];
                    exists = true;
                    break;
                }
            }


            demo.ColumnName = columnname;
            demo.AttributeName = attrname;
            // demo.ListType = o.ListType;
            demo.DemoCategoryType = democategory;
            var seq = sortSeq || 0;
            demo.addValue(value, name, seq);

            if (!exists) {
                uc.demo.SelectsValue.SelectedDemos.push(demo);
                framework.common.sortJson(uc.demo.SelectsValue.SelectedDemos, "AttributeName", "asc");
            }
        },

        removeDemo: function(iscategory, columnname, attrvalue, democategory) {
            uc.demo.SelectsValue.SelectedDemos = $.grep(uc.demo.SelectsValue.SelectedDemos, function(cat) {
                if (cat.ColumnName == columnname && cat.DemoCategoryType == democategory) {
                    if (iscategory) {
                        return false;
                    } else {
                        cat.removeValue(attrvalue);
                        if (cat.Values.length == 0) {
                            return false;
                        }
                    }
                }

                return true;
            });
        },


        /*** follow function for getting particual demos by DemoCategoryType ***/
        GetSelectedDemoByType: function(democategory) {
            var lists = [];
            for (var i = 0; i < uc.demo.SelectsValue.SelectedDemos.length; i++) {
                if (uc.demo.SelectsValue.SelectedDemos[i].DemoCategoryType == democategory) {
                    lists.push(uc.demo.SelectsValue.SelectedDemos[i]);
                }
            }
            return lists;
        },

        GetAddedIndustries: function() {
            return uc.demo.SelectsValue.GetSelectedDemoByType(entity.enums.SelectedDemoType.Industry);
        },

        GetOmitIndustires: function() {
            return uc.demo.SelectsValue.GetSelectedDemoByType(entity.enums.SelectedDemoType.IndustryOmit);
        },

        RemoveByCategoryType: function(democategory) {
            uc.demo.SelectsValue.SelectedDemos = $.grep(uc.demo.SelectsValue.SelectedDemos, function(item) {
                return item.DemoCategoryType != democategory;
            });
        }


    },

    SearchSelectsValue: {

        SearchSelectedDemos: [],

        addDemo: function(columnname, attrname, value, name, democategory, sortSeq) {
            var demo = new entity.SelectedDemoCategory();
            var exists = false;
            for (var i = 0; i < uc.demo.SearchSelectsValue.SearchSelectedDemos.length; i++) {
                if (uc.demo.SearchSelectsValue.SearchSelectedDemos[i].ColumnName == columnname && uc.demo.SearchSelectsValue.SearchSelectedDemos[i].DemoCategoryType == democategory) {
                    demo = uc.demo.SearchSelectsValue.SearchSelectedDemos[i];
                    exists = true;
                    break;
                }
            }


            demo.ColumnName = columnname;
            demo.AttributeName = attrname;
            // demo.ListType = o.ListType;
            demo.DemoCategoryType = democategory;
            var seq = sortSeq || 0;
            demo.addValue(value, name, seq);

            if (!exists) {
                uc.demo.SearchSelectsValue.SearchSelectedDemos.push(demo);
                framework.common.sortJson(uc.demo.SearchSelectsValue.SearchSelectedDemos, "AttributeName", "asc");
            }
        },

        removeDemo: function(iscategory, columnname, attrvalue, democategory) {
            uc.demo.SearchSelectsValue.SearchSelectedDemos = $.grep(uc.demo.SearchSelectsValue.SearchSelectedDemos, function(cat) {
                if (cat.ColumnName == columnname && cat.DemoCategoryType == democategory) {
                    if (iscategory) {
                        return false;
                    } else {
                        cat.removeValue(attrvalue);
                        if (cat.Values.length == 0) {
                            return false;
                        }
                    }
                }

                return true;
            });
        }
    },

    /************************  Industry Methods locate here ***********************/
    LoadIndustryTree: function() {
        $("#demo_industry_trees").tree({
            data: {
                type: "json",
                async: true,
                opts: {
                    async: true,
                    method: "POST",
                    dataType: 'json',
                    url: "PlaceOrder.aspx/GetChildrenBySICCode"
                }
            },
            callback: {
                // Make sure static is not used once the tree has loaded for the first time
                onload: function(t) {
                    t.settings.data.opts.static_value = false;
                },
                // Take care of refresh calls - n will be false only when the whole tree is refreshed or loaded of the first time
                beforedata: function(n, t) {
                    if (n == false) {
                        //t.settings.data.opts.static = stat;
                        return jQuery.toJSON({ id: "", listType: page.placeorder.order.ListType });
                    } else {
                        return jQuery.toJSON({ id: $(n).attr("IndustryCode") || 0, listType: page.placeorder.order.ListType });
                    }
                },

                ondata: function(d, t) {
                    return d.d.DataSource;
                }
            }
        });
    },

    IndustryTree_AddClick: function(el) {
        if (page.placeorder.order.DemoType == entity.enums.DemoType.All) return;
        var sicCode = $(el).attr("code");

        if (sicCode.length < 6 && page.placeorder.order.ListType == entity.enums.DataSourceType.InfoUSABusiness) {
            framework.common.Ajax({
                url: "PlaceOrder.aspx/SearchSICByKeyword",
                data: { keyword: sicCode,
                    listType: page.placeorder.order.ListType
                },
                success: function(result) {
                    var data = result.DataSource;

                    for (var i = 1; i < data.length; i++) {

                        uc.demo.SelectsValue.addDemo(data[i].TopLevelIndustryCode, entity.lookup.TopIndustryLevels.getByCode(data[i].TopLevelIndustryCode).DisplayName, data[i].IndustryCode, data[i].IndustryDesc, entity.enums.SelectedDemoType.Industry);

                    }
                    uc.demo.BindSelectsValues();
                },
                error: function(rep) {

                },
                waitingElement: 'demo_industry_tree_source'
            });

        } else {
            var sicDesc = $(el).attr("desc");
            var category = $(el).attr("category");
            uc.demo.SelectsValue.addDemo(category, entity.lookup.TopIndustryLevels.getByCode(category).DisplayName, sicCode, sicDesc, entity.enums.SelectedDemoType.Industry);
            uc.demo.BindSelectsValues();
        }

    },

    IndustryTree_OmitClick: function(el) {
        if (page.placeorder.order.DemoType == entity.enums.DemoType.All) return;
        var sicCode = $(el).attr("code");

        if (sicCode.length < 6 && page.placeorder.order.ListType == entity.enums.DataSourceType.InfoUSABusiness) {
            framework.common.Ajax({
                url: "PlaceOrder.aspx/SearchSICByKeyword",
                data: { keyword: sicCode,
                    listType: page.placeorder.order.ListType
                },
                success: function(result) {
                    var data = result.DataSource;

                    for (var i = 1; i < data.length; i++) {

                        uc.demo.SelectsValue.addDemo(data[i].TopLevelIndustryCode, entity.lookup.TopIndustryLevels.getByCode(data[i].TopLevelIndustryCode).DisplayName + " (Omit)", data[i].IndustryCode, data[i].IndustryDesc, entity.enums.SelectedDemoType.IndustryOmit);

                    }
                    uc.demo.BindSelectsValues();
                },
                error: function(rep) {

                },
                waitingElement: 'demo_industry_tree_source'
            });

        } else {
            var sicDesc = $(el).attr("desc");
            var category = $(el).attr("category");
            var categoryName = entity.lookup.TopIndustryLevels.getByCode(category).DisplayName + " (Omit)";

            uc.demo.SelectsValue.addDemo(category, categoryName, sicCode, sicDesc, entity.enums.SelectedDemoType.IndustryOmit);
            uc.demo.BindSelectsValues();
        }
    },

    Industry_RemoveClick: function(el) {
        if (page.placeorder.order.DemoType == entity.enums.DemoType.All) return;
        var iscategory = false;
        var columnname = $(el).attr("columnname");
        var attrvalue = $(el).attr("value");
        var democategory = $(el).attr("democategory");
        uc.demo.SelectsValue.removeDemo(iscategory, columnname, attrvalue, democategory);
        uc.demo.BindSelectsValues();
    },

    ClearSelectedIndustries_Click: function() {
        if (page.placeorder.order.DemoType == entity.enums.DemoType.All) return;
        uc.demo.SelectsValue.RemoveByCategoryType(entity.enums.SelectedDemoType.Industry);
        uc.demo.BindSelectsValues();
    },

    ClearOmitIndustries_Click: function() {
        if (page.placeorder.order.DemoType == entity.enums.DemoType.All) return;
        uc.demo.SelectsValue.RemoveByCategoryType(entity.enums.SelectedDemoType.IndustryOmit);
        uc.demo.BindSelectsValues();
    },

    IndustryQuickPickup_AddClick: function(el) {
        if (page.placeorder.order.DemoType == entity.enums.DemoType.All) return;
        var code = $(el).attr("code");
        var desc = $(el).attr("desc");
        uc.demo.SelectsValue.addDemo(page.placeorder.BusinessShortcutsName, page.placeorder.BusinessShortcutsName, code, desc, entity.enums.SelectedDemoType.IndustryQuickPickup);
        uc.demo.BindSelectsValues();
    },

    IndustryQuickPickup_RemoveClick: function(el) {
        if (page.placeorder.order.DemoType == entity.enums.DemoType.All) return;
        var iscategory = false;
        var attrvalue = $(el).attr("code");
        uc.demo.SelectsValue.removeDemo(iscategory, page.placeorder.BusinessShortcutsName, attrvalue, entity.enums.SelectedDemoType.IndustryQuickPickup);
        uc.demo.BindSelectsValues();
    },

    AddIndustryByCode: function(isOmited) {
        if (page.placeorder.order.DemoType == entity.enums.DemoType.All) return;
        var keyword = jQuery('#tbKeyword').val();
        if (keyword == '')
            return;

        uc.demo.SetErrorMessage(false, "");

        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetSICByCode",
            data: { siccode: keyword,
                listType: page.placeorder.order.ListType
            },
            success: function(result) {
                //bind data
                var data = result.DataSource;
                if (data == null) {
                    uc.demo.SetErrorMessage(true, "You may only add or omit in this field with a valid numeric SIC Code.");
                    return;
                }

                var democategory;
                var suffix = "";
                if (isOmited) {
                    democategory = entity.enums.SelectedDemoType.IndustryOmit;
                    suffix = " (Omit)";
                } else {
                    democategory = entity.enums.SelectedDemoType.Industry;
                }

                uc.demo.SelectsValue.addDemo(data.TopLevelIndustryCode, entity.lookup.TopIndustryLevels.getByCode(data.TopLevelIndustryCode).DisplayName + suffix, data.IndustryCode, data.IndustryDesc, democategory);
                uc.demo.BindSelectsValues();
            },
            error: function(rep) {

            },
            waitingElement: 'ct_demo_panels'
        });


    },

    SetErrorMessage: function(bShow, msg) {
        var elementId = page.placeorder.order.ListType == entity.enums.DataSourceType.Occupant ? '#demo_occupant_message_error' : '#demo_message_error';
        if (page.placeorder.isMultiCount) {
            elementId = '#multi_save_count_message_error'
        }
        if (bShow) {
            jQuery(elementId).removeClass("hidden").html(msg);
        } else {
            jQuery(elementId).addClass("hidden").html("");
        }
    },

    ClearMinOrMaxValue: function() {
        jQuery('#demo_lifestyle_variables_input input[type="text"]').val('').removeAttr("min").removeAttr("max");
        jQuery('#demo_options_variables_input input[type="text"]').val('').removeAttr("min").removeAttr("max");
    },

    LoadQuickPicks: function() {
        var o = page.placeorder.order;
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetQuickPickups",
            data: { listType: o.ListType },
            success: function(result) {
                if (result.ResultFlag == true) {
                    if (result.DataSource != null && result.DataSource.length > 0) {
                        var $e = $('#demo_qp_source');
                        $e.setTemplateElement("qp_source_template");
                        $e.processTemplate(result.DataSource);
                    } else {
                        $('#demo_qp_source').html("");
                    }
                }
            },
            error: function(rep) {
            },
            waitingElement: 'ct_demo_quickpickup_panels'
        });

    },
    LoadCharitableGivings: function() {
        var o = page.placeorder.order;
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetCharitableGivings",
            data: { listType: o.ListType },
            success: function(result) {
                if (result.ResultFlag == true) {
                    if (result.DataSource != null && result.DataSource.length > 0) {
                        var $e = $('#demo_cg_source');
                        $e.setTemplateElement("demo_cg_source_tmpl");
                        $e.processTemplate(result.DataSource);
                    } else {
                        $('#demo_cg_source').html("");
                    }
                }
            },
            error: function(rep) {
            },
            waitingElement: 'ct_demo_charitable_giving'
        });

    },

    LoadMarketClarityQuickPicks: function() {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetMarketClarityQuickPickups",
            data: { listType: page.placeorder.order.ListType },
            success: function(result) {
                if (result.ResultFlag == true) {
                    if (result.DataSource != null && result.DataSource.length > 0) {
                        uc.demo.MarketClarityQuickPicks = result.DataSource;
                        var $e = $('#demo_marketclarity_qp_source');
                        $e.setTemplateElement("demo_marketclarity_source_tmpl");
                        $e.processTemplate(result.DataSource);
                    } else {
                        $('#demo_marketclarity_qp_source').html("");
                    }
                }
            },
            error: function(rep) {
            },
            waitingElement: 'ct_demo_marketclarity_panels'
        });

    },

    LoadMarketStreetQuickPicks: function() {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetMarketStreetQuickPickups",
            data: { listType: page.placeorder.order.ListType },
            success: function(result) {
                if (result.ResultFlag == true) {
                    if (result.DataSource != null && result.DataSource.length > 0) {
                        uc.demo.MarketStreetQuickPicks = result.DataSource;
                        var $e = $('#demo_marketstreet_qp_source');
                        $e.setTemplateElement("demo_marketstreet_source_tmpl");
                        $e.processTemplate(result.DataSource);
                    } else {
                        $('#demo_marketstreet_qp_source').html("");
                    }
                }
            },
            error: function(rep) {
            },
            waitingElement: 'ct_demo_marketstreet_panels'
        });

    },

    QuickPickup_AddClick: function(el) {
        if (page.placeorder.order.DemoType == entity.enums.DemoType.All) return;
        var cusstatus = $("#demo_qp_selected").children(".item").length;
        if (page.placeorder.order.ListType == 10 && cusstatus > 0) {
            uc.demo.SetErrorMessage(true, "you can only choose one item.");
            return false;
        }

        var id = $(el).attr("id");
        var qpType = $(el).attr("qpType");
        var name = jQuery(el).attr("qpName");
        var desc = $(el).attr("desc");
        if (qpType == '1') {
            uc.demo.SelectsValue.addDemo("Site Quick Pick", "Site Quick Pick", id, name, entity.enums.SelectedDemoType.SiteQuickPickup, 0);
        }
        else {
            uc.demo.SelectsValue.addDemo("Quick Pick", "Quick Pick", id, name, entity.enums.SelectedDemoType.QuickPickup, 0);
        }
        uc.demo.BindSelectsValues();
    },

    CharitableGiving_AddClick: function(el) {
        if (page.placeorder.order.DemoType == entity.enums.DemoType.All) return;
        var cusstatus = $("#demo_cg_selected").children(".item").length;
        if (page.placeorder.order.ListType == 10 && cusstatus > 0) {
            uc.demo.SetErrorMessage(true, "you can only choose one item.");
            return false;
        }

        var id = $(el).attr("id");
        var qpType = $(el).attr("qpType");
        var name = jQuery(el).attr("qpName");
        var desc = $(el).attr("desc");

        uc.demo.SelectsValue.addDemo("Charitable Giving", "Charitable Giving", id, name, entity.enums.SelectedDemoType.CharitableGiving, 0);
        uc.demo.BindSelectsValues();
    },

    MarketClarity_AddClick: function(el) {
        var cusstatus = $("#demo_marketclarity_qp_selected").children(".item").length;
        if (page.placeorder.order.ListType == 10 && cusstatus > 0) {
            uc.demo.SetErrorMessage(true, "you can only choose one item.");
            return false;
        }

        var id = $(el).attr("id");
        var qpType = $(el).attr("qpType");
        var name = jQuery(el).attr("qpName");
        var desc = $(el).attr("desc");

        uc.demo.SelectsValue.addDemo("Market Clarity Quick Pick", "Market Clarity Quick Pick", id, name, entity.enums.SelectedDemoType.MarketClarity, 0);
        uc.demo.BindSelectsValues();
    },

    MarketClarity_AddAllClick: function() {
        if (!uc.demo.IsMarketClarityLoadedAll) {

            uc.demo.IsMarketClarityLoadedAll = true;
            $("#ct_demo_anico_mc_selectall a").text("Remove All Market Clarity Quick Pick");
            $("#ct_demo_anico_mc_selectall a").attr("title", "Remove All Market Clarity Quick Pick");

            for (var i = 0; i < uc.demo.MarketClarityQuickPicks.length; i++) {
                var id = uc.demo.MarketClarityQuickPicks[i].QpId.toString();
                var name = uc.demo.MarketClarityQuickPicks[i].QpName;
                uc.demo.SelectsValue.addDemo("Market Clarity Quick Pick", "Market Clarity Quick Pick", id, name, entity.enums.SelectedDemoType.MarketClarity, 0);
            }
            uc.demo.BindSelectsValues();
        }
        else {
            uc.demo.MarketClarity_RemoveAllClick();
        }


    },

    MarketStreet_AddClick: function(el) {
        var cusstatus = $("#demo_marketclarity_qp_selected").children(".item").length;
        if (page.placeorder.order.ListType == 10 && cusstatus > 0) {
            uc.demo.SetErrorMessage(true, "you can only choose one item.");
            return false;
        }

        var id = $(el).attr("id");
        var qpType = $(el).attr("qpType");
        var name = jQuery(el).attr("qpName");
        var desc = $(el).attr("desc");

        uc.demo.SelectsValue.addDemo("Market Street Quick Pick", "Market Street Quick Pick", id, name, entity.enums.SelectedDemoType.MarketStreet, 0);
        uc.demo.BindSelectsValues();
    },

    MarketStreet_AddAllClick: function() {
        if (!uc.demo.IsMarketStreetLoadedAll) {

            uc.demo.IsMarketStreetLoadedAll = true;
            $("#ct_demo_anico_ms_selectall a").text("Remove All Market Street Quick Pick");
            $("#ct_demo_anico_ms_selectall a").attr("title", "Remove All Market Street Quick Pick");

            for (var i = 0; i < uc.demo.MarketStreetQuickPicks.length; i++) {
                var id = uc.demo.MarketStreetQuickPicks[i].QpId.toString();
                var name = uc.demo.MarketStreetQuickPicks[i].QpName;
                uc.demo.SelectsValue.addDemo("Market Street Quick Pick", "Market Street Quick Pick", id, name, entity.enums.SelectedDemoType.MarketStreet, 0);
            }
            uc.demo.BindSelectsValues();
        }
        else {
            uc.demo.MarketStreet_RemoveAllClick();
        }
    },


    QuickPickup_RemoveClick: function(el) {
        $("#demo_message_error").addClass("hidden");
        if (page.placeorder.order.DemoType == entity.enums.DemoType.All) return;

        var iscategory = false;
        var attrvalue = $(el).attr("id");
        uc.demo.SelectsValue.removeDemo(iscategory, "Quick Pick", attrvalue, entity.enums.SelectedDemoType.QuickPickup);
        uc.demo.BindSelectsValues();
    },

    CharitableGiving_RemoveClick: function(el) {
        $("#demo_message_error").addClass("hidden");
        if (page.placeorder.order.DemoType == entity.enums.DemoType.All) return;

        var iscategory = false;
        var attrvalue = $(el).attr("id");
        uc.demo.SelectsValue.removeDemo(iscategory, "Charitable Giving", attrvalue, entity.enums.SelectedDemoType.CharitableGiving);
        uc.demo.BindSelectsValues();
    },

    MarketClarity_RemoveClick: function(el) {
        $("#demo_message_error").addClass("hidden");

        var iscategory = false;
        var attrvalue = $(el).attr("id");
        uc.demo.SelectsValue.removeDemo(iscategory, "Market Clarity Quick Pick", attrvalue, entity.enums.SelectedDemoType.MarketClarity);
        uc.demo.BindSelectsValues();
    },

    MarketClarity_RemoveAllClick: function() {
        $("#demo_message_error").addClass("hidden");

        uc.demo.IsMarketClarityLoadedAll = false;
        $("#ct_demo_anico_mc_selectall a").text("Add All Market Clarity Quick Pick");
        $("#ct_demo_anico_mc_selectall a").attr("title", "Add All Market Clarity Quick Pick");

        $("#demo_marketclarity_qp_selected a").each(function(index) {
            var iscategory = false;
            var attrvalue = $(this).attr("id");
            uc.demo.SelectsValue.removeDemo(iscategory, "Market Clarity Quick Pick", attrvalue, entity.enums.SelectedDemoType.MarketClarity);
        });
        uc.demo.BindSelectsValues();
    },

    MarketStreet_RemoveClick: function(el) {
        $("#demo_message_error").addClass("hidden");

        var iscategory = false;
        var attrvalue = $(el).attr("id");
        uc.demo.SelectsValue.removeDemo(iscategory, "Market Street Quick Pick", attrvalue, entity.enums.SelectedDemoType.MarketStreet);
        uc.demo.BindSelectsValues();
    },

    MarketStreet_RemoveAllClick: function(el) {
        $("#demo_message_error").addClass("hidden");

        uc.demo.IsMarketStreetLoadedAll = false;
        $("#ct_demo_anico_ms_selectall a").text("Add All Market Street Quick Pick");
        $("#ct_demo_anico_ms_selectall a").attr("title", "Add All Market Street Quick Pick");

        $("#demo_marketstreet_qp_selected a").each(function(index) {
            var iscategory = false;
            var attrvalue = $(this).attr("id");
            uc.demo.SelectsValue.removeDemo(iscategory, "Market Street Quick Pick", attrvalue, entity.enums.SelectedDemoType.MarketStreet);
        });
        uc.demo.BindSelectsValues();
    },


    SiteQuickPickup_RemoveClick: function(el) {
        $("#demo_message_error").addClass("hidden");
        if (page.placeorder.order.DemoType == entity.enums.DemoType.All) return;
        var iscategory = false;
        var attrvalue = $(el).attr("id");
        uc.demo.SelectsValue.removeDemo(iscategory, "Site Quick Pick", attrvalue, entity.enums.SelectedDemoType.SiteQuickPickup);
        uc.demo.BindSelectsValues();
    },

    ShowSaveAsMyQuickpick: function() {
        uc.demo.ShowMyQuickpickError(false, "");
        uc.demo.MyQuickpickSelectsValue.SelectedDemos = uc.demo.CloneSelectedDemos();
        uc.demo.BindMyAvailableOptions();
        uc.demo.BindMyTargetOptions();
        framework.ui.ShowDialog('saveAsMyQuickpick', { fixedOnScroll: true, appendForm: true, css: { cursor: "default", top: '15%', left: '30%', border: '0px solid #aaa'} });
        //framework.ui.AddCloseDialogEvent(uc.demo.LoadQuickPicks);
    },


    AddQuickPickValue: function(categoryId, variables) {
        //var id = $('#' + variables + ' option:selected').val();
        //        var qpCount = $("#demo_selections option[columnname='Quick Pick']").length;
        //        if (qpCount > 0) {
        //            uc.demo.SetErrorMessage(true, "you can only choose one item.");
        //            return false;
        //        }

        jQuery('#' + variables + ' option:selected').each(function(i, option) {
            //var qpName = $('#' + variables + ' option:selected').text().trim();
            uc.demo.SelectsValue.addDemo("Quick Pick", "Quick Pick", this.value, this.text, entity.enums.SelectedDemoType.QuickPickup, 0);
        });
    },

    currentFile: "",
    ShowUploadFile: function() {
        framework.ui.ShowDialog('UploadFile');
    },

    ShowUploadFileHelp: function() {
        framework.ui.ShowDialog('UploadFileHelp');
    },

    BindUploadFile: function() {
        $("#ErrorMessage").html('');
        $("#ErrorMessage").hide();
        $("#UploadFail").html('');
        $("#UploadFail").hide();
        $("#btn").hide();
        $("#cutomsupp_msg").html('');
        $("#cutomsupp_msg").hide();
        $("#cutomsupp_msg").addClass("hidden");
        uc.demo.currentFile = "";

        var button = $('#btnSelect'), interval;
        var au = new AjaxUpload(button, {
            action: 'Common/ExcelUploader.ashx',
            autoSubmit: false,
            name: 'myfile',
            responseType: 'json',

            onChange: function(file, ext) {
                $("#ErrorMessage").html('');
                $("#UploadFail").html('');
                if (!(ext && /^(xls|xlsx)$/.test(ext))) {
                    $("#UploadFail").html('We just accept Microsoft Excel (97 or newer).');
                    $("#UploadFail").show();
                    return false;
                }
                $("#filename").attr("value", file);

            },
            onSubmit: function(file, ext) {
                $("#ErrorMessage").html('');
                $("#UploadFail").html('');
                $("#btn").hide();
                if ($("#filename").attr("value") == "") {
                    $("#UploadFail").html('You must select a Microsoft Excel file(97 or newer).');
                    $("#UploadFail").show();
                    return false;
                }
                else if ($("#userFileName").attr("value") == "") {
                    $("#UploadFail").html('You must input your file name.');
                    $("#UploadFail").show();
                    return false;
                }
                else if (!(ext && /^(xls|xlsx)$/.test(ext))) {
                    $("#UploadFail").html('We just accept Microsoft Excel (97 or newer).');
                    $("#UploadFail").show();
                    return false;
                }
                framework.ui.showWaiting('UploadFile', true);
                this.disable();
            },
            onComplete: function(file, response) {
                $("#ErrorMessage").html('');
                $("#UploadFail").html('');
                window.clearInterval(interval);
                // enable upload button
                this.enable();

                if (response.ResultFlag) {
                    uc.demo.currentFile = response.DataSource;
                    uc.demo.currentFile.UserFileName = $("#userFileName").attr("value");
                    uc.demo.GetRecord(response.DataSource);
                }
                else {
                    $("#UploadFail").html(response.ResultMessage);
                    $("#UploadFail").show();
                }
                framework.ui.showWaiting('UploadFile', false);
            }
        });
        return au;
    },

    GetRecord: function(path) {
        $("#ErrorMessage").html('');
        $("#ErrorMessage").hide();
        $("#UploadFail").html('');
        $("#UploadFail").hide();
        $("#btn").hide();
        $("#cutomsupp_msg").html('');
        $("#cutomsupp_msg").hide();
        var o = page.placeorder.order;

        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetRecord",
            data: { filePath: path.TargetFile, type: 1 },
            success: function(result) {
                if (result.ResultFlag) {
                    if (result.ResultMessage != null) {
                        $("#UploadFail").html(result.ResultMessage);
                        $("#UploadFail").show();
                    }
                    else {
                        if (result.DataSource != null) {

                            $("#SelectFile").hide();
                            $("#filetable").setTemplateElement("listfilestable");
                            $("#filetable").processTemplate(result.DataSource);
                            $("#TipForSuccessfully").setTemplateElement("TipOfSuccessfully");
                            $("#TipForSuccessfully").processTemplate(result.DataSource);
                            $("#RecordDetails").show();
                            $("#btn").show();
                        }
                    }
                }
                else {
                    $("#UploadFail").html("").html(result.ResultMessage);
                    $("#UploadFail").show();
                }

            },
            error: function(rep) {
                $("#UploadFail").html("Error occurred when getting file info, please try it later.");
                $("#UploadFail").show();
            }
        });
    },

    BackToUploadFile: function() {
        framework.ui.showWaiting('RecordDetails', true);
        $("#filename").attr("value", "");
        $('#userFileName').attr("value", '');
        $("#RecordDetails").hide();
        $("#btn").hide();
        framework.ui.showWaiting('RecordDetails', false);
        $("#SelectFile").show();
    },

    NextToUploadFile: function() {
        var o = page.placeorder.order;

        if (uc.demo.currentFile && uc.demo.currentFile != "") {
            $("#cutomsupp_msg").html("");
            $("#cutomsupp_msg").hide();
            framework.common.Ajax({
                url: "PlaceOrder.aspx/ProcessCustomSuppressionFile",
                data: { listType: o.ListType, file: uc.demo.currentFile },
                success: function(result) {
                    $("#cutomsupp_msg").html("").html("We're loading your file for suppression. When it is ready, typically within 30 minutes, you will be alerted via email. You will then see this file in the 'Suppress Uploaded File' option when building your list.").removeClass("hidden");
                    $("#cutomsupp_msg").show();
                    framework.ui.CloseDialog();
                },
                error: function(rep) {

                }
            });
        }
    },


    ResetUploadFile: function() {
        $('#cutomsupp_msg').html('');
        $('#userFileName').attr("value", '');
        $('#cutomsupp_msg').hide();
        $("#filename").attr("value", "");
        $("#RecordDetails").hide();
        $("#btn").hide();
        $("#SelectFile").show();
    },

    BindMyAvailableOptions: function(selects) {
        var selects = uc.demo.SelectsValue.SelectedDemos;
        this.BindOptions("myAvailableOptions", selects);
        /*
        var strFormat = "<option value='{0}' columnname='{1}' democategory='{2}' iscategory='{3}' attrname='{6}' sortseq='{7}' style='font-weight:{5}'>{4}</option>";
        var templatestring = '';
        for (var i = 0; i < selects.length; i++) {
        // if (selects[i].DemoCategoryType == entity.enums.SelectedDemoType.Demography || selects[i].DemoCategoryType == entity.enums.SelectedDemoType.LifeStyle) {
        templatestring = templatestring + String.format(strFormat,
        selects[i].ColumnName,
        selects[i].ColumnName,
        selects[i].DemoCategoryType,
        '1',
        selects[i].AttributeName,
        'bold',
        selects[i].AttributeName,
        i);
        for (var j = 0; j < selects[i].Values.length; j++) {
        templatestring = templatestring + String.format(strFormat,
        selects[i].Values[j].AttributeValue,
        selects[i].ColumnName,
        selects[i].DemoCategoryType,
        '0',
        '&nbsp;&nbsp;' + selects[i].Values[j].AttributeValueName,
        'normal',
        selects[i].Values[j].AttributeValueName,
        selects[i].Values[j].SortSeq);
        //'<option value="' + selects[i].Values[j].AttributeValue + '">&nbsp;&nbsp;' + selects[i].Values[j].AttributeValueName + '</option>';
        }
        //}
        }
        jQuery('#myAvailableOptions').html(templatestring);
        framework.common.iPad.refreshMask("myAvailableOptions");
        */
    },

    BindMyTargetOptions: function() {
        var selects = uc.demo.MyQuickpickSelectsValue.SelectedDemos;
        this.BindOptions("myTargetOptions", selects);

        /*
        var strFormat = "<option value='{0}' columnname='{1}' democategory='{2}' iscategory='{3}' style='font-weight:{5}'>{4}</option>";
        var templatestring = '';
        for (var i = 0; i < selects.length; i++) {
        //if (selects[i].DemoCategoryType == entity.enums.SelectedDemoType.Demography || selects[i].DemoCategoryType == entity.enums.SelectedDemoType.LifeStyle) {
        templatestring = templatestring + String.format(strFormat,
        selects[i].ColumnName,
        selects[i].ColumnName,
        selects[i].DemoCategoryType,
        '1',
        selects[i].AttributeName,
        'bold');
        for (var j = 0; j < selects[i].Values.length; j++) {
        templatestring = templatestring + String.format(strFormat,
        selects[i].Values[j].AttributeValue,
        selects[i].ColumnName,
        selects[i].DemoCategoryType,
        '0',
        '&nbsp;&nbsp;' + selects[i].Values[j].AttributeValueName,
        'normal');
        }
        //}
        }
        jQuery('#myTargetOptions').html(templatestring);
        framework.common.iPad.refreshMask("myTargetOptions");
        */
    },

    BindOptions: function(elementId, selects) {
        var strFormat = "<option value='{0}' columnname='{1}' democategory='{2}' iscategory='{3}' attrname='{6}' sortseq='{7}' style='font-weight:{5}'>{4}</option>";

        var templatestring = '';
        for (var i = 0; i < selects.length; i++) {
            if (selects[i].DemoCategoryType != entity.enums.SelectedDemoType.QuickPickup && selects[i].DemoCategoryType != entity.enums.SelectedDemoType.SiteQuickPickup) {
                templatestring = templatestring + String.format(strFormat,
                                                                selects[i].ColumnName,
                                                                selects[i].ColumnName,
                                                                selects[i].DemoCategoryType,
                                                                '1',
                                                                selects[i].AttributeName,
                                                                'bold',
                                                                selects[i].AttributeName,
                                                                i);
                var business = (selects[i].DemoCategoryType == entity.enums.SelectedDemoType.Industry || selects[i].DemoCategoryType == entity.enums.SelectedDemoType.IndustryOmit);
                for (var j = 0; j < selects[i].Values.length; j++) {
                    var display = business ? (selects[i].Values[j].AttributeValue + ':' + selects[i].Values[j].AttributeValueName) : selects[i].Values[j].AttributeValueName;
                    templatestring = templatestring + String.format(strFormat,
                                                                    selects[i].Values[j].AttributeValue,
                                                                    selects[i].ColumnName,
                                                                    selects[i].DemoCategoryType,
                                                                    '0',
                                                                    '&nbsp;&nbsp;' + display,
                                                                    'normal',
                                                                    selects[i].Values[j].AttributeValueName,
                                                                    selects[i].Values[j].SortSeq);
                }
            }
        }
        jQuery('#' + elementId).html(templatestring);
        framework.common.iPad.refreshMask(elementId);
    },

    /*
    

    GetOptions: function(demos) {
    var groups = [];
    var items = this.GetGroupOptions(demos, entity.enums.SelectedDemoType.LifeStyle);
    if (items != null && items.length > 0) {
    var group = new entity.SelectedDemoCategoryGroup();
    group.DemoCategoryType = entity.enums.SelectedDemoType.LifeStyle;
    group.DemoCategoryName = group.getName(entity.enums.SelectedDemoType.LifeStyle);
    group.Demos = items;
    }
    },

    GetGroupOptions: function(demos, type) {
    return jQuery.grep(demos, function(demo, index) {
    return demo.DemoCategoryType == type;
    });
    },
    */

    AddAvailableOptionsToTarget: function() {
        jQuery('#myAvailableOptions option:selected').each(function(i, option) {
            var iscategory = $(this).attr("iscategory") == "1" ? true : false;
            var columnname = $(this).attr("columnname");
            var attrvalue = $(this).attr("value");
            var democategory = $(this).attr("democategory");
            var attrName = $(this).attr("attrname");
            var sortseq = $(this).attr("sortseq");
            uc.demo.MyQuickpickSelectsValue.addDemo(iscategory, columnname, attrvalue, attrName, democategory, sortseq);

        });
        uc.demo.BindMyTargetOptions();
    },

    RemoveTargetOptions: function() {
        jQuery('#myTargetOptions option:selected').each(function(i, option) {
            var iscategory = $(this).attr("iscategory") == "1" ? true : false;
            var columnname = $(this).attr("columnname");
            var attrvalue = $(this).attr("value");
            var democategory = $(this).attr("democategory");
            uc.demo.MyQuickpickSelectsValue.removeDemo(iscategory, columnname, attrvalue, democategory);

        });
        uc.demo.BindMyTargetOptions();
    },

    RemoveAllTargetOptions: function() {
        uc.demo.MyQuickpickSelectsValue.SelectedDemos = [];
        uc.demo.BindMyTargetOptions();
    },

    CloneSelectedDemos: function() {
        var clonedDemos = [];
        var selectedDemo = null;
        var selectedDemoValue = null;
        if (uc.demo.SelectsValue.SelectedDemos != null) {
            for (var i = 0; i < uc.demo.SelectsValue.SelectedDemos.length; i++) {
                var demo = new entity.SelectedDemoCategory();
                selectedDemo = uc.demo.SelectsValue.SelectedDemos[i];
                demo.ColumnName = selectedDemo.ColumnName;
                demo.AttributeName = selectedDemo.AttributeName;
                demo.DemoCategoryType = selectedDemo.DemoCategoryType;
                for (var j = 0; j < selectedDemo.Values.length; j++) {
                    var demoValue = new entity.SelectedDemoCategoryValue();
                    selectedDemoValue = selectedDemo.Values[j];
                    demoValue.ColumnName = selectedDemoValue.ColumnName;
                    demoValue.AttributeValue = selectedDemoValue.AttributeValue;
                    demoValue.AttributeValueName = selectedDemoValue.AttributeValueName;
                    demoValue.SortSeq = selectedDemoValue.SortSeq;
                    demo.Values.push(demoValue);
                }
                clonedDemos.push(demo);
            }
        }
        return clonedDemos;
    },

    SaveAsMyQuickpick: function() {
        uc.demo.ShowMyQuickpickError(false, "");
        var quickpickName = jQuery("#myQuickpickName").val();
        if (String.IsNullOrEmpty(quickpickName)) {
            uc.demo.ShowMyQuickpickError(true, "Please enter your quickpick name.");
            return false;
        }
        if (uc.demo.MyQuickpickSelectsValue.SelectedDemos.length < 1) {
            uc.demo.ShowMyQuickpickError(true, "Please add quickpick criteria.");
            return false;
        }
        var quickpickDesc = jQuery("#myQuickpickDesc").val();
        var listType = page.placeorder.order.ListType;

        framework.common.Ajax({
            url: "PlaceOrder.aspx/SaveMyQuickpick",
            data: { quickPickName: quickpickName,
                quickPickDesc: quickpickDesc,
                listType: page.placeorder.order.ListType,
                targetOptions: uc.demo.MyQuickpickSelectsValue.SelectedDemos
            },
            success: function(result) {
                var message = "";
                if (result.ResultFlag) {
                    var o = page.placeorder.order;
                    $("#ct_demo_tabs ul li" + uc.demo.listTypeMatch + "[id='quickPickupHeader']").removeClass("hidden");
                    message = String.format("Your quickpick {0} has been saved and is available moving forward behind the QuickPicks tab.", quickpickName);
                    uc.demo.LoadQuickPicks();
                } else {
                    message = String.format("Your quickpick {0} fail to be saved, error detail is {1}", quickpickName, result.ResultMessage);
                }
                uc.demo.ShowMyQuickpickError(true, message);
            },
            error: function(rep) {
                uc.demo.ShowMyQuickpickError(true, "Fail to save your quickpick.");
            },
            waitingElement: 'saveAsMyQuickpick'
        });
    },

    ShowMyQuickpickError: function(flag, errorMsg) {
        if (!flag) {
            jQuery("#myQuickpickError").addClass("hidden");
        } else {
            jQuery("#myQuickpickError").html(errorMsg);
            jQuery("#myQuickpickError").removeClass("hidden");
        }
    },

    MyQuickpickSelectsValue: {
        SelectedDemos: [],

        addDemo: function(iscategory, columnname, value, name, democategory, sortSeq) {
            var availableDemo = null;
            for (var i = 0; i < uc.demo.SelectsValue.SelectedDemos.length; i++) {
                if (uc.demo.SelectsValue.SelectedDemos[i].ColumnName == columnname && uc.demo.SelectsValue.SelectedDemos[i].DemoCategoryType == democategory) {
                    availableDemo = uc.demo.SelectsValue.SelectedDemos[i];
                    break;
                }
            }
            if (availableDemo == null) {
                return;
            }

            var demo = new entity.SelectedDemoCategory();
            var exists = false;
            for (var i = 0; i < uc.demo.MyQuickpickSelectsValue.SelectedDemos.length; i++) {
                if (uc.demo.MyQuickpickSelectsValue.SelectedDemos[i].ColumnName == columnname && uc.demo.MyQuickpickSelectsValue.SelectedDemos[i].DemoCategoryType == democategory) {
                    demo = uc.demo.MyQuickpickSelectsValue.SelectedDemos[i];
                    exists = true;
                    break;
                }
            }
            demo.ColumnName = availableDemo.ColumnName;
            demo.AttributeName = availableDemo.AttributeName;
            demo.DemoCategoryType = availableDemo.DemoCategoryType;
            if (iscategory) {
                uc.demo.MyQuickpickSelectsValue.cloneCategoryValues(availableDemo, demo);
            } else {
                var seq = sortSeq || 0;
                demo.addValue(value, name, seq);
            }

            if (!exists) {
                uc.demo.MyQuickpickSelectsValue.SelectedDemos.push(demo);
                framework.common.sortJson(uc.demo.MyQuickpickSelectsValue.SelectedDemos, "AttributeName", "asc");
            }
        },

        cloneCategoryValues: function(availableDemo, demo) {
            for (var j = 0; j < availableDemo.Values.length; j++) {
                var demoValue = new entity.SelectedDemoCategoryValue();
                availableDemoValue = availableDemo.Values[j];
                demoValue.ColumnName = availableDemoValue.ColumnName;
                demoValue.AttributeValue = availableDemoValue.AttributeValue;
                demoValue.AttributeValueName = availableDemoValue.AttributeValueName;
                demoValue.SortSeq = availableDemoValue.SortSeq;
                demo.Values.push(demoValue);
            }
        },

        removeDemo: function(iscategory, columnname, attrvalue, democategory) {
            uc.demo.MyQuickpickSelectsValue.SelectedDemos = $.grep(uc.demo.MyQuickpickSelectsValue.SelectedDemos, function(cat) {
                if (cat.ColumnName == columnname && cat.DemoCategoryType == democategory) {
                    if (iscategory) {
                        return false;
                    } else {
                        cat.removeValue(attrvalue);
                        if (cat.Values.length == 0) {
                            return false;
                        }
                    }
                }

                return true;
            });
        },

        /*** follow function for getting particual demos by DemoCategoryType ***/
        GetSelectedDemoByType: function(democategory) {
            var lists = [];
            for (var i = 0; i < uc.demo.MyQuickpickSelectsValue.SelectedDemos.length; i++) {
                if (uc.demo.MyQuickpickSelectsValue.SelectedDemos[i].DemoCategoryType == democategory) {
                    lists.push(uc.demo.MyQuickpickSelectsValue.SelectedDemos[i]);
                }
            }
            return lists;
        },

        RemoveByCategoryType: function(democategory) {
            uc.demo.MyQuickpickSelectsValue.SelectedDemos = $.grep(uc.demo.MyQuickpickSelectsValue.SelectedDemos, function(item) {
                return item.DemoCategoryType != democategory;
            });
        }


    },

    ShowMyQuickpick: function(element, isCharitableGiving) {
        uc.demo.SetErrorMessage(false);

        if (isCharitableGiving) {
            $("#qp_detail_info_title").text("Charitable Giving Information");
        }
        else {
            $("#qp_detail_info_title").text("My Quickpick Information");
        }

        var qpId = $(element).attr("qp");
        var qpType = $(element).attr("qpType");
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetQuickPickup",
            data: { id: qpId, qpType: qpType
            },
            success: function(result) {
                if (result.ResultFlag) {
                    $("#myQuickPickupInfo").setTemplateElement("myQuickPickupDetailsTemplate");
                    $("#myQuickPickupInfo").processTemplate(result.DataSource);
                    if (isCharitableGiving) {
                        $("#qp_detail_info_name").text("Name:");
                        $("#qp_detail_info_desc").text("Desc:");
                    }
                    else {
                        $("#qp_detail_info_name").text("Quickpick Name:");
                        $("#qp_detail_info_desc").text("Quickpick Desc:");
                    }
                    framework.ui.ShowDialog('myQuickPickupDetails', { fixedOnScroll: true, appendForm: true, css: { cursor: "default", top: '15%', left: '30%', border: '0px solid #aaa'} });
                } else {
                    uc.demo.SetErrorMessage(true, result.ResultMessage);
                }
            },
            error: function(rep) {
                uc.demo.SetErrorMessage(true, "Fail to check the quick pickup details.");
            },
            waitingElement: 'ct_demo_quickpickup_panels'
        });
    },

    RemoveMyQuickpick: function(element) {
        uc.demo.SetErrorMessage(false);
        if (!confirm("Are you sure to delete this quick pick?")) {
            return false;
        }
        var qpId = $(element).attr("qp");
        framework.common.Ajax({
            url: "PlaceOrder.aspx/RemoveQuickPick",
            data: { id: qpId },
            success: function(result) {
                if (result.ResultFlag) {
                    uc.demo.LoadQuickPicks();
                } else {
                    uc.demo.SetErrorMessage(true, "Fail to delete the quick pickup.");
                }
            },
            error: function(rep) {
                uc.demo.SetErrorMessage(true, "Fail to delete the quick pickup.");
            },
            waitingElement: 'ct_demo_quickpickup_panels'
        });
    },

    LoadAllAudiencePropensity: function() {
        var o = page.placeorder.order;
        framework.common.Ajax({
            url: "PlaceOrder.aspx/LoadAllAudiencePropensity",
            data: { listtype: o.ListType },
            success: function(result) {
                if (result.ResultFlag) {
                    $("#allAudiencePropensityInfo").setTemplateElement("allAudiencePropensityTemplate");
                    $("#allAudiencePropensityInfo").processTemplate(result.DataSource);
                } else {
                    uc.demo.SetErrorMessage(true, "Fail to load the audience propensity.");
                }
            },
            error: function(rep) {
                uc.demo.SetErrorMessage(true, "Fail to load the audience propensity.");
            },
            waitingElement: 'allAudiencePropensity'
        });
        jQuery("#view_all_audience_propensity a").colorbox({ inline: true, href: "#allAudiencePropensity", width: 600, height: 620, opacity: 0.5, scrolling: true });
        //framework.ui.ShowDialog('allAudiencePropensity', { fixedOnScroll: true, appendForm: true, css: { cursor: "default", top: '55%', left: '30%', border: '0px solid #aaa'} });

    }

};

/********************** Suppression Methods - Begin - *******************************/
uc.demo.suppression = {
    pagingOptions: null,
    getPriorOrderSuppressionIntial: false,
    custom_pagingOptions: null,
    customSuppressionIntial: false,
    saveCount_pagingOptions: null,
    saveCountSuppressionIntial: false,

    Init: function() {

        if (page.placeorder.order.SuppressionByDomain) {
            $("#suppression_by_domain").attr("checked", true);
        }
        else {
            $("#suppression_by_domain").removeAttr("checked");
        }

        if (uc.demo.AllowCustomDomainSuppression()) {
            $('#demo_regular_suppression').addClass("hidden");
            $('#demo_domain_suppression').removeClass("hidden");
            $('#days_domain_suppression').text(page.placeorder.Days_DomainSuppression);
            return;
        }
        else {
            $('#demo_regular_suppression').removeClass("hidden");
            $('#demo_domain_suppression').addClass("hidden");
        }

        var currentDate = new Date();
        var year = currentDate.getFullYear();
        var month = currentDate.getMonth() + 1;
        var day = currentDate.getDate();
        var startDate = String.format("{0}/{1}/{2}", month, day + 1, year - 1);
        var endDate = String.format("{0}/{1}/{2}", month, day + 1, year);
        //        $('#demo_suppression_range_start').datePicker({ startDate: startDate, endDate: endDate });
        //        $('#demo_suppression_range_end').datePicker({ startDate: startDate, endDate: endDate });
        //        $('#custom_suppression_range_start').datePicker({ startDate: startDate, endDate: endDate });
        //        $('#custom_suppression_range_end').datePicker({ startDate: startDate, endDate: endDate });
        $('#demo_suppression_range_start').datepicker({ minDate: startDate, maxDate: endDate });
        $('#demo_suppression_range_end').datepicker({ minDate: startDate, maxDate: endDate });
        $('#custom_suppression_range_start').datepicker({ minDate: startDate, maxDate: endDate });
        $('#custom_suppression_range_end').datepicker({ minDate: startDate, maxDate: endDate });
        $('#save_count_suppression_range_start').datepicker({ minDate: startDate, maxDate: endDate });
        $('#save_count_suppression_range_end').datepicker({ minDate: startDate, maxDate: endDate });
        $('#demo_suppression_range_start').css("float", "left");
        $('#demo_suppression_range_end').css("float", "left");
        $('#custom_suppression_range_start').css("float", "left");
        $('#custom_suppression_range_end').css("float", "left");
        $('#save_count_suppression_range_start').css("float", "left");
        $('#save_count_suppression_range_end').css("float", "left");
        $("#ui-datepicker-div").css("font-size", "11px");

        uc.demo.suppression.pagingOptions = new entity.PagingOptions();
        uc.demo.suppression.pagingOptions.PageSize = 12;
        uc.demo.suppression.pagingOptions.SortBy = "OrderDate";

        uc.demo.suppression.custom_pagingOptions = new entity.PagingOptions();
        uc.demo.suppression.custom_pagingOptions.PageSize = 12;
        uc.demo.suppression.custom_pagingOptions.SortBy = "OrderDate";

        uc.demo.suppression.saveCount_pagingOptions = new entity.PagingOptions();
        uc.demo.suppression.saveCount_pagingOptions.PageSize = 12;
        uc.demo.suppression.saveCount_pagingOptions.SortBy = "OrderDate";

        var o = page.placeorder.order;
        var suppressionType = o.SuppressionType;

        // begin: reset load suppression options  2012-12-12 jack
        if (suppressionType == entity.enums.SuppressionType.DATE || suppressionType == entity.enums.SuppressionType.ORDERLIST) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            //the two sentences below have dependence each other,do not change their sequence
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + suppressionType + "']").attr('checked', "checked");

        }
        else if (suppressionType == entity.enums.SuppressionType.CUSTOMORDER || suppressionType == entity.enums.SuppressionType.CUSTOMDATE) {
            jQuery("#demo_suppression_checkbox_customer").attr("checked", "checked");
            uc.demo.suppression.CustomerFileSuppressionOption_Click();
            jQuery(":radio[name='custom-suppression-option']").filter("[value='" + suppressionType + "']").attr('checked', "checked");

        }
        else if (suppressionType == entity.enums.SuppressionType.SAVEDCOUNTORDER || suppressionType == entity.enums.SuppressionType.SAVEDCOUNTDATA) {
            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + suppressionType + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.DATE_CUSTOMORDERS) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.DATE + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_customer").attr("checked", "checked");
            uc.demo.suppression.CustomerFileSuppressionOption_Click();
            jQuery(":radio[name='custom-suppression-option']").filter("[value='" + entity.enums.SuppressionType.CUSTOMORDER + "']").attr('checked', "checked");

        }
        else if (suppressionType == entity.enums.SuppressionType.DATE_CUSTOMDATE) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.DATE + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_customer").attr("checked", "checked");
            uc.demo.suppression.CustomerFileSuppressionOption_Click();
            jQuery(":radio[name='custom-suppression-option']").filter("[value='" + entity.enums.SuppressionType.CUSTOMDATE + "']").attr('checked', "checked");

        }
        else if (suppressionType == entity.enums.SuppressionType.ORDERLIST_CUSTOMORDERS) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.ORDERLIST + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_customer").attr("checked", "checked");
            uc.demo.suppression.CustomerFileSuppressionOption_Click();
            jQuery(":radio[name='custom-suppression-option']").filter("[value='" + entity.enums.SuppressionType.CUSTOMORDER + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.ORDERLIST_CUSTOMDATE) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.ORDERLIST + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_customer").attr("checked", "checked");
            uc.demo.suppression.CustomerFileSuppressionOption_Click();
            jQuery(":radio[name='custom-suppression-option']").filter("[value='" + entity.enums.SuppressionType.CUSTOMDATE + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.DATE_SAVEDCOUNTORDER) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.DATE + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTORDER + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.DATE_SAVEDCOUNTDATA) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.DATE + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTDATA + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.ORDERLIST_SAVEDCOUNTORDER) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.ORDERLIST + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTORDER + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.ORDERLIST_SAVEDCOUNTDATA) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.ORDERLIST + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTDATA + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.SAVEDCOUNTDATA_CUSTOMORDERS) {
            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTDATA + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_customer").attr("checked", "checked");
            uc.demo.suppression.CustomerFileSuppressionOption_Click();
            jQuery(":radio[name='custom-suppression-option']").filter("[value='" + entity.enums.SuppressionType.CUSTOMORDER + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.SAVEDCOUNTDATA_CUSTOMDATE) {
            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTDATA + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_customer").attr("checked", "checked");
            uc.demo.suppression.CustomerFileSuppressionOption_Click();
            jQuery(":radio[name='custom-suppression-option']").filter("[value='" + entity.enums.SuppressionType.CUSTOMDATE + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.SAVEDCOUNTORDER_CUSTOMORDERS) {
            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTORDER + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_customer").attr("checked", "checked");
            uc.demo.suppression.CustomerFileSuppressionOption_Click();
            jQuery(":radio[name='custom-suppression-option']").filter("[value='" + entity.enums.SuppressionType.CUSTOMORDER + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.SAVEDCOUNTORDER_CUSTOMDATE) {
            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTORDER + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_customer").attr("checked", "checked");
            uc.demo.suppression.CustomerFileSuppressionOption_Click();
            jQuery(":radio[name='custom-suppression-option']").filter("[value='" + entity.enums.SuppressionType.CUSTOMDATE + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.DATE_CDATE_SDATE) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.DATE + "']").attr('checked', "checked");


            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTDATA + "']").attr('checked', "checked");


            jQuery("#demo_suppression_checkbox_customer").attr("checked", "checked");
            uc.demo.suppression.CustomerFileSuppressionOption_Click();
            jQuery(":radio[name='custom-suppression-option']").filter("[value='" + entity.enums.SuppressionType.CUSTOMDATE + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.DATE_CDATE_SORDER) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.DATE + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_customer").attr("checked", "checked");
            uc.demo.suppression.CustomerFileSuppressionOption_Click();
            jQuery(":radio[name='custom-suppression-option']").filter("[value='" + entity.enums.SuppressionType.CUSTOMDATE + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTORDER + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.DATE_CORDER_SDATE) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.DATE + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTDATA + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTORDER + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.DATE_CORDER_SORDER) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.DATE + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTORDER + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_customer").attr("checked", "checked");
            uc.demo.suppression.CustomerFileSuppressionOption_Click();
            jQuery(":radio[name='custom-suppression-option']").filter("[value='" + entity.enums.SuppressionType.CUSTOMORDER + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.OL_CDATE_SDATE) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.ORDERLIST + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTDATA + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_customer").attr("checked", "checked");
            uc.demo.suppression.CustomerFileSuppressionOption_Click();
            jQuery(":radio[name='custom-suppression-option']").filter("[value='" + entity.enums.SuppressionType.CUSTOMDATE + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.OL_CDATE_SORDER) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.ORDERLIST + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTORDER + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTDATA + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.OL_CORDER_SDATE) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.ORDERLIST + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_customer").attr("checked", "checked");
            uc.demo.suppression.CustomerFileSuppressionOption_Click();
            jQuery(":radio[name='custom-suppression-option']").filter("[value='" + entity.enums.SuppressionType.CUSTOMORDER + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTDATA + "']").attr('checked', "checked");
        }
        else if (suppressionType == entity.enums.SuppressionType.OL_CORDER_SORDER) {
            jQuery("#demo_suppression_checkbox_prior_order").attr("checked", "checked");
            uc.demo.suppression.PriorOrderSuppressionOption_Click();
            jQuery(":radio[name='suppression-option']").filter("[value='" + entity.enums.SuppressionType.ORDERLIST + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_save_count").attr("checked", "checked");
            uc.demo.suppression.SavedListCountSuppressionOption_Click();
            jQuery(":radio[name='save-count-suppression-option']").filter("[value='" + entity.enums.SuppressionType.SAVEDCOUNTORDER + "']").attr('checked', "checked");

            jQuery("#demo_suppression_checkbox_customer").attr("checked", "checked");
            uc.demo.suppression.CustomerFileSuppressionOption_Click();
            jQuery(":radio[name='custom-suppression-option']").filter("[value='" + entity.enums.SuppressionType.CUSTOMORDER + "']").attr('checked', "checked");
        }

        if (suppressionType == entity.enums.SuppressionType.DATE || suppressionType == entity.enums.SuppressionType.DATE_CUSTOMORDERS || suppressionType == entity.enums.SuppressionType.DATE_SAVEDCOUNTORDER ||
        suppressionType == entity.enums.SuppressionType.DATE_CORDER_SORDER) {
            if (o.SuppressionStartDate && o.SuppressionEndDate) {
                $('#demo_suppression_range_start').val(Ext.util.Format.date(o.SuppressionStartDate));
                $('#demo_suppression_range_end').val(Ext.util.Format.date(o.SuppressionEndDate));
                o.OrderSuppressions = [];
            }
        }


        if (suppressionType == entity.enums.SuppressionType.CUSTOMDATE || suppressionType == entity.enums.SuppressionType.ORDERLIST_CUSTOMDATE || suppressionType == entity.enums.SuppressionType.SAVEDCOUNTORDER_CUSTOMDATE ||
        suppressionType == entity.enums.SuppressionType.OL_CDATE_SORDER) {
            if (o.CustomSuppressionStartDate && o.CustomSuppressionEndDate) {
                $('#custom_suppression_range_start').val(Ext.util.Format.date(o.CustomSuppressionStartDate));
                $('#custom_suppression_range_end').val(Ext.util.Format.date(o.CustomSuppressionEndDate));
                o.CustomSuppressions = [];
            }
        }

        if (suppressionType == entity.enums.SuppressionType.SAVEDCOUNTDATA || suppressionType == entity.enums.SuppressionType.ORDERLIST_SAVEDCOUNTDATA || suppressionType == entity.enums.SuppressionType.SAVEDCOUNTDATA_CUSTOMORDERS ||
        suppressionType == entity.enums.SuppressionType.OL_CORDER_SDATE) {
            if (o.SaveCountSuppressionStartDate && o.SaveCountSuppressionEndDate) {
                $('#save_count_suppression_range_start').val(Ext.util.Format.date(o.SaveCountSuppressionStartDate));
                $('#save_count_suppression_range_end').val(Ext.util.Format.date(o.SaveCountSuppressionEndDate));
                o.SaveCountSuppressions = [];
            }
        }

        if (o.AllSuppressionChecked && (suppressionType == entity.enums.SuppressionType.ORDERLIST || suppressionType == entity.enums.SuppressionType.ORDERLIST_CUSTOMDATE || suppressionType == entity.enums.SuppressionType.ORDERLIST_CUSTOMORDERS
        || suppressionType == entity.enums.SuppressionType.ORDERLIST_SAVEDCOUNTORDER || suppressionType == entity.enums.SuppressionType.ORDERLIST_SAVEDCOUNTDATA
        || suppressionType == entity.enums.SuppressionType.OL_CDATE_SDATE || suppressionType == entity.enums.SuppressionType.OL_CDATE_SORDER || suppressionType == entity.enums.SuppressionType.OL_CORDER_SDATE || suppressionType == entity.enums.SuppressionType.OL_CORDER_SORDER)) {
            $("#suppression_addallbox").attr("checked", "checked");
        }

        if (o.AllCustomSuppressionChecked && (suppressionType == entity.enums.SuppressionType.CUSTOMORDER || suppressionType == entity.enums.SuppressionType.DATE_CUSTOMORDERS || suppressionType == entity.enums.SuppressionType.ORDERLIST_CUSTOMORDERS
        || suppressionType == entity.enums.SuppressionType.SAVEDCOUNTDATA_CUSTOMORDERS || suppressionType == entity.enums.SuppressionType.SAVEDCOUNTORDER_CUSTOMORDERS
        || suppressionType == entity.enums.SuppressionType.DATE_CORDER_SDATE || suppressionType == entity.enums.SuppressionType.DATE_CORDER_SORDER || suppressionType == entity.enums.SuppressionType.OL_CORDER_SDATE || suppressionType == entity.enums.SuppressionType.OL_CORDER_SORDER)) {
            $("#custom_addallbox").attr("checked", "checked");
        }

        if (o.AllSaveCountSuppressionChecked && (suppressionType == entity.enums.SuppressionType.SAVEDCOUNTORDER || suppressionType == entity.enums.SuppressionType.DATE_SAVEDCOUNTORDER || suppressionType == entity.enums.SuppressionType.ORDERLIST_SAVEDCOUNTORDER
        || suppressionType == entity.enums.SuppressionType.SAVEDCOUNTORDER_CUSTOMORDERS || suppressionType == entity.enums.SuppressionType.SAVEDCOUNTORDER_CUSTOMDATE
        || suppressionType == entity.enums.SuppressionType.DATE_CDATE_SORDER || suppressionType == entity.enums.SuppressionType.DATE_CORDER_SORDER || suppressionType == entity.enums.SuppressionType.OL_CDATE_SORDER || suppressionType == entity.enums.SuppressionType.OL_CORDER_SORDER)) {
            $("#save_count_suppression_addallbox").attr("checked", "checked");
        }


        uc.demo.suppression.SuppressionOption_Click();
        uc.demo.suppression.GetSuppressionList();
        uc.demo.suppression.BindSelectedSuppressions();

        uc.demo.suppression.CustomSuppressionOption_Click();
        uc.demo.suppression.GetCustomSuppressions();
        uc.demo.suppression.BindSelectedCustomSuppressions();


        uc.demo.suppression.SaveCountSuppressionOption_Click();
        uc.demo.suppression.GetSaveCountSuppressionList();
        uc.demo.suppression.BindSelectedSaveCountSuppressions();
        // end: reset load suppression options  2012-12-12 jack
    },

    AutoLoadSuppression: function() {
        var accountId = page.placeorder.order.AccountId;
        framework.common.Ajax({
            url: "/PlaceOrder.aspx/GetSuppressionsByDatasource",
            data: { accountId: accountId, listType: page.placeorder.order.ListType },
            success: function(result) {
                if (result.DataSource.isenable == false) {
                    $("#customsupp_pan").remove();
                }
                if (result.ResultFlag == true) {
                    page.placeorder.order.OrderSuppressions = result.DataSource.suppression;
                    page.placeorder.order.SuppressionType = entity.enums.SuppressionType.ORDERLIST;
                    uc.demo.suppression.BindSelectedSuppressions();
                }
            },
            error: function(rep) {
                uc.demo.SetErrorMessage(rep);
            },
            waitingElement: 'Landing_OrderHistory'
        });
    },

    GetCustomSuppressions: function(pagingOptions) {
        if (!uc.demo.suppression.customSuppressionIntial) {

            if (pagingOptions == null || pagingOptions == window.undefined) {
                pagingOptions = uc.demo.suppression.custom_pagingOptions;
            }


            framework.common.Ajax({
                url: "/PlaceOrder.aspx/GetCustomSuppressions",
                data: { listtype: page.placeorder.order.ListType, pagingOptions: pagingOptions },
                success: function(result) {
                    if (result.ResultFlag == true) {
                        if (result.DataSource.Items != null && result.DataSource.Items.length > 0) {
                            // attach the template
                            $("#myCustomOrders").setTemplateElement("customSuppressionTemplate");

                            // process the template
                            $("#myCustomOrders").processTemplate(result.DataSource.Items);

                            //jQuery("#custom_suppression_radio_list_panel").removeClass("hidden");
                            //uc.demo.suppression.CustomerFileSuppressionOption_Click();

                            uc.demo.suppression.custom_InitPagingBar(result.DataSource.TotalRecordCount);

                        } else {
                            jQuery("#custom_suppression_radio_list_panel").addClass("hidden");
                        }
                        uc.demo.suppression.customSuppressionIntial = true;
                    } else {
                        uc.demo.SetErrorMessage(true, result.ResultMessage);
                    }
                },
                error: function(rep) {
                    uc.demo.SetErrorMessage(rep);
                },
                waitingElement: 'ct_suppression_panels'
            });
        }
    },

    SerachSuppressionList: function() {
        uc.demo.suppression.getPriorOrderSuppressionIntial = false;
        uc.demo.suppression.GetSuppressionList();
    },

    SerachCustomSuppressionList: function() {
        uc.demo.suppression.customSuppressionIntial = false;
        uc.demo.suppression.GetCustomSuppressions();
    },

    SerachSaveCountSuppressionList: function() {
        uc.demo.suppression.saveCountSuppressionIntial = false;
        uc.demo.suppression.GetSaveCountSuppressionList();
    },

    GetSuppressionList: function(pagingOptions) {
        //if loaded suppression list, no need load again 2012-12-12 jack 
        if (!uc.demo.suppression.getPriorOrderSuppressionIntial) {
            var accountId = page.placeorder.order.AccountId;
            if (accountId == null) {
                accountId = 0;
            }

            var orderName = jQuery('#demo_suppression_search_ordername').val();
            var orderNumber = jQuery('#demo_suppression_search_ordernumber').val();


            if (pagingOptions == null || pagingOptions == window.undefined) {
                pagingOptions = uc.demo.suppression.pagingOptions;
            }

            framework.common.Ajax({
                url: "/PlaceOrder.aspx/GetSuppressionList",
                data: { accountId: accountId, pagingOptions: pagingOptions, listtype: page.placeorder.order.ListType, orderName: orderName, orderNumber: orderNumber },
                success: function(result) {
                    if (result.ResultFlag == true) {
                        // attach the template
                        $("#demo_suppression_order_list").setTemplateElement("demo_suppression_order_list_template");

                        // process the template
                        $("#demo_suppression_order_list").processTemplate(result.DataSource.Items);

                        uc.demo.suppression.InitPagingBar(result.DataSource.TotalRecordCount);
                        uc.demo.suppression.getPriorOrderSuppressionIntial = true;
                    } else {
                        uc.demo.SetErrorMessage(true, result.ResultMessage);
                    }
                },
                error: function(rep) {
                    uc.demo.SetErrorMessage(rep);
                },
                waitingElement: 'ct_suppression_panels'
            });
        }
    },

    SearchOrder: function(el) {
        var pagingOptions = uc.demo.suppression.pagingOptions;

        var exp = $(el).attr("sortexpression");
        if (pagingOptions.SortBy == exp) {
            pagingOptions.SortDescending = !pagingOptions.SortDescending;
        } else {
            pagingOptions.SortDescending = true;
        }
        pagingOptions.SortBy = $(el).attr("sortexpression");
        uc.demo.suppression.getPriorOrderSuppressionIntial = false;
        uc.demo.suppression.GetSuppressionList(pagingOptions);
    },

    pageselectCallback: function(page_id, jq) {
        var pagingOptions = uc.demo.suppression.pagingOptions;
        pagingOptions.PageNumber = page_id + 1;
        uc.demo.suppression.getPriorOrderSuppressionIntial = false;
        uc.demo.suppression.GetSuppressionList(pagingOptions);
    },

    _IsInitPagingBar: false,
    InitPagingBar: function(totalcount) {
        if (!uc.demo.suppression._IsInitPagingBar || uc.demo.suppression.pagingOptions.TotalRecordCount != totalcount) {
            uc.demo.suppression._IsInitPagingBar = true;
            uc.demo.suppression.pagingOptions.TotalRecordCount = totalcount;
            jQuery("#demo_suppression_pagination").pagination(totalcount, {
                first_text: "First",
                prev_text: "Prev",
                next_text: "Next",
                last_text: "Last",
                ellipse_text: " ",
                num_edge_entries: 2,
                num_display_entries: 6,
                items_per_page: uc.demo.suppression.pagingOptions.PageSize,
                callback: uc.demo.suppression.pageselectCallback
            });
        }
    },


    custom_pageselectCallback: function(page_id, jq) {
        var pagingOptions = uc.demo.suppression.pagingOptions;
        pagingOptions.PageNumber = page_id + 1;
        uc.demo.suppression.customSuppressionIntial = false;
        uc.demo.suppression.GetCustomSuppressions(pagingOptions);
    },

    custom_IsInitPagingBar: false,
    custom_InitPagingBar: function(totalcount) {
        if (!uc.demo.suppression.custom_IsInitPagingBar || uc.demo.suppression.custom_pagingOptions.TotalRecordCount != totalcount) {
            uc.demo.suppression.custom_IsInitPagingBar = true;
            uc.demo.suppression.custom_pagingOptions.TotalRecordCount = totalcount;
            jQuery("#custom_suppression_pagination").pagination(totalcount, {
                first_text: "First",
                prev_text: "Prev",
                next_text: "Next",
                last_text: "Last",
                ellipse_text: " ",
                num_edge_entries: 2,
                num_display_entries: 6,
                items_per_page: uc.demo.suppression.custom_pagingOptions.PageSize,
                callback: uc.demo.suppression.custom_pageselectCallback
            });
        }
    },

    GetSaveCountSuppressionList: function(pagingOptions) {
        if (!uc.demo.suppression.saveCountSuppressionIntial) {
            var accountId = page.placeorder.order.AccountId;
            if (accountId == null) {
                accountId = 0;
            }

            var countName = jQuery('#save_count_suppression_search_name').val();
            var countNumber = jQuery('#save_count_suppression_search_number').val();

            if (pagingOptions == null || pagingOptions == window.undefined) {
                pagingOptions = uc.demo.suppression.saveCount_pagingOptions;
            }

            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetSaveCountSuppressionList",
                data: { pagingOptions: pagingOptions, accountId: accountId, listType: page.placeorder.order.ListType, countName: countName, countNumber: countNumber },
                success: function(result) {
                    if (result.ResultFlag) {
                        if (result.DataSource.Items != null && result.DataSource.Items.length > 0) {
                            uc.demo.SetErrorMessage(false);
                            $("#demo_suppression_save_count").setTemplateElement("saveCountSuppressionTemplate");
                            $("#demo_suppression_save_count").processTemplate(result.DataSource.Items);

                            uc.demo.suppression.saveCount_InitPagingBar(result.DataSource.TotalRecordCount);
                            uc.demo.suppression.saveCountSuppressionIntial = true;
                        } else {
                            $("#demo_suppression_save_count").html('');
                            if ((!String.IsNullOrEmpty(countName)) || (!String.IsNullOrEmpty(countNumber))) {
                                uc.demo.SetErrorMessage(true, "There is no save count lists for suppression.");
                            }
                        }

                    } else {
                        uc.demo.SetErrorMessage(true, result.ResultMessage);
                    }
                },
                error: function(rep) {
                    uc.demo.SetErrorMessage(rep);
                },
                waitingElement: 'ct_suppression_panels'
            });
        }
    },

    SerachSaveCount: function(el) {
        var pagingOptions = uc.demo.suppression.saveCount_pagingOptions;
        var exp = $(el).attr("sortexpression");
        if (pagingOptions.SortBy == exp) {
            pagingOptions.SortDescending = !pagingOptions.SortDescending;
        } else {
            pagingOptions.SortDescending = true;
        }
        pagingOptions.SortBy = $(el).attr("sortexpression");
        uc.demo.suppression.saveCountSuppressionIntial = false;
        uc.demo.suppression.GetSaveCountSuppressionList(pagingOptions);
    },

    saveCount_IsInitPagingBar: false,
    saveCount_InitPagingBar: function(totalCount) {
        if (!uc.demo.suppression.saveCount_IsInitPagingBar || uc.demo.suppression.saveCount_pagingOptions.TotalRecordCount != totalCount) {
            uc.demo.suppression.saveCount_IsInitPagingBar = true;
            uc.demo.suppression.saveCount_pagingOptions.TotalRecordCount = totalCount;
            jQuery("#save_count_suppression_pagination").pagination(totalCount, {
                first_text: "First",
                prev_text: "Prev",
                next_text: "Next",
                last_text: "Last",
                ellipse_text: " ",
                num_edge_entries: 2,
                num_display_entries: 6,
                items_per_page: uc.demo.suppression.saveCount_pagingOptions.PageSize,
                callback: uc.demo.suppression.saveCount_pageselectCallback
            });
        }
    },

    saveCount_pageselectCallback: function(page_id, jq) {
        var pagingOptions = uc.demo.suppression.saveCount_pagingOptions;
        pagingOptions.PageNumber = page_id + 1;
        uc.demo.suppression.saveCountSuppressionIntial = false;
        uc.demo.suppression.GetSaveCountSuppressionList(pagingOptions);
    },

    SuppressionOption_Click: function() {
        var suppression = jQuery("input[type='radio'][name='suppression-option']:checked").val();
        jQuery('#demo_suppression_radio_range_panel').addClass("hidden");
        jQuery('#demo_suppression_radio_list_panel').addClass("hidden");
        jQuery('#suppression_addall').addClass("hidden");

        if (suppression == entity.enums.SuppressionType.DATE) {
            jQuery('#demo_suppression_radio_range_panel').removeClass("hidden");
            jQuery('#suppression_addall').addClass("hidden");
        } else if (suppression == entity.enums.SuppressionType.ORDERLIST) {
            jQuery('#demo_suppression_radio_list_panel').removeClass("hidden");
            jQuery('#suppression_addall').removeClass("hidden");
        }

    },

    CustomSuppressionOption_Click: function() {
        var suppression = jQuery("input[type='radio'][name='custom-suppression-option']:checked").val();
        jQuery('#custom_suppression_radio_list_panel').addClass("hidden");
        jQuery('#custom_suppression_radio_range_panel').addClass("hidden");
        jQuery('#custom_addall').addClass("hidden");

        if (suppression == entity.enums.SuppressionType.CUSTOMORDER) {
            jQuery('#custom_suppression_radio_list_panel').removeClass("hidden");
            jQuery('#custom_addall').removeClass("hidden");
        } else if (suppression == entity.enums.SuppressionType.CUSTOMDATE) {
            jQuery('#custom_suppression_radio_range_panel').removeClass("hidden");
            jQuery('#custom_addall').addClass("hidden");
        }

    },

    SaveCountSuppressionOption_Click: function() {
        var suppressionType = jQuery("input[type='radio'][name='save-count-suppression-option']:checked").val();
        jQuery('#save_count_suppression_radio_range_panel').addClass("hidden");
        jQuery('#save_count_suppression_radio_list_panel').addClass("hidden");
        jQuery('#save_count_suppression_addall').addClass("hidden");

        if (suppressionType == entity.enums.SuppressionType.SAVEDCOUNTORDER) {
            jQuery('#save_count_suppression_radio_list_panel').removeClass("hidden");
            jQuery('#save_count_suppression_addall').removeClass("hidden");
        } else if (suppressionType == entity.enums.SuppressionType.SAVEDCOUNTDATA) {
            jQuery('#save_count_suppression_radio_range_panel').removeClass("hidden");
        }
    },

    AddSuppression_Click: function(element) {
        var o = page.placeorder.order;
        var $el = $(element);
        var ordercode = $el.attr("ordercode");
        var orderdesc = $el.attr("orderdesc");
        var orderid = $el.attr("orderid");

        if (o.OrderSuppressions == null) {
            o.OrderSuppressions = [];
        }

        for (var i = 0; i < o.OrderSuppressions.length; i++) {
            if (o.OrderSuppressions[i].SuppressedOrderId == orderid) {
                return;
            }
        }

        var supp = new entity.OrderSuppression();
        supp.SuppressedOrderId = orderid;
        supp.SuppressionName = orderdesc;
        supp.SuppressionValue = ordercode;
        supp.SuppressedOrderCode = ordercode;
        supp.OriginalOrderId = orderid;
        supp.SuppressedOrderDesc = orderdesc;

        o.OrderSuppressions.push(supp);

        uc.demo.suppression.BindSelectedSuppressions();

    },

    AddAllSuppressionOrder: function() {
        var o = page.placeorder.order;
        o.AllSuppressionChecked = $("#suppression_addallbox").is(":checked");

        if (!o.AllSuppressionChecked) {
            o.OrderSuppressions = null;
        }
    },

    AddAllCustomSuppressionOrder: function() {
        var o = page.placeorder.order;
        o.AllCustomSuppressionChecked = $("#custom_addallbox").is(":checked");

        if (!o.AllCustomSuppressionChecked) {
            o.CustomSuppressions = null;
        }
    },

    AddAllSuppressionSaveCount: function() {
        var o = page.placeorder.order;
        o.AllSaveCountSuppressionChecked = $("#save_count_suppression_addallbox").is(":checked");

        if (!o.AllSaveCountSuppressionChecked) {
            o.SaveCountSuppressions = null;
        }
    },

    RemoveSuppression_Click: function(element) {
        var o = page.placeorder.order;
        var $el = $(element);
        var orderid = $el.attr("orderid");

        o.OrderSuppressions = $.grep(o.OrderSuppressions, function(item) {
            return item.SuppressedOrderId != orderid;
        });

        uc.demo.suppression.BindSelectedSuppressions();

    },

    BindSelectedSuppressions: function() {
        var o = page.placeorder.order;
        if (o.OrderSuppressions == null) {
            o.OrderSuppressions = [];
        }

        if (!o.AllSuppressionChecked) {
            // attach the template
            $("#demo_suppression_selected_order_list").setTemplateElement("demo_suppression_selected_order_list_template");

            // process the template
            $("#demo_suppression_selected_order_list").processTemplate(o.OrderSuppressions);
        }


    },

    AddCustomSuppression: function(element) {
        var o = page.placeorder.order;
        var $el = $(element);
        var name = $el.attr("suppressionname");
        var value = $el.attr("suppressionvalue");
        var orderDate = $el.attr("orderdate");
        var desc = $el.attr("suppressiondesc");

        if (o.CustomSuppressions == null) {
            o.CustomSuppressions = [];
        }

        for (var i = 0; i < o.CustomSuppressions.length; i++) {
            if (o.CustomSuppressions[i].SuppressionValue == value) {
                return;
            }
        }

        var supp = new entity.OrderCustomSuppression();
        supp.SuppressionName = name;
        supp.SuppressionValue = value;
        supp.OrderDate = orderDate;
        supp.FileName = desc;
        o.CustomSuppressions.push(supp);

        uc.demo.suppression.BindSelectedCustomSuppressions();

    },

    RemoveCustomSuppression: function(element) {
        var o = page.placeorder.order;
        var $el = $(element);
        var value = $el.attr("suppressionvalue");

        o.CustomSuppressions = $.grep(o.CustomSuppressions, function(item) {
            return item.SuppressionValue != value;
        });

        uc.demo.suppression.BindSelectedCustomSuppressions();

    },

    BindSelectedCustomSuppressions: function() {
        var o = page.placeorder.order;
        if (o.CustomSuppressions == null) {
            o.CustomSuppressions = [];
        }

        if (!o.AllCustomSuppressionChecked) {
            // attach the template
            $("#mySelectedCustomOrders").setTemplateElement("customSuppressionSelectedTemplate");

            // process the template
            $("#mySelectedCustomOrders").processTemplate(o.CustomSuppressions);
        }
    },

    AddSaveCountSuppression_Click: function(element) {
        var o = page.placeorder.order;
        var $el = $(element);
        var ordercode = $el.attr("ordercode");
        var orderdesc = $el.attr("orderdesc");
        var orderid = $el.attr("orderid");
        var countid = $el.attr("countid");
        if (o.SaveCountSuppressions == null) {
            o.SaveCountSuppressions = [];
        }

        for (var i = 0; i < o.SaveCountSuppressions.length; i++) {
            if (o.SaveCountSuppressions[i].SuppressedCountId == orderid) {
                return;
            }
        }

        var supp = new entity.SaveCountSuppression();
        supp.SuppressedCountId = orderid;
        supp.SuppressionName = orderdesc;
        supp.SuppressionValue = countid;
        supp.SuppressedCountCode = ordercode;
        supp.OriginalCountId = orderid;
        supp.SuppressedCountDesc = orderdesc;

        o.SaveCountSuppressions.push(supp);

        uc.demo.suppression.BindSelectedSaveCountSuppressions();
    },

    RemoveSaveCountSuppression: function(element) {
        var o = page.placeorder.order;
        var $el = $(element);
        var orderid = $el.attr("orderid");

        o.SaveCountSuppressions = $.grep(o.SaveCountSuppressions, function(item) {
            return item.SuppressedCountId != orderid;
        });

        uc.demo.suppression.BindSelectedSaveCountSuppressions();
    },

    BindSelectedSaveCountSuppressions: function() {
        var o = page.placeorder.order;
        if (o.SaveCountSuppressions == null) {
            o.SaveCountSuppressions = [];
        }

        if (!o.AllSaveCountSuppressionChecked) {

            $("#demo_suppression_select_save_count").setTemplateElement("saveCountSuppressionSelectedTemplate");
            $("#demo_suppression_select_save_count").processTemplate(o.SaveCountSuppressions);
        }
    },

    // begin: reset suppression options  2012-12-12 jack
    PriorOrderSuppressionOption_Click: function() {
        jQuery("#suppression_addall").addClass("hidden");
        jQuery("input[type='radio'][name='suppression-option']").removeAttr("checked");

        var o = page.placeorder.order;
        var checkOption = jQuery("#demo_suppression_checkbox_prior_order");
        if (checkOption.is(":checked")) {
            jQuery("#div_prior_order_suppression").removeClass("hidden");
        }
        else {
            jQuery("#div_prior_order_suppression").addClass("hidden");
            jQuery('#demo_suppression_radio_range_panel').addClass("hidden");
            jQuery('#demo_suppression_radio_list_panel').addClass("hidden");

            o.OrderSuppressions = null;
            o.SuppressionType = entity.enums.SuppressionType.NONE;
        }
    },

    CustomerFileSuppressionOption_Click: function() {
        jQuery("#custom_addall").addClass("hidden");
        jQuery("input[type='radio'][name='custom-suppression-option']").removeAttr("checked");

        var o = page.placeorder.order;
        var checkOption = jQuery("#demo_suppression_checkbox_customer");
        if (checkOption.is(":checked")) {
            jQuery("#customer_file_suppression").removeClass("hidden");
        }
        else {
            jQuery("#customer_file_suppression").addClass("hidden");
            jQuery('#custom_suppression_radio_list_panel').addClass("hidden");
            jQuery('#custom_suppression_radio_range_panel').addClass("hidden");

            o.CustomSuppressions = null;
            o.SuppressionType = entity.enums.SuppressionType.NONE;
        }
    },

    SavedListCountSuppressionOption_Click: function() {
        jQuery("#save_count_suppression_addall").addClass("hidden");
        jQuery("input[type='radio'][name='save-count-suppression-option']").removeAttr("checked");

        var o = page.placeorder.order;
        var checkOption = jQuery("#demo_suppression_checkbox_save_count");
        if (checkOption.is(":checked")) {
            jQuery("#save_count_suppression").removeClass("hidden");
        } else {
            jQuery("#save_count_suppression").addClass("hidden");
            jQuery('#save_count_suppression_radio_range_panel').addClass("hidden");
            jQuery('#save_count_suppression_radio_list_panel').addClass("hidden");

            o.SaveCountSuppressions = null;
            o.SuppressionType = entity.enums.SuppressionType.NONE;
        }
    }

    // end: reset suppression options 2012-12-12 jack
};
/********************** Suppression Methods - End -   *******************************/

/********************** Multi Saved Count Methods - Bgein -   *******************************/

uc.demo.multicount = {
    MultiSaveCount_pagingOptions: null,
    MultiSaveCountInit: false,
    MultiSaveCount_IsInitPagingBar: false,
    
    Init: function(){
        uc.demo.multicount.MultiSaveCount_pagingOptions = new entity.PagingOptions();
        uc.demo.multicount.MultiSaveCount_pagingOptions.PageSize = 12;
        uc.demo.multicount.MultiSaveCount_pagingOptions.SortBy = "OrderDate";
        
        uc.demo.multicount.LoadSaveCountList();
        uc.demo.multicount.BindSelectedMultiSaveCount();
    },
    
    LoadSaveCountList: function(pagingOptions){
        if (!uc.demo.multicount.MultiSaveCountInit) {
            var accountId = page.placeorder.order.AccountId;
            if (accountId == null) {
                accountId = 0;
            }

            var countName = jQuery('#multi_save_count_search_name').val();
            var countNumber = jQuery('#multi_save_count_search_number').val();

            if (pagingOptions == null || pagingOptions == window.undefined) {
                pagingOptions = uc.demo.multicount.MultiSaveCount_pagingOptions;
            }

            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetSaveCountSuppressionList",
                data: { pagingOptions: pagingOptions, accountId: accountId, listType: page.placeorder.order.ListType, countName: countName, countNumber: countNumber },
                success: function(result) {
                    if (result.ResultFlag) {
                        if (result.DataSource.Items != null && result.DataSource.Items.length > 0) {
                            uc.demo.SetErrorMessage(false);
                            $("#multi_save_count").setTemplateElement("MultiSaveCountTemplate");
                            $("#multi_save_count").processTemplate(result.DataSource.Items);

                            uc.demo.multicount.MultiSaveCount_InitPagingBar(result.DataSource.TotalRecordCount);
                            uc.demo.multicount.MultiSaveCountInit = true;
                        } else {
                            $("#multi_save_count").html('');
                            if ((!String.IsNullOrEmpty(countName)) || (!String.IsNullOrEmpty(countNumber))) {
                                uc.demo.SetErrorMessage(true, "There is no save count lists.");
                            }
                        }

                    } else {
                        uc.demo.SetErrorMessage(true, result.ResultMessage);
                    }
                },
                error: function(rep) {
                    uc.demo.SetErrorMessage(rep);
                },
                waitingElement: 'demo_multi_saved_count_list'
            });
        }
    },    
    
    MultiSaveCount_InitPagingBar: function(totalCount) {
        if (!uc.demo.multicount.MultiSaveCount_IsInitPagingBar || uc.demo.multicount.MultiSaveCount_pagingOptions.TotalRecordCount != totalCount) {
            uc.demo.multicount.MultiSaveCount_IsInitPagingBar = true;
            uc.demo.multicount.MultiSaveCount_pagingOptions.TotalRecordCount = totalCount;
            jQuery("#multi_save_count_pagination").pagination(totalCount, {
                first_text: "First",
                prev_text: "Prev",
                next_text: "Next",
                last_text: "Last",
                ellipse_text: " ",
                num_edge_entries: 2,
                num_display_entries: 6,
                items_per_page: uc.demo.multicount.MultiSaveCount_pagingOptions.PageSize,
                callback: uc.demo.multicount.MultiSaveCount_pageselectCallback
            });
        }
    },

    MultiSaveCount_pageselectCallback: function(page_id, jq) {
        var pagingOptions = uc.demo.multicount.MultiSaveCount_pagingOptions;
        pagingOptions.PageNumber = page_id + 1;
        uc.demo.multicount.MultiSaveCountInit = false;
        uc.demo.multicount.LoadSaveCountList(pagingOptions);
    },
    
    AddMultiSaveCount_Click: function(element) {
        var o = page.placeorder.order;
        var $el = $(element);
        var ordercode = $el.attr("ordercode");
        var orderdesc = $el.attr("orderdesc");
        var orderid = $el.attr("orderid");
        var countid = $el.attr("countid");
        
        if(!String.IsNullOrEmpty(orderdesc)){
            orderdesc = ordercode + " (" + orderdesc + ")";
        }
        
        if (o.OrderGeos == null) {
            o.OrderGeos = [];
        }

        for (var i = 0; i < o.OrderGeos.length; i++) {
            if (o.OrderGeos[i].GeoKeyCode == countid) {
                return;
            }
        }
   
        var geo = new entity.OrderGeo();
        geo.GeoKeyCode = countid;
        geo.GeoKeyDesc = orderdesc;
        geo.GeoType = entity.enums.GeoType.MultiCount;
        o.OrderGeos.push(geo);

        uc.demo.multicount.BindSelectedMultiSaveCount();
    },

    RemoveMultiSaveCount: function(element) {
        var o = page.placeorder.order;
        var $el = $(element);
        var countid = $el.attr("countid");

        o.OrderGeos = $.grep(o.OrderGeos, function(item) {
            return item.GeoKeyCode != countid;
        });

        uc.demo.multicount.BindSelectedMultiSaveCount();
    },

    BindSelectedMultiSaveCount: function() {
        var o = page.placeorder.order;
        if (o.OrderGeos == null) {
            o.OrderGeos = [];
        }

        $("#multi_save_count_selected").setTemplateElement("MultiSaveCountSelectedTemplate");
        $("#multi_save_count_selected").processTemplate(o.OrderGeos);        
                
    },
    
    SerachMultiSaveCountList: function() {
        uc.demo.multicount.MultiSaveCountInit = false;
        uc.demo.multicount.LoadSaveCountList();
    },
    
    SerachSaveCount: function(el) {
        var pagingOptions = uc.demo.multicount.MultiSaveCount_pagingOptions;
        var exp = $(el).attr("sortexpression");
        if (pagingOptions.SortBy == exp) {
            pagingOptions.SortDescending = !pagingOptions.SortDescending;
        } else {
            pagingOptions.SortDescending = true;
        }
        pagingOptions.SortBy = $(el).attr("sortexpression");
        uc.demo.multicount.MultiSaveCountInit = false;
        uc.demo.multicount.LoadSaveCountList(pagingOptions);
    },
    
    GetCountNumber:function(val){
        return val.toString().substring(0,val.toString().indexOf(" ("));
    },
    
    GetCountName: function(val){
        return val.toString().substring(val.toString().indexOf(" (")+2, val.toString().length-1);
    }

}

/********************** Multi Saved Count Methods - End -   *******************************/
