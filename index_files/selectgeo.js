ni.RegisterNameSpace("uc");

uc.geo = {
    gotoresult: false,
    //-------------------------for drawing polygon
    Y: null,
    PolygonList: [],
    PolylineList: [],
    overlay: null,
    //-------------------------

    // Initial Step Setting
    InitStepSetting: function(order) {
        var step = page.placeorder.orderflow || new entity.OrderFlow();
        step.CurrentStep = entity.enums.OrderStep.Geo;
        step.StepTitle = "";
        step.StepDescription = "";
        step.StepButtonsStatus = entity.enums.StepButtons.Back | entity.enums.StepButtons.Next;
        step.StepButtonsEvent = [
  			{ ButtonKey: entity.enums.StepButtons.Next, ButtonEvent: uc.geo.Click_Next },
  			{ ButtonKey: entity.enums.StepButtons.Back, ButtonEvent: uc.geo.Click_Back }
  		];

        return step;
        // framework.listener.FireListener(framework.listener.LISTENER_INIT_STEP, step);
    },

    Init: function(args) {

        if (args != null && args.gotoresult == true) {
            uc.geo.gotoresult = true;
        } else {
            uc.geo.gotoresult = false;
        }

        var o = page.placeorder.order;
        o.CurrentStep = entity.enums.OrderStep.Geo;

        // ToDo: moving follow codes, use orderflow object and fire the init step listener
        var step = uc.geo.InitStepSetting();
        //alert("befroe firelistener");
        framework.listener.FireListener(framework.listener.LISTENER_INIT_STEP, step);
        //alert("after firelistener");
        jQuery("#geo_zip_map_result").addClass("hidden");
        jQuery('#ct_geo').fadeIn(1000);
        jQuery('#ct_step_geo').removeClass("hidden");

        uc.geo.SetErrorMessage(false, "");

        if (page.global.isMyAcxiomPartnerUSite) {
            $("#geo_radius_zip").attr("title", "Enter Zip Code");
            $("#geo_radius_address").attr("title", "Enter Address");
            $("#geo_polygon_address").attr("title", "Enter Location");
        } else {
            $("#geo_radius_zip").removeAttr("title");
            $("#geo_radius_address").removeAttr("title");
            $("#geo_polygon_address").removeAttr("title");
        }

        if (page.placeorder.ZipcodeOriginalTypeDescs != null && page.placeorder.ZipcodeOriginalTypeDescs.length > 0) {
            for (var i = 0; i < page.placeorder.ZipcodeOriginalTypeDescs.length; i++) {
                jQuery("#geoZipOriginalType" + page.placeorder.ZipcodeOriginalTypeDescs[i].TextName).html(page.placeorder.ZipcodeOriginalTypeDescs[i].TextValue);
            }
        }
        if (page.placeorder.AvailableStateDescs != null && page.placeorder.AvailableStateDescs.length > 0) {
            jQuery(".availableStateDesc").html(page.placeorder.AvailableStateDescs[0].TextValue);
        }

        jQuery("#ct_geo").removeClass("hidden");
        jQuery("#ct_geo [attr='geography_panel']").addClass("hidden");

        switch (o.GeoType) {
            case entity.enums.GeoType.State:
                jQuery('#ct_geo_state').removeClass("hidden");
                uc.geo.state.Init();
                //add by lisa at 06/04/2015 for 5752 begin
                //div in multi geo
                if ($('#multiGeo_p_state #ct_geo_state').length >= 1) {
                    $("#ct_geo").append($("#ct_geo_state"));
                }
                //add by lisa at 06/04/2015 for 5752 end
                break;
            case entity.enums.GeoType.City:
                jQuery('#ct_geo_city').removeClass("hidden");
                uc.geo.city.Init();
                //add by lisa at 06/04/2015 for 5752 begin
                //div in multi geo
                if ($('#multiGeo_p_city #ct_geo_city').length >= 1) {
                    $("#ct_geo").append($("#ct_geo_city"));
                }
                //add by lisa at 06/04/2015 for 5752 end

                break;
            case entity.enums.GeoType.County:
                jQuery('#ct_geo_county').removeClass("hidden");
                uc.geo.county.Init();
                //add by lisa at 06/04/2015 for 5752 begin
                //div in multi geo
                if ($('#multiGeo_p_county #ct_geo_county').length >= 1) {
                    $("#ct_geo").append($("#ct_geo_county"));
                }
                //add by lisa at 06/04/2015 for 5752 end
                break;
            //add by lisa.wang at 28/04/2015 for 5720             
            case entity.enums.GeoType.CongressionalDistrict:
                //alert("display");
                jQuery('#ct_geo_district').removeClass("hidden");
                uc.geo.district.Init();
                break;
            //add by lisa.wang at 06/01/2015 for 5752 begin        
            case entity.enums.GeoType.MultiGeo:
                jQuery('#ct_multiGeo').removeClass("hidden");
                $("#ct_multiGeo_tabs").tabs({
                    select: function(event, ui) {
                        var ordIndex = $(ui.tab).attr("ord");
                        uc.geo.SelectTab(parseInt(ordIndex));

                    }
                });
                uc.geo.zip.Init();
                uc.geo.state.Init();
                uc.geo.county.Init();
                uc.geo.city.Init();

                //append
                $("#multiGeo_p_zip").append($("#ct_geo_zip"));
                $("#multiGeo_p_city").append($("#ct_geo_city"));
                $("#multiGeo_p_county").append($("#ct_geo_county"));
                $("#multiGeo_p_state").append($("#ct_geo_state"));

                //show
                jQuery('#ct_geo_zip').removeClass("hidden");
                jQuery('#ct_geo_city').removeClass("hidden");
                jQuery('#ct_geo_county').removeClass("hidden");
                jQuery('#ct_geo_state').removeClass("hidden");

                break;
            //add by lisa at 06/04/2015 for 5752 end   
            case entity.enums.GeoType.Radius:
                //blue switch
                if (page.placeorder.isBlue) {
                    uc.geo.radius = uc.geo.radius_blue;
                }
                if (page.placeorder.order.SeeBreakDown) {
                    jQuery("input[name=ckb_seeBreakdown]").attr("checked", true);
                } else {
                jQuery("input[name=ckb_seeBreakdown]").attr("checked", false);
                }
            case entity.enums.GeoType.ZipRadius:

            case entity.enums.GeoType.Closex:
            case entity.enums.GeoType.Polygon:
            case entity.enums.GeoType.MultiRadius:
            case entity.enums.GeoType.MultiClosex:
            case entity.enums.GeoType.AcxiomMultiRadius:
            case entity.enums.GeoType.ZipMap:
                //blue switch
                if (page.placeorder.isBlue) {
                    uc.geo.radius = uc.geo.radius_blue;
                } else {
                    jQuery('#ct_geo_radius').removeClass("hidden");
                }
                uc.geo.radius.Init();
                if (page.placeorder.EnableZipCodeOrCarrierRouteRadius) {
                    jQuery('#span_radius').removeClass("hidden");
                }

                break;
            case entity.enums.GeoType.Zip:
                jQuery('#ct_geo_zip').removeClass("hidden");
                uc.geo.zip.Init();

                //add by lisa at 06/04/2015 for 5752 begin
                //div in multi geo
                if ($('#multiGeo_p_zip #ct_geo_zip').length >= 1) {
                    $("#ct_geo").append($("#ct_geo_zip"));
                }
                //add by lisa at 06/04/2015 for 5752 end
                break;
            case entity.enums.GeoType.Scf:
                jQuery('#ct_geo_scf').removeClass("hidden");
                uc.geo.scf.Init();
                break;
            case entity.enums.GeoType.Msa:
                jQuery('#ct_geo_msa').removeClass("hidden");
                uc.geo.msa.Init();
                break;
            case entity.enums.GeoType.ZipUpload:
                jQuery('#ct_geo_zipUpload').removeClass("hidden");
                uc.geo.zipupload.Init();
                break;
        }


        if (page.placeorder.order.GeoType == entity.enums.GeoType.Radius && page.placeorder.currentDataSource == entity.enums.DataSourceType.Consumer) {
            //show see report
            jQuery('#span_seeBreakDown').removeClass("hidden");
        } else {
            //hide see report
            jQuery('#span_seeBreakDown').addClass("hidden");
        }
    },

    /*add by lisa at 06/03/2015 for 5752 begin*/
    SelectTab: function(index) {
        $('#multiGeo_p_zip').addClass("hidden");
        switch (index) {
            case entity.enums.MultiGeoTab.ZipCode:
                $('#multiGeo_p_zip').removeClass("hidden");
                break;
            case entity.enums.DemoTab.City:
                $('#multiGeo_p_city').removeClass("hidden");
                break;
            case entity.enums.DemoTab.County:
                $('#multiGeo_p_county').removeClass("hidden");
                break;
            case entity.enums.DemoTab.State:
                $('#multiGeo_p_state').removeClass("hidden");
                break;
        }
    },
    /*add by lisa at 06/03/2015 for 5752 end*/

    SetSeeBreakDown: function() {
        uc.geo.SetErrorMessage(false, "");

        if ($("#span_seeBreakDown input[type='checkbox'][name='ckb_seeBreakdown']:checked").val() == "on") {
            page.placeorder.order.SeeBreakDown = true;
        }
        else {
            page.placeorder.order.SeeBreakDown = false;
        }
    },

    // ToDo:
    SetOrderGeos: function() {
        var o = page.placeorder.order;
        //		var orignalGeos = page.placeorder.order.OrderGeos;
        var result = false;
        switch (o.GeoType) {
            case entity.enums.GeoType.State:
                result = uc.geo.state.SetOrderGeos(o);
                break;
            case entity.enums.GeoType.City:
                result = uc.geo.city.SetOrderGeos(o);
                break;
            case entity.enums.GeoType.County:
                result = uc.geo.county.SetOrderGeos(o);
                break;
            case entity.enums.GeoType.CongressionalDistrict: //lisa for 5720
                result = uc.geo.district.SetOrderGeos(o);
                break;
            case entity.enums.GeoType.MultiGeo: //lisa for 5752
                result = uc.geo.multigeo.SetOrderGeos(o);
                break;
            case entity.enums.GeoType.Radius:
            case entity.enums.GeoType.ZipRadius:
            case entity.enums.GeoType.Closex:
            case entity.enums.GeoType.Polygon:
            case entity.enums.GeoType.MultiRadius:
            case entity.enums.GeoType.MultiClosex:
            case entity.enums.GeoType.AcxiomMultiRadius:
            case entity.enums.GeoType.ZipMap:
                result = uc.geo.radius.SetOrderGeos(o);
                break;
            case entity.enums.GeoType.Zip:
                result = uc.geo.zip.SetOrderGeos(o);
                break;
            case entity.enums.GeoType.Scf:
                result = uc.geo.scf.SetOrderGeos(o);
                break;
            case entity.enums.GeoType.Msa:
                result = uc.geo.msa.SetOrderGeos(o);
                break;
            case entity.enums.GeoType.ZipUpload:
                result = uc.geo.zipupload.SetOrderGeos(o);
                break;
        }

        //		if (orignalGeos != null && orignalGeos.length > 0) {
        //			for (var i = 0; i < o.OrderGeos.length; i++) {
        //				var targetGeo = uc.geo.CheckIfGeoExists(o.OrderGeos[i], orignalGeos);
        //				if (targetGeo != null) {
        //					o.OrderGeos[i] = targetGeo;
        //				}
        //			}
        //		}
        return result;
    },

    // check if geo exists, if exists, return the target geo, otherwise null will return
    CheckIfGeoExists: function(geo, target) {
        if (geo == null || String.IsNullOrEmpty(geo.GeoKeyCode) || target == null || target.length < 1)
            return null;
        for (var i = 0; i < target.length; i++) {
            if (target[i] != null && geo.GeoKeyCode == target[i].GeoKeyCode) {
                return target[i];
            }

        }
        return null;

    },

    SetErrorMessage: function(bShow, msg) {
        if (bShow) {
            jQuery('#geo_message_error').removeClass("hidden").html(msg);
        } else {
            jQuery('#geo_message_error').addClass("hidden")
        }
    },

    SetErrorMessageForMulti: function(bShow, msg) {
        if (bShow) {
            jQuery('#multigeo_message_error').removeClass("hidden").html(msg);
        } else {
            jQuery('#multigeo_message_error').addClass("hidden")
        }
    },


    //	Pre_Click_Next: function() {
    //		var geoType = page.placeorder.order.GeoType;

    //		if (page.placeorder.isBlue && (geoType == entity.enums.GeoType.Radius || geoType == entity.enums.GeoType.Closex)) {

    //			if (uc.geo.radius.hasSearchResult()) {
    //				return true;
    //			} else {
    //				//Do the search first
    //				uc.geo.radius.SearchAddress();
    //				return false;
    //			}
    //		}
    //	},

    Click_Next: function() {
        uc.geo.SetErrorMessage(false, "");

        var o = page.placeorder.order;

        var bSetGeos = uc.geo.SetOrderGeos();
        if (bSetGeos) {
            //            $("#ct_geo div[name='GeoType']").each(function() {
            //                $(this).addClass("hidden");
            //            });
            page.placeorder.TrackOrderPathGAEvent("Step 1 - Geo","Geo Next Button");
            
            if (uc.geo.gotoresult) {//Goto result page directly
                uc.geo.gotoresult = false;
                framework.common.Ajax({
                    url: "PlaceOrder.aspx/SubmitOrder",
                    data: { order: page.placeorder.order },
                    success: function(result) {
                        if (result.ResultFlag == true) {
                            $("#ct_geo div[name='GeoType']").each(function() {
                                $(this).addClass("hidden");
                            });

                            page.placeorder.order = result.DataSource;

                            //TODO: not a good way for setting it here, should create another class for stroing order step but not order object
                            page.placeorder.order.NextStep = entity.enums.OrderStep.PollCount;
                            page.placeorder.GoNext();
                            // setTimeout(function() { uc.pollcount.CheckPollingStatus(result.DataSource.RequestId); }, 1000);
                        }

                    },
                    error: function(rep) {
                    },
                    waitingElement: 'ct_geo'
                });
            }
            else {

                $("#ct_geo div[name='GeoType']").each(function() {
                    $(this).addClass("hidden");
                });

                o.NextStep = entity.enums.OrderStep.Demo;
                //uc.geo.Init();
                page.placeorder.GoNext();
            }

        }
    },

    Click_Back: function() {
        var geoType = page.placeorder.order.GeoType;

        $("#ct_geo div[name='GeoType']").each(function() {
            $(this).addClass("hidden");
        });
        $("#ma_explain_video_line").css("display", "block");
        $("[id^='sl360_explain_video_setp_']").css("display", "none");
        $("#sl360_explain_video_setp_1").css("display", "block");
        
        page.placeorder.TrackOrderPathGAEvent("Step 1 - Geo","Geo Back Button");
        
        page.placeorder.GoBack();
    }


};

