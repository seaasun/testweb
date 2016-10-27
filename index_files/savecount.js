ni.RegisterNameSpace("uc");
uc.savecount = {
    _Validator: null,
    _IsInit: false,
    _UserCountry: null,
    Init: function() {
        if (page.placeorder.currentDataSource == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
            var message = "<div class='dialog-title-m'>Save Campaign</div><div class='break'></div><div class='dialog-description'><span>Please complete the form below to save your campaign. Upon completion you will:</span><ul style='list-style-type: decimal; margin-top: 0pt; margin-bottom: 0pt;'><li>Instantly receive links to download (pdf) and print this quote</li><li>Receive an email with a link to retrieve your saved campaign</li></ul></div>";
            jQuery("#ct_result_save_count_header").html(message);
            jQuery("#slc_interesting").addClass("hidden");
            jQuery("#ct_result_save_count_special").html("campaign");
        }
        var o = page.placeorder.order;
        uc.savecount.ShowSaveCountEditing(o);


        // just for performance purpose
        // uc.savecount._Validator = uc.savecount.GetValidator();
        // uc.savecount._Validator.resetForm();
        uc.savecount.SetErrorMessage();

        if (!uc.savecount._IsInit) {
            uc.savecount._IsInit = true;
            $("#results_sc_phone").setMask("(999) 999-9999");
            $("#results_sc_phoneext").setMask("99999");
        }
    },

    Continue: function() {
        var o = page.placeorder.order;
        //framework.common.LogClickEvent("Click continue button in save count page.", jQuery.toJSON(o), "Continue.");
        framework.common.LogClickEvent("Click continue button in save count page.", null, "Continue.");
        //set order contact
        uc.savecount.Save_Data();

        var order = page.placeorder.order;
        //validate
        //var isValid = $("#aspnetForm").validate().form();
        var isValid = uc.savecount.DoValidation();

        //check the browser session value. jack.xin 2012-09-10
        if (typeof (page.placeorder.CurrentSessionId) == null || typeof (page.placeorder.CurrentSessionId) == "undefined") {
            uc.payment.SetErrorMessage(true, "The browser didn't get session.");
            return;
        }
        if (page.placeorder.CurrentSessionId == "") {
            uc.payment.SetErrorMessage(true, "Browser session value is empty.");
            return;
        }

        if (isValid) {
            //load google analytics js code.
            // uc.savecount.Load_Google_Analytics_Js();

            //load google analytics js code. jack.xin 2012-07-25
            uc.savecount.Load_Google_Analytics_Js_For_SLC();



            framework.ui.showWaiting('ct_results_save_count_edit', true);

            uc.savecount.Click_Google_Analytics_SaveCount();

            //make ajax call to save count
            framework.common.Ajax({
                url: "PlaceOrder.aspx/SaveCount",
                data: { order: order, currentSessionId: page.placeorder.CurrentSessionId },
                success: function(result) {
                    framework.ui.showWaiting('ct_results_save_count_edit', false);
                    //add check  jack.xin 2012-07-18
                    if (!result.ResultFlag) {
                        //show error message
                        uc.savecount.SetErrorMessage(true, result.ResultMessage);
                        return;
                    }
                    //show save count detail
                    var data = result.DataSource;
                    if (data != null) {
                        uc.savecount.ShowOrderDetail(order);
                    }
                },
                error: function(rep) {
                    framework.ui.showWaiting('ct_results_save_count_edit', false);
                    //show error message
                    uc.savecount.SetErrorMessage(true, "Unfortunately, the system is unable to process your request. Our technical support specialists have been notified. Thank you for your patience while we work to resolve the error.");
                }
            });
        }
    },

    Click_Google_Analytics_SaveCount: function() {
        //you should first check if ga is set
        if (typeof ga !== 'undefined') {
            ga('send', 'event', 'Save Count', 'Clicked through to save count');
        }
        //check if _gaq is set too
        if (typeof _gaq !== 'undefined') {
            _gaq.push(['_trackEvent', 'Save Count', 'Clicked through to save count']);
        }
    },

    Load_Google_Analytics_Js: function() {
        $.getScript("//www.googleadservices.com/pagead/conversion.js");

        $("#SaveCount_Google_Analytics_Js")[0].innerHTML =
			"<script type=\"text/javascript\">" +
            "try {" +
                "var pageTracker = _gat._getTracker(\"UA-3481158-4\");" +
                "pageTracker._trackPageview(\"/0480296263/goal\");" +
            "} catch (err) { }" +
			"<\/script>" +
			"<noscript>" +
                "<img height=1 width=1 border=0 src='http://www.googleadservices.com/pagead/conversion/1072646300/?value=2&label=Zl1MCNHaRhCckb3_Aw&script=0' ></img>"
        "</noscript>;";
    },

    //load google analytics js code. jack.xin 2012-07-25
    Load_Google_Analytics_Js_For_SLC: function() {
        $.getScript("//www.googleadservices.com/pagead/conversion.js");

        $("#SaveCount_Google_Analytics_Js_For_SLC")[0].innerHTML =
			"<script type=\"text/javascript\">" +
            "try {" +
                "var google_conversion_id = 1072646300;" +
                "var google_conversion_language = \"en_US\";" +
                "var google_conversion_format = \"1\";" +
                "var google_conversion_color = \"ffffff\";" +
                "var google_conversion_label = \"Zl1MCNHaRhCckb3_Aw\";" +
                "var google_conversion_value = 3;" +
                "pageTracker._trackPageview(\"/0480296263/goal\");" +
            "} catch (err) { }" +
			"<\/script>" +
			"<noscript>" +
			"<div style=\"display:inline;\">" +
                "<img height='1' width='1' style=\"border-style:none;\" alt='' src='http://www.googleadservices.com/pagead/conversion/1072646300/?value=3&amp;label=Zl1MCNHaRhCckb3_Aw&amp;guid=ON&amp;script=0' />" +
            "</div>"
        "</noscript>;";

    },

    Save_Data: function() {
        var o = parent.page.placeorder.order;
        var contact = o.OrderContactInformation;
        if (contact == null) {
            contact = new entity.OrderContact();
        }
        //text fields
        contact.FirstName = jQuery("#results_sc_firstname").val();
        contact.LastName = jQuery("#results_sc_lastname").val();
        contact.Company = jQuery("#results_sc_company").val();
        contact.Phone = jQuery("#results_sc_phone").val();
        contact.Email = jQuery("#results_sc_email").val();
        contact.OrderName = jQuery("#results_sc_ordername").val();
        //options
        contact.CallMe = jQuery("#results_sc_callme")[0].checked;
        contact.OrderForClients = jQuery("#results_sc_orderforclient")[0].checked;
        contact.AddToMailingList = false; // jQuery("input[type='checkbox'][name='myAddToMailingList']")[0].checked;
        contact.CountryCode = String.IsNullOrEmpty(contact.CountryCode) ? "US" : contact.CountryCode;
        contact.IsContactMeByEmail = jQuery("#results_sc_contact_me").attr("checked");
        contact.IsSendEmailToList = jQuery("#results_sc_contact_list").attr("checked");
        o.OrderContactInformation = contact;
    },

    ShowSaveCountEditing: function(o) {
        jQuery('#ct_results_save_count_edit').removeClass("hidden");
        jQuery('#ct_results_save_count_success').addClass("hidden");

        uc.savecount.SetErrorMessage(false);

        framework.common.LogClickEvent("Save count page init", null, "Load_Data.");

        if (page.global.IsVertaxEnabled) {
            jQuery("#results_sc_taxnote").removeClass("hidden");
        }

        var contact = o.OrderContactInformation;
        if (contact != null) {
            //text fields
            jQuery("#results_sc_firstname").val(contact.FirstName);
            jQuery("#results_sc_lastname").val(contact.LastName);
            jQuery("#results_sc_company").val(contact.Company);
            jQuery("#results_sc_phone").val(contact.Phone);
            jQuery("#results_sc_email").val(contact.Email);
            jQuery("#results_sc_ordername").val(contact.OrderName);
        } else {
            jQuery("#results_sc_ordername").val("");
            var user = null;
            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetUserInformation",
                success: function(result) {
                    if (result.ResultFlag == true) {
                        user = result.DataSource;
                        if (user != null) {
                            var contact = new entity.OrderContact();
                            contact.FirstName = user.FirstName;
                            contact.LastName = user.LastName;
                            contact.Company = user.Company;
                            contact.Email = user.Email;
                            if (!String.IsNullOrEmpty(user.HomePhone)) {
                                var phone = user.HomePhone;
                                phone = phone.replace("(", "").replace(")", "").replace(" ", "").replace("x", "").replace("-", "");
                                contact.Phone = String.format("({0}) {1}-{2}", phone.substr(0, 3), phone.substr(3, 3), phone.substr(6, 4));
                            }
                            if (user.UsersAddress != null && user.UsersAddress.length > 0) {
                                var address = user.UsersAddress[0];
                                contact.AddressLine = address.AddressLine;
                                contact.City = address.CityName;
                                contact.State = address.StateCode;
                                contact.Zipcode = address.ZipCode;
                                contact.CountryCode = address.CountryCode;
                            }
                            o.OrderContactInformation = contact;
                            jQuery("#results_sc_firstname").val(contact.FirstName);
                            jQuery("#results_sc_lastname").val(contact.LastName);
                            jQuery("#results_sc_company").val(contact.Company);
                            jQuery("#results_sc_email").val(contact.Email);
                            if (!String.IsNullOrEmpty(contact.Phone)) {
                                var phone = user.HomePhone;
                                phone = phone.replace("(", "").replace(")", "").replace(" ", "").replace("x", "").replace("-", "");
                                jQuery("#results_sc_phone").val(contact.Phone);
                                if (phone.length > 10) {
                                    jQuery("#results_sc_phoneext").val(contact.Phone.substr(10, contact.Phone.length - 10));
                                }
                            }
                        } else {
                            uc.savecount.ResetSaveCount();
                        }
                    }
                },
                error: function(rep) {
                    uc.savecount.ResetSaveCount();
                },
                waitingElement: 'ct_results_save_count'
            });

        }
    },

    ResetSaveCount: function() {
        jQuery("#results_sc_firstname").val("");
        jQuery("#results_sc_lastname").val("");
        jQuery("#results_sc_company").val("");
        jQuery("#results_sc_phone").val("");
        jQuery("#results_sc_email").val("");
    },

    ShowOrderDetail: function(o) {
        jQuery('#ct_results_save_count_edit').addClass("hidden");
        jQuery('#ct_results_save_count_success').removeClass("hidden");


        // uc.savecount.Load_Google_Analytics_Js();
        var contact = o.OrderContactInformation;
        if (contact != null) {
            //text fields
            if (page.placeorder.currentDataSource == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {
                jQuery('#results_sc_success_titledesc').html(String.format('An email has been sent to {0} with a link to retrieve your campaign. ', contact.Email));
            } else {
                jQuery('#results_sc_success_titledesc').html(String.format('An email has been sent to {0} with a link to retrieve your saved count. ', contact.Email));
            }
            jQuery("#results_sc_success_firstname").val(contact.FirstName);
            jQuery("#results_sc_success_lastname").val(contact.LastName);
            jQuery("#results_sc_success_company").val(contact.Company);
            jQuery("#results_sc_success_phone").val(contact.Phone);
            jQuery("#results_sc_success_email").val(contact.Email);
            jQuery("#results_sc_success_ordername").val(contact.OrderName);
        }
    },

    GetValidator: function() {
        var validator = jQuery("form[name='PopupForm']").validate({
            rules: {
                results_sc_firstname: { required: true },
                results_sc_lastname: { required: true },
                results_sc_company: { required: true },
                results_sc_email: { required: true, email: true },
                results_sc_ordername: { required: true }
            },
            messages: {
                results_sc_firstname: { required: "Please enter your first name. " },
                results_sc_lastname: { required: "Please enter your last name. " },
                results_sc_company: { required: "Please enter your company name. " },
                results_sc_email: { email: "Please enter a valid email address", required: "Please enter your email address. " },
                results_sc_ordername: { required: "Please name your list count." }
            },
            errorContainer: jQuery('#SLC_ValidateSummay'),
            errorLabelContainer: jQuery("ul", jQuery('#SLC_ValidateSummay')),
            wrapper: 'li'
        });

        return validator;
    },

    DoValidation: function() {
        var validator = uc.savecount.GetValidator();

        validator.resetForm();
        if (!validator.form()) {
            jQuery('#SLC_ValidateSummay').removeClass("hidden");
            return false;
        } else {
            jQuery('#SLC_ValidateSummay').addClass("hidden");
            return true;
        }

    },

    SetErrorMessage: function(bShow, msg) {
        if (bShow) {
            jQuery('#results_sc_error').removeClass("hidden").html(msg);
        } else {
            jQuery("#ct_results_save_count_edit input[class*='error']").removeClass("error");
            jQuery("#SLC_ValidateSummay").addClass("hidden");
            jQuery('#results_sc_error').addClass("hidden");
        }
    }
};

//jQuery(document).ready(function() {
//    uc.savecount.Load_Data();
//});
