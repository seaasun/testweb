ni.RegisterNameSpace("uc");
uc.stepnav = {
    _IsInit: false,
    _MaxStep: entity.enums.OrderStep.ListQuote,
    _CurrentStep: entity.enums.OrderStep.ListQuote,
    Init: function() {
        var order = page.placeorder.order;
        if (uc.stepnav._IsInit == false) {
            $('#ct_step_navs_contents .step-nav-header').bind("click", function(e) {
                uc.stepnav.ToggleStepExpandedStatus(this);
            });
            uc.stepnav.GetAllHouseHoldsDescription(order.ListType);
            if (order.ListType == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
                $("#step-nav3").html("Choose Mobile Ad Campaign");
            }
            uc.stepnav._IsInit = true;
        }

        uc.stepnav.BindOrder(order);
        order.record = "";
        uc.stepnav.SetStepStatus(order.CurrentStep, order.CurrentStep);
    },

    BindOrder: function(order) {

        // bind geos
        $("#step_nav_geos_details").html("");
        $("#step_nav_geos_details").setTemplateElement("step_nav_geos_template");
        $("#step_nav_geos_details").processTemplate(order);

        // bind demos
        if (order.NextStep >= entity.enums.OrderStep.Demo) {
            $("#step_nav_demos_details").setTemplateElement("step_nav_demos_template");
            $("#step_nav_demos_details").processTemplate(order);
        }

        // bind list quote
        if (order.NextStep >= entity.enums.OrderStep.ListQuote) {
            $("#step_nav_results_details").setTemplateElement("step_nav_results_template");
            $("#step_nav_results_details").processTemplate(order);
        }

        // set action button status:
        if (order.OrderGeos != null && order.CurrentStep >= entity.enums.OrderStep.Geo && order.CurrentStep < entity.enums.OrderStep.Success && !page.placeorder.isMultiCount) {
            jQuery('#step_nav_geos_details_action').removeClass("hidden");
            jQuery('#sl360_step_nav_geos_edit_action').removeClass("hidden");
        } else {
            jQuery('#step_nav_geos_details_action').addClass("hidden");
            jQuery('#sl360_step_nav_geos_edit_action').addClass("hidden");
        }

        // ToDo
        if (order.CurrentStep >= entity.enums.OrderStep.Demo && order.CurrentStep < entity.enums.OrderStep.Success) {
            if (order.ListType == entity.enums.DataSourceType.Occupant && order.TargetOption != 0 && order.RouteOption != 0) {
                jQuery('#step_nav_demos_details_action').removeClass("hidden");
                jQuery('#sl360_step_nav_demos_edit_action').removeClass("hidden");
            } else if (order.DemoType == entity.enums.DemoType.All) {
                jQuery('#step_nav_demos_details_action').removeClass("hidden");
                jQuery('#sl360_step_nav_demos_edit_action').removeClass("hidden");
            } else if (order.OrderSelectedDemos != null && order.OrderSelectedDemos.length > 0) {
                jQuery('#step_nav_demos_details_action').removeClass("hidden");
                jQuery('#sl360_step_nav_demos_edit_action').removeClass("hidden");
            } else {
                jQuery('#step_nav_demos_details_action').addClass("hidden");
                jQuery('#sl360_step_nav_demos_edit_action').addClass("hidden");
            }
        } else {
            jQuery('#step_nav_demos_details_action').addClass("hidden");
            jQuery('#sl360_step_nav_demos_edit_action').addClass("hidden");
        }
        
        
    },

    BindListQuoteData: function() {
        var order = page.placeorder.order;
        // bind list quote
        $("#step_nav_results_details").setTemplateElement("step_nav_results_template");
        $("#step_nav_results_details").processTemplate(order);
    },

    GetAllHouseHoldsDescription: function(listType) {
        if (page.placeorder.AllHouseholdDesc == null) {
            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetSelectAllTargetDesc",
                data: { listType: listType },
                success: function(result) {
                    if (result.ResultFlag == true) {
                        page.placeorder.AllHouseholdDesc = result.DataSource;
                    }
                },
                error: function(rep) {
                    framework.common.LogClickEvent(String.format("Fail to get all households option for list type {0}", listType), "", rep == null ? "Fail to get all households option" : rep.responseText);
                }
            });
        }
    },

    SetAllHouseHoldsDescription: function(listType) {
        return page.placeorder.GetAllHouseHoldsDescription();


        //        var desc = "Select All Households In Target Area(s)";
        //        switch (listType) {
        //            case entity.enums.DataSourceType.Consumer:
        //                desc = "Select All Households In Target Area(s)";
        //                break;
        //            case entity.enums.DataSourceType.Business:
        //                desc = "Select All Businesses in Chosen Target Area(s)";
        //                break;
        //            case entity.enums.DataSourceType.Occupant:
        //                break;
        //            case entity.enums.DataSourceType.NewHomeowner:
        //                desc = "Select All New Homeowners From Past 6 Months";
        //                break;
        //                break;
        //            case entity.enums.DataSourceType.NewMover:
        //                desc = "All New Movers from past 6 months";
        //                break;
        //            default:
        //                break;

        //        };
        //        return desc;
    },

    ToggleStepExpandedStatus: function(el) {
        var isexpanded = $(el).attr("isexpanded") || "0";
        if (isexpanded == "0") {
            uc.stepnav.SetSingleStepStatus(el, "1");
        } else {
            uc.stepnav.SetSingleStepStatus(el, "0");
        }
    },

    SetSingleStepStatus: function(el, bIsExapnded) {
        if (bIsExapnded == "1") {
            $(el).addClass("step-nav-header-expand").attr("isexpanded", "1");
            $(el).next().removeClass("hidden");
            $(el).parent().addClass("ct-step-navs-section-expand");
            $(el).find(".arrow_down").removeClass("arrow_down").addClass("arrow_up");
            $(el).find(".arrow_up").removeClass("arrow_up").addClass("arrow_down");
            //$(el).find(".sl360_edit_action").removeClass("hidden");
        } else {
            $(el).removeClass("step-nav-header-expand").attr("isexpanded", "0");
            $(el).next().addClass("hidden");
            $(el).parent().removeClass("ct-step-navs-section-expand");
            //$(el).find(".sl360_edit_action").addClass("hidden");
            $(el).find(".arrow_down").removeClass("arrow_down").addClass("arrow_up");
        }
    },

    SetStepStatus: function(currentStep, currentMaxStep) {
        $('#ct_step_navs_contents .step-nav-header').each(function(i, option) {
            var minstep = Number($(this).attr('minstep'));
            var maxstep = Number($(this).attr('maxstep'));
            if (minstep <= currentStep && maxstep >= currentStep) {
                $('#ct_step_navs_contents .step-nav-header').removeClass("step-nav-header-current");
                $(this).addClass("step-nav-header-current");
            }

            if (minstep <= currentMaxStep) {
                uc.stepnav.SetSingleStepStatus(this, "1");
            } else {
                uc.stepnav.SetSingleStepStatus(this, "0");
            }
        });
    },

    Click_EditSelections_Geo: function() {
        var o = page.placeorder.order;
        //        if (o.OrderGeos != null) {
        //            for (var i = 0; i < o.length; i++) {
        //                o.OrderGeos.OrderGeoDetails = null;
        //            }
        //        }
        //        if (page.placeorder.order.OrderDemos != null) {
        //            page.placeorder.order.OrderDemos = null;
        //        }
        //        if (page.placeorder.order.ElementsForPricing != null) {
        //            page.placeorder.order.ElementsForPricing = null;
        //        }
        page.placeorder.ClearRedundantForSubmitOrder(page.placeorder.order);
        framework.common.LogClickEvent("Click Edit Selections link", jQuery.toJSON(o), "Click_EditSelections_Geo.");
        page.placeorder.order.NextStep = entity.enums.OrderStep.Geo;
        //jenny.xiao_20131014 add nationwide
        if (page.placeorder.order.GeoType == entity.enums.GeoType.NationWide || 
            page.placeorder.order.GeoType == entity.enums.GeoType.MultiCount) {
            page.placeorder.order.NextStep = entity.enums.OrderStep.GeoType;
        }
        if (o.CurrentStep == entity.enums.OrderStep.ListQuote) {
            page.placeorder.GoNext({ gotoresult: true });
        } else {
            page.placeorder.GoNext();
        }
        $("#ma_explain_video_line").css("display", "block");
        if (page.placeorder.order.GeoType == entity.enums.GeoType.Polygon) {
            $("#ma_explain_video_line").css("display", "block");
            $("[id^='sl360_explain_video_setp_']").css("display", "none");
            $("#sl360_explain_video_setp_2").css("display", "block");
        }
        else {
            $("#ma_explain_video_line").css("display", "none");
            $("[id^='sl360_explain_video_setp_']").css("display", "none");
        }
    },

    Click_EditSelections_Demo: function() {
        page.placeorder.order.NextStep = entity.enums.OrderStep.Demo;
        //clear the geo details
        //        if (page.placeorder.order.OrderGeos != null) {
        //            for (var i = 0; i < page.placeorder.order.OrderGeos.length; i++) {
        //                page.placeorder.order.OrderGeos.OrderGeoDetails = null;
        //            }
        //        }
        //        if (page.placeorder.order.OrderDemos != null) {
        //            page.placeorder.order.OrderDemos = null;
        //        }
        //        if (page.placeorder.order.ElementsForPricing != null) {
        //            page.placeorder.order.ElementsForPricing = null;
        //        }
        page.placeorder.ClearRedundantForSubmitOrder(page.placeorder.order);
        page.placeorder.GoNext();
        $("#ma_explain_video_line").css("display", "block");
        $("[id^='sl360_explain_video_setp_']").css("display", "none");
        $("#sl360_explain_video_setp_3").css("display", "block");
    }
};

framework.listener.AddListener(framework.listener.LISTENER_INIT_STEP, uc.stepnav.Init);
framework.listener.AddListener(framework.listener.LISTENER_UPDATE_RESULTS_ORDER, uc.stepnav.BindListQuoteData);
//framework.listener.FireListener(framework.listener.LISTENER_GOTO_DEMOOPTION);