uc.geo.zip = {
    _IsInit: false,
    ZipRegExp: null,
    DuplicateZips: [],
    Init: function() {
        if (uc.geo.zip._IsInit == false) {
            uc.geo.zip.CreateZipInputs();
            jQuery("#geo_zip_range_input").slideUp();
            // Load From Order
            //uc.geo.zip.LoadFromOrder();
            if (page.placeorder.order.ZipcodeOriginalType != entity.enums.ZipcodeOrignalType.ZIP_INPUT
                && page.placeorder.order.ZipcodeOriginalType != entity.enums.ZipcodeOrignalType.ZIP_PASTED
                && page.placeorder.order.ZipcodeOriginalType != entity.enums.ZipcodeOrignalType.ZIP_RANGE_INPUT
            ) {

                page.placeorder.order.ZipcodeOriginalType = entity.enums.ZipcodeOrignalType.ZIP_INPUT;
            }
            ZipRegExp = new RegExp(page.placeorder.ZipRegularExpression, "i");
            uc.geo.zip._IsInit = true;
            if (page.placeorder.order.ZipcodeOriginalType != entity.enums.ZipcodeOrignalType.ZIP_INPUT) {
                uc.geo.zip.ToggleZipInput();
                uc.geo.zip.ToggleTargetPanel(page.placeorder.order.ZipcodeOriginalType);
                //jQuery("#geo_zip_paste_div")
            }
            if (entity.enums.ZipcodeOrignalType.ZIP_PASTED > page.placeorder.MaxZipcodeOriginalType) {
                jQuery("#geo_zip_paste_panel").addClass("hidden");
            }
            if (entity.enums.ZipcodeOrignalType.ZIP_RANGE_INPUT > page.placeorder.MaxZipcodeOriginalType) {
                jQuery("#geo_zip_range_input_panel").addClass("hidden");
            }

        }
        if (!page.global.isMyAcxiomPartnerUSite) {
            uc.geo.zip.LoadFromOrder();
        } else {
            if (page.placeorder.order.OrderId != undefined && page.placeorder.order.OrderId > 0) {
                uc.geo.zip.LoadFromOrder();
            }
        }
        jQuery("#geo_zip_range_from").setMask(page.placeorder.ZipMask);
        jQuery("#geo_zip_range_to").setMask(page.placeorder.ZipMask);
        //$('#geo_zip_inputs input:text').first().focus();
        
        if(page.placeorder.order.ListType == entity.enums.DataSourceType.InfoUSA_Consumer || page.placeorder.order.ListType == entity.enums.DataSourceType.InfoUSA_Business){
            $("#geo_zip_paste_panel").addClass("hidden");
            $("#geo_zip_range_input_panel").addClass("hidden");
        }
        else{
            $("#geo_zip_paste_panel").removeClass("hidden");
            $("#geo_zip_range_input_panel").removeClass("hidden");
        }
    },

    LoadFromOrder: function() {
        var o = page.placeorder.order;
        if ((o.GeoType == entity.enums.GeoType.Zip || o.GeoType == entity.enums.GeoType.MultiGeo) && o.OrderGeos != null) {  //#5752 multi geo
            var objZips = $('#geo_zip_inputs input:text') || [];
            //var counts = o.OrderGeos.length;
            var MyZipGeo = [];
            for (var j = 0; j < o.OrderGeos.length; j++) {
                if (o.OrderGeos[j].GeoType == entity.enums.GeoType.Zip)
                    MyZipGeo.push(o.OrderGeos[j]);

            }
            var counts = MyZipGeo.length;
            for (var i = 0; i < objZips.length; i++) {


                if (i <= counts - 1) {
                    //#5752 mutli geo begin
                    //if (o.OrderGeos[i].GeoType == entity.enums.GeoType.Zip)
                    //{
                    //#5752 mutli geo end
                    //objZips[i].value = o.OrderGeos[i].GeoKeyCode;
                    objZips[i].value = MyZipGeo[i].GeoKeyCode;
                    //}
                } else {
                    objZips[i].value = "";
                }
            }

            jQuery("#geo_zip_paste").val("");
            var v = "";
            if (counts > 0) {
                v = MyZipGeo[0].GeoKeyCode;
            }
            for (var i = 1; i < counts; i++) {

                v += "\n" + MyZipGeo[i].GeoKeyCode;
            }
            jQuery("#geo_zip_paste").val(v);

            jQuery("#geo_zip_range_from").val("");
            jQuery("#geo_zip_range_to").val("");
            var minZipcode = "";
            var maxZipcode = "";
            if (counts > 0) {
                minZipcode = MyZipGeo[0].GeoKeyCode;
                maxZipcode = MyZipGeo[0].GeoKeyCode;
            }
            for (var i = 1; i < counts; i++) {
                minZipcode = uc.geo.zip.MinZipcode(minZipcode, MyZipGeo[i].GeoKeyCode); //framework.common.LeftPad(Math.min(minZipcode, o.OrderGeos[i].GeoKeyCode), '0', 5);
                maxZipcode = uc.geo.zip.MaxZipcode(minZipcode, MyZipGeo[i].GeoKeyCode); //framework.common.LeftPad(Math.max(maxZipcode, o.OrderGeos[i].GeoKeyCode), '0', 5);
            }
            jQuery("#geo_zip_range_from").val(minZipcode);
            jQuery("#geo_zip_range_to").val(maxZipcode);
        }
    },

    MinZipcode: function(a, b) {
        if (a < b) {
            return a;
        }
        return b;

    },

    MaxZipcode: function(a, b) {
        if (a < b) {
            return b;
        }
        return a;
    },

    CreateZipInputs: function() {

        // attach the template
        $("#geo_zip_inputs").setTemplateElement("geo_zip_template");

        // process the template
        $("#geo_zip_inputs").processTemplate({ linecount: 5 });

        $('#geo_zip_inputs input:text').setMask(page.placeorder.ZipMask);
    },

    GetInputedZips: function() {
        //get all inputed zips
        var objZips = $('#geo_zip_inputs input:text') || [];
        var zips = [];
        objZips.each(function(i) {
            var str = jQuery.trim(this.value);
            if (str != "") {
                zips.push(str);
            }
        });

        return zips;

    },

    IsValidZipcode: function(zipcode) {
        return ZipRegExp.test(zipcode);
    },

    IsValidZip4: function(zipcode) {
        return ZipRegExp.test(zipcode);
    },

    IsValidCRRT: function(zipcode) {
        return ZipRegExp.test(zipcode);
    },

    GetPastedZips: function() {
        var pastedStr = jQuery("#geo_zip_paste").val();
        var zips = pastedStr.split('\n');
        var allZips = new Array();
        var pos = 0;
        var zip = "";

        if (uc.geo.zip.tempRadio == 1) {
            ZipRegExp = new RegExp(page.placeorder.ZipRegularExpression, "i");
            for (var i = 0; i < zips.length; i++) {
                zip = jQuery.trim(zips[i]);
                if (uc.geo.zip.IsValidZipcode(zip)) {
                    if (!uc.geo.zip.IsZipExisting(allZips, zip)) {
                        allZips[pos] = zip;
                        pos++;
                    }
                    else {
                        uc.geo.zip.AddDuplicateValue(zip);
                    }
                }
                else {
                    uc.geo.zip.AddDuplicateValue(zip);
                }
                //			if (!isNaN(zip) && zip.length >= 5) {
                //				if (!uc.geo.zip.IsZipExisting(allZips, zip)) {
                //					allZips[pos] = zip.substring(0, 5);
                //					pos++;
                //				}
                //			}
            }
        }
        else if (uc.geo.zip.tempRadio == entity.enums.RadiusTypeChoice.ZIP4) {
            ZipRegExp = new RegExp(page.placeorder.Zip4RegularExpression, "i");
            for (var i = 0; i < zips.length; i++) {
                zip = jQuery.trim(zips[i]);
                if (uc.geo.zip.IsValidZip4(zip)) {
                    if (!uc.geo.zip.IsZipExisting(allZips, zip)) {
                        allZips[pos] = zip;
                        pos++;
                    }
                    else {
                        uc.geo.zip.AddDuplicateValue(zip);
                    }
                }
                else {
                    uc.geo.zip.AddDuplicateValue(zip);
                }
            }
        }
        else if (uc.geo.zip.tempRadio == entity.enums.RadiusTypeChoice.CRRT) {
            ZipRegExp = new RegExp(page.placeorder.CRRTRegularExpression, "i");
            for (var i = 0; i < zips.length; i++) {
                zip = jQuery.trim(zips[i]);
                if (uc.geo.zip.IsValidCRRT(zip)) {
                    if (!uc.geo.zip.IsZipExisting(allZips, zip)) {
                        allZips[pos] = zip;
                        pos++;
                    }
                    else {
                        uc.geo.zip.AddDuplicateValue(zip);
                    }
                }
                else {
                    uc.geo.zip.AddDuplicateValue(zip);
                }
            }
        }
        return allZips;

    },
    
    AddDuplicateValue: function(val) {
        if (!uc.geo.zip.IsZipExisting(uc.geo.zip.DuplicateZips, val)) {
                uc.geo.zip.DuplicateZips.push(val);
        }
    },

    GetRangeZips: function(from, to, maxLength) {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetZipcodesByRange",
            data: { fromZipcode: from,
                toZipcode: to,
                maxLength: maxLength
            },
            async: false,
            success: function(result) {
                if (result.ResultFlag == true) {
                    return result.DataSource;
                }

            },
            error: function(rep) {

            },
            waitingElement: 'ct_geo'
        });
    },

    IsZipExisting: function(allZips, zip) {
        for (var i = 0; i < allZips.length; i++) {
            if (allZips[i] == zip) {
                return true;
            }
        }
        return false;
    },

    ResetZips: function(zips) {
        // var zips = uc.geo.zip.getInputedZips()
        if (zips.length > 0) {
            if (page.placeorder.order.ZipcodeOriginalType == entity.enums.ZipcodeOrignalType.ZIP_INPUT) {
                //clear first
                $('#geo_zip_inputs input:text').val('');
                //re-order the zips, remove all blank fields.
                var allZips = $('#geo_zip_inputs input:text').val('') || [];
                for (var i = 0; i < zips.length; i++) {
                    allZips[i].value = zips[i];
                }
                return true;
            } else if (page.placeorder.order.ZipcodeOriginalType == entity.enums.ZipcodeOrignalType.ZIP_PASTED) {
                jQuery("#geo_zip_paste").val("");
                var v = zips[0];
                for (var i = 1; i < zips.length; i++) {
                    v += "\n" + zips[i];
                }
                jQuery("#geo_zip_paste").val(v);
                return true;
            } else {
                var minZipcode = "";
                var maxZipcode = "";
                if (zips.length > 0) {
                    minZipcode = zips[0];
                    maxZipcode = zips[0];
                }

                for (var i = 1; i < zips.length; i++) {
                    minZipcode = uc.geo.zip.MinZipcode(minZipcode, zips[i]);
                    maxZipcode = uc.geo.zip.MaxZipcode(minZipcode, zips[i]);
                    //					minZipcode = framework.common.LeftPad(Math.min(minZipcode, zips[i]), '0', 5);
                    //					maxZipcode = framework.common.LeftPad(Math.max(maxZipcode, zips[i]), '0', 5);
                }
                jQuery("#geo_zip_range_from").val(minZipcode);
                jQuery("#geo_zip_range_to").val(maxZipcode);

            }
        }
    },

    //	SwitchPastePanel: function() {
    //		jQuery("#geo_zip_paste_switch").toggleClass("collapsed-panel-restore");
    //		jQuery("#geo_zip_enter_switch").toggleClass("collapsed-panel-restore");
    //		jQuery("#geo_zip_paste_div").toggleClass("hidden");
    //		jQuery("#geo_zip_inputs").slideToggle();
    //	},

    ToggleZipInput: function() {
        jQuery("#geo_zip_enter_switch").toggleClass("collapsed-panel-restore");
        jQuery("#geo_zip_inputs").slideToggle();
    },

    ToggleZipPastePanel: function() {
        jQuery("#geo_zip_paste_switch").toggleClass("collapsed-panel-restore");
        jQuery("#geo_zip_paste_div").toggleClass("hidden");
    },

    ToggleZipRangeInput: function() {
        jQuery("#geo_zip_range_input_switch").toggleClass("collapsed-panel-restore");
        jQuery("#geo_zip_range_input").slideToggle();
    },

    tempRadio: 1,

    TogglePastePanel: function(el) {
        //jQuery(el).toggleClass("collapsed-panel-restore");
        //jQuery(el).next().toggleClass("hidden");

        //		jQuery("#geo_zip_paste_switch").toggleClass("collapsed-panel-restore");
        //		jQuery("#geo_zip_enter_switch").toggleClass("collapsed-panel-restore");
        //		jQuery("#geo_zip_paste_div").toggleClass("hidden");
        //		jQuery("#geo_zip_inputs").slideToggle();
        //jQuery("#geo_zip_inputs").toggleClass("hidden");

        var originalZipType = parseInt($(el).attr("originalType"));

        uc.geo.zip.ToggleZipcodePanel(originalZipType);
        //page.placeorder.order.ZipcodeOriginalType = originalZipType; 


        //		uc.geo.zip.SwitchPastePanel();
        //		page.placeorder.order.IsPastedZipcodes = !page.placeorder.order.IsPastedZipcodes;
    },

    ToggleZipcodePanel: function(originalZipType) {
        var nextZipType;
        if (originalZipType != page.placeorder.order.ZipcodeOriginalType) {
            nextZipType = originalZipType;
        } else {
            if (originalZipType == entity.enums.ZipcodeOrignalType.ZIP_INPUT) {
                nextZipType = entity.enums.ZipcodeOrignalType.ZIP_PASTED;
            } else if (originalZipType == entity.enums.ZipcodeOrignalType.ZIP_PASTED) {
                nextZipType = entity.enums.ZipcodeOrignalType.ZIP_RANGE_INPUT;
            } else {
                nextZipType = entity.enums.ZipcodeOrignalType.ZIP_INPUT;
            }
        }
        if (nextZipType > page.placeorder.MaxZipcodeOriginalType) {
            nextZipType = entity.enums.ZipcodeOrignalType.ZIP_INPUT;
        }

        uc.geo.zip.ToggleTargetPanel(page.placeorder.order.ZipcodeOriginalType);
        uc.geo.zip.ToggleTargetPanel(nextZipType);
        page.placeorder.order.ZipcodeOriginalType = nextZipType;

        //		var orderZipType = page.placeorder.order.ZipcodeOriginalType;
        //		if (orderZipType != originalZipType) {
        //			if (orderZipType == entity.enums.ZipcodeOrignalType.INPUT) {
        //				uc.geo.zip.ToggleZipInput();
        //			} else if (orderZipType == entity.enums.ZipcodeOrignalType.PASTED) {
        //				uc.geo.zip.ToggleZipPastePanel();
        //			} else {
        //				uc.geo.zip.ToggleZipRangeInput();
        //			}
        //		} else {
        //			if (originalZipType == entity.enums.ZipcodeOrignalType.INPUT) {
        //				uc.geo.zip.ToggleZipInput();
        //				uc.geo.zip.ToggleZipPastePanel();
        //				nextZipType = entity.enums.ZipcodeOrignalType.PASTED;
        //			} else if (originalZipType == entity.enums.ZipcodeOrignalType.PASTED) {
        //				uc.geo.zip.ToggleZipPastePanel();
        //				uc.geo.zip.ToggleZipRangeInput();
        //				nextZipType = entity.enums.ZipcodeOrignalType.RANGE_INPUT;
        //			} else {
        //				uc.geo.zip.ToggleZipRangeInput();
        //				uc.geo.zip.ToggleZipInput();
        //				nextZipType = entity.enums.ZipcodeOrignalType.INPUT;
        //			}
        //		}
        //return nextZipType;
    },

    ToggleTargetPanel: function(originalZipType) {
        if (originalZipType == entity.enums.ZipcodeOrignalType.ZIP_INPUT) {
            uc.geo.zip.ToggleZipInput();
        } else if (originalZipType == entity.enums.ZipcodeOrignalType.ZIP_PASTED) {
            uc.geo.zip.ToggleZipPastePanel();
        } else {
            uc.geo.zip.ToggleZipRangeInput();
        }
    },


    SetOrderGeos: function(order) {  
    
        uc.geo.zip.DuplicateZips = [];
        uc.geo.SetErrorMessage(false);
          
        // get zips
        uc.geo.zip.tempRadio = $("input[type='radio'][name='pastezip_radio']:checked").val();

        var zips = null;
        if (page.placeorder.order.ZipcodeOriginalType == entity.enums.ZipcodeOrignalType.ZIP_INPUT) {
            zips = uc.geo.zip.GetInputedZips();
            if (zips == null || zips.length == 0) {
                uc.geo.SetErrorMessage(true, "Please input at least one ZIP.");
                return false;
            }

        }
        else if (page.placeorder.order.ZipcodeOriginalType == entity.enums.ZipcodeOrignalType.ZIP_PASTED) {
            zips = uc.geo.zip.GetPastedZips();
            if (zips == null || zips.length == 0) {
                if (uc.geo.zip.tempRadio == entity.enums.RadiusTypeChoice.ATUO) {
                    uc.geo.SetErrorMessage(true, "Please input at least one ZIP (e.g. 10017) and each end with newline.");
                }
                else if (uc.geo.zip.tempRadio == entity.enums.RadiusTypeChoice.ZIP4) {
                    uc.geo.SetErrorMessage(true, "Please input at least one ZIP (e.g. 071100001).");
                }
                else if (uc.geo.zip.tempRadio == entity.enums.RadiusTypeChoice.CRRT) {
                    uc.geo.SetErrorMessage(true, "Please input at least one ZIP (e.g. 07110:B001).");
                }
                return false;
            }
        } else {
            var from = jQuery("#geo_zip_range_from").val().trim();
            if (from == "" || !uc.geo.zip.IsValidZipcode(from)) {
                uc.geo.SetErrorMessage(true, "Please input the from ZIP code.");
                return false;
            }
            var to = jQuery("#geo_zip_range_to").val().trim();
            if (to == "" || !uc.geo.zip.IsValidZipcode(to)) {
                uc.geo.SetErrorMessage(true, "Please input the to ZIP code.");
                return false;
            }

            if (from > to) {
                var temp = from;
                from = to;
                to = temp;
                jQuery("#geo_zip_range_from").val(from);
                jQuery("#geo_zip_range_to").val(to);
            }

            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetZipcodesByRange",
                data: { fromZipcode: from,
                    toZipcode: to,
                    maxLength: page.global.MaxNumberOfPastedZips
                },
                async: false,
                success: function(result) {
                    if (result.ResultFlag == true) {
                        zips = result.DataSource;
                    }

                },
                error: function(rep) {

                },
                waitingElement: 'ct_geo'
            });

            if (zips == null || zips.length == 0) {
                uc.geo.SetErrorMessage(true, "Please input at least one ZIP.");
                return false;
            }

        }

        //check whether zip is valid
        var isValid = true;
        var ziptype = 0;
        if (page.placeorder.order.ZipcodeOriginalType == entity.enums.ZipcodeOrignalType.ZIP_PASTED) {
            ziptype = uc.geo.zip.tempRadio;
        }

        order.ZipType = ziptype;

        //Erik Wang @20160215  just check the duplicate data or format
        if(page.placeorder.order.ZipcodeOriginalType == entity.enums.ZipcodeOrignalType.ZIP_PASTED) {
            if(uc.geo.zip.DuplicateZips.length > 0) {
                uc.geo.zip.ResetZips(zips);
                var duplicateString = "";
                for(var i = 0; i < uc.geo.zip.DuplicateZips.length; i++) {
                    duplicateString += (i == 0 ? "" : ", ") + uc.geo.zip.DuplicateZips[i].toString();
                }
                uc.geo.SetErrorMessage(true, "There were invalid or duplicate entries. They have been removed. Please click Next to continue. <br />Invalid or Duplicate entries: " + duplicateString);
                isValid = false;
            }
        }
        else {        
            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetZipsByZips",
                data: { zips: zips, zipType: ziptype },
                async: false,
                success: function(result) {
                    var resultZips = result.DataSource;
                    uc.geo.zip.ResetZips(resultZips);
                    if (resultZips == null || resultZips.length == 0) {
                        uc.geo.SetErrorMessage(true, "Please input at least one zip.");
                        isValid = false;
                    }
                    if (resultZips.length != zips.length) {
                        uc.geo.SetErrorMessage(true, "There were invalid or duplicate entries. They have been removed. Please click Next to continue.");
                        isValid = false;
                        setTimeout(function() { uc.geo.SetErrorMessage(false); }, 3000);
                    }
                },
                error: function(rep) {
                    uc.geo.SetErrorMessage(rep.responseText);
                    isValid = false;
                },
                waitingElement: 'ct_main_panel'
            });
        }
        
        if (!isValid) return false;

        // set max pasted zips;
        var length = zips.length > page.global.MaxNumberOfPastedZips ? page.global.MaxNumberOfPastedZips : zips.length;


        // set geos
        geos = [];
        for (var i = 0; i < length; i++) {
            var geo = new entity.OrderGeo();
            geo.GeoKeyCode = zips[i];
            geo.GeoKeyDesc = zips[i];
            geo.GeoType = entity.enums.GeoType.Zip;
            geos.push(geo);
        }

        if (geos == null || geos.length == 0) {
            uc.geo.SetErrorMessage(true, "Please input at least one zip.");
            return false;
        }

        order.OrderGeos = geos;
        return true;
    }
};

uc.geo.state = {
    isFirstLoad: true,
    Init: function() {
        if (uc.geo.state.isFirstLoad) {
            uc.geo.state.LoadStates();

            // Load From Order
            //uc.geo.state.LoadFromOrder();

            uc.geo.state.isFirstLoad = false;
        }
        if (!page.global.isMyAcxiomPartnerUSite) {
            uc.geo.state.LoadFromOrder();
        } else {
            if (page.placeorder.order.OrderId != undefined && page.placeorder.order.OrderId > 0) {
                uc.geo.state.LoadFromOrder();
            }
        }
    },

    LoadFromOrder: function() {
        var o = page.placeorder.order;
        if ((o.GeoType == entity.enums.GeoType.State || o.GeoType == entity.enums.GeoType.MultiGeo) && o.OrderGeos != null) { //#5752 multi geo
            //#5752 mutli geo begin
            var geos = [];
            for (var i = 0; i < o.OrderGeos.length; i++) {
                var myGeoType = o.OrderGeos[i].GeoType;
                if (myGeoType == entity.enums.GeoType.State) {
                    geos.push(o.OrderGeos[i]);
                }
            }
            //#5752 mutli geo end

            framework.ui.fillDropDownList({
                ElementId: "geo_state_right",
                DataSource: geos, //#5752 multi geo
                ValueField: "GeoKeyCode",
                TextField: "GeoKeyDesc",
                SelectValue: null
            });
        }
    },

    LoadStates: function() {

        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetStates",
            data: {},
            success: function(result) {
                if (result.ResultFlag == true) {
                    framework.ui.fillDropDownList({
                        ElementId: "geo_state_left",
                        DataSource: result.DataSource,
                        ValueField: "StateCode",
                        TextField: "StateName",
                        SelectValue: null
                    });
                }
            },
            error: function(rep) {
                uc.geo.SetErrorMessage(true, "We've a problem on retrieving states list, please try again later.");
            },
            waitingElement: 'ct_main_panel'
        });
    },

    AddStatesToTarget: function() {
        var sources = $('#geo_state_left').selectedOptions() || []
        for (var i = 0; i < sources.length; ++i) {
            if (!$("#geo_state_right").containsOption(sources[i].value)) {
                $("#geo_state_right").addOption(sources[i].value, sources[i].text, false);
            }
        };

        $("#geo_state_right").sortOptions(true);
        framework.common.iPad.refreshMask("geo_state_right");
    },

    RemoveStatesFromTarget: function() {
        $('#geo_state_right').removeOption(/./, true);
        framework.common.iPad.refreshMask("geo_state_right");
    },

    RemoveAllStatesFromTarget: function() {
        $('#geo_state_right').removeOption(/./);
        framework.common.iPad.refreshMask("geo_state_right");
    },

    //TODO
    SetOrderGeos: function(order) {
        // do validation first
        // set geos
        geos = [];
        jQuery("#geo_state_right option").each(
            function(i) {
                var geo = new entity.OrderGeo();
                geo.StateCode = this.value;
                geo.GeoKeyCode = this.value;
                geo.GeoKeyDesc = this.text;
                geo.GeoType = entity.enums.GeoType.State;
                geos.push(geo);
            }
        );

        if (geos == null || geos.length == 0) {
            uc.geo.SetErrorMessage(true, "Please select at least one state.");
            return false;
        }

        order.OrderGeos = geos;
        return true;
    }
};


//add by lisa.wang at 28/04/2015 begin for 5720
uc.geo.district = {
    isFirstLoad: true,
    Init: function() {
        if (uc.geo.district.isFirstLoad) {
            uc.geo.district.LoadStates();
            uc.geo.district.isFirstLoad = false;
        }
        if (!page.global.isMyAcxiomPartnerUSite) {
            uc.geo.district.LoadFromOrder();
        }
    },

    LoadFromOrder: function() {
        var o = page.placeorder.order;
        if (o.GeoType == entity.enums.GeoType.CongressionalDistrict && o.OrderGeos != null) {
            var key = "";
            for (var i = 0; i < o.OrderGeos.length; ++i) {
                key = o.OrderGeos[i].GeoKeyCode + "|" + o.OrderGeos[i].StateCode;
                if (!$("#geo_district_right").containsOption(key)) {
                    $("#geo_district_right").addOption(key, o.OrderGeos[i].CityName, false);
                }
            }
            if (framework.common.iPad.IsIpad()) {
                jQuery("#geo_district_right[multiple] option:selected").removeAttr("selected");
            }
            framework.common.iPad.refreshMask("geo_district_right");
        }
    },

    LoadStates: function() {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetStates",
            data: {},
            success: function(result) {
                if (result.ResultFlag == true) {
                    framework.ui.fillDropDownList({
                        ElementId: "geo_district_state",
                        DataSource: result.DataSource,
                        ValueField: "StateCode",
                        TextField: "StateName",
                        SelectValue: null
                    });

                    uc.geo.district.LoadDistricts();
                }
            },
            error: function(rep) {
                uc.geo.SetErrorMessage(true, "We've a problem on retrieving states list, please try again later.");
            },
            waitingElement: 'ct_main_panel'
        });
    },

    LoadDistricts: function() {
        var state = jQuery("#geo_district_state").val();
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetDistrictsByState",
            data: { statecode: state },
            success: function(result) {
                if (result.ResultFlag == true) {
                    framework.ui.fillDropDownList({
                        ElementId: "geo_district_left",
                        DataSource: result.DataSource,
                        ValueField: "Code",
                        TextField: "Name",
                        SelectValue: null
                    });
                }
            },
            error: function(rep) {
            },
            waitingElement: 'ct_geo_district'
        });
    },


    AddDistrictsToTarget: function() {
        var sources = $('#geo_district_left').selectedOptions() || []
        var state = jQuery("#geo_district_state").val();
        var key = "";
        for (var i = 0; i < sources.length; ++i) {
            key = sources[i].value + "|" + state;
            if (!$("#geo_district_right").containsOption(key)) {
                $("#geo_district_right").addOption(key, sources[i].text, false);
            }
        }
    },

    RemoveDistrictsFromTarget: function() {
        $('#geo_district_right').removeOption(/./, true);
    },

    RemoveAllDistrictsFromTarget: function() {
        $('#geo_district_right').removeOption(/./);
    },

    //TODO
    SetOrderGeos: function(order) {
        // do validation first
        // set geos
        geos = [];
        //var state = jQuery("#geo_city_state").val();
        jQuery("#geo_district_right option").each(
            function(i) {
                var geo = new entity.OrderGeo();
                var state = this.value.split("|")[1];
                geo.StateCode = state;
                geo.GeoKeyCode = this.value.split("|")[0]; //this.text + ":" + state;
                geo.GeoKeyDesc = String.format("{0}({1})", this.text, state);
                geo.CityName = this.text;
                geo.GeoType = entity.enums.GeoType.CongressionalDistrict;
                geos.push(geo);
            }
        );

        if (geos == null || geos.length == 0) {
            uc.geo.SetErrorMessage(true, "Please select at least one district.");
            return false;
        }

        order.OrderGeos = geos;
        return true;
    }
};
//add by lisa.wang at 28/04/2015 end

