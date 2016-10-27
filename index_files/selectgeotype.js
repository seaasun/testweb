ni.RegisterNameSpace("uc");
uc.geotype = {
    // Initial Step Setting
    InitStepSetting: function(order) {
        var step = page.placeorder.orderflow || new entity.OrderFlow();
        step.CurrentStep = entity.enums.OrderStep.GeoType;
        uc.geotype.CheckHideZip4();
        var ds = entity.lookup.DataSource.getByCode(page.placeorder.order.ListType);
        step.StepTitle = "";
        step.StepDescription = "";
        step.StepButtonsStatus = entity.enums.StepButtons.StartOver | entity.enums.StepButtons.Next;
        step.StepButtonsEvent = [
			{ ButtonKey: entity.enums.StepButtons.Next, ButtonEvent: uc.geotype.Click_Next, TestKey: "uc.geotype.Click_Next" }
        //{ ButtonKey: entity.enums.StepButtons.Back, ButtonEvent: uc.geotype.Click_Back }
		];
        return step;
        // framework.listener.FireListener(framework.listener.LISTENER_INIT_STEP, step);
    },

    _IsHideZip4: false,
    _IsInit: false,
    IsAgreeAttestation: false,
    Init: function() {
        this.SetErrorMessage(false);

        var o = page.placeorder.order;
        o.CurrentStep = entity.enums.OrderStep.GeoType;

        // ToDo: moving follow codes, use orderflow object and fire the init step listener   
        var step = uc.geotype.InitStepSetting();
        framework.listener.FireListener(framework.listener.LISTENER_INIT_STEP, step);

        jQuery('#ct_step_geotype').removeClass("hidden");
        
        page.placeorder.isMultiCount = false;
        // Load From Order
        if (!uc.geotype._IsInit) {

            //must agree the attestation agreement
            //add databilities unregister site
            if ((page.global.isMyAcxiomPartnerUSite || page.global.isDatabilitiesUSite) && !uc.geotype.IsAgreeAttestation) {
                //framework.ui.ShowDialog('ucAttestation', { appendForm: true, css: { cursor: "default", top: '15%', left: '30%', border: '0px solid #aaa'} });
                //$(".closeBtn").addClass("hidden");
                if (page.global.isDatabilitiesUSite) {
                    $("#attestation_site").text("Databilities");
                    $("#attestation_minAmount").text("$250");
                    $("#attestation_pCode").addClass("hidden");
                    $("#attestation_oStart").addClass("hidden");
                    $("a.register-button").attr("href", $("a.register-button").attr("href").replace("signup", "register_databilities"));
                    $("a.login-button").attr("href", $("a.login-button").attr("href").replace("signin", "login_databilities"));
                }
            }

            uc.geotype.LoadAvaliableGeoTypes();
            uc.geotype.LoadFromOrder();
            uc.geotype._IsInit = true;


        }
    },

    LoadAvaliableGeoTypes: function() {
        var o = page.placeorder.order;
        var datasource = o.ListType;
        var showoptions =

                             [{ key: entity.enums.DataSourceType.Consumer, value: [[0, 1], [3, 2], [4, 6], [5, 14], [7, 17], [19, 18], [20, -1], [22, -1], [23, -1]] }, /* lisa 06/01/2015 for issue 5720 and 5752*/
							   {key: entity.enums.DataSourceType.Business, value: [[0, 1], [3, 2], [4, 6], [5, 14], [7, 18], [20, 17], [23, -1]] },
							   { key: entity.enums.DataSourceType.NewMover, value: [[0, 1], [3, 2], [4, 6], [5, 14], [7, 18], [20, 17], [23, -1]] },
        // closex geo type is not supported by occupant and equifaxc datasources
        // error message: no session id exists in ud_saturation_session will be shown when going
        // through closex geo type on occupant path
				               {key: entity.enums.DataSourceType.Occupant, value: [[9, 1], [10, 2], [4, 17], [-1, 18]] },
							   { key: entity.enums.DataSourceType.NewHomeowner, value: [[0, 1], [3, 6], [4, 14], [5, 7], [20, 18], [-1, 17], [23, -1]] },
							   { key: entity.enums.DataSourceType.HomeData, value: [[0, 1], [3, 6], [4, 14], [5, 7], [-1, 17], [23, -1]] },
        // the error message: request failed with HTTP status 405: Method Not Allowed will be shown when going
        // through closex geo type on equifax path
							   {key: entity.enums.DataSourceType.Equifaxc, value: [[0, 1], [3, 2], [4, 14], [5, 7], [-1, 18], [-1, 17], [23, -1]] },
							   { key: entity.enums.DataSourceType.Experian, value: [[0, 1], [3, 2], [4, 6], [5, 14], [7, 18], [-1, 17], [23, -1]] },
							   { key: entity.enums.DataSourceType.Compass, value: [[0, 1], [3, 2], [4, 6], [5, 14], [7, 18], [19, 17], [23, -1]] },
							   { key: entity.enums.DataSourceType.CanadaConsumer, value: [[0, 1], [3, 6], [5, 14], [7, 18], [-1, 17], [23, -1]] },
							   { key: entity.enums.DataSourceType.InfoUSABusiness, value: [[0, 1], [3, 2], [4, 6], [5, 14], [7, 18], [-1, 15], [23, -1]] },
							   { key: entity.enums.DataSourceType.InfoUSAConsumer, value: [[0, 1], [3, 2], [4, 6], [5, 14], [7, 18], [-1, 15]] },
							   { key: entity.enums.DataSourceType.Valassis, value: [[0, 1], [3, 2], [5, 6], [7, 14], [20, 18], [-1, 17]] },
							   { key: entity.enums.DataSourceType.ResidentOccupant, value: [[0, 1], [3, 2], [5, 6], [-1, 14], [-1, 17], [-1, 18]] },
							   { key: entity.enums.DataSourceType.InfoUSA_Business, value: [[0, 1], [3, 2], [4, 14], [5, 17]] },
							   { key: entity.enums.DataSourceType.InfoUSA_Consumer, value: [[0, 1], [3, 2], [4, 14], [5, 17]] },
							   { key: entity.enums.DataSourceType.InfoBase_BusinessList, value: [[0, 1], [3, 2], [4, 6], [5, 14], [20, 18], [-1, 17]] },
							   { key: entity.enums.DataSourceType.InfoUSA_IDMS_Business, value: [[0, 1], [3, 2], [4, 6], [5, 18], [-1, 17], [-1, 16], [23, -1]] },
							   { key: entity.enums.DataSourceType.Mobile_Consumer_Advertising, value: [[0, 1], [3, 2], [4, 6], [5, 14], [7, 17], [19, 16], [20, 18], [23, -1]] }

							   ];

        var optionsForDataSource = null;
        for (var i = 0; i < showoptions.length; i++) {
            if (showoptions[i].key == datasource) {
                optionsForDataSource = showoptions[i].value;
            }
        }


        var lefts = [];
        var rights = [];
        var datasourceDisplay = [];

        for (var i = 0; i < optionsForDataSource.length; i++) {

            var leftDisplay, rightDisplay;
            if (optionsForDataSource[i][0] != null) {
                leftDisplay = this.GetGeoTypeDisplay(optionsForDataSource[i][0]);
                if (leftDisplay != null) {
                    var geoTypeDesc = this.GetInternationalGeoTypeDisplay(leftDisplay.value);
                    if (!String.IsNullOrEmpty(geoTypeDesc)) {
                        leftDisplay.desc = geoTypeDesc;
                    }
                    //alert(optionsForDataSource.length);

                    //alert(leftDisplay);
                    lefts.push(leftDisplay);
                }
            }

            if (optionsForDataSource[i][1] != null) {
                rightDisplay = this.GetGeoTypeDisplay(optionsForDataSource[i][1]);
                if (rightDisplay != null) {
                    var geoTypeDesc = this.GetInternationalGeoTypeDisplay(rightDisplay.value);
                    if (!String.IsNullOrEmpty(geoTypeDesc)) {
                        rightDisplay.desc = geoTypeDesc;
                    }
                    rights.push(rightDisplay);
                }
            }

        }

        var byleft = lefts.length >= rights.length;
        var targets = byleft ? lefts : rights;

        for (var j = 0; j < targets.length; j++) {
            if (byleft) {
                if (j > rights.length - 1) {
                    datasourceDisplay.push({ left: lefts[j], right: null });
                }
                else
                    datasourceDisplay.push({ left: lefts[j], right: rights[j] });
            }
            else {
                if (j > lefts.length - 1) {
                    datasourceDisplay.push({ left: null, right: rights[j] });
                }
                else
                    datasourceDisplay.push({ left: lefts[j], right: rights[j] });
            }

        }

        var templateDataSource = { table: datasourceDisplay, geotype: datasource };
        $("#ct_geotype_result").setTemplateElement("ct_geotype_template", null, { filter_data: false });
        $("#ct_geotype_result").processTemplate(templateDataSource);
        $("#ct_geotype_result").removeClass("hidden");
        var acxiomMultRadiusFeature = jQuery("#geo_type_acxiom_radius");
        if (acxiomMultRadiusFeature.length > 0 && !page.placeorder.IsAcxiomMultiRadius) {
            acxiomMultRadiusFeature.parent().addClass("hidden");
        }

//        if (page.placeorder.isMultiCount) {
//            $("#geo_type_zip").removeAttr("checked");
//            $("#geo_type_multicount").attr("checked", "checked");
//        }
//        else {
//            $("#geo_type_zip").attr("checked", "checked");
//            $("#geo_type_multicount").removeAttr("checked");
//        }


    },

    GetInternationalGeoTypeDisplay: function(geoType) {
        var geoTypeDisplay = null;
        if (page.placeorder.GeoTypeDescs != null && page.placeorder.GeoTypeDescs.length > 0) {
            var geoTypeDesc = null;
            for (var i = 0; i < page.placeorder.GeoTypeDescs.length; i++) {
                geoTypeDesc = page.placeorder.GeoTypeDescs[i];
                if (geoTypeDesc.TextName == geoType) {
                    geoTypeDisplay = geoTypeDesc.TextValue;
                    break;
                }
            }
        }
        return geoTypeDisplay;
    },

    LoadFromOrder: function() {
        var o = page.placeorder.order;
        var $GeoEl = jQuery(String.format("#ct_step_geotype input[name='geo-radios'][value='{0}']", o.GeoType));
        if ($GeoEl.length > 0) {
            $GeoEl[0].checked = true;
        }
    },

    ContinueAttestation: function() {
        uc.geotype.IsAgreeAttestation = true;
        framework.ui.CloseDialog('ucAttestation');
    },

    Click_Next: function() {
        if (Number(jQuery("input[name='geo-radios']:checked").val()) == -1) {
            var desc = String.format("Please contact {1} for nationwide list counts at {0} or at {2}.", page.global.PhoneNumber, page.global.DataSpecialistDesc, page.globa.ContactEmail)
            uc.geotype.SetErrorMessage(true, desc);
            return false;
        }

        var o = page.placeorder.order;
        var GeoType = Number(jQuery("input[name='geo-radios']:checked").val());
        if (o.GeoType != GeoType) {
            //            if (page.placeorder.IsMultipleAddress && GeoType == entity.enums.GeoType.Radius
            //                && o.ListType != entity.enums.DataSourceType.Occupant
            //                && o.ListType != entity.enums.DataSourceType.InfoUSABusiness
            //                && o.ListType != entity.enums.DataSourceType.InfoUSAConsumer) {
            //                GeoType = entity.enums.GeoType.AcxiomMultiRadius
            //            }


            o.OrderGeos = null;
            o.OrderAddresses = null;
            o.GeoType = GeoType;
        }
        if (o.GeoType == entity.enums.GeoType.AcxiomMultiRadius) {
            page.placeorder.IsShowOrderGeoDetailQuantity = false;
        }

        if (o.GeoType == entity.enums.GeoType.MultiCount) {
            page.placeorder.isMultiCount = true;
        } else {
            page.placeorder.isMultiCount = false;
         }

        //jenny.xiao add section nationwide
        if (o.GeoType == entity.enums.GeoType.NationWide) {
            o.NextStep = entity.enums.OrderStep.Demo;
            geos = [];
            var geo = new entity.OrderGeo();
            geo.GeoKeyCode = "1";
            geo.GeoKeyDesc = "NATIONWIDE";
            geo.GeoType = entity.enums.GeoType.NationWide;
            geos.push(geo);
            o.OrderGeos = geos;
        }
        else if (o.GeoType == entity.enums.GeoType.MultiCount) {
            o.NextStep = entity.enums.OrderStep.Demo;
            //            geos = [];
            //            var geo = new entity.OrderGeo();
            //            geo.GeoKeyCode = "24";
            //            geo.GeoKeyDesc = "Multi Saved List Count";
            //            geo.GeoType = entity.enums.GeoType.MultiCount;
            //            geos.push(geo);
            //            o.OrderGeos = geos;
        }
        else {
            o.NextStep = entity.enums.OrderStep.Geo;
        }

        // must agree the attestation on myacxiompartner unregister site
        //        if (page.global.isMyAcxiomPartnerUSite && !uc.geotype.IsAgreeAttestation) {

        //            $("#accept_attestation").bind("click", function() {
        //                uc.geotype.IsAgreeAttestation = true;
        //                framework.ui.CloseDialog();
        //                page.placeorder.GoNext();
        //            });
        //            $("#cancel_attestation").bind("click", function() {
        //                uc.geotype.IsAgreeAttestation = false;
        //                framework.ui.CloseDialog();
        //            });
        //            //$("#ucAttestation").colorbox({ iframe: true, width: 610, height: 420, opacity: 0.5, scrolling: true });
        //            framework.ui.ShowDialog('ucAttestation', { appendForm: true, css: { cursor: "default", top: '15%', left: '25%', border: '0px solid #aaa'} });


        //        } else {
        //            page.placeorder.GoNext();
        //        }
        page.placeorder.TrackOrderPathGAEvent("Step 1 - GeoType","GeoType Next Button");
        page.placeorder.GoNext();

    },

    Click_Back: function() {
        page.placeorder.GoBack();
    },

    SetErrorMessage: function(bShow, msg) {
        if (bShow) {
            jQuery('#geo_type_message_error').removeClass("hidden").html(msg);
        } else {
            jQuery('#geo_type_message_error').addClass("hidden")
        }
    },

    GetGeoTypeDisplay: function(key) {
        // var radiusDesc = "Choose Radius Around Single/Multi Address(es) <img src='usadata/images/google.jpg'></img><input type='button' class='slhelp' primaryKey='Specify Radius Around Address'/>"
        radiusDesc = "Choose by Radius around an Address <img src='usadata/images/google.jpg'></img><img class='sl360_map_icon hidden' src='usadata/images/googlemap.png'><input type='button' class='slhelp' primaryKey='Specify Radius Around Address'/><i class='fa fa-question-circle tip slhelp hidden' primarykey='Specify Radius Around Address' aria-hidden='true'></i>";
        //        if (!page.placeorder.IsMultipleAddress) {
        //            radiusDesc = "Choose by Radius around an Address <img src='usadata/images/google.jpg'></img><input type='button' class='slhelp' primaryKey='Specify Radius Around Address'/>";

        //        }
        //        var closetDesc = page.placeorder.IsMultipleAddress ? "Choose Closest Records Single/Multiple Address(es) <img src='usadata/images/google.jpg'></img>"
        var closetDesc = "Closest records to an Address <img src='usadata/images/google.jpg'></img><img class='sl360_map_icon hidden' src='usadata/images/googlemap.png'>";
        var geotypsDisplay = [{ index: 0, value: 5, id: "geo_type_zip", desc: uc.geotype._IsHideZip4 ? "Enter ZIP Codes (Copy and Paste up to 2000 ZIP/Carrier Routes codes)" : "Enter ZIP Codes (Copy and Paste up to 2000 ZIP/Carrier Routes/ZIP9 codes)" },
        //{ index: 1, value: 7, id: "geo_type_radius", desc: "Choose Radius Around Single/Multi Address(es) <img src='usadata/images/google.jpg'></img><input type='button' class='slhelp' primaryKey='Specify Radius Around Address'/>" },
					   {index: 1, value: 7, id: "geo_type_radius", desc: radiusDesc },
					   { index: 2, value: 11, id: "geo_type_zipradius", desc: "Choose by Radius around a ZIP Code <img src='usadata/images/google.jpg'></img><img class='sl360_map_icon hidden' src='usadata/images/googlemap.png'><input type='button' class='slhelp' primaryKey='Choose By Radius Around Zipcode'/><i class='fa fa-question-circle tip slhelp hidden' primarykey='Choose By Radius Around Zipcode' aria-hidden='true'></i>" },
					   { index: 3, value: 4, id: "geo_type_city", desc: "Choose by City" },
					   { index: 4, value: 3, id: "geo_type_county", desc: "Choose by County" },
					   { index: 5, value: 2, id: "geo_type_state", desc: "Choose by State" },
        //{ index: 6, value: 12, id: "geo_type_closex", desc: "Choose Closest Records Single/Multiple Address(es) <img src='usadata/images/google.jpg'></img>" },
					   {index: 6, value: 12, id: "geo_type_closex", desc: closetDesc },
					   { index: 7, value: 8, id: "geo_type_scf", desc: "Enter SCF Codes (up to 25) [first 3 digits of a zip code]" },
					   { index: 8, value: 9, id: "geo_type_ZipUpload", desc: "Upload a ZIP Code File (Excel format required)" },
					   { index: 9, value: 5, id: "geo_type_zip", desc: uc.geotype._IsHideZip4 ? "Enter ZIP Codes (Copy and Paste up to 2000 ZIP/Carrier Routes codes)" : "Enter ZIP Codes (Copy and Paste up to 2000 ZIP/Carrier Routes/ZIP9 codes)" },
					   { index: 10, value: 4, id: "geo_type_city", desc: "Choose by City Name" },
        //{ index: 11, value: 7, id: "geo_type_radius", desc: "Choose Radius Around Single/Multi Address(es) <img src='usadata/images/google.jpg'></img><input type='button' class='slhelp' primaryKey='Specify Radius Around Address'/>" },
					   {index: 12, value: 9, id: "geo_type_ZipUpload", desc: "Upload a Microsoft Excel ZIP Code File" },
					   { index: 13, value: -1, id: "geo_type_entireusa", desc: "Choose the entire United States" },
					   { index: 14, value: 13, id: "geo_type_polygon", desc: "Select from Map (Draw Polygon) <img src='usadata/images/google.jpg'></img><img class='sl360_map_icon hidden' src='usadata/images/googlemap.png'>" },
					   { index: 15, value: 14, id: "geo_type_multiradius", desc: "Radius around Multiple Addresses <img src='usadata/images/google.jpg'></img><img class='sl360_map_icon hidden' src='usadata/images/googlemap.png'><input type='button' class='slhelp' primaryKey='Specify Radius Around Address'/><i class='fa fa-question-circle tip slhelp hidden' primarykey='Specify Radius Around Address' aria-hidden='true'></i>" },
					   { index: 16, value: 15, id: "geo_type_multiclosex", desc: "Closest Records to Multiple Addresses <img src='usadata/images/google.jpg'></img><img class='sl360_map_icon hidden' src='usadata/images/googlemap.png'>" },
					   { index: 17, value: 16, id: "geo_type_acxiom_radius", desc: "Radius around Multiple Addresses <img src='usadata/images/google.jpg'></img><img class='sl360_map_icon hidden' src='usadata/images/googlemap.png'><input type='button' class='slhelp' primaryKey='Specify Radius Around Address'/><i class='fa fa-question-circle tip slhelp hidden' primarykey='Specify Radius Around Address' aria-hidden='true'></i>" },
					   { index: 18, value: 18, id: "geo_type_zip_map", desc: "Select ZIP Codes or Carrier Routes from Map <img src='usadata/images/google.jpg'></img><img class='sl360_map_icon hidden' src='usadata/images/googlemap.png'><input type='button' class='slhelp' primaryKey='Choose by Radius'/><i class='fa fa-question-circle tip slhelp hidden' primarykey='Choose by Radius' aria-hidden='true'></i>" },
					   { index: 19, value: 10, id: "geo_type_msa", desc: "Choose by Metro Area" },
        //jenny.xiao add new section
					   {index: 20, value: 20, id: "geo_type_nationwide", desc: "Total U.S." },
        //lisa.wang add new section for 5720
					   {index: 22, value: 22, id: "geo_type_Congressional_District", desc: "Congressional District" },
        //lisa.wang add new section for 5752
					   {index: 23, value: 23, id: "geo_type_multigeo", desc: "Choose More than one type of Area <input type='button' class='slhelp' primaryKey='Choose More than one type of Area'/><i class='fa fa-question-circle tip slhelp hidden' primarykey='Choose More than one type of Area' aria-hidden='true'></i>" },
					   { index: 24, value: 24, id: "geo_type_multicount", desc: "Multi Saved List Count"}];

        //        if (key != 24 && page.placeorder.isMultiCount)
        //        {   
        //            return null;
        //        }
        //        else if(key == 24 && !page.placeorder.isMultiCount)
        //        {
        //            return null;
        //        }

	   //is enable multi count
	   if (key == 24 && !page.placeorder.isEnableMultiCount) {
	       return null;
	   }

        if (key == 18 && !page.placeorder.EnableZipCodeOrCarrierRoute) {

            return null;
        }

        if (key == 15 && !page.placeorder.IsMultipleAddress) {
            return null;
        }

        //for multi geo for 5752
        if (key == 23 && !page.placeorder.isEnableMultiGeo) {
            return null;
        }

        if (key == 16 && !page.placeorder.IsMultipleAddress) {
            return null;
        }

        if (key == 17 && !page.placeorder.IsMultipleAddress) {
            return null;
        }

        if ((key == 7 || key == 19 || key == 20) && (page.global.isMyAcxiomPartnerUSite || page.global.isDatabilitiesUSite)) {
            return null;
        }
        //disable geotypes from siteSetting: DISABLED_GEOTYPES = 198
        if (page.placeorder.disabledGeoTypes) {
            var disabledGeoTypes = page.placeorder.disabledGeoTypes.split(',');
            for (var i in disabledGeoTypes) {
                if (disabledGeoTypes[i] * 1 == key) {
                    //console.log(disabledGeoTypes[i]);
                    return null;
                }
            }
        }


        for (var i = 0; i < geotypsDisplay.length; i++) {
            if (geotypsDisplay[i].index == key) {
                return geotypsDisplay[i];
            }
        }
        return null;


    },

    CheckHideZip4: function() {
        $("#geoZipOriginalType7").show();
        uc.geotype._IsHideZip4 = false;
        var zipArr = page.placeorder.DataSourceOfHideZip4.split(",");
        for (i = 0; i < zipArr.length; i++) {
            if (zipArr[i] == page.placeorder.order.ListType) {
                uc.geotype._IsHideZip4 = true;
                break;
            }
        }
        if (uc.geotype._IsHideZip4) {
            $("#geoZipOriginalType7").hide();
            $("label[for='geo_type_zip']").html("Enter ZIP Codes (Copy and Paste up to 2000 ZIP/Carrier Routes codes)");
            $("#Span6").html("Copy And Paste (up to 2000 ZIP/Carrier Routes)");
        }
    }
};