//add by lisa.wang at 06/01/2015 for 5752 begin
uc.geo.multigeo = {
    isFirstLoad: true,
    Init: function() {
        if (uc.geo.multigeo.isFirstLoad) {
            uc.geo.multigeo.LoadStates();
            uc.geo.multigeo.isFirstLoad = false;
        }
        if (!page.global.isMyAcxiomPartnerUSite) {
            //uc.geo.multigeo.LoadFromOrder();
        }
    },

    SetOrderGeos: function(order) {
        uc.geo.zip.DuplicateZips = [];
        uc.geo.SetErrorMessage(false);
        
        geos = [];
        jQuery("#geo_state_right option").each(
            function(i) {
                var geo = new entity.OrderGeo();
                geo.StateCode = this.value;
                geo.GeoKeyCode = this.value;
                geo.GeoKeyDesc = this.text;
                geo.GeoType = entity.enums.GeoType.State;
                geos.push(geo);
            }
        );



        jQuery("#geo_city_right option").each(
            function(i) {
                var geo = new entity.OrderGeo();
                var state = this.value.split("|")[1];
                geo.StateCode = state;
                geo.GeoKeyCode = this.text + ":" + state;
                geo.GeoKeyDesc = String.format("{0}({1})", this.text, state);
                geo.CityName = this.text;
                geo.GeoType = entity.enums.GeoType.City;
                geos.push(geo);
            }
        );

        jQuery("#geo_county_right option").each(
            function(i) {
                var state = $(this).attr('state');
                var geo = new entity.OrderGeo();
                geo.StateCode = state;
                geo.CountyCode = this.value;
                geo.CountyName = this.text;
                geo.CountyFips = $(this).attr('countyfips');
                geo.GeoKeyCode = this.value;
                geo.GeoKeyDesc = String.format("{0}({1})", this.text, state);
                geo.GeoType = entity.enums.GeoType.County;
                geos.push(geo);
            }
        );

        //zip begin
        uc.geo.zip.tempRadio = $("input[type='radio'][name='pastezip_radio']:checked").val();

        var zips = null;
        if (page.placeorder.order.ZipcodeOriginalType == entity.enums.ZipcodeOrignalType.ZIP_INPUT) {
            zips = uc.geo.zip.GetInputedZips();
            //do nothing
        }
        else if (page.placeorder.order.ZipcodeOriginalType == entity.enums.ZipcodeOrignalType.ZIP_PASTED) {
            zips = uc.geo.zip.GetPastedZips();
            if (zips == null || zips.length == 0) {
                if (uc.geo.zip.tempRadio == entity.enums.RadiusTypeChoice.ATUO) {
                    uc.geo.SetErrorMessage(true, "Please input at least one ZIP (e.g. 10017) and each end with newline.");
                }
                else if (uc.geo.zip.tempRadio == entity.enums.RadiusTypeChoice.ZIP4) {
                    uc.geo.SetErrorMessage(true, "Please input at least one ZIP (e.g. 071100001).");
                }
                else if (uc.geo.zip.tempRadio == entity.enums.RadiusTypeChoice.CRRT) {
                    uc.geo.SetErrorMessage(true, "Please input at least one ZIP (e.g. 07110:B001).");
                }
                return false;
            }
        } else {
            var from = jQuery("#geo_zip_range_from").val().trim();
            if (from == "" || !uc.geo.zip.IsValidZipcode(from)) {
                uc.geo.SetErrorMessage(true, "Please input the from ZIP code.");
                return false;
            }
            var to = jQuery("#geo_zip_range_to").val().trim();
            if (to == "" || !uc.geo.zip.IsValidZipcode(to)) {
                uc.geo.SetErrorMessage(true, "Please input the to ZIP code.");
                return false;
            }
            if (from > to) {
                var temp = from;
                from = to;
                to = temp;
                jQuery("#geo_zip_range_from").val(from);
                jQuery("#geo_zip_range_to").val(to);
            }

            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetZipcodesByRange",
                data: { fromZipcode: from,
                    toZipcode: to,
                    maxLength: page.global.MaxNumberOfPastedZips
                },
                async: false,
                success: function(result) {
                    if (result.ResultFlag == true) {
                        zips = result.DataSource;
                    }

                },
                error: function(rep) {

                },
                waitingElement: 'ct_geo'
            });

            if (zips == null || zips.length == 0) {
                uc.geo.SetErrorMessage(true, "Please input at least one ZIP.");
                return false;
            }


        }
        //check whether zip is valid
        var ziptype = 0;
        if (page.placeorder.order.ZipcodeOriginalType == entity.enums.ZipcodeOrignalType.ZIP_PASTED) {
            ziptype = uc.geo.zip.tempRadio;
        }

        order.ZipType = ziptype;
        
        //Erik Wang @20160215  just check the duplicate data or format
        if(page.placeorder.order.ZipcodeOriginalType == entity.enums.ZipcodeOrignalType.ZIP_PASTED) {
            if(uc.geo.zip.DuplicateZips.length > 0) {
                uc.geo.zip.ResetZips(zips);
                var duplicateString = "";
                for(var i = 0; i < uc.geo.zip.DuplicateZips.length; i++) {
                    duplicateString += (i == 0 ? "" : ", ") + uc.geo.zip.DuplicateZips[i].toString();
                }
                uc.geo.SetErrorMessage(true, "There were invalid or duplicate entries. They have been removed. Please click Next to continue. <br />Invalid or Duplicate entries: " + duplicateString);
                isValid = false;
            }
        }
        else {   
            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetZipsByZips",
                data: { zips: zips, zipType: ziptype },
                async: false,
                success: function(result) {
                    var resultZips = result.DataSource;
                    uc.geo.zip.ResetZips(resultZips);

                    if (resultZips.length != zips.length) {
                        uc.geo.SetErrorMessage(true, "There were invalid or duplicate entries. They have been removed. Please click Next to continue.");
                        return false;
                    }
                },
                error: function(rep) {
                    uc.geo.SetErrorMessage(rep.responseText);
                    return false;
                },
                waitingElement: 'ct_main_panel'
            });
        }

        if (zips != null) {
            // set max pasted zips;
            var length = zips.length > page.global.MaxNumberOfPastedZips ? page.global.MaxNumberOfPastedZips : zips.length;

            // set geos
            for (var i = 0; i < length; i++) {
                var geo = new entity.OrderGeo();
                geo.GeoKeyCode = zips[i];
                geo.GeoKeyDesc = zips[i];
                geo.GeoType = entity.enums.GeoType.Zip;
                geos.push(geo);
            }
        }
        //zip end


        if (geos == null || geos.length == 0) {
            uc.geo.SetErrorMessageForMulti(true, "Please select at least one of Zip,City,County or State.");
            return false;
        } else {
            uc.geo.SetErrorMessageForMulti(false, "");
        }

        order.OrderGeos = geos;
        return true;
    }
};
//add by lisa.wang for 5752 at 28/04/2015 end


uc.geo.city = {
    isFirstLoad: true,
    Init: function() {
        if (uc.geo.city.isFirstLoad) {
            uc.geo.city.LoadStates();

            // Load From Order
            //uc.geo.city.LoadFromOrder();

            uc.geo.city.isFirstLoad = false;
        }
        if (!page.global.isMyAcxiomPartnerUSite) {
            uc.geo.city.LoadFromOrder();
        } else {
            if (page.placeorder.order.OrderId != undefined && page.placeorder.order.OrderId > 0) {
                uc.geo.city.LoadFromOrder();
            }
        }
    },

    LoadFromOrder: function() {
        var o = page.placeorder.order;
        if ((o.GeoType == entity.enums.GeoType.City || o.GeoType == entity.enums.GeoType.MultiGeo) && o.OrderGeos != null) {//#5752 multi geo
            var key = "";
            for (var i = 0; i < o.OrderGeos.length; ++i) {
                //#5752 mutli geo begin
                if (o.OrderGeos[i].GeoType != entity.enums.GeoType.City) continue;
                //#5752 mutli geo end

                key = o.OrderGeos[i].CityName + "|" + o.OrderGeos[i].StateCode;
                if (!$("#geo_city_right").containsOption(key)) {
                    $("#geo_city_right").addOption(key, o.OrderGeos[i].CityName, false);
                }
            }
            if (framework.common.iPad.IsIpad()) {
                jQuery("#geo_city_right[multiple] option:selected").removeAttr("selected");
            }
            framework.common.iPad.refreshMask("geo_city_right");
        }
    },

    LoadStates: function() {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetStates",
            data: {},
            success: function(result) {
                if (result.ResultFlag == true) {
                    framework.ui.fillDropDownList({
                        ElementId: "geo_city_state",
                        DataSource: result.DataSource,
                        ValueField: "StateCode",
                        TextField: "StateName",
                        SelectValue: null
                    });

                    uc.geo.city.LoadCities();
                }
            },
            error: function(rep) {
                uc.geo.SetErrorMessage(true, "We've a problem on retrieving states list, please try again later.");
            },
            waitingElement: 'ct_main_panel'
        });
    },

    LoadCities: function() {
        var state = jQuery("#geo_city_state").val();
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetCitiesByState",
            data: { statecode: state },
            success: function(result) {
                if (result.ResultFlag == true) {
                    framework.ui.fillDropDownList({
                        ElementId: "geo_city_left",
                        DataSource: result.DataSource,
                        ValueField: "CityCode",
                        TextField: "CityName",
                        SelectValue: null
                    });
                }
            },
            error: function(rep) {
            },
            waitingElement: 'ct_geo_city'
        });
    },

    AddCitiesToTarget: function() {
        var sources = $('#geo_city_left').selectedOptions() || []
        var state = jQuery("#geo_city_state").val();
        var key = "";
        for (var i = 0; i < sources.length; ++i) {
            key = sources[i].text + "|" + state;
            if (!$("#geo_city_right").containsOption(key)) {
                $("#geo_city_right").addOption(key, sources[i].text, false);
            }
        };
        $("#geo_city_right").sortOptions(true);
        framework.common.iPad.refreshMask("geo_city_right");
    },

    RemoveCitiesFromTarget: function() {
        $('#geo_city_right').removeOption(/./, true);
        framework.common.iPad.refreshMask("geo_city_right");
    },

    RemoveAllCitiesFromTarget: function() {
        $('#geo_city_right').removeOption(/./);
        framework.common.iPad.refreshMask("geo_city_right");
    },

    //TODO
    SetOrderGeos: function(order) {
        // do validation first
        // set geos
        geos = [];
        //var state = jQuery("#geo_city_state").val();
        jQuery("#geo_city_right option").each(
            function(i) {
                var geo = new entity.OrderGeo();
                var state = this.value.split("|")[1];
                geo.StateCode = state;
                geo.GeoKeyCode = this.text + ":" + state;
                geo.GeoKeyDesc = String.format("{0}({1})", this.text, state);
                geo.CityName = this.text;
                geo.GeoType = entity.enums.GeoType.City;
                geos.push(geo);
            }
        );

        if (geos == null || geos.length == 0) {
            uc.geo.SetErrorMessage(true, "Please select at least one city.");
            return false;
        }

        order.OrderGeos = geos;
        return true;
    }
};

uc.geo.county = {
    isFirstLoad: true,
    Init: function() {
        if (uc.geo.county.isFirstLoad) {
            uc.geo.county.LoadStates();

            // Load From Order
            //uc.geo.county.LoadFromOrder();

            uc.geo.county.isFirstLoad = false;
        }
        if (!page.global.isMyAcxiomPartnerUSite) {
            uc.geo.county.LoadFromOrder();
        } else {
            if (page.placeorder.order.OrderId != undefined && page.placeorder.order.OrderId > 0) {
                uc.geo.county.LoadFromOrder();
            }
        }
    },

    LoadFromOrder: function() {
        var o = page.placeorder.order;
        if ((o.GeoType == entity.enums.GeoType.County || o.GeoType == entity.enums.GeoType.MultiGeo) && o.OrderGeos != null) {//#5752 multi geo
            //#5752 mutli geo begin
            var geos = [];
            for (var i = 0; i < o.OrderGeos.length; i++) {
                var myGeoType = o.OrderGeos[i].GeoType;
                if (myGeoType == entity.enums.GeoType.County) {
                    geos.push(o.OrderGeos[i]);
                }
            }
            //#5752 mutli geo end
            framework.ui.fillDropDownList({
                ElementId: "geo_county_right",
                DataSource: geos,
                ValueField: "GeoKeyCode",
                TextField: "CountyName",
                SelectValue: null,
                Attributes: { countycode: 'GeoKeyCode', countyfips: 'CountyFips', state: 'StateCode' }
            });
        }
    },

    LoadStates: function() {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetStates",
            data: {},
            success: function(result) {
                if (result.ResultFlag == true) {
                    framework.ui.fillDropDownList({
                        ElementId: "geo_county_state",
                        DataSource: result.DataSource,
                        ValueField: "StateCode",
                        TextField: "StateName",
                        SelectValue: null
                    });

                    uc.geo.county.LoadCounties();
                }
            },
            error: function(rep) {
                uc.geo.SetErrorMessage(true, "We've a problem on retrieving states list, please try again later.");
            },
            waitingElement: 'ct_main_panel'
        });
    },

    LoadCounties: function() {
        var state = jQuery("#geo_county_state").val();
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetCountiesByState",
            data: { statecode: state },
            success: function(result) {
                if (result.ResultFlag == true) {
                    // uc.geo.county.BindCountyValues(result.DataSource);
                    framework.ui.fillDropDownList({
                        ElementId: "geo_county_left",
                        DataSource: result.DataSource,
                        ValueField: "CountyCode",
                        TextField: "CountyName",
                        SelectValue: null,
                        Attributes: { countycode: 'CountyCode', countyfips: 'CountyFips', state: 'StateCode' }
                    });
                }

            },
            error: function(rep) {
            },
            waitingElement: 'ct_geo_county'
        });
    },

    AddCountiesToTarget: function() {
        var sources = $('#geo_county_left').selectedOptions() || []
        for (var i = 0; i < sources.length; ++i) {
            if (!$("#geo_county_right").containsOption(sources[i].value)) {
                //$("#geo_county_right").addOption(sources[i].value, sources[i].text, false);
                $("#geo_county_right").append($(sources[i]).clone())
            }
        };
        $("#geo_county_right").val(-1);

        // re-order, need to move it to framework
        var lst = $("#geo_county_right").get(0);
        var ops = [];
        while (lst.options.length) {
            var b = lst.options[lst.options.length - 1];
            ops.unshift(lst.removeChild(b));
        }
        ops.sort(function(a, b) { return a.value > b.value; });
        while (ops.length) {
            lst.appendChild(ops.shift());
        }
        framework.common.iPad.refreshMask("geo_county_right");
        //$("#geo_county_right").sortOptions(true);

    },

    RemoveCountiesFromTarget: function() {
        $('#geo_county_right').removeOption(/./, true);
        framework.common.iPad.refreshMask("geo_county_right");
    },

    RemoveAllCountiesFromTarget: function() {
        $('#geo_county_right').removeOption(/./);
        framework.common.iPad.refreshMask("geo_county_right");
    },

    //TODO
    SetOrderGeos: function(order) {
        // do validation first
        // set geos
        geos = [];
        jQuery("#geo_county_right option").each(
            function(i) {
                var state = $(this).attr('state');
                var geo = new entity.OrderGeo();
                geo.StateCode = state;
                geo.CountyCode = this.value;
                geo.CountyName = this.text;
                if(order.ListType == entity.enums.DataSourceType.InfoUSA_Consumer || order.ListType == entity.enums.DataSourceType.InfoUSA_Business){
                    geo.CountyFips = String.format("{0}_{1}", this.text, state);
                }
                else{
                    geo.CountyFips = $(this).attr('countyfips');
                }
                geo.GeoKeyCode = this.value;
                geo.GeoKeyDesc = String.format("{0}({1})", this.text, state);
                geo.GeoType = entity.enums.GeoType.County;
                geos.push(geo);
            }
        );

        if (geos == null || geos.length == 0) {
            uc.geo.SetErrorMessage(true, "Please select at least one county.");
            return false;
        }

        order.OrderGeos = geos;
        return true;
    }
};

uc.geo.radius = {

    _NeedAddLayer: true,
    _initAddLayer: true,
    _IsInit: false,
    RadiusAddresses: [],
    CurrentAddress: null,
    Overlays: null,
    MapZips: [],
    MapPaths: [],
    isCallAndLoadMap: false,
    HighlightOverlays: null,
    HighlightData: null,
    MultiRadiusFileName: null,

    Init: function() {
        var o = page.placeorder.order;
        uc.geo.radius.Overlays = new Object();
        jQuery("#ct_geo_radius_input").addClass("hidden");
        jQuery("#ct_geo_radius_zip").addClass("hidden");
        jQuery("#ct_geo_radius_closex").addClass("hidden");
        jQuery("#ct_geo_polygon").addClass("hidden");
        jQuery("#ct_geo_multiRadius").addClass("hidden");
        jQuery("#ct_geo_multiClosex").addClass("hidden");
        jQuery("#add_radius_target_address_radius").addClass("hidden");
        jQuery("#add_radius_target_address_closex").addClass("hidden");
        jQuery('#multi_closex_name').addClass("hidden");
        jQuery("#search_closex").addClass("hidden");
        jQuery("#multi_radius_address").addClass("hidden");
        jQuery("#ct_geo_multi_radius_input").addClass("hidden");
        jQuery("#ct_geo_zip_map").addClass("hidden");
        jQuery('#span_closex_name').addClass("hidden");
        if (page.placeorder.RadiusUnit == entity.enums.UmCodeType.KM) {
            jQuery(".radius_unit").html("Kilometer(s)");
        }
        switch (o.GeoType) {
            case entity.enums.GeoType.Radius:
                jQuery("#ct_geo_radius_input").removeClass("hidden");
                //		        if (page.placeorder.IsMultipleAddress)
                //				{
                //				    jQuery("#add_radius_target_address_radius").removeClass("hidden");
                //				    jQuery("#multi_radius_address").removeClass("hidden");
                //				}
                if (o.ListType == entity.enums.DataSourceType.CanadaConsumer) {
                    //only zip code is valid for compasscan datasource
                    jQuery("#radiusTypeByRadius").find("option").remove().end().append('<option value="4" title="Postal Code">Postal Code</option>');

                }
                break;
            case entity.enums.GeoType.ZipRadius:
                jQuery("#ct_geo_radius_zip").removeClass("hidden");
                jQuery("#geo_radius_zip").setMask(page.placeorder.ZipMask);
                break;
            case entity.enums.GeoType.Closex:
                jQuery("#ct_geo_radius_closex").removeClass("hidden");
                //			    if (page.placeorder.IsMultipleAddress) {
                //			        jQuery("#add_radius_target_address_closex").removeClass("hidden");
                //			        jQuery("#search_closex").removeClass("hidden");
                //			        jQuery("#multi_radius_address").removeClass("hidden");
                //			        jQuery('#multi_closex_name').removeClass("hidden");
                //			        jQuery('#span_closex_name').removeClass("hidden");
                //			    }
                //uc.geo.showAddRadiusAddrfn(entity.enums.GeoType.Closex);
                break;
            case entity.enums.GeoType.Polygon:
                jQuery("#ct_geo_polygon").removeClass("hidden");
                if (o.ListType == entity.enums.DataSourceType.CanadaConsumer) {
                    //only zip code is valid for compasscan datasource
                    jQuery("#radiusTypeByPolygon").find("option").remove().end().append('<option value="4" title="Postal Code">Postal Code</option>');

                }
                break;
            case entity.enums.GeoType.MultiRadius:
                jQuery("#ct_geo_multiRadius").removeClass("hidden");
                if (page.placeorder.IsMultipleAddress) {

                    jQuery("#multi_radius_address").removeClass("hidden");
                }
                break;
            case entity.enums.GeoType.MultiClosex:
                jQuery("#ct_geo_multiClosex").removeClass("hidden");
                if (page.placeorder.IsMultipleAddress) {

                    jQuery("#multi_radius_address").removeClass("hidden");
                }
                break;
            case entity.enums.GeoType.AcxiomMultiRadius:
                jQuery("#ct_geo_multi_radius_input").removeClass("hidden");
                if (page.placeorder.IsMultipleAddress) {
                    jQuery("#add_multi_radius_target_address_radius").removeClass("hidden");
                    jQuery("#multi_radius_address").removeClass("hidden");
                }
                break;
            case entity.enums.GeoType.ZipMap:
                jQuery("#ct_geo_zip_map").removeClass("hidden");
                break;

        };

        // hide more address if exist
        uc.geo.radius.ShowMoreAddresses();
        //		var zipMapRadiusTypeChoice = page.placeorder.order.RadiusTypeChoice != entity.enums.RadiusTypeChoice.CRRT ? entity.enums.RadiusTypeChoice.ZIP5 : entity.enums.RadiusTypeChoice.CRRT;		
        var mapZoom = 4;
        if (!uc.geo.radius._IsInit) {
            // Load From Order
            //uc.geo.radius.LoadFromOrder();

            // Initialize Google Map
            framework.ui.showWaiting('ct_geo_radius', true);

            framework.common.GoogleMap.LoadMapApi(
				function() {
				    jQuery('#geo_radius_map').jmap('init', { 'mapCenter': page.placeorder.MapCenter, 'mapZoom': mapZoom, 'mapEnableScrollZoom': true, 'mapEnableScaleControl': true }, function() {
				        if (!page.global.isMyAcxiomPartnerUSite) {
				            uc.geo.radius.LoadFromOrder();
				        } else {
				            if (page.placeorder.order.OrderId != undefined && page.placeorder.order.OrderId > 0) {
				                uc.geo.radius.LoadFromOrder();
				            }
				        }
				        var elMap = jQuery('#geo_radius_map');
				        var thisMap = Mapifies.MapObjects.Get(elMap);
				        uc.geo.overlay = new google.maps.OverlayView();
				        uc.geo.overlay.draw = function() { };
				        uc.geo.overlay.setMap(thisMap);

				        if (uc.geo.overlay.getProjection() == undefined) {
				            uc.geo.overlay = new google.maps.OverlayView();
				            uc.geo.overlay.draw = function() { };
				            uc.geo.overlay.setMap(thisMap);
				        }
				        google.maps.event.addListener(thisMap, 'idle', function() { });

				        google.maps.event.addListener(thisMap, "zoom_changed", function() {
				            var o = page.placeorder.order;
				            var zipMapRadiusTypeChoice = page.placeorder.order.RadiusTypeChoice != entity.enums.RadiusTypeChoice.CRRT ? entity.enums.RadiusTypeChoice.ZIP5 : entity.enums.RadiusTypeChoice.CRRT;
				            if (framework.common.IsWMSEnable) {
				                var elMap = jQuery('#geo_radius_map');
				                var thisMap = Mapifies.MapObjects.Get(elMap);
				                var zoom = thisMap.getZoom();

				                if (uc.geo.radius._NeedAddLayer && !uc.geo.radius._initAddLayer) {
				                    uc.geo.radius._initAddLayer = true;
				                }
				                uc.geo.radius._NeedAddLayer = true;

				                //uc.geo.radius.AddLayer(zipMapRadiusTypeChoice, false);
				                //				                }
				                if (uc.geo.radius._NeedAddLayer && uc.geo.radius.isCallAndLoadMap == false) {
				                    if (uc.geo.radius._initAddLayer) {
				                        var zip = jQuery("#zip_map_address").val();

				                        if (framework.common.IsNumber(zip, 5)) {
				                            uc.geo.radius.isCallAndLoadMap = true;
				                            framework.common.Ajax({
				                                url: "PlaceOrder.aspx/GetZip",
				                                data: { zip: zip },
				                                success: function(result) {
				                                    if (result.ResultFlag) {
				                                        var Lat = result.DataSource.Latitude;
				                                        var Lng = result.DataSource.Longitude;
				                                        // set Latitude and Longitude
				                                        jQuery('#geo_radius_addr_lat').val(Lat);
				                                        jQuery('#geo_radius_add_lng').val(Lng);

				                                        var radius = jQuery("#zip_map_radius").val();
				                                        if (page.placeorder.EnableZipCodeOrCarrierRouteRadius) {
				                                            if (radius != undefined && radius != "" && radius != null) {
				                                                uc.geo.radius.showRadiusElements(Lng, Lat, radius, true);
				                                            }
				                                        } else {

				                                            uc.geo.radius.ZipMapSelected({ x: Lng, y: Lat });
				                                        }
				                                    }
				                                    uc.geo.radius.isCallAndLoadMap = false;
				                                },
				                                error: function(rep) {
				                                    uc.geo.SetErrorMessage(true, valid.message);
				                                    uc.geo.radius.isCallAndLoadMap = false;
				                                }
				                            });
				                        };

				                        uc.geo.radius.AddLayer(zipMapRadiusTypeChoice, false);
				                    };
				                    //uc.geo.radius._NeedAddLayer = false;
				                }
				            }
				        });

				        framework.ui.showWaiting('ct_geo_radius', false);
				        if (o.GeoType == entity.enums.GeoType.ZipMap && page.placeorder.AddressByCurrentUser != '') {
				            uc.geo.radius.SearchAddressWithAddress(page.placeorder.AddressByCurrentUser, '', uc.geo.radius.showRadiusElements, uc.geo.radius.USMapLoad, true);
				            var zipMapRadiusTypeChoice = page.placeorder.order.RadiusTypeChoice != entity.enums.RadiusTypeChoice.CRRT ? entity.enums.RadiusTypeChoice.ZIP5 : entity.enums.RadiusTypeChoice.CRRT;
				            uc.geo.radius.AddLayer(zipMapRadiusTypeChoice, false);
				        } else {
				            //							uc.geo.radius.USMapLoad();
				        }
				    });


				    //init Googel Auto Complete API
				    framework.common.InitAutocomplete(jQuery("#geo_radius_address")[0], uc.geo.radius.SearchAddress);
				    framework.common.InitAutocomplete(jQuery("#geo_radius_closex_address")[0], uc.geo.radius.SearchClosexAddress);
				    framework.common.InitAutocomplete(jQuery("#geo_polygon_address")[0], uc.geo.radius.SearchPolygonAddress);
				    framework.common.InitAutocomplete(jQuery("#multi_radius")[0], uc.geo.radius.SearchAcxiomAddress);
				    framework.common.InitAutocomplete(jQuery("#geo_multiclosex_address")[0], uc.geo.radius.SearchMultiClosexAddress);
				    framework.common.InitAutocomplete(jQuery("#zip_map_address")[0], uc.geo.radius.SearchZipMapAddress);

				}
			);


            jQuery("#geo_radius_value").numeric();
            jQuery("#geo_radius_zip_value").numeric();
            jQuery("#geo_multiradius_value").numeric();
            jQuery("#geo_radius_closex_qty").setMask("99999");
            jQuery("#geo_multiclosex_qty").setMask("99999");

            uc.geo.radius._IsInit = true;
        } else {
            //uc.geo.radius.DoSearch();

            // uc.geo.radius.LoadFromOrder();
            jQuery('#geo_radius_map').jmap('init', { 'mapCenter': page.placeorder.MapCenter, 'mapZoom': mapZoom, 'mapEnableScrollZoom': true, 'mapEnableScaleControl': true }, function() {
                if (!page.global.isMyAcxiomPartnerUSite) {
                    uc.geo.radius.LoadFromOrder();
                } else {
                    if (page.placeorder.order.OrderId != undefined && page.placeorder.order.OrderId > 0) {
                        uc.geo.radius.LoadFromOrder();
                    }
                }
                var elMap = jQuery('#geo_radius_map');
                var thisMap = Mapifies.MapObjects.Get(elMap);
                uc.geo.overlay = new google.maps.OverlayView();
                uc.geo.overlay.draw = function() { };
                uc.geo.overlay.setMap(thisMap);

                if (uc.geo.overlay.getProjection() == undefined) {
                    uc.geo.overlay = new google.maps.OverlayView();
                    uc.geo.overlay.draw = function() { };
                    uc.geo.overlay.setMap(thisMap);
                }
                google.maps.event.addListener(thisMap, 'idle', function() { });
            });

            //		if (o.GeoType == entity.enums.GeoType.ZipMap && page.placeorder.AddressByCurrentUser != '') {
            //		    uc.geo.radius.SearchAddressWithAddress(page.placeorder.AddressByCurrentUser, '', undefined, uc.geo.radius.USMapLoad, true);
            //		}
            //			if (framework.common.IsWMSEnable && o.GeoType == entity.enums.GeoType.ZipMap)
            //				{
            //				    //framework.common.addLayer("CR", "CR", 1, Mapifies.MapObjects.Get(jQuery('#geo_radius_map')));
            //				    //framework.common.addLayer("USHighways", "ZipCode", 0, Mapifies.MapObjects.Get(jQuery('#geo_radius_map')));
            //				    jQuery("input[name=geo_zip_map_type][value=" + zipMapRadiusTypeChoice + "]").attr("checked", true);
            //				    uc.geo.radius.AddLayer(zipMapRadiusTypeChoice, false);
            //				    GEvent.addListener(Mapifies.MapObjects.Get(jQuery('#geo_radius_map')), "click", uc.geo.radius.ZipMapClickHandler); 
            //				}

        };

        //Fixed bug: avoid show decimal in Desired Quantity
        if (jQuery("#geo_radius_closex_qty").val().trim() != "") {
            if (jQuery("#geo_radius_closex_qty").val().indexOf(".") > 0 || jQuery("#geo_radius_closex_address").val().trim() == "") {
                jQuery("#geo_radius_closex_qty").attr("value", "");
            };
        };

        if (jQuery("#geo_radius_address").val().trim() == "") {
            jQuery("#geo_radius_value").attr("value", "");
        };
        if (jQuery("#geo_radius_zip").val().trim() == "") {
            jQuery("#geo_radius_zip_value").attr("value", "");

        };


    },



    CheckCloseXQuantity: function(element) {
        uc.geo.SetErrorMessage(false, "");
        uc.geo.SetErrorMessageForMulti(false, "");
        var item = jQuery(element);
        if (String.IsNullOrEmpty(item.val())) {
            uc.geo.SetErrorMessage(true, "Quantity is required!");
            return;
        }
        var quantity = Number(item.val());
        if (quantity > 25000) {
            item.val(25000);
        }
        if (quantity <= 0) {
            uc.geo.SetErrorMessage(true, "Quantity must be greater than 0!");
            return;
        }
    },

    unique: function(array) {
        var ret = [], record = {}, it, tmp, obj = "__object__", bak = [], i, len;
        var type = {
            "number": function(n) { return "__number__" + n; },
            "string": function(n) { return "__string__" + n; },
            "boolean": function(n) { return "__boolean__" + n; },
            "undefined": function(n) { return "__undefined__"; },
            "object": function(n) {
                return n === null ? "__null__" : obj in n ? n[obj] : (n[obj] = obj + bak.push(n));
            }
        };
        for (i = 0, len = array.length; i < len; i++) {
            it = array[i]; tmp = type[typeof it](it);
            if (!(tmp in record)) { ret.push(it); record[tmp] = true; }
        }
        for (i = 0, len = bak.length; i < len; delete bak[i++][obj]) { }
        return ret;
    },

    AddLayer: function(typeChoice, reload) {
        var elMap = jQuery('#geo_radius_map');
        var thisMap = Mapifies.MapObjects.Get(elMap);
        var zoom = thisMap.getZoom();
        if (zoom < 12) {
            return;
        }
        uc.geo.radius._initAddLayer = false;
        //uc.geo.radius.MapZips = uc.geo.radius.unique(uc.geo.radius.MapZips);
        if (reload) {
            uc.geo.radius.ClearMapZips();
        }
        uc.geo.radius.ShowSelectedZips(uc.geo.radius.MapZips);
        var layerName = typeChoice == entity.enums.RadiusTypeChoice.CRRT ? "CR" : "ZIP";
        framework.common.addLayer(layerName, layerName, 1, Mapifies.MapObjects.Get(jQuery('#geo_radius_map')));
        page.placeorder.order.RadiusTypeChoice = typeChoice;
        //uc.geo.radius.SearchZipMapAddress();
    },

    ClearMapZips: function() {
        var zipsMap = Mapifies.MapObjects.Get(jQuery('#geo_radius_map'));
        jQuery.each(uc.geo.radius.MapZips, function(index, data) {
            uc.geo.radius.RemoveGeoElement(data, zipsMap);
        });
        uc.geo.radius.MapZips = [];
        //uc.geo.radius.ShowSelectedZips(uc.geo.radius.MapZips);	
    },

    CheckRadius: function(obj) {
        uc.geo.SetErrorMessage(false, "");
        if (String.IsNullOrEmpty(jQuery(obj).val())) {
            uc.geo.SetErrorMessage(true, "Radius is required!");
            return;
        }
        var radius = Number(jQuery(obj).val());

        //#6148 - Update radius around an address to go to 200 miles
        if (radius > 200) {
            jQuery(obj).val(200);
        }
        if (radius <= 0) {
            uc.geo.SetErrorMessage(true, "Radius must be greater than 0!");
            return;
        }

        var o = page.placeorder.order;
        switch (o.GeoType) {
            case entity.enums.GeoType.Radius:
                uc.geo.radius.SearchAddress();
                break;
            case entity.enums.GeoType.ZipRadius:
                uc.geo.radius.SearchZipAddress();
                break;
            case entity.enums.GeoType.MultiRadius:
                uc.geo.radius.SearchMultiAddress();
                break;
            case entity.enums.GeoType.AcxiomMultiRadius:
                uc.geo.radius.SearchAcxiomAddress();
                break;
            case entity.enums.GeoType.ZipMap:
                uc.geo.radius.SearchZipMapAddress();
                break;
        }

        //		if (o.GeoType == entity.enums.GeoType.Radius) {
        //			uc.geo.radius.SearchAddress();
        //		} else if (o.GeoType == entity.enums.GeoType.ZipRadius) {
        //			uc.geo.radius.SearchZipAddress();
        //		}
    },

    SetRadiusDescription: function() {
        var radiusUnit = framework.ui.GetRadiusUnitDesc(page.placeorder.RadiusUnit);
        var desc = String.format("You may change the radius by entering the number of \"{0}\" (maximum 50 {0}) and re-clicking \"Search\". When you are ready to proceed, please click \"Next\".", radiusUnit);

    },

    LoadFromOrder: function() {
        var o = page.placeorder.order;

        var searchStr = "";
        var lat = null;
        var lng = null;
        var radius = "";
        var quantity = "";
        var pointsStr = "";
        var radiusTypeChoice = o.RadiusTypeChoice;
        uc.geo.radius.RadiusAddresses = [];
        if (o.OrderAddresses != null && o.OrderAddresses.length > 0) {
            for (var i = 0; i < o.OrderAddresses.length; i++) {
                if (o.OrderAddresses[i].AddrUsageType == 2) {
                    searchStr = o.OrderAddresses[i].AddressLine;
                    lat = o.OrderAddresses[i].Latitude;
                    lng = o.OrderAddresses[i].Longitude;
                    pointsStr = o.OrderAddresses[i].AddrSearchString;
                    radius = o.OrderAddresses[i].Radius;
                    quantity = o.OrderAddresses[i].Quantity;
                    uc.geo.radius.RadiusAddresses.push(o.OrderAddresses[i]);
                }
            }
        }

        if (radiusTypeChoice == entity.enums.RadiusTypeChoice.UNKNOWN) {
            radiusTypeChoice = entity.enums.RadiusTypeChoice.AUTO;
        }

        switch (o.GeoType) {
            case entity.enums.GeoType.Radius:
                jQuery('#geo_radius_address').val(searchStr);
                jQuery('#geo_radius_value').val(radius);
                jQuery("#radiusTypeByRadius").val(radiusTypeChoice);
                break;
            case entity.enums.GeoType.ZipRadius:
                jQuery('#geo_radius_zip').val(searchStr);
                jQuery('#geo_radius_zip_value').val(radius);
                jQuery("#radiusTypeByRadiusZip").val(radiusTypeChoice);
                break;
            case entity.enums.GeoType.Closex:
                jQuery('#geo_radius_closex_address').val(searchStr);
                jQuery('#geo_radius_closex_qty').val(quantity);
                break;
            case entity.enums.GeoType.Polygon:
                jQuery('#geo_polygon_address').val(searchStr);
                jQuery("#radiusTypeByPolygon").val(radiusTypeChoice);
                $("#ma_explain_video_line").css("display", "block");
                $("#sl360_explain_video_setp_2").css("display", "block");
                break;
            case entity.enums.GeoType.MultiRadius:
                jQuery("#geo_multiradius_address").val(searchStr);
                jQuery('#geo_multiradius_value').val(radius);
                jQuery("#RadiusTypeByMultiRadius").val(radiusTypeChoice);
                break;
            case entity.enums.GeoType.MultiClosex:
                jQuery("#geo_multiclosex_address").val(searchStr);
                jQuery('#geo_multiclosex_qty').val(quantity);
                break;
        }

        if (o.GeoType != entity.enums.GeoType.ZipMap) {
            if (lat != null && lng != null) {
                uc.geo.radius.SearchMapByLatLngAndAddress(lat, lng, searchStr, true);
            }
            if (uc.geo.radius.RadiusAddresses.length > 0) {
                uc.geo.radius.CurrentAddress = uc.geo.radius.RadiusAddresses[uc.geo.radius.RadiusAddresses.length - 1];

                var elMap = jQuery('#geo_radius_map');
                elMap.jmap('ClearMap');
                if (uc.geo.radius.CurrentAddress != null) {
                    elMap.jmap('MoveTo', {
                        'mapCenter': [uc.geo.radius.CurrentAddress.Latitude, uc.geo.radius.CurrentAddress.Longitude]
                    });
                }
                framework.ui.ShowMarkers(uc.geo.radius.RadiusAddresses, elMap);
            }
            uc.geo.radius.ShowTargetAddresses(uc.geo.radius.RadiusAddresses);
        } else {
            var zipMapRadiusTypeChoice = page.placeorder.order.RadiusTypeChoice != entity.enums.RadiusTypeChoice.CRRT ? entity.enums.RadiusTypeChoice.ZIP5 : entity.enums.RadiusTypeChoice.CRRT;
            if (framework.common.IsWMSEnable && o.GeoType == entity.enums.GeoType.ZipMap) {
                jQuery("input[name=geo_zip_map_type][value=" + zipMapRadiusTypeChoice + "]").attr("checked", true);


                //                var latitude = 40.7519846;
                //                var Longitude = -73.96977950000002;
                //                var elMap = jQuery('#geo_radius_map');
                //                elMap.jmap('ClearMap');
                //                elMap.jmap('MoveTo', {
                //                'mapCenter': [latitude, Longitude]
                //                });



                //uc.geo.radius.AddLayer(zipMapRadiusTypeChoice, false);
                google.maps.event.addListener(Mapifies.MapObjects.Get(jQuery('#geo_radius_map')), "mousemove", uc.geo.radius.ZipMapMouseMoveHandler);
                google.maps.event.addListener(Mapifies.MapObjects.Get(jQuery('#geo_radius_map')), "mouseout", uc.geo.radius.RemoveHighlightGeoElement);

                google.maps.event.addListener(Mapifies.MapObjects.Get(jQuery('#geo_radius_map')), "click", uc.geo.radius.ZipMapClickHandler);

            }

            if (o.OrderGeos != null) {
                var geos = [];
                jQuery.each(o.OrderGeos, function(i, data) {
                    geos.push(data.GeoKeyDesc);
                });
                uc.geo.radius.MapZips = [];
                var zipType = page.placeorder.order.RadiusTypeChoice == entity.enums.RadiusTypeChoice.CRRT ? "crid" : "zip";
                framework.common.ShowGeoElements(zipType, geos, uc.geo.radius.Overlays, uc.geo.radius.MapZips, Mapifies.MapObjects.Get(jQuery('#geo_radius_map')), uc.geo.radius.AddGeoElement);
            }
        }
    },

    DoSearch: function() {
        var o = page.placeorder.order;
        switch (o.GeoType) {
            case entity.enums.GeoType.Radius:
                uc.geo.radius.SearchAddress();
                break;
            case entity.enums.GeoType.ZipRadius:
                uc.geo.radius.SearchZipAddress();
                break;
            case entity.enums.GeoType.Closex:
                uc.geo.radius.SearchClosexAddress();
                break;
            case entity.enums.GeoType.Polygon:
                uc.geo.radius.SearchPolygonAddress();
                break;

        }
    },



    SearchAddress: function() {
        uc.geo.SetErrorMessage(false, "");
        var address = jQuery('#geo_radius_address').val();
        var radius = jQuery('#geo_radius_value').val();
        return uc.geo.radius.SearchAddressWithAddress(address, radius);

    },


    ShowUploadMultiAddress: function() {
        uc.geo.radius.ResetUploadFile();
        framework.ui.ShowDialog('UploadFileForMultiRadius');
    },

    currentFile: "",
    BindUploadFile: function() {
        $("#ct_geo_UploadFail").html('');
        $("#ct_geo_UploadFail").hide();
        $("#ct_geo_btn").hide();

        uc.geo.radius.currentFile = "";

        var button = $('#ct_geo_btnSelect'), interval;
        var au = new AjaxUpload(button, {
            action: 'Common/ExcelUploader.ashx',
            autoSubmit: false,
            name: 'myfile',
            responseType: 'json',

            onChange: function(file, ext) {
                uc.geo.SetErrorMessage(false, "");
                $("#ct_geo_UploadFail").html('');
                $("#ct_geo_UploadFail").hide();
                $("#ct_geo_btn").hide();
                if (!(ext && /^(xls|xlsx)$/.test(ext))) {
                    $("#ct_geo_UploadFail").html('We just accept Microsoft Excel (97 or newer).');
                    $("#ct_geo_UploadFail").show();
                    return false;
                }
                var filename = document.getElementById("ct_geo_filename");
                if (filename) {
                    filename.value = file;
                }
            },
            onSubmit: function(file, ext) {
                uc.geo.SetErrorMessage(false, "");
                $("#ct_geo_UploadFail").html('');
                $("#ct_geo_UploadFail").hide();
                $("#ct_geo_btn").hide();
                if (!(ext && /^(xls|xlsx)$/.test(ext))) {
                    $("#ct_geo_UploadFail").html('We just accept Microsoft Excel (97 or newer).');
                    $("#ct_geo_UploadFail").show();
                    return false;
                }
                framework.ui.showWaiting('UploadFileForMultiRadius', true);
                this.disable();
            },
            onComplete: function(file, response) {
                window.clearInterval(interval);
                // enable upload button
                this.enable();

                if (response.ResultFlag) {
                    uc.geo.radius.currentFile = response.DataSource;
                    uc.geo.radius.GetRecord(response.DataSource);
                    uc.geo.radius.MultiRadiusFileName = response.DataSource;
                }
                else {
                    $("#ct_geo_UploadFail").html(response.ResultMessage);
                    $("#ct_geo_UploadFail").show();
                }
                framework.ui.showWaiting('UploadFileForMultiRadius', false);
            }
        });
        return au;
    },

    headStr: null,
    sRecord: null,
    cols: null,
    GetRecord: function(path) {
        uc.geo.SetErrorMessage(false, "");
        $("#ct_geo_UploadFail").html('');
        $("#ct_geo_UploadFail").hide();
        $("#ct_geo_btn").hide();
        var o = page.placeorder.order;

        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetRecord",
            data: { filePath: path.TargetFile, type: 2 },
            success: function(result) {
                if (result.ResultFlag) {
                    if (result.ResultMessage != null) {
                        $("#ct_geo_UploadFail").html(result.ResultMessage);
                        $("#ct_geo_UploadFail").show();
                    }
                    else {
                        if (result.DataSource != null) {
                            uc.geo.radius.headStr = result.DataSource.HeadRow;
                            uc.geo.radius.sRecord = result.DataSource.SuccessRow;
                            uc.geo.radius.cols = result.DataSource.UpLoadListColumn;

                            $("#ct_geo_SelectFile").hide();
                            $("#ct_geo_filetable").setTemplateElement("ct_geo_listfilestable");
                            $("#ct_geo_filetable").processTemplate(result.DataSource);
                            $("#ct_geo_TipForSuccessfully").setTemplateElement("ct_geo_TipOfSuccessfully");
                            $("#ct_geo_TipForSuccessfully").processTemplate(result.DataSource);
                            $("#ct_geo_RecordDetails").show();
                            $("#ct_geo_btn").show();
                        }
                    }
                }
                else {
                    $("#ct_geo_UploadFail").html("").html(result.ResultMessage);
                    $("#ct_geo_UploadFail").show();
                }

            },
            error: function(rep) {
                $("#ct_geo_UploadFail").html("Error occurred when getting file info, please try it later.");
                $("#ct_geo_UploadFail").show();
            }
        });
        framework.ui.showWaiting('ct_geo_SelectFile', false);
    },

    BackToUploadFile: function() {
        uc.geo.radius.ResetUploadFile();
    },

    NextToUploadFile: function() {
        var o = page.placeorder.order;
        if (uc.geo.radius.currentFile && uc.geo.radius.currentFile != "") {
            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetAddressByFile2",
                data: { FilePath: uc.geo.radius.MultiRadiusFileName.TargetFile },
                success: function(result) {

//                    var myDate = new Date();
//                    console.log("begin time:");
//                    console.log(myDate);

                    var geos = result.DataSource.GeoItems;
                    if (result.ResultFlag) {
                        if (geos.length > 0) {
                            var radiuses = [];
                            for (var i = 0; i < geos.length; i++) {
                                var radiusAddress = new entity.OrderAddress();
                                radiusAddress.AddrUsageType = 2; // AddressType.SEARCH_CENTER_ADDRESS;
                                radiusAddress.AddressName = String.IsNullOrEmpty(geos[i].KeyCode) ? geos[i].AddressLine : geos[i].KeyCode;
                                radiusAddress.Latitude = geos[i].Latitude; //.toFixed(6);
                                radiusAddress.Longitude = geos[i].Longitude; //.toFixed(6);
                                radiusAddress.AddressLine = geos[i].AddressLine;
                                radiusAddress.Radius = geos[i].Distance;
                                radiuses.push(radiusAddress);

                                //uc.geo.radius.AddATargetAddress(radiusAddress);
                            }

                            uc.geo.radius.AddMultiTargetAddress(radiuses);
                        }

//                        var myDate2 = new Date();
//                        console.log("end time:");
//                        console.log(myDate2);

                        var msg = String.format("Total records: {0}, {1} records been found on map.", result.DataSource.TotalCount, result.DataSource.GeoItems.length);
                        uc.geo.SetErrorMessage(true, msg);

                        framework.ui.CloseDialog();
                    }
                    else {
                        uc.geo.SetErrorMessage(true, "Error occurred when getting GEO info, please try it later.1");
                    }

                },
                error: function(rep) {
                    uc.geo.SetErrorMessage(true, "Error occurred when getting GEO info, please try it later.2");
                }
            });
        }
    },

    ResetUploadFile: function() {
        $("#ct_geo_filename").attr("value", "");
        $("#ct_geo_RecordDetails").hide();
        $("#ct_geo_btn").hide();
        uc.geo.SetErrorMessage(false, "");
        $("#ct_geo_SelectFile").show();
    },

    SearchAcxiomAddress: function() {
        uc.geo.SetErrorMessage(false, "");
        var address = jQuery('#multi_radius').val();
        var radius = jQuery('#multi_radius_value').val();

        return uc.geo.radius.SearchAddressWithAddress(address, radius);
    },

    SearchZipMapAddress: function() {
        uc.geo.SetErrorMessage(false, "");
        uc.geo.radius.isCallAndLoadMap = true;
        var map = Mapifies.MapObjects.Get(jQuery('#geo_radius_map'));
        if (uc.geo.radius.Overlays) {
            //map.removeOverlay(uc.geo.radius.Overlays);
            jQuery('#geo_radius_map').jmap('ClearMap');
            uc.geo.radius.ClearMapZips();
        }
        _.each(uc.geo.radius.Overlays, function(v, k) { uc.geo.radius.RemoveGeoElement(k, map); });

        var address = jQuery('#zip_map_address').val();
        var radius = jQuery('#zip_map_radius').val();

        //Erik Wang 20121016
        //fuck this code,I don't konw why google.maps.geometry always return undefined,but if I drow a circle first,it will be ok.
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

        if (framework.common.IsNumber(address, 5)) {
            return uc.geo.radius.SearchZipAddressWithZip(address, radius, uc.geo.radius.showRadiusElements);

        } else {

            return uc.geo.radius.SearchAddressWithAddress(address, radius, uc.geo.radius.showRadiusElements, uc.geo.radius.USMapLoad);

        }
    },

    SearchMultiAddress: function() {
        uc.geo.SetErrorMessage(false, "");
        var address = jQuery('#geo_multiradius_address').val();
        var radius = jQuery('#geo_multiradius_value').val();
        return uc.geo.radius.SearchAddressWithAddress(address, radius);
    },



    SearchAddressWithAddress: function(address, radius, callback, usMapLoad, isInit) {
        var elMap = jQuery('#geo_radius_map');

        jQuery('#geo_radius_addr_lat').val('');
        jQuery('#geo_radius_add_lng').val('');

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
                var placeMarks = result;
                var position = 0;
                for (var i = 0; i < placeMarks.length; i++) {
                    if (uc.geo.radius.IsValidAddress(placeMarks[i].types[0])) {
                        validAddresses[position++] = placeMarks[i];
                    }
                }
                var point;
                if (validAddresses.length > 0) {
                    point = validAddresses[0];
                } else {
                    point = result[0];
                }
                if (typeof usMapLoad == 'function') {
                    /*if (point.AddressDetails.Country.CountryNameCode != 'US') {
                    if (isInit == undefined) {
                    var accuracyMsg = String.format("Please note: The address ({0}) could not be found in USA, please check and confirm the address.", address);
                    uc.geo.SetErrorMessage(true, accuracyMsg);
                    }
                    mapZoom = 4;
                    usMapLoad();
                    return;
                    }*/
                }

                // result.Placemark[0].AddressDetails.Country.CountryNameCode
                //var point = result.Placemark[0];
                // set Latitude and Longitude
                jQuery('#geo_radius_addr_lat').val(point.geometry.location.lat());
                jQuery('#geo_radius_add_lng').val(point.geometry.location.lng());

                var thisMap = Mapifies.MapObjects.Get(elMap);
                var mapZoom = null;
                if (String.IsNullOrEmpty(radius)) {
                    mapZoom = 15;
                    //				    if (isInit != undefined) {
                    //				        mapZoom = 4;
                    //				    }
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
                    'pointTitle': point.formatted_address
                });

                var radiusAddress = new entity.OrderAddress();
                radiusAddress.AddrUsageType = 2; // AddressType.SEARCH_CENTER_ADDRESS;
                radiusAddress.AddressName = address;
                radiusAddress.Latitude = point.geometry.location.lat(); //.toFixed(6);
                radiusAddress.Longitude = point.geometry.location.lng(); //.toFixed(6);
                radiusAddress.AddressLine = address;
                radiusAddress.Radius = radius;
                uc.geo.radius.CurrentAddress = radiusAddress;

                var addrlst = uc.geo.radius.RadiusAddresses.concat(new Array(radiusAddress));
                framework.ui.ShowMarkers(addrlst, elMap);

                //show more address if exist
                uc.geo.radius.ShowMoreAddresses(validAddresses);

                uc.geo.radius.WarnIfAddressAccuracyIsMatched(point.formatted_address, point.types[0]);

            } else {
                // jQuery('#geo_radius_address').val(valid.message);
                uc.geo.SetErrorMessage(true, "Sorry, we are unable to geocode that address!");
                elMap.jmap('ClearMap');
                //uc.geo.radius.ShowMoreAddresses();
            }

            //            if (typeof callback == 'function') {
            //                callback();
            //             }
        });
        return false;
    },

    ShowTargetAddresses: function(addresses) {
        if (addresses == null || addresses.length == 0) {
            jQuery("#targetRadiusAddressesDiv").addClass("hidden");
            jQuery("#targetRadiusAddresses").html("");
            return;
        }
        //		// only multi-radius or only multi-closex will show the target address
        //		if (page.placeorder.order.GeoType != entity.enums.GeoType.MultiRadius && page.placeorder.order.GeoType != entity.enums.GeoType.MultiClosex) {
        //			return;
        //		}

        jQuery("#targetRadiusAddressesDiv").removeClass("hidden");
        var addressInfo = "";
        var radiusUnit = framework.ui.GetRadiusUnitDesc(page.placeorder.RadiusUnit);
        var addressFormat = '<div><span><a href="javascript:void(0);" address="{0}" onclick="javascript:uc.geo.radius.NailPoint(this);" title="Move to the target area.">Address: {0}, Radius: {1} {2}</a></span> <a href="javascript:void(0);" targetAddress="{0}" onclick="javascript:uc.geo.radius.RemoveTargetAddress(this);" title="Remove the target area." ><img src="images/delete_icon.jpg" alt="delete" style="vertical-align:middle;"></a></div>';
        if (page.placeorder.order.GeoType == entity.enums.GeoType.Closex || page.placeorder.order.GeoType == entity.enums.GeoType.MultiClosex) {
            addressFormat = '<div><span><a href="javascript:void(0);" address="{0}" onclick="javascript:uc.geo.radius.NailPoint(this);" title="Move to the target area.">Address: {0}, Quantity: {1} </a></span> <a href="javascript:void(0);" targetAddress="{0}" onclick="javascript:uc.geo.radius.RemoveTargetAddress(this);" title="Remove the target area." ><img src="images/delete_icon.jpg" alt="delete"></a></div>';
            for (var i = 0; i < addresses.length; i++) {
                addressInfo = addressInfo + String.format(addressFormat, addresses[i].AddressLine, addresses[i].Quantity);
            }
        } else {
            for (var i = 0; i < addresses.length; i++) {
                addressInfo = addressInfo + String.format(addressFormat, addresses[i].AddressLine, addresses[i].Radius, radiusUnit);
            }
        }

        jQuery("#targetRadiusAddresses").html(String.format("<div>{0}</div>", addressInfo));

    },

    AddRadiusTargetAddress: function() {
        uc.geo.SetErrorMessage(false, "");
        var address = jQuery('#geo_radius_address').val();
        var radius = jQuery('#geo_radius_value').val();

        uc.geo.radius.AddTargetAddress(address, radius, "Please enter an address!");

    },

    AddAcxiomRadiusTargetAddress: function() {
        uc.geo.SetErrorMessage(false, "");
        var address = jQuery('#multi_radius').val();
        var radius = jQuery('#multi_radius_value').val();
        var addressName = jQuery('#multi_radius_name').val();
        if (String.IsNullOrEmpty(addressName)) {
            uc.geo.SetErrorMessage(true, "Address name is required!");
            return;
        }
        uc.geo.radius.AddTargetAddress(address, radius, "Please enter an address!", addressName);
        jQuery('#multi_radius_name').val("");

    },

    AddMultiRadiusTargetAddress: function() {
        uc.geo.SetErrorMessage(false, "");
        var address = jQuery('#geo_multiradius_address').val();
        var radius = jQuery('#geo_multiradius_value').val();
        var addressName = jQuery('#ct_geo_multiradius_name').val();
        if (String.IsNullOrEmpty(addressName)) {
            uc.geo.SetErrorMessage(true, "Address name is required!");
            return;
        }
        uc.geo.radius.AddTargetAddress(address, radius, "Please enter an address!", addressName);
    },

    AddZipRadiusTargetAddress: function() {
        uc.geo.SetErrorMessage(false, "");
        var address = jQuery('#geo_radius_zip').val();
        var radius = jQuery('#geo_radius_zip_value').val();

        uc.geo.radius.AddTargetAddress(address, radius, "Please enter a valid ZIP code!");

    },

    //GetMapPointsForCircle: function(


    AddClosetTargetAddress: function() {
        uc.geo.SetErrorMessage(false, "");
        var address = jQuery('#geo_radius_closex_address').val();
        var quantity = jQuery('#geo_radius_closex_qty').val();
        var addressName = jQuery('#multi_closex_name').val();

        uc.geo.radius.AddClosetTargetAddressWithAdress(address, quantity, addressName);
        jQuery('#multi_closex_name').val("");

    },

    AddMultiClosetTargetAddress: function() {
        uc.geo.SetErrorMessage(false, "");
        var address = jQuery('#geo_multiclosex_address').val();
        var quantity = jQuery('#geo_multiclosex_qty').val();
        var addressName = jQuery('#ct_geo_multiclosex_name').val();
        if (String.IsNullOrEmpty(addressName)) {
            uc.geo.SetErrorMessage(true, "Address name is required!");
            return;
        }

        uc.geo.radius.AddClosetTargetAddressWithAdress(address, quantity, addressName);
    },

    AddClosetTargetAddressWithAdress: function(address, quantity, addressName) {
        var lat = jQuery('#geo_radius_addr_lat').val();
        var lng = jQuery('#geo_radius_add_lng').val();
        if (String.IsNullOrEmpty(address)) {
            uc.geo.SetErrorMessage(true, errorMsgForAddress);
            return;
        }

        if (String.IsNullOrEmpty(quantity)) {
            uc.geo.SetErrorMessage(true, "Quantity is required!");
            return;
        }

        var quantityValue = Number(quantity);
        if (quantityValue <= 0) {
            uc.geo.SetErrorMessage(true, "Quantity must be greater than 0!");
            return;
        }

        if (String.IsNullOrEmpty(lat) || String.IsNullOrEmpty(lng)) {
            uc.geo.SetErrorMessage(true, "Sorry, we are unable to geocode that address!");
            return;

        }

        if (String.IsNullOrEmpty(addressName)) {
            addressName = address;
        }


        var radiusAddress = new entity.OrderAddress();
        radiusAddress.AddrUsageType = 2; // AddressType.SEARCH_CENTER_ADDRESS;
        radiusAddress.AddressName = addressName;
        radiusAddress.Latitude = lat; //.toFixed(6);
        radiusAddress.Longitude = lng; //.toFixed(6);
        radiusAddress.AddressLine = address;
        radiusAddress.Radius = 0;
        radiusAddress.Quantity = quantity;
        uc.geo.radius.AddATargetAddress(radiusAddress);
    },

    AddTargetAddress: function(address, radius, errorMsgForAddress, addressName) {
        var lat = jQuery('#geo_radius_addr_lat').val();
        var lng = jQuery('#geo_radius_add_lng').val();
        if (String.IsNullOrEmpty(address)) {
            uc.geo.SetErrorMessage(true, errorMsgForAddress);
            return;
        }

        if (String.IsNullOrEmpty(radius)) {
            uc.geo.SetErrorMessage(true, "Radius is required!");
            return;
        }

        var radiusValue = Number(radius);
        if (radiusValue <= 0) {
            uc.geo.SetErrorMessage(true, "Radius must be greater than 0!");
            return;
        }

        if (String.IsNullOrEmpty(lat) || String.IsNullOrEmpty(lng)) {
            uc.geo.SetErrorMessage(true, "Sorry, we are unable to geocode that address!");
            return;
        }

        var radiusAddress = new entity.OrderAddress();
        radiusAddress.AddrUsageType = 2; // AddressType.SEARCH_CENTER_ADDRESS;
        radiusAddress.AddressName = String.IsNullOrEmpty(addressName) ? address : addressName;
        radiusAddress.Latitude = lat; //.toFixed(6);
        radiusAddress.Longitude = lng; //.toFixed(6);
        radiusAddress.AddressLine = address;
        radiusAddress.Radius = radius;
        uc.geo.radius.AddATargetAddress(radiusAddress);

    },

    AddATargetAddress: function(radiusAddress) {
        var exists = false;
        for (var i = 0; i < uc.geo.radius.RadiusAddresses.length; i++) {
            if (uc.geo.radius.RadiusAddresses[i].AddressName == radiusAddress.AddressName || uc.geo.radius.RadiusAddresses[i].AddressLine == radiusAddress.AddressLine) {
                exists = true;
                uc.geo.radius.RadiusAddresses[i] = radiusAddress;
                break;
            }
        }
        if (!exists) {
            uc.geo.radius.RadiusAddresses.push(radiusAddress);
        }

        uc.geo.radius.CurrentAddress = radiusAddress;
        var elMap = jQuery('#geo_radius_map');
        elMap.jmap('ClearMap');

        elMap.jmap('MoveTo', {
            'mapCenter': [radiusAddress.Latitude, radiusAddress.Longitude]
        });

        framework.ui.ShowMarkers(uc.geo.radius.RadiusAddresses, elMap);
        uc.geo.radius.ShowTargetAddresses(uc.geo.radius.RadiusAddresses);
    },


    AddMultiTargetAddress: function(radiusAddresses) {
        _.each(radiusAddresses, function(radius, id) {
            var exists = false;
            for (var i = 0; i < uc.geo.radius.RadiusAddresses.length; i++) {
                if (uc.geo.radius.RadiusAddresses[i].AddressName == radius.AddressName || uc.geo.radius.RadiusAddresses[i].AddressLine == radius.AddressLine) {
                    exists = true;
                    uc.geo.radius.RadiusAddresses[i] = radius;
                    break;
                }
            }
            if (!exists) {
                uc.geo.radius.RadiusAddresses.push(radius);
            }
        });

        uc.geo.radius.CurrentAddress = radiusAddresses[0];
        var elMap = jQuery('#geo_radius_map');
        elMap.jmap('ClearMap');

        elMap.jmap('MoveTo', {
            'mapCenter': [uc.geo.radius.CurrentAddress.Latitude, uc.geo.radius.CurrentAddress.Longitude]
        });

        framework.ui.ShowMarkers(uc.geo.radius.RadiusAddresses, elMap);
        uc.geo.radius.ShowTargetAddresses(uc.geo.radius.RadiusAddresses);
    },


    RemoveTargetAddress: function(element) {
        var target = $(element);
        var address = target.attr("targetAddress");
        if (String.IsNullOrEmpty(address)) {
            return;
        }
        if (uc.geo.radius.RadiusAddresses == null || uc.geo.radius.RadiusAddresses.length == 0) {
            return;
        }
        var resultArray = $.grep(uc.geo.radius.RadiusAddresses, function(element, i) {
            if (element.AddressLine == address) {
                return false;
            } else {
                return true;
            }
        });
        uc.geo.radius.RadiusAddresses = resultArray;
        if (uc.geo.radius.CurrentAddress != null && uc.geo.radius.CurrentAddress.AddressLine == address && resultArray.length > 0) {
            uc.geo.radius.CurrentAddress = uc.geo.radius.RadiusAddresses[uc.geo.radius.RadiusAddresses.length - 1];
        }

        var elMap = jQuery('#geo_radius_map');
        elMap.jmap('ClearMap');
        if (uc.geo.radius.CurrentAddress != null) {
            elMap.jmap('MoveTo', {
                'mapCenter': [uc.geo.radius.CurrentAddress.Latitude, uc.geo.radius.CurrentAddress.Longitude]
            });
        }

        framework.ui.ShowMarkers(uc.geo.radius.RadiusAddresses, elMap);
        uc.geo.radius.ShowTargetAddresses(uc.geo.radius.RadiusAddresses);

    },
    //jenny.xiao highlight start
    ZipMapMouseMoveHandler: function(marker, point) {
        var map = Mapifies.MapObjects.Get(jQuery('#geo_radius_map'));
        var zipType = page.placeorder.order.RadiusTypeChoice == entity.enums.RadiusTypeChoice.CRRT ? "cr" : "zipxy";
        var mapGetDataUrl = page.global.MapGetDataUrl + String.format("type={0}&x={1}&y={2}&callback=?", zipType, marker.latLng.lng(), marker.latLng.lat());

        //alert(marker.latLng.lng() + "   " + marker.latLng.lat());
        $.get(mapGetDataUrl, function(data) {
            if (data != undefined) {
                var id = data.id;
                //Remove the overly if it is already existed, otherwise, added it to the map layer
                if (uc.geo.radius.HighlightOverlays != null && _.has(uc.geo.radius.HighlightOverlays, id)) {
                    //uc.geo.radius.RemoveGeoElement(id, map);

                }
                else {
                    uc.geo.radius.RemoveHighlightGeoElement(map);
                    uc.geo.radius.AddHighlightGeoElement(id, data.data, map);
                }
            }
        }, "json");
    },
    //jenny.xiao highlight end
    ZipMapClickHandler: function(marker, point) {
        if (uc.geo.radius.HighlightOverlays != null) {
            var map = Mapifies.MapObjects.Get(jQuery('#geo_radius_map'));
            _.each(uc.geo.radius.HighlightOverlays, function(overlay, id) {
                var cId = id;
                var data = uc.geo.radius.HighlightData[id];
                //                _.each(uc.geo.radius.HighlightOverlays[id], function(overlay) {
                //                    overlay.setMap(null);
                //                });
                //                delete uc.geo.radius.HighlightOverlays[id];
                //                delete uc.geo.radius.HighlightData[id];
                //Remove the overly if it is already existed, otherwise, added it to the map layer
                if (_.has(uc.geo.radius.Overlays, cId)) {
                    uc.geo.radius.RemoveGeoElement(cId, map);
                }
                else {
                    uc.geo.radius.AddGeoElement(cId, data, map);
                }
            });

        }

        //        var map = Mapifies.MapObjects.Get(jQuery('#geo_radius_map'));
        //        //Erik Wang 20121016
        //        //fuck this code,I don't konw why google.maps.geometry always return undefined,but if I drow a circle first,it will be ok.
        //        //draw an empty circle ---- begin
        //        var circleOptions = {
        //            center: new google.maps.LatLng(0, 0),
        //            strokeWeight: 2,
        //            strokeOpacity: 1,
        //            fillOpacity: 0.25,
        //            map: map,
        //            radius: 100,
        //            clickable: false
        //        };
        //        var circle = new google.maps.Circle(circleOptions);
        //        circle.setMap(null);
        //        //draw an empty circle ---- end

        //        var zipType = page.placeorder.order.RadiusTypeChoice == entity.enums.RadiusTypeChoice.CRRT ? "cr" : "zipxy";
        //        var mapGetDataUrl = page.global.MapGetDataUrl + String.format("type={0}&x={1}&y={2}&callback=?", zipType, marker.latLng.lng(), marker.latLng.lat());


        //        $.get(mapGetDataUrl, function(data) {
        //            if (data != undefined) {
        //                var id = data.id;

        //                //Remove the overly if it is already existed, otherwise, added it to the map layer
        //                if (_.has(uc.geo.radius.Overlays, id)) {
        //                    uc.geo.radius.RemoveGeoElement(id, map);
        //                }
        //                else {
        //                    uc.geo.radius.AddGeoElement(id, data.data, map);
        //                }
        //            }
        //        }, "json");

    },

    //    ZipMapClickHandler: function(marker, point) {
    //        var map = Mapifies.MapObjects.Get(jQuery('#geo_radius_map'));
    //        //Erik Wang 20121016
    //        //fuck this code,I don't konw why google.maps.geometry always return undefined,but if I drow a circle first,it will be ok.
    //        //draw an empty circle ---- begin
    //        var circleOptions = {
    //            center: new google.maps.LatLng(0, 0),
    //            strokeWeight: 2,
    //            strokeOpacity: 1,
    //            fillOpacity: 0.25,
    //            map: map,
    //            radius: 100,
    //            clickable: false
    //        };
    //        var circle = new google.maps.Circle(circleOptions);
    //        circle.setMap(null);
    //        //draw an empty circle ---- end

    //        var zipType = page.placeorder.order.RadiusTypeChoice == entity.enums.RadiusTypeChoice.CRRT ? "cr" : "zipxy";
    //        var mapGetDataUrl = page.global.MapGetDataUrl + String.format("type={0}&x={1}&y={2}&callback=?", zipType, marker.latLng.lng(), marker.latLng.lat());


    //        $.get(mapGetDataUrl, function(data) {
    //            if (data != undefined) {
    //                var id = data.id;

    //                //Remove the overly if it is already existed, otherwise, added it to the map layer
    //                if (_.has(uc.geo.radius.Overlays, id)) {
    //                    uc.geo.radius.RemoveGeoElement(id, map);
    //                }
    //                else {
    //                    uc.geo.radius.AddGeoElement(id, data.data, map);
    //                }
    //            }
    //        }, "json");

    //    },

    ZipMapSelected: function(point) {
        var map = Mapifies.MapObjects.Get(jQuery('#geo_radius_map'));
        var zipType = page.placeorder.order.RadiusTypeChoice == entity.enums.RadiusTypeChoice.CRRT ? "cr" : "zipxy";
        var mapGetDataUrl = page.global.MapGetDataUrl + String.format("type={0}&x={1}&y={2}&callback=?", zipType, point.x, point.y);


        $.get(mapGetDataUrl, function(data) {
            var id = data.id;

            //Remove the overly if it is already existed, otherwise, added it to the map layer
            if (_.has(uc.geo.radius.Overlays, id)) {
                //uc.geo.radius.RemoveGeoElement(id, map);
            }
            else {
                uc.geo.radius.AddGeoElement(id, data.data, map);
            }
        }, "json");

    },

    USMapLoad: function() {

        jQuery('#geo_radius_map').jmap('init', { 'mapCenter': page.placeorder.MapCenter, 'mapZoom': 4, 'mapEnableScrollZoom': true, 'mapEnableScaleControl': true }, function() { uc.geo.radius.LoadFromOrder(); });


    },

    showRadiusElements: function(x, y, radius, isfitBounds) {

        var map = Mapifies.MapObjects.Get(jQuery('#geo_radius_map'));
        var zipType = page.placeorder.order.RadiusTypeChoice == entity.enums.RadiusTypeChoice.CRRT ? "radius_cr" : "radius_zip";
        //var zipType = "radius_cr";
        var mapGetDataUrl = page.global.MapGetDataUrl + String.format("type={0}&x={1}&y={2}&r={3}&callback=?", zipType, x, y, radius);



        $.get(mapGetDataUrl, function(data) {
            if (!_.isArray(data)) {
                //jenny.xiao_20131010 avoid to add many layers
                if (_.has(uc.geo.radius.Overlays, id)) {
                }
                else {
                    uc.geo.radius.AddGeoElement(data.id, data.data, map);
                }
                //uc.geo.radius.AddGeoElement(data.id, data.data, map);
            } else {
                _.each(data, function(geo) {
                    var id = geo.id;

                    //Remove the overly if it is already existed, otherwise, added it to the map layer
                    if (_.has(uc.geo.radius.Overlays, id)) {
                        // uc.geo.radius.RemoveGeoElement(id, map);
                    }
                    else {
                        uc.geo.radius.AddGeoElement(id, geo.data, map);
                    }
                });
            }
            if (isfitBounds) {
            } else {
                framework.common.ZoomMapToElements(uc.geo.radius.Overlays, map);
            };
        }, "json");

    },
    //jenny.xiao highlight start
    RemoveHighlightGeoElement: function() {
        // Iterate to remove the overlays from map
        if (uc.geo.radius.HighlightOverlays != null) {

            _.each(uc.geo.radius.HighlightOverlays, function(overlay, id) {
                _.each(uc.geo.radius.HighlightOverlays[id], function(overlay) {
                    overlay.setMap(null);
                });
                delete uc.geo.radius.HighlightOverlays[id];
                delete uc.geo.radius.HighlightData[id];
            });

        }
    },

    AddHighlightGeoElement: function(id, data, map) {

        if (page.placeorder.order.RadiusTypeChoice == entity.enums.RadiusTypeChoice.ZIP5 && !(framework.common.IsNumber(id, 5))) {
            return;
        }
        var mapPath = new uc.geo.radius.Path();
        mapPath.values = [];
        mapPath.id = id;
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
                mapPath.values.push(polyline.encodedPoints);
            })


            //Erik Wang 20121016
            //fuck this code,I don't konw why google.maps.geometry always return undefined,but if I drow a circle first,it will be ok.
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
                strokeColor: "#B07D1E",
                strokeWeight: 2,
                strokeOpacity: 1,
                fillColor: "#B07D1E",
                fillOpacity: 0.4,
                map: map,
                paths: google.maps.geometry.encoding.decodePath(polylines[0].points),
                clickable: false,
                editable: false
            };
            var p = new google.maps.Polygon(polygonLayerOptions);
            polygons.push(p);
        });
        if (uc.geo.radius.HighlightOverlays == null) {
            uc.geo.radius.HighlightOverlays = new Object();
            uc.geo.radius.HighlightData = new Object();
        }
        uc.geo.radius.HighlightOverlays[id] = polygons;
        uc.geo.radius.HighlightData[id] = data;
        //uc.geo.radius.MapPaths.push(mapPath);
    },

    //jenny.xiao highlight end

    AddGeoElement: function(id, data, map) {

        if (page.placeorder.order.RadiusTypeChoice == entity.enums.RadiusTypeChoice.ZIP5 && !(framework.common.IsNumber(id, 5))) {
            return;
        }
        var mapPath = new uc.geo.radius.Path();
        mapPath.values = [];
        mapPath.id = id;
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
                mapPath.values.push(polyline.encodedPoints);
            });
            //Draw the polygon overlay on map
            /*var p = new GPolygon.fromEncoded({
            polylines: polylines,
            fill: true,
            color: "#0000ff",
            outline: true
            }, { clickable: false });
            p.click = false;
            polygons.push(p);
            map.addOverlay(p);*/


            //Erik Wang 20121016
            //fuck this code,I don't konw why google.maps.geometry always return undefined,but if I drow a circle first,it will be ok.
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
                clickable: false,
                editable: false
            };
            var p = new google.maps.Polygon(polygonLayerOptions);
            polygons.push(p);
        });
        uc.geo.radius.Overlays[id] = polygons;
        if (!String.IsNullOrEmpty(id)) {
            uc.geo.radius.MapZips.push(id);
            uc.geo.radius.ShowSelectedZips(uc.geo.radius.MapZips);
        }
        uc.geo.radius.MapPaths.push(mapPath);
    },

    RemoveGeoElement: function(id, map) {
        // Iterate to remove the overlays from map
        _.each(uc.geo.radius.Overlays[id], function(overlay) {
            //map.removeOverlay(overlay);
            overlay.setMap(null);
        });
        delete uc.geo.radius.Overlays[id];

        uc.geo.radius.MapZips = jQuery.grep(uc.geo.radius.MapZips, function(data) {
            return data != id;
        });

        uc.geo.radius.ShowSelectedZips(uc.geo.radius.MapZips);
        uc.geo.radius.MapPaths = jQuery.grep(uc.geo.radius.MapPaths, function(mapPath, i) {
            return mapPath.id != id;
        });

    },

    ShowSelectedZips: function(selectedZips) {
        jQuery("#geo_zip_map_result").html("");
        if (selectedZips == null || selectedZips.length == 0) {
            jQuery("#geo_zip_map_result").addClass("hidden");
            return;
        }

        jQuery("#geo_zip_map_result").removeClass("hidden");
        var zipInfo = "";
        var zipInfoFormat = '<div><span>{0}</span></div>';
        for (var i = 0; i < selectedZips.length; i++) {
            zipInfo = zipInfo + String.format(zipInfoFormat, selectedZips[i]);
        }
        jQuery("#geo_zip_map_result").html(String.format("<div>{0}</div>", zipInfo));
    },

    NailPoint: function(element) {
        var addressName = jQuery(element).attr("address");
        if (String.IsNullOrEmpty(addressName)) {
            return;
        }
        var address = null;
        var anAddress = null;
        for (var i in uc.geo.radius.RadiusAddresses) {
            anAddress = uc.geo.radius.RadiusAddresses[i];
            if (anAddress.AddressLine == addressName) {
                address = anAddress;
                break;
            }
        }
        if (address != null) {
            var elMap = jQuery('#geo_radius_map');
            elMap.jmap('MoveTo', {
                'mapCenter': [address.Latitude, address.Longitude]
            });
        }
    },

    // only accuracy level achieve the street level, the address is valid
    IsValidAddress: function(accuracy) {
        if (accuracy < 8) {
            return false;
        }
        return true;

    },

    WarnIfAddressAccuracyIsMatched: function(address, accuracy) {
        if (String.IsNullOrEmpty(address) || uc.geo.radius.IsValidAddress(accuracy)) {
            return;
        }
        var accuracyMsg = String.format("Please note: The address entered was not found and the nearest matched address ({0}) will be used for this search.", address);
        uc.geo.SetErrorMessage(true, accuracyMsg);

    },


    WarnIfZipIsMatched: function(address) {
        if (String.IsNullOrEmpty(address)) {
            return;
        }
        var accuracyMsg = String.format("Please note: The address/zip ({0}) code could not be found, please check and confirm the address/zip code.", address);
        uc.geo.SetErrorMessage(true, accuracyMsg);

    },

    SearchMultiClosexAddress: function() {
        uc.geo.SetErrorMessage(false, null);
        var address = jQuery('#geo_multiclosex_address').val();
        return uc.geo.radius.SearchAddressWithAddress(address, null);
    },

    SearchClosexAddress: function() {
        uc.geo.SetErrorMessage(false, null);
        var address = jQuery('#geo_radius_closex_address').val();
        return uc.geo.radius.SearchAddressWithAddress(address, null);
        return false;

    },

    SearchZipAddress: function() {
        uc.geo.SetErrorMessage(false, "");
        var zip = jQuery('#geo_radius_zip').val();

        var radius = jQuery('#geo_radius_zip_value').val();
        var elMap = jQuery('#geo_radius_map');

        jQuery('#geo_radius_addr_lat').val('');
        jQuery('#geo_radius_add_lng').val('');

        if (String.IsNullOrEmpty(zip)) {
            elMap.jmap('ClearMap');
            return;
        }
        uc.geo.radius.isCallAndLoadMap = true;
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetZip",
            data: { zip: zip },
            success: function(result) {
                if (result.ResultFlag) {
                    var Lat = result.DataSource.Latitude;
                    var Lng = result.DataSource.Longitude;
                    // set Latitude and Longitude
                    jQuery('#geo_radius_addr_lat').val(Lat);
                    jQuery('#geo_radius_add_lng').val(Lng);

                    var thisMap = Mapifies.MapObjects.Get(elMap);
                    var mapZoom = null;
                    if (String.IsNullOrEmpty(radius)) {
                        mapZoom = 14;
                    }
                    //thisMap.clearOverlays();
                    elMap.jmap('ClearMap');
                    elMap.jmap('MoveTo', {
                        'mapCenter': [Lat, Lng],
                        'mapZoom': mapZoom
                    });

                    if (!String.IsNullOrEmpty(radius)) {
                        elMap.jmap('AddRoundCircleOverlay', {
                            'mapCenter': [Lat, Lng],
                            'radius': radius
                        });
                    }

                    elMap.jmap('AddMarker', {
                        'pointLatLng': [Lat, Lng],
                        'pointTitle': zip
                    });
                } else {
                    uc.geo.SetErrorMessage(true, "This ZIP Code is not exist! Please input again.");
                    elMap.jmap('ClearMap');

                }

                uc.geo.radius.isCallAndLoadMap = false;
            },
            error: function(rep) {
                uc.geo.SetErrorMessage(true, valid.message);
                uc.geo.radius.isCallAndLoadMap = false;
            }
        });

        return false;

    },

    SearchZipAddressWithZip: function(zip, radius, callback) {
        uc.geo.SetErrorMessage(false, "");

        var elMap = jQuery('#geo_radius_map');
        jQuery('#geo_radius_addr_lat').val('');
        jQuery('#geo_radius_add_lng').val('');

        if (String.IsNullOrEmpty(zip)) {
            elMap.jmap('ClearMap');
            return;
        }

        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetZip",
            data: { zip: zip },
            success: function(result) {
                if (result.ResultFlag) {
                    var Lat = result.DataSource.Latitude;
                    var Lng = result.DataSource.Longitude;
                    // set Latitude and Longitude
                    jQuery('#geo_radius_addr_lat').val(Lat);
                    jQuery('#geo_radius_add_lng').val(Lng);

                    var thisMap = Mapifies.MapObjects.Get(elMap);
                    var mapZoom = 14;
                    //thisMap.clearOverlays();
                    elMap.jmap('ClearMap');
                    elMap.jmap('MoveTo', {
                        'mapCenter': [Lat, Lng],
                        'mapZoom': mapZoom
                    });

                    if (!String.IsNullOrEmpty(radius)) {
                        elMap.jmap('AddRoundCircleOverlay', {
                            'mapCenter': [Lat, Lng],
                            'radius': radius
                        });
                    }

                    elMap.jmap('AddMarker', {
                        'pointLatLng': [Lat, Lng],
                        'pointTitle': zip
                    });
                    if (typeof callback == 'function') {
                        if (page.placeorder.EnableZipCodeOrCarrierRouteRadius) {
                            if (radius != undefined && radius != "" && radius != null) {
                                callback(Lng, Lat, radius);
                            }
                        } else {

                            uc.geo.radius.ZipMapSelected({ x: Lng, y: Lat });
                        }
                        uc.geo.radius.AddLayer(page.placeorder.order.RadiusTypeChoice, false);

                    }

                } else {
                    var accuracyMsg = String.format("Please note: The address/zip code ({0}) could not be found, please check and confirm the address/zip code.", zip);
                    uc.geo.SetErrorMessage(true, accuracyMsg);
                    elMap.jmap('ClearMap');
                    uc.geo.radius.USMapLoad();
                }

                uc.geo.radius.isCallAndLoadMap = false;
            },
            error: function(rep) {
                uc.geo.radius.isCallAndLoadMap = false;
                uc.geo.SetErrorMessage(true, valid.message);
            }
        });

        return false;

    },


    SearchMapByLatLngAndAddress: function(Lat, Lng, address, nopopup) {
        if (nopopup) {
            // ZECCO.hermespopup.hide();
        } else {
            ZECCO.hermespopup.hide();
        }
        var o = page.placeorder.order;
        radius = null;
        switch (o.GeoType) {
            case entity.enums.GeoType.Radius:
                jQuery('#geo_radius_address').val(address);
                radius = jQuery('#geo_radius_value').val();
                break;
            case entity.enums.GeoType.ZipRadius:
                jQuery('#geo_radius_zip').val(address);
                radius = jQuery('#geo_radius_zip_value').val();
                break;
            case entity.enums.GeoType.Closex:
                jQuery('#geo_radius_closex_address').val(address);
                //radius = jQuery('#geo_radius_closex_qty').val();
                break;
            case entity.enums.GeoType.Polygon:
                jQuery("#geo_polygon_address").val(address);
                break;
        }

        radius = Number(radius || 0);
        Lat = Number(Lat);
        Lng = Number(Lng);

        var mapZoom = null;
        if (radius <= 0) {
            mapZoom = 15;
        }

        var elMap = jQuery('#geo_radius_map');
        jQuery('#geo_radius_addr_lat').val(Lat);
        jQuery('#geo_radius_add_lng').val(Lng);
        var thisMap = Mapifies.MapObjects.Get(elMap);
        //thisMap.clearOverlays();
        elMap.jmap('ClearMap');
        elMap.jmap('MoveTo', {
            'mapCenter': [Lat, Lng],
            'mapZoom': mapZoom
        });

        if (o.GeoType != entity.enums.GeoType.Closex && o.GeoType != entity.enums.GeoType.Polygon && radius > 0) {
            elMap.jmap('AddRoundCircleOverlay', {
                'mapCenter': [Lat, Lng],
                'radius': radius
            });
        };
        if (o.GeoType != entity.enums.GeoType.Polygon) {
            elMap.jmap('AddMarker', {
                'pointLatLng': [Lat, Lng],
                'pointTitle': address
            });
        }
    },

    SearchPolygonAddress: function() {
        uc.geo.SetErrorMessage(false, "");
        var address = jQuery('#geo_polygon_address').val();
        var elMap = jQuery('#geo_radius_map');

        jQuery('#geo_radius_addr_lat').val('');
        jQuery('#geo_radius_add_lng').val('');

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
                for (var i = 0; i < placeMarks.length; i++) {
                    if (uc.geo.radius.IsValidAddress(placeMarks[i].types[0])) {
                        validAddresses[position++] = placeMarks[i];
                    }
                }
                var point;
                if (validAddresses.length > 0) {
                    point = validAddresses[0];
                } else {
                    point = result[0];
                }
                //var point = result.Placemark[0];
                // set Latitude and Longitude
                jQuery('#geo_radius_addr_lat').val(point.geometry.location.lat());
                jQuery('#geo_radius_add_lng').val(point.geometry.location.lng());

                var thisMap = Mapifies.MapObjects.Get(elMap);
                //thisMap.clearOverlays();
                elMap.jmap('ClearMap');
                elMap.jmap('MoveTo', {
                    'mapCenter': [point.geometry.location.lat(), point.geometry.location.lng()],
                    'mapZoom': 14
                });

                elMap.jmap('AddMarker', {
                    'pointLatLng': [point.geometry.location.lat(), point.geometry.location.lng()],
                    'pointIcon': 'themes/default/assets/images/gmap/mm_20_blue.png',
                    'pointTitle': point.formatted_address
                }, function(marker) {
                    uc.geo.radius.searchMarker = marker;
                });

                // show more address if exist
                uc.geo.radius.ShowMoreAddresses(validAddresses);

                uc.geo.radius.WarnIfAddressAccuracyIsMatched(point.formatted_address, point.types[0]);
                // });
            } else {
                // jQuery('#geo_radius_address').val(valid.message);
                uc.geo.SetErrorMessage(true, "Sorry, we are unable to geocode that address!");
                elMap.jmap('ClearMap');
                uc.geo.radius.ShowMoreAddresses();
            }
        });
        return false;

    },



    // only accuracy level achieve the street level, the address is valid
    IsValidAddress: function(accuracy) {
        //if (accuracy < 8) {
        //	return false;
        //}
        if (accuracy != "street_address") {
            return false;
        }
        return true;

    },

    ShowMoreAddresses: function(result) {
        var o = page.placeorder.order;
        var morebuttonId = null;
        if (o.Geotype == entity.enums.GeoType.Radius) {
            morebuttonId = "geo_radius_show_more";
        } else if (o.GeoType == entity.enums.GeoType.CloseX) {
            morebuttonId = "geo_radius_closex_show_more";
        } else {
            morebuttonId = "geo_radius_polgyon_show_more";
        }


        if (result == window.undefined || result == null || result.length < 2) {
            jQuery('#' + morebuttonId).addClass("hidden");
            return;
        };

        var placeMarks = result;
        var strAll = "";
        for (var i = 0; i < placeMarks.length; i++) {
            placemark = placeMarks[i];
            /*
            var locality;
			
			if (placemark.AddressDetails == null || placemark.AddressDetails.Country == null
            || placemark.AddressDetails.Country.AdministrativeArea == null) {
            locality = null;
            } else if (placemark.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea != null) {
            locality = placemark.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality;
            } else {
            locality = placemark.AddressDetails.Country.AdministrativeArea.Locality;
            }
			
			var refAddr = "";
            var localityName = "";
            */
            var showAddrInfo = "";
            /*
            if (locality != null) {
            if (locality.Thoroughfare != null) {
            refAddr = locality.Thoroughfare.ThoroughfareName + ",";
            }
            localityName = locality.LocalityName;
            showAddrInfo = refAddr + "<b><i>" + locality.LocalityName + "</i></b>";
            } else {
            var firstCommaPosition = placemark.length; //placemark.address.indexOf(',');
            if (firstCommaPosition > 0) {
            refAddr = placemark.address.substring(0, firstCommaPosition + 1);
            showAddrInfo = refAddr + "<b><i>" + placemark.address.substring(firstCommaPosition + 1, placemark.address.length) + "</i></b>";
            } else {
            showAddrInfo = placemark.address;
            }
            }
            */
            showAddrInfo = "<b><i>" + placemark.formatted_address + "</i></b>";
            var addr = placemark.formatted_address;

            var strFromat = "<div><a class='ShortAddress' href='javascript:void(0);' onclick=\"javascript:uc.geo.radius.SearchMapByLatLngAndAddress('{0}','{1}','{2}');\"> {3} </a></div><div>{4}</div>";
            var refAddInfo = String.format(strFromat, placemark.geometry.location.lat(), placemark.geometry.location.lng(), placemark.formatted_address, showAddrInfo, placemark.formatted_address);

            strAll += refAddInfo;
        }

        jQuery('#' + morebuttonId).removeClass("hidden");
        jQuery('#geo_radius_more_addresses').html(strAll);
    },

    //TODO
    SetOrderGeos: function(order) {
        // do validation first
        // set geos
        var geos = [];
        var Lat = jQuery('#geo_radius_addr_lat').val();
        var Lng = jQuery('#geo_radius_add_lng').val();
        var address;
        var radius;
        var pointsStr;
        var geo = new entity.OrderGeo();
        radius = 0;
        var quantity = 0;
        var radiusTypeChoice = entity.enums.RadiusTypeChoice.UNKNOWN;
        if (!page.placeorder.IsMultipleAddress || order.GeoType == entity.enums.GeoType.Polygon
		    || order.GeoType == entity.enums.GeoType.ZipRadius || order.GeoType == entity.enums.GeoType.Radius
		    || order.GeoType == entity.enums.GeoType.Closex) {
            uc.geo.radius.RadiusAddresses = [];
        }

        switch (order.GeoType) {
            case entity.enums.GeoType.Radius:
                geo.GeoType = entity.enums.GeoType.Radius;
                radiusTypeChoice = jQuery("#radiusTypeByRadius").val();
                if (uc.geo.radius.RadiusAddresses.length < 1) {
                    uc.geo.radius.AddRadiusTargetAddress();
                }
                break;
            case entity.enums.GeoType.ZipRadius:
                geo.GeoType = entity.enums.GeoType.ZipRadius;
                radiusTypeChoice = jQuery("#radiusTypeByRadiusZip").val();
                if (uc.geo.radius.RadiusAddresses.length < 1) {
                    uc.geo.radius.AddZipRadiusTargetAddress();
                }
                break;
            case entity.enums.GeoType.Closex:
                geo.GeoType = entity.enums.GeoType.Closex;
                if (uc.geo.radius.RadiusAddresses.length < 1) {
                    uc.geo.radius.AddClosetTargetAddress();
                }
                break;
            case entity.enums.GeoType.Polygon:
                address = jQuery("#geo_polygon_address").val();
                pointsStr = uc.geo.radius.ComposePoints();
                //uc.geo.radius.RadiusAddresses = [];
                var orderAddress = new entity.OrderAddress();
                orderAddress.AddrUsageType = 2; // AddressType.SEARCH_CENTER_ADDRESS;
                orderAddress.AddressName = address;
                orderAddress.Latitude = Lat; //.toFixed(6);
                orderAddress.Longitude = Lng; //.toFixed(6);
                orderAddress.AddrSearchString = pointsStr;
                orderAddress.AddressLine = address;
                uc.geo.radius.RadiusAddresses.push(orderAddress);

                geo.GeoType = entity.enums.GeoType.Polygon;
                radiusTypeChoice = jQuery("#radiusTypeByPolygon").val();
                break;
            case entity.enums.GeoType.MultiRadius:
                geo.GeoType = entity.enums.GeoType.MultiRadius;
                radiusTypeChoice = jQuery("#RadiusTypeByMultiRadius").val();

                if (uc.geo.radius.RadiusAddresses.length < 1) {
                    uc.geo.radius.AddMultiRadiusTargetAddress();
                }
                break;
            case entity.enums.GeoType.MultiClosex:
                geo.GeoType = entity.enums.GeoType.MultiClosex;

                if (uc.geo.radius.RadiusAddresses.length < 1) {
                    uc.geo.radius.AddMultiClosetTargetAddress();
                }
                break;
            case entity.enums.GeoType.AcxiomMultiRadius:
                geo.GeoType = entity.enums.GeoType.AcxiomMultiRadius;
                radiusTypeChoice = jQuery("#multiRadiusTypeByRadius").val();

                if (uc.geo.radius.RadiusAddresses.length < 1) {
                    uc.geo.radius.AddAcxiomRadiusTargetAddress();
                }
                break;
            case entity.enums.GeoType.ZipMap:
                geo.GeoType = entity.enums.GeoType.ZipMap;
                radiusTypeChoice = order.RadiusTypeChoice;

                break;

        }

        if (order.GeoType != entity.enums.GeoType.ZipMap) {
            if (uc.geo.radius.RadiusAddresses.length < 1) {
                if (order.GeoType == entity.enums.GeoType.Radius
			       || order.GeoType == entity.enums.GeoType.ZipRadius
			       || order.GeoType == entity.enums.GeoType.Closex
			       || order.GeoType == entity.enums.GeoType.MultiRadius
			       || order.GeoType == entity.enums.GeoType.MultiClosex
			       || order.GeoType == entity.enums.GeoType.AcxiomMultiRadius
			       ) {
                    //var msg = "Please add an address!";
                    //uc.geo.SetErrorMessage(true, msg);
                    return false;
                }
            }
            if (order.GeoType == entity.enums.GeoType.Polygon && !uc.geo.radius.polygonCompleted) {
                var msg = "Please complete a polygon!";
                uc.geo.SetErrorMessage(true, msg);
                return false;
            }
        } else {
            if (uc.geo.radius.MapZips.length < 1) {
                var msg = "Please add a ZIP or carrier routes!";
                uc.geo.SetErrorMessage(true, msg);
                return false;
            }

        }
        order.RadiusTypeChoice = radiusTypeChoice;
        //order.UMCode = 2; //UmcodeType.MILE;
        order.UmCode = page.placeorder.RadiusUnit;
        order.Radius = radius;

        order.OrderAddresses = [];
        for (var i = 0; i < uc.geo.radius.RadiusAddresses.length; i++) {
            var anAddress = uc.geo.radius.RadiusAddresses[i];
            var ageo = new entity.OrderGeo();
            var geoKeyCode = null;
            if (order.GeoType == entity.enums.GeoType.Closex || order.GeoType == entity.enums.GeoType.MultiClosex) {
                geoKeyCode = String.format("{0}:{1}:{2}:{3}", anAddress.Longitude, anAddress.Latitude, anAddress.Quantity, order.UmCode);
            } else if (order.GeoType == entity.enums.GeoType.Polygon) {
                geoKeyCode = anAddress.AddrSearchString;
            } else {
                geoKeyCode = String.format("{0}:{1}:{2}:{3}", anAddress.Longitude, anAddress.Latitude, anAddress.Radius, order.UmCode);
            }
            ageo.GeoKeyCode = geoKeyCode;
            anAddress.AddrSearchString = geoKeyCode;
            ageo.AddressLine = geoKeyCode;
            ageo.GeoKeyDesc = anAddress.AddressName;
            geos.push(ageo);
            order.OrderAddresses.push(anAddress);


        }

        for (var i = 0; i < uc.geo.radius.MapZips.length; i++) {
            var ageo = new entity.OrderGeo();
            var geoKeyCode = null;
            if (order.RadiusTypeChoice == entity.enums.RadiusTypeChoice.CRRT) {
                geoKeyCode = String.format("{0}:{1}", uc.geo.radius.MapZips[i].substring(0, 5), uc.geo.radius.MapZips[i].substring(5));
            } else {
                geoKeyCode = uc.geo.radius.MapZips[i];
            }
            ageo.GeoKeyCode = geoKeyCode;
            ageo.AddressLine = geoKeyCode;
            ageo.GeoKeyDesc = uc.geo.radius.MapZips[i];
            geos.push(ageo);
        }

        if (geos == null || geos.length == 0) {
            uc.geo.SetErrorMessage(true, "Please select at least one address.");
            return false;
        }

        order.OrderGeos = geos;
        return true;
    },

    /**
    * Basic object class for geography selection
    */
    GeoSelectionObject: function() {
        this.selectionType = "";
        this.selectId = "";
        this.selectionName = "";
        this.polyline = null; //GPolyline
        this.radiusCenterLat;
        this.radiusCenterLon;
        this.radiusSize;
        this.count;
        this.points = [];
        this.K = "-1";
        this.be = false;
    },

    //parse points from a string separated with "|"
    ParsePoints: function(pointsStr) {
        var points = [];
        // no points information
        if (String.IsNullOrEmpty(pointsStr)) {
            return points;
        }
        var allPoints = pointsStr.split("|");
        //point separated with ":", the format is latitude:longtitude
        if (allPoints.length > 0) {
            for (var i = 0; i < allPoints.length; i++) {
                if (!String.IsNullOrEmpty(allPoints[i])) {
                    var aPoint = allPoints[i].split(":");
                    if (aPoint.length == 2) {
                        //var point = new GLatLng(aPoint[1], aPoint[0]);
                        var point = new google.maps.LatLng(aPoint[1], aPoint[0]);
                        points.push(point);
                    }
                }

            }
        }
        return points;
    },

    //separate point with "|"
    ComposePoints: function() {
        var pointStr = "";

        if (uc.geo.PolygonList.length == 0) {
            return pointStr;
        }

        var points = uc.geo.PolygonList[uc.geo.PolygonList.length - 1].getPath().getArray();

        if (points[points.length - 1] != points[0]) {
            points.push(points[0]);
        }

        if (uc.geo.radius.polygonCompleted) {

            pointStr = points[0].lng() + ":" + points[0].lat();

            for (var i = 1; i < points.length; i++) {
                pointStr = pointStr + "|" + points[i].lng() + ":" + points[i].lat();
            }
        }
        return pointStr;
    },

    getPolygonBounds: function(poionts) {
        var bounds = new google.maps.LatLngBounds();
        var i;
        for (i = 0; i < poionts.length; i++) {
            bounds.extend(poionts[i]);
        }
        return bounds;
    },

    getPolygonCenter: function(poionts) {
        var bounds = new google.maps.LatLngBounds();
        var i;
        for (i = 0; i < poionts.length; i++) {
            bounds.extend(poionts[i]);
        }
        return bounds.getCenter();
    },

    DrawPolygon: function(elMap, points, editable) {
        if (points == null || points.length < 3) {
            return;
        }

        var map = Mapifies.MapObjects.Get(elMap);

        //var polygon = new GPolygon(points, "#f33f00", 5, 1, "#ff0000", 0.2)
        //map.addOverlay(polygon);
        var polygonLayerOptions = {
            strokeColor: "#f33f00",
            strokeWeight: 5,
            strokeOpacity: 1,
            fillColor: "#ff0000",
            fillOpacity: 0.2,
            map: map,
            paths: points,
            editable: editable == undefined ? true : editable
        };
        var polygon = new google.maps.Polygon(polygonLayerOptions);
        uc.geo.PolygonList.push(polygon);

        var zoom = map.getZoom();
        var polgyonCenter = uc.geo.radius.getPolygonCenter(points); //polygon.getBounds().getCenter();
        var polygonBounds = uc.geo.radius.getPolygonBounds(points);

        if (zoom < uc.geo.radius.polygonZoomLevel) {
            //var zoomLevel = map.getBoundsZoomLevel(polygon.getBounds());
            map.setCenter(polgyonCenter);
            //map.setZoom(zoomLevel);
            //zoom = zoomLevel;
            map.fitBounds(polygonBounds);
        }
        if (uc.geo.radius.geoSelections.length == 0) {
            var geoSelection = new uc.geo.radius.GeoSelectionObject();
            geoSelection.selectionType = "POLYGON";
            geoSelection.points = points;
            uc.geo.radius.geoSelections.push(geoSelection);
        }


        uc.geo.radius.polygonZoom = zoom;
        uc.geo.radius.polygonCompleted = true;
        uc.geo.radius.polygonStart = false;
        uc.geo.radius.clearGMarkers();
        uc.geo.radius.clearListeners();
        uc.geo.radius.removeOverlay(map, uc.geo.radius.mouseLine);
        uc.geo.radius.mouseLine = null;
        //map.getDragObject().setDraggableCursor("hand");

        var mapOptions = {
            //zoom: map.getZoom(),
            center: polgyonCenter,
            mapTypeId: map.getMapTypeId(),
            draggable: true,
            draggableCursor: "hand"
        };
        map.setOptions(mapOptions);
    },

    drawPolyline: function(map, points, strokeColor) {
        if (points == null || points.lenght < 2) {
            return;
        }

        /*
        var polyline = new GPolyline(points, strokeColor, 3, 1, {
        clickable: false
        });
        */
        var thisMap = Mapifies.MapObjects.Get(map);
        var polygon = uc.geo.radius.geoSelections[uc.geo.radius.indexOfLastGeoSelection];

        var polylineOptions = {
            clickable: false,
            strokeColor: strokeColor,
            strokeWeight: 3,
            strokeOpacity: 1,
            map: thisMap,
            path: points
        };
        polygon.polyline = new google.maps.Polyline(polylineOptions);
        //thisMap.addOverlay(polygon.polyline);

    },

    drawMouseLine: function(map, points, strokeColor) {
        if (points == null || points.lenght < 2) {
            return;
        }

        /*var polyline = new GPolyline(points, strokeColor, 3, 0.5, {
        clickable: false
        });
        */
        var thisMap = Mapifies.MapObjects.Get(map);
        var polylineOptions = {
            clickable: false,
            strokeColor: strokeColor,
            strokeWeight: 3,
            strokeOpacity: 0.5,
            map: thisMap,
            path: points
        };
        var polyline = new google.maps.Polyline(polylineOptions);
        uc.geo.PolylineList.push(polyline);
        uc.geo.radius.mouseLine = polyline;

    },

    addMarker: function(map, point) {
        if (point == null) {
            return;
        }

        var thisMap = Mapifies.MapObjects.Get(map);
        /*var marker = new GMarker(point, {
        icon: uc.geo.radius.remarkerIcon,
        draggable: true
        });
        */
        var markerOption = {
            position: point,
            icon: "themes/default/assets/images/gmap/squaremarker.png",
            draggable: false,
            map: thisMap
        }
        var marker = new google.maps.Marker(markerOption);
        google.maps.event.addListener(marker, 'click', uc.geo.radius.addPointClick);
        google.maps.event.addListener(marker, 'dragend', uc.geo.radius.dragPoint);
        //thisMap.addOverlay(marker);
        uc.geo.radius.gMarkers.push(marker);

    },

    IsLineCross: function(lineA, lineB) {
        var dx, dy, da, db, s, t;
        dx = lineA.endPoint.lat() - lineA.startPoint.lat();
        dy = lineA.endPoint.lng() - lineA.startPoint.lng();
        da = lineB.endPoint.lat() - lineB.startPoint.lat();
        db = lineB.endPoint.lng() - lineB.startPoint.lng();
        if ((da * dy - db * dx) == 0) {
            return 0;
        }
        s = (dx * (lineB.startPoint.lng() - lineA.startPoint.lng()) + dy * (lineA.startPoint.lat() - lineB.startPoint.lat())) / (da * dy - db * dx);
        t = (da * (lineA.startPoint.lng() - lineB.startPoint.lng()) + db * (lineB.startPoint.lat() - lineA.startPoint.lat())) / (db * dx - da * dy);
        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            return 1;
        }
        return 0;

    },

    checkPointAndLines: function(currentPoint, lastPoint, aV) {
        var points = uc.geo.radius.geoSelections[uc.geo.radius.indexOfLastGeoSelection].points;
        if (lastPoint == null || points.length < 2) {
            return false;
        }
        for (var i = 0; i < (points.length - 1); i++) {
            if (i != aV && (i != aV - 1) && (i != aV + 1)) {
                if (uc.geo.radius.IsLineCross(new uc.geo.radius.Line(lastPoint, currentPoint), new uc.geo.radius.Line(points[i], points[i + 1])) == true) {
                    return true;
                }
            }
        }
        return false;
    },

    Point: function() {
        this.x = 0;
        this.y = 0;
    },

    Line: function(start, end) {
        this.startPoint = start;
        this.endPoint = end;
    },

    Path: function() {
        this.id = null;
        this.values = [];
    },

    MyCircle: function() {
        this.Latitude = null;
        this.Longitude = null;
        this.Radius = 0;
    },

    geoSelections: [], // GeoSelections array
    gMarkers: [], // GMarker array
    dragEndListener: [], //dragEndListener
    mouseMoveListener: null, //mouse move listener
    clickListener: null, // click listener
    polygonCompleted: false, // flag to check whether the polgyon is completed
    polygonStart: false, // flag to check whether beginning to draw polygon
    polygonZoomLevel: 9, //min zoom level if want to draw polgyon
    //lastGPolyline: null, // last GPolyline
    indexOfLastGeoSelection: 0, //index of last last geo selection
    remarkerIcon: null,
    searchMarker: null,
    mouseLine: null,
    polygonZoom: 9,


    startPolygon: function() {
        var elMap = jQuery('#geo_radius_map');
        var thisMap = Mapifies.MapObjects.Get(elMap);
        var address = jQuery('#geo_polygon_address').val();

        //		if (String.IsNullOrEmpty(address)) {
        //			alert('Please Click Map Area first.');
        //			return;
        //		}
        var zoom = thisMap.getZoom();
        if (zoom < uc.geo.radius.polygonZoomLevel) {
            alert('Please Zoom in to use the polygon mapping tool.\nTo select larger geographic regions, please use a radius select, scf, ZIP code, or county selection.');
            return;
        }

        uc.geo.radius.polygonCompleted = false;
        mouseLine = null;

        var geoSelection = new uc.geo.radius.GeoSelectionObject();
        geoSelection.selectionType = "POLYGON";
        uc.geo.radius.geoSelections.push(geoSelection);
        uc.geo.radius.indexOfLastGeoSelection = uc.geo.radius.geoSelections.length - 1;
        //thisMap.getDragObject().setDraggableCursor("crosshair");
        var mapOptions = {
            zoom: zoom,
            center: thisMap.getCenter(),
            mapTypeId: thisMap.getMapTypeId(),
            draggable: true,
            draggableCursor: "crosshair"
        };
        thisMap.setOptions(mapOptions);

        google.maps.event.addListener(thisMap, 'click', uc.geo.radius.addPointClick);
        google.maps.event.addListener(thisMap, 'mousemove', uc.geo.radius.drawLineToMousePoint);
        uc.geo.radius.polygonStart = true;
        /*
        uc.geo.radius.remarkerIcon = new GIcon();
        uc.geo.radius.remarkerIcon.image = "themes/default/assets/images/gmap/squaremarker.png";
        uc.geo.radius.remarkerIcon.iconSize = new GSize(10, 10);
        uc.geo.radius.remarkerIcon.iconAnchor = new GPoint(5, 5);
        */
    },

    clearPolygon: function() {
        var elMap = jQuery('#geo_radius_map');
        var thisMap = Mapifies.MapObjects.Get(elMap);
        uc.geo.radius.clearListeners();
        uc.geo.radius.clearGMarkers();
        //thisMap.clearOverlays();
        if (uc.geo.radius.searchMarker != null) {
            //hisMap.addOverlay(uc.geo.radius.searchMarker);
            uc.geo.radius.searchMarker.setMap(thisMap);
        }
        //clear polyline for the unclosure polylines
        if (uc.geo.radius.geoSelections.length > uc.geo.PolygonList.length) {
            uc.geo.radius.removeOverlay(thisMap, uc.geo.radius.geoSelections[uc.geo.PolygonList.length].polyline);
        }
        if (uc.geo.radius.mouseLine != null) {
            uc.geo.radius.removeOverlay(thisMap, uc.geo.radius.mouseLine);
        }

        for (var i = 0; i < uc.geo.PolygonList.length; i++) {
            uc.geo.PolygonList[i].setMap(null);
        }
        uc.geo.PolygonList.length = 0;
        uc.geo.radius.polygonCompleted = false;
        uc.geo.radius.polygonStart = false;
        uc.geo.radius.geoSelections = [];
        uc.geo.radius.indexOfLastGeoSelection = 0;
        mouseLine = null;
        //thisMap.clearOverlays();

        //thisMap.getDragObject().setDraggableCursor("hand");
        var mapOptions = {
            zoom: thisMap.getZoom(),
            center: thisMap.getCenter(),
            mapTypeId: thisMap.getMapTypeId(),
            draggable: true,
            draggableCursor: "hand"
        };
        thisMap.setOptions(mapOptions);
    },

    clearListeners: function() {
        var elMap = jQuery('#geo_radius_map');
        var thisMap = Mapifies.MapObjects.Get(elMap);
        google.maps.event.clearListeners(thisMap);
    },

    clearListener: function(eventName) {
        var elMap = jQuery('#geo_radius_map');
        var thisMap = Mapifies.MapObjects.Get(elMap);
        google.maps.event.clearListeners(thisMap, eventName);
    },

    clearGMarkers: function() {
        //var elMap = jQuery('#geo_radius_map');
        //var thisMap = Mapifies.MapObjects.Get(elMap);
        for (var i = 0; i < uc.geo.radius.gMarkers.length; i++) {
            //thisMap.removeOverlay(thisMap, uc.geo.radius.gMarkers[i]);
            //uc.geo.radius.removeOverlay(thisMap, uc.geo.radius.gMarkers[i]);
            uc.geo.radius.gMarkers[i].setMap(null);
            //uc.geo.radius.gMarkers[i] = null;
        }
        uc.geo.radius.gMarkers = [];
    },

    checkCurrentClickObject: function(obj, currentPosition) {
        if (obj != null && obj != undefined) {
            for (var i = 0; i < obj.points.length; i++) {
                if (currentPosition == obj.points[i]) {
                    uc.geo.Y = currentPosition;
                    return true;
                }
            }
        }
        return false;
    },

    addPointClick: function(overlay) {
        var polygon = null;
        polygon = uc.geo.radius.geoSelections[uc.geo.radius.indexOfLastGeoSelection];
        var elMap = jQuery('#geo_radius_map');
        var thisMap = Mapifies.MapObjects.Get(elMap);
        if (uc.geo.radius.checkCurrentClickObject(polygon, overlay.latLng)) {
            if (polygon.points.length > 0) {
                if (polygon.points.length > 1 && polygon.points.length < 3 && polygon.points[0] == uc.geo.Y) {
                    alert("You must add at least 3 points to define a selection area.\nPlease click another point.");
                } else {

                    if (polygon.points[0] == uc.geo.Y) {
                        // draw polygon
                        polygon.points.push(uc.geo.Y);
                        uc.geo.radius.DrawPolygon(elMap, polygon.points);
                        uc.geo.radius.removeOverlay(thisMap, polygon.polyline);
                        for (var i = 0; i < uc.geo.PolylineList.length; i++) {
                            uc.geo.PolylineList[i].setMap(null);
                        }
                        uc.geo.PolylineList.length = 0;

                    } else if (polygon.points[polygon.points.length - 1] == overlay.latLng) {
                        // overlay locate in the last point
                        uc.geo.radius.removeOverlay(thisMap, polygon.polyline);
                        var gMarker = uc.geo.radius.gMarkers[polygon.points.length - 1];
                        uc.geo.radius.removeOverlay(thisMap, gMarker);
                        polygon.points.pop();
                        uc.geo.radius.gMarkers.pop();
                        if (polygon.points.length < 1) {
                            uc.geo.radius.clearPolygon();
                        } else {
                            uc.geo.radius.drawPolyline(elMap, polygon.points, "#ff0000");
                        }
                    } else {
                        alert('You must click on the first point to close the polygon.');
                    }

                }
            }

        } else {
            //uc.geo.radius.addMarker(elMap, point);
            if (uc.geo.radius.checkPointAndLines(overlay.latLng, polygon.points[polygon.points.length - 1], polygon.points.length - 1) == 0) {
                uc.geo.radius.addMarker(elMap, overlay.latLng);
                var polygon = null;
                polygon = uc.geo.radius.geoSelections[uc.geo.radius.indexOfLastGeoSelection];
                polygon.points.push(overlay.latLng);
                uc.geo.radius.removeOverlay(thisMap, polygon.polyline);
                uc.geo.radius.drawPolyline(elMap, polygon.points, "#ff0000");
            } else {
                alert('Line segments defining the selection area can not cross');
            }

        }
    },

    drawLineToMousePoint: function(point) {
        if (uc.geo.radius.polygonCompleted || !uc.geo.radius.polygonStart) {
            return;
        }
        var elMap = jQuery('#geo_radius_map');
        var thisMap = Mapifies.MapObjects.Get(elMap);
        var polygon = uc.geo.radius.geoSelections[uc.geo.radius.indexOfLastGeoSelection];
        uc.geo.radius.removeOverlay(thisMap, uc.geo.radius.mouseLine);
        if (polygon != null && polygon.points.length > 0) {
            var points = [];
            points.push(point.latLng);
            points.push(polygon.points[polygon.points.length - 1]);
            uc.geo.radius.drawMouseLine(elMap, points, "#0000FF");
        }
    },

    removeOverlay: function(map, overlay) {
        if (overlay != null) {
            //map.removeOverlay(overlay);
            overlay.setMap(null);
        }
    },

    dragPoint: function() {
        var polygon, i, points, bT = 1;
        polygon = uc.geo.radius.geoSelections[uc.geo.radius.indexOfLastGeoSelection];
        points = polygon.points;
        for (i = 0; i < points.length; i++) {
            if (uc.geo.radius.gMarkers[i].getPoint() != points[i]) {
                if (i > 0) {
                    if (uc.geo.radius.checkPointAndLines(gMarkers[i].getPoint(), points[i - 1], i - 1) == 1) {
                        bT = 0;
                    }
                }
                if (i < points.length - 1) {
                    if (uc.geo.radius.checkPointAndLines(gMarkers[i].getPoint(), points[i + 1], i) == 1) {
                        bT = 0;
                    }
                }
                if (bT == 1) {
                    polygon.points[i] = uc.geo.radius.gMarkers[i].getPoint();
                } else {
                    uc.geo.radius.gMarkers[i].setPoint(points[i]);
                    alert('Cannot move point, because polygon lines can not cross');
                }
            }
        }
        var elMap = jQuery('#geo_radius_map');
        uc.geo.radius.removeOverlay(polygon.polyline);
        uc.geo.radius.drawPolyline(elMap, points, "#ff0000");
    },

    GetMapAddresses: function() {
        var addresses = [];
        for (var i = 0; i < uc.geo.radius.RadiusAddresses.length; i++) {
            var address = new uc.geo.radius.MyCircle();
            address.Latitude = uc.geo.radius.RadiusAddresses[i].Latitude;
            address.Longitude = uc.geo.radius.RadiusAddresses[i].Longitude;
            address.Radius = uc.geo.radius.RadiusAddresses[i].Radius;
            addresses.push(address);
        }

        if (addresses.length < 1) {
            var radius = "0";
            switch (page.placeorder.order.GeoType) {
                case entity.enums.GeoType.Radius:
                    radius = jQuery("#geo_radius_value").val();
                    break;
                case entity.enums.GeoType.ZipRadius:
                    radius = jQuery("#geo_radius_zip_value").val();
                    break;
                case entity.enums.GeoType.MultiRadius:
                    radius = jQuery("#geo_multiradius_value").val();
                    break;
                case entity.enums.GeoType.AcxiomMultiRadius:
                    radius = jQuery("#multi_radius_value").val();
                    break;
            }
            var lat = jQuery('#geo_radius_addr_lat').val();
            var lng = jQuery('#geo_radius_add_lng').val();
            if (!String.IsNullOrEmpty(lat) && !String.IsNullOrEmpty(lng)) {
                var address = new uc.geo.radius.MyCircle();
                address.Latitude = lat;
                address.Longitude = lng;
                address.Radius = radius;
                addresses.push(address);
            }
        }
        return addresses;

    },

    GetPointsStr: function() {
        var pointStr = [];
        if (page.placeorder.order.GeoType == entity.enums.GeoType.Polygon) {
            var pstr = uc.geo.radius.ComposePoints();
            if (!String.IsNullOrEmpty(pstr)) {
                pointStr.push(pstr);
            }
        }
        return pointStr;
    },

    SubmitMyMap: function() {
        var elMap = jQuery('#geo_radius_map');
        var thisMap = Mapifies.MapObjects.Get(elMap);

        google.maps.event.addListener(thisMap, 'idle', function() { });
        uc.geo.radius.SubmitMap(thisMap, page.global.MapWidth, page.global.MapHeight, page.placeorder.order.GeoType == entity.enums.GeoType.ZipMap);
    },




    SubmitMap: function(map, width, height, withWms) {

        var center = map.getCenter();
        var centerLat = center.lat();
        var centerLng = center.lng();
        var zoom = map.getZoom();

        //var centerPoint = map.fromLatLngToContainerPixel(center, zoom);
        var centerPoint = uc.geo.overlay.getProjection().fromLatLngToContainerPixel(center); //map.getProjection().fromLatLngToPoint(center);
        /* x coordinate. (This value increases to the right in the Google Maps coordinate system.)   */
        //var southWestPoint = new GPoint(centerPoint.x - (width / 2), centerPoint.y + (height / 2));
        var southWestPoint = new google.maps.Point(centerPoint.x - (width / 2), centerPoint.y + (height / 2));
        /*  y coordinate. (This value increases downwards in the Google Maps coordinate system.) */
        //var northEastPoint = new GPoint(centerPoint.x + (width / 2), centerPoint.y - (height / 2));
        var northEastPoint = new google.maps.Point(centerPoint.x + (width / 2), centerPoint.y - (height / 2));



        //var southWest = map.fromContainerPixelToLatLng(southWestPoint);
        var southWest = uc.geo.overlay.getProjection().fromContainerPixelToLatLng(southWestPoint);
        //var northEast = map.fromContainerPixelToLatLng(northEastPoint);
        var northEast = uc.geo.overlay.getProjection().fromContainerPixelToLatLng(northEastPoint);

        var bbox = String.format("{0},{1},{2},{3}", southWest.lng(), southWest.lat(), northEast.lng(), northEast.lat());
        var mapPaths = [];
        for (var i = 0; i < uc.geo.radius.MapPaths.length; i++) {
            for (var j = 0; j < uc.geo.radius.MapPaths[i].values.length; j++) {
                mapPaths.push(uc.geo.radius.MapPaths[i].values[j]);
            }
        }
        var other = "";
        if (withWms) {
            var layerName = page.placeorder.order.RadiusTypeChoice == entity.enums.RadiusTypeChoice.CRRT ? "CR" : "ZIP";
            other = String.format("LAYERS={0}", layerName);
        }
        var addresses = uc.geo.radius.GetMapAddresses();
        var pointStr = uc.geo.radius.GetPointsStr();
        framework.common.Ajax({
            url: "PlaceOrder.aspx/MapToPdf",
            data: { center: String.format("{0},{1}", centerLat, centerLng),
                zoom: zoom,
                bbox: bbox,
                paths: mapPaths,
                withWms: withWms,
                other: other,
                addresses: addresses,
                polygonPoints: pointStr
            },
            success: function(result) {
                if (result.ResultFlag == true) {
                    //window.location.href = result.DownloadFile;
                    jQuery("#downloadMap").attr("href", result.DataSource.DownloadFile);
                    //jQuery("#downloadMap").trigger("click");
                    window.open(result.DataSource.DownloadFile);
                }

            },
            error: function(rep) {
            },
            waitingElement: 'ct_geo'
        });

    }


};

uc.geo.scf = {
    _IsInit: false,
    ScfRegExp: null,
    Init: function() {
        if (uc.geo.scf._IsInit == false) {
            uc.geo.scf.CreateZipInputs();
            jQuery("#ct_geo_scf").removeClass("hidden");
            uc.geo.scf.ScfRegExp = new RegExp(page.placeorder.ScfRegExp, "i");
            uc.geo.scf._IsInit = true;
            jQuery("#geo_scf_range_input").slideUp();
            jQuery("#geo_scf_range_from").setMask(page.placeorder.ScfMask);
            jQuery("#geo_scf_range_to").setMask(page.placeorder.ScfMask);

            if (page.placeorder.order.ZipcodeOriginalType != entity.enums.ZipcodeOrignalType.SCF_INPUT
			    && page.placeorder.order.ZipcodeOriginalType != entity.enums.ZipcodeOrignalType.SCF_RANGE_INPUT) {
                page.placeorder.order.ZipcodeOriginalType = entity.enums.ZipcodeOrignalType.SCF_INPUT;
            }
            if (page.placeorder.order.ZipcodeOriginalType != entity.enums.ZipcodeOrignalType.SCF_INPUT) {
                uc.geo.scf.ToggleSCFInput();
                uc.geo.scf.ToggleSCFRangeInput();
            }
            if (entity.enums.ZipcodeOrignalType.SCF_RANGE_INPUT > page.placeorder.MaxScfcodeOriginalType) {
                jQuery("#geo_scf_range_input_panel").addClass("hidden");
            }
        }
        if (!page.global.isMyAcxiomPartnerUSite) {
            uc.geo.scf.LoadFromOrder();
        } else {
            if (page.placeorder.order.OrderId != undefined && page.placeorder.order.OrderId > 0) {
                uc.geo.scf.LoadFromOrder();
            }
        }
    },

    CreateZipInputs: function() {

        // attach the template
        $("#ct_gep_scf_inputs").setTemplateElement("ct_gep_scf_template");

        // process the template
        $("#ct_gep_scf_inputs").processTemplate({ linecount: 5 });

        $('#ct_gep_scf_inputs input:text').setMask(page.placeorder.ScfMask);
    },

    IsValidScf: function(scf) {
        return uc.geo.scf.ScfRegExp.test(scf);
    },

    LoadFromOrder: function() {
        var o = page.placeorder.order;
        if (o.GeoType == entity.enums.GeoType.Scf && o.OrderGeos != null) {
            var counts = o.OrderGeos.length;
            var objZips = $('#ct_gep_scf_inputs input:text') || [];
            for (var i = 0; i < objZips.length; i++) {
                if (i <= counts - 1) {
                    objZips[i].value = o.OrderGeos[i].GeoKeyCode;
                } else {
                    objZips[i].value = "";
                }
            }

            if (counts > 0) {
                jQuery("#geo_scf_range_from").val(o.OrderGeos[0].GeoKeyCode);
                jQuery("#geo_scf_range_to").val(o.OrderGeos[o.OrderGeos.length - 1].GeoKeyCode);
            }

        }
    },

    serverValidating: false,
    validatedZips: null,

    ResetZips: function(zips) {
        // var zips = uc.geo.zip.getInputedZips()
        if (zips.length > 0) {
            //re-order the zips, remove all blank fields.
            if (page.placeorder.order.ZipcodeOriginalType == entity.enums.ZipcodeOrignalType.SCF_INPUT) {
                var allZips = $('#ct_gep_scf_inputs input:text').val('') || [];
                for (var i = 0; i < zips.length; i++) {
                    allZips[i].value = zips[i];
                }
                return true;
            } else {
                jQuery("#geo_scf_range_from").val(zips[0]);
                jQuery("#geo_scf_range_to").val(zips[zips.length - 1]);
            }
        }
    },


    ToggleSCFcodePanel: function(originalZipType) {
        var nextZipType;
        if (originalZipType != page.placeorder.order.ZipcodeOriginalType) {
            nextZipType = originalZipType;
        } else {
            if (originalZipType == entity.enums.ZipcodeOrignalType.SCF_INPUT) {
                nextZipType = entity.enums.ZipcodeOrignalType.SCF_RANGE_INPUT;
            } else {
                nextZipType = entity.enums.ZipcodeOrignalType.SCF_INPUT;
            }
        }
        if (nextZipType > page.placeorder.MaxScfcodeOriginalType) {
            nextZipType = entity.enums.ZipcodeOrignalType.SCF_INPUT;
        }

        uc.geo.scf.ToggleTargetPanel(page.placeorder.order.ZipcodeOriginalType);
        uc.geo.scf.ToggleTargetPanel(nextZipType);
        page.placeorder.order.ZipcodeOriginalType = nextZipType;
    },

    ToggleSCFRangeInput: function() {
        jQuery("#geo_scf_range_input_switch").toggleClass("collapsed-panel-restore");
        jQuery("#geo_scf_range_input").slideToggle();
    },

    ToggleSCFInput: function() {
        jQuery("#geo_scf_enter_switch").toggleClass("collapsed-panel-restore");
        jQuery("#ct_gep_scf_inputs").slideToggle();
    },

    ToggleTargetPanel: function(originalZipType) {
        if (originalZipType == entity.enums.ZipcodeOrignalType.SCF_INPUT) {
            uc.geo.scf.ToggleSCFInput();
        } else {
            uc.geo.scf.ToggleSCFRangeInput();
        }
    },

    ToggleSCFPanel: function(el) {
        var originalZipType = parseInt($(el).attr("originalType"));

        uc.geo.scf.ToggleSCFcodePanel(originalZipType);

    },


    SetOrderGeos: function(order) {
        // do validation first
        // set geos
        geos = [];
        var zips = [];
        if (page.placeorder.order.ZipcodeOriginalType == entity.enums.ZipcodeOrignalType.SCF_INPUT) {
            var objZips = $('#ct_gep_scf_inputs input:text') || [];

            var validZips = [];
            objZips.each(function(i) {
                var str = jQuery.trim(this.value);
                if (str != '') {
                    if (!uc.geo.scf.IsValidScf(str)) {
                        $(this).val('');
                        hasError = true;
                    } else if (jQuery.inArray(str, validZips) != -1) {
                        $(this).val('');
                        hasError = true;
                    } else {
                        validZips.push(str);
                    }
                }
            });
            if (validZips.length < 0) {
                uc.geo.SetErrorMessage(true, " Please input at least one SCF.");
                return false;
            }

            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetZipsByScf",
                data: { zips: validZips },
                async: false,
                waitingElement: 'ct_main_panel',
                success: function(result) {
                    zips = result.DataSource;
                },
                error: function(rep) {

                }
            });

        } else {
            var from = jQuery("#geo_scf_range_from").val().trim();
            if (from == "" || from.length != 3) {
                uc.geo.SetErrorMessage(true, "Please input the from scf code.");
                return false;
            }
            var to = jQuery("#geo_scf_range_to").val().trim();
            if (to == "" || to.length != 3) {
                uc.geo.SetErrorMessage(true, "Please input the to scf code.");
                return false;
            }
            if (parseInt(from) > parseInt(to)) {
                var temp = from;
                from = to;
                to = temp;
                jQuery("#geo_scf_range_from").val(from);
                jQuery("#geo_scf_range_to").val(to);
            }

            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetSCFcodesBySCFRange",
                data: { fromSCF: from,
                    toSCF: to,
                    maxLength: page.global.MaxNumberOfZipcodeBySCF
                },
                async: false,
                success: function(result) {
                    if (result.ResultFlag == true) {
                        zips = result.DataSource;
                    }
                },
                error: function(rep) {

                },
                waitingElement: 'ct_geo'
            });
        }
        if (zips == null || zips.length < 1) {
            uc.geo.SetErrorMessage(true, " Please input at least one SCF.");
            return false;
        }

        this.ResetZips(zips);

        //TODO: check whether zip is valid
        for (var i = 0; i < zips.length; i++) {
            var geo = new entity.OrderGeo();
            geo.GeoKeyCode = zips[i];
            geo.GeoKeyDesc = zips[i];
            geo.GeoType = entity.enums.GeoType.Scf;
            geos.push(geo);
        }

        if (geos == null || geos.length == 0) {
            uc.geo.SetErrorMessage(true, " You must select one or more areas first.");
            return false;
        }

        order.OrderGeos = geos;
        return true;
    }
};

uc.geo.zipupload = {
    upload: null,
    zipUploadResult: null,
    zipUploadCompleted: false,
    Init: function() {
        this.BackToInputs();
        jQuery("#ct_geo_zipUpload").removeClass("hidden");

        this.upload = new AjaxUpload('#ct_geo_zipUpload_control', {
            action: 'FileHandler.ashx',
            name: 'zipUpload',
            autoSubmit: false,
            responseType: 'json',
            onChange: function(file, extension) {
                jQuery("#ct_geo_zipUpload_control_file").val($(this._input).val());
            },
            onSubmit: function(file, ext) {
                jQuery("#ct_geo_zipUpload_control_file").val("");
                page.placeorder.Block();
            },
            onComplete: function(file, response) {
                uc.geo.zipupload.zipUploadResult = response;
                uc.geo.zipupload.zipUploadCompleted = true;
                page.placeorder.UnBlock();
                uc.geo.Click_Next();

            }
        });
    },
    HasUploadResult: function() {
        return !($("#ct_geo_zipUpload_result").hasClass("hidden"));
    },
    BackToInputs: function() {
        uc.geo.SetErrorMessage(false, "");
        $("#ct_geo_zipUpload_control").removeClass("hidden");
        $("#ct_geo_zipUpload_result").addClass("hidden");
    },
    SetOrderGeos: function(order) {

        if (this.HasUploadResult()) {
            geos = [];

            for (var i = 0; i < this.zipUploadResult.DataSource.zips.length; i++) {
                var geo = new entity.OrderGeo();
                geo.GeoKeyCode = this.zipUploadResult.DataSource.zips[i].zip;
                geo.GeoKeyDesc = this.zipUploadResult.DataSource.zips[i].zip;
                geo.GeoType = entity.enums.GeoType.ZipUpload;
                geos.push(geo);
            }

            if (geos == null || geos.length == 0) {
                uc.geo.SetErrorMessage(true, "Please provide at least one zip.");
                return false;
            }
            order.OrderGeos = geos;

            return true;
        }
        else {
            if (uc.geo.zipupload.zipUploadCompleted == false) {

                if (!this.upload._input || this.upload._input.value === '') {
                    uc.geo.SetErrorMessage(true, "You must select a Microsoft Excel 97 or later file");
                    return false;
                }

                this.upload.enable();
                this.upload.submit();
                return false;
            }
            else {
                uc.geo.zipupload.zipUploadCompleted = false;

                if (uc.geo.zipupload.zipUploadResult.DataSource.hasError) {
                    uc.geo.SetErrorMessage(true, "You must select a Microsoft Excel 97 or later file");
                    return false;
                } else {
                    if (uc.geo.zipupload.zipUploadResult.DataSource.hasWarning) {
                        uc.geo.SetErrorMessage(true, "There were invalid or duplicate entries. They have been removed. ");
                    }
                    $("#ct_geo_zipUpload_result").setTemplateElement("ct_geo_zipUpload_template");
                    $("#ct_geo_zipUpload_result").processTemplate(uc.geo.zipupload.zipUploadResult.DataSource);
                    $("#ct_geo_zipUpload_result").removeClass("hidden");
                    $("#ct_geo_zipUpload_control").addClass("hidden");
                    return false;
                }
            }
        }

    }
};

uc.geo.msa = {
    _IsInit: false,


    Init: function() {
        if (uc.geo.msa._IsInit == false) {

            uc.geo.msa.LoadStates();
            uc.geo.msa._IsInit = true;
        }

    },

    LoadStates: function() {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetStates",
            data: {},
            success: function(result) {
                if (result.ResultFlag == true) {

                    framework.ui.fillDropDownList({
                        ElementId: "geo_msa_state",
                        DataSource: result.DataSource,
                        ValueField: "StateCode",
                        TextField: "StateName",
                        SelectValue: null
                    });

                    jQuery("#geo_msa_state").append("<option value=''>All</option>");
                    jQuery("#geo_msa_state").trigger("onchange");
                }
            },
            error: function(rep) {
                uc.geo.SetErrorMessage(true, "We've a problem on retrieving states list, please try again later.");
            },
            waitingElement: 'ct_main_panel'
        });
    },

    SearchAreasByState: function() {
        var state = jQuery("#geo_msa_state").val();
        var param = { listType: page.placeorder.order.ListType, state: state };

        framework.common.Ajax({
            url: "PlaceOrder.aspx/SearchAreas",
            data: param,
            success: function(result) {
                if (result.ResultFlag == true) {
                    framework.ui.fillDropDownList({
                        ElementId: "geo_msa_left",
                        DataSource: result.DataSource,
                        SelectValue: null
                    });
                }
            },
            error: function(rep) {
                uc.geo.SetErrorMessage(true, "We've a problem on retrieving MSA list, please try again later.");
            },
            waitingElement: 'ct_main_panel'
        });
    },

    AddAreasToTarget: function() {
        var sources = $('#geo_msa_left').selectedOptions() || []


        for (var i = 0; i < sources.length; ++i) {
            if (!$("#geo_msa_right").containsOption(sources[i].value)) {
                $("#geo_msa_right").addOption(sources[i].value, sources[i].text, false);
            }
        };
        $("#geo_msa_right").sortOptions(true);
        framework.common.iPad.refreshMask("geo_msa_right");
    },

    RemoveAreasFromTarget: function() {
        $('#geo_msa_right').removeOption(/./, true);
        framework.common.iPad.refreshMask("geo_msa_right");
    },

    RemoveAllAreasFromTarget: function() {
        $('#geo_msa_right').removeOption(/./);
        framework.common.iPad.refreshMask("geo_msa_right");
    },

    SetOrderGeos: function(order) {
        geos = [];
        jQuery("#geo_msa_right option").each(
            function(i) {
                var geo = new entity.OrderGeo();
                geo.GeoKeyCode = this.value;
                geo.GeoKeyDesc = this.text;
                geo.GeoType = entity.enums.GeoType.Msa;
                geos.push(geo);
            }
        );

        if (geos == null || geos.length == 0) {
            uc.geo.SetErrorMessage(true, "Please select at least one MSA.");
            return false;
        }

        order.OrderGeos = geos;
        return true;
    }

};


