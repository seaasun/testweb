ni.RegisterNameSpace("uc");
uc.payment = {
    _IsInit: false,
    CurrentPaymentMethod: null,
    Countries: [],
    InternationalText: [],
    CreditCard: {
        CCNumber: "",
        CCType: "10",
        MaskNumber: "",
        NeedValidation: true
    },
    IsContactAddressComplete: false,
    enableSanNumber: false,
    SanNumberIsActive: false,
    TaxResult: null,
    MaxRetries: 3,
    Retries: 0,

    // Initial Step Setting
    InitStepSetting: function(order) {
        var step = page.placeorder.orderflow || new entity.OrderFlow();
        step.CurrentStep = entity.enums.OrderStep.Payment;
        step.StepTitle = "";
        step.StepDescription = "<b>You're almost finished!</b> Please confirm the order details below are correct and then enter your contact and payment information. Click 'Process Order' to complete your order. Once your payment is approved, you will receive an email with your order confirmation and receipt, with details on accessing your leads.";
        step.StepButtonsStatus = entity.enums.StepButtons.Back | entity.enums.StepButtons.PlaceOrder;
        step.StepButtonsEvent = [
			{ ButtonKey: entity.enums.StepButtons.Back, ButtonEvent: uc.payment.Click_Back },
			{ ButtonKey: entity.enums.StepButtons.PlaceOrder, ButtonEvent: uc.payment.ProcessOrder }
		];
        return step;
        // framework.listener.FireListener(framework.listener.LISTENER_INIT_STEP, step);
    },

    Init: function() {
        page.placeorder.order.CurrentStep = entity.enums.OrderStep.Payment;
        uc.payment.SetErrorMessage(false, "");
        // ToDo: moving follow codes, use orderflow object and fire the init step listener
        if (framework.common.IsRegisteredSite) {
            var step = uc.payment.InitStepSetting();
            framework.listener.FireListener(framework.listener.LISTENER_INIT_STEP, step);
        }
        jQuery('#payment_ValidateSummay').addClass("hidden");
        var year = (new Date()).getFullYear() + 1;

        jQuery("#payment_bill_year").val(year);

        uc.payment.GetOrderContact();
        uc.payment.LoadCountries();
        uc.payment.GetOrder();
        if (!page.placeorder.IsShowOrderGeoDetailQuantity) {
            jQuery("#orderDetails td[attr='selectedQuantity']").addClass("hidden");
        }

        uc.payment.ProcessContactInfor();

        if (!uc.payment._IsInit) {
            uc.payment._IsInit = true;
            $("#payment_agreement").colorbox({ iframe: true, width: 670, height: 600, opacity: 0.5, scrolling: false });


        }


        $("#payment_contact_firstname").first().focus();
    },

    LoadCountries: function() {
        var countryCode = "US";
        var contact = page.placeorder.order.OrderContactInformation;

        if (contact != null && !String.IsNullOrEmpty(contact.CountryCode)) {
            countryCode = contact.CountryCode;
        }
        if (uc.payment.Countries.length < 1) {
            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetCountries",
                data: {},
                success: function(result) {
                    if (result.ResultFlag == true) {
                        uc.payment.Countries = result.DataSource;
                        jQuery("#countriesOfContactDiv").html(uc.payment.FillCountries("countryOfContact", uc.payment.Countries, "countryOfContact", "uc.payment.LoadStatesOfContactByCountry()"));
                        jQuery("input[type=radio][name=countryOfContact][value=" + countryCode + "]").attr("checked", "checked");
                        //jQuery("").html(uc.payment.FillCountries("", uc.payment.Countries, "countryOfContact"));
                        jQuery("#countriesOfBillDiv").html(uc.payment.FillCountries("countryOfBill", uc.payment.Countries, "countryOfBill", "uc.payment.LoadStatesOfBillByCountry()"));
                        jQuery("#divcountries").html(uc.payment.FillCountries("country", uc.payment.Countries, "country", "uc.payment.LoadStatesOfByCountry()"));
                        jQuery("input[type=radio][name=countryOfBill][value=" + countryCode + "]").attr("checked", "checked");
                        jQuery("input[type=radio][name=country][value=" + countryCode + "]").attr("checked", "checked");
                        if (page.global.isMyAcxiomPartnerUSite) {
                            uc.payment.LoadStates(countryCode, false);
                        } else if (framework.common.IsRegisteredSite) {
                            uc.payment.LoadStates(countryCode, true);
                        } else {
                            uc.payment.LoadStates(countryCode, false);
                        }
                        uc.payment.LoadInternationalText();
                    }
                },
                error: function(rep) {
                }
            });
        }
    },

    FillCountries: function(elementId, countries, name, changeFunction) {
        var htmlInfo = "";
        var countryFormat = "<input type='radio' id='{0}{1}' name='{2}' value='{3}' onClick='javascript:{5};'  ></input><label id='{0}{1}label' for='{0}{1}'>{4}</label>";
        if (countries == null || countries.length < 1) {
            return htmlInfo;
        }
        jQuery.each(countries, function(i, country) {
            htmlInfo = htmlInfo + String.format(countryFormat, elementId, country.CountryCode, name, country.CountryCode, country.CountryName, changeFunction);
        });
        return htmlInfo;
    },

    LoadStatesOfContactByCountry: function() {
        var countryCode = jQuery("input[type=radio][name=countryOfContact]:checked").val();
        if (String.IsNullOrEmpty(countryCode)) {
            countryCode = "US";
        }
        if (jQuery("#payment_bill_same_as_contact:checked").length > 0) {
            var countryCodeOfBill = jQuery("input[type=radio][name=countryOfBill]:checked").val();
            if (countryCode != countryCodeOfBill) {
                jQuery("input[type=radio][name=countryOfBill][value=" + countryCode + "]").attr("checked", "checked");
                uc.payment.LoadStates(countryCode, false);
            }
        } else {
            uc.payment.LoadStatesByCountry(countryCode, "payment_contact_state");
            uc.payment.SetZipMask(countryCode, "payment_contact_zip");
        }
        uc.payment.FillInternationalTextOfContact(countryCode);
    },

    LoadStatesOfBillByCountry: function() {
        var countryCode = jQuery("input[type=radio][name=countryOfBill]:checked").val();
        if (String.IsNullOrEmpty(countryCode)) {
            countryCode = "US";
        }
        uc.payment.LoadStatesByCountry(countryCode, "payment_bill_state");
        uc.payment.SetZipMask(countryCode, "payment_bill_zip");
        uc.payment.ShowMessageOfCreditCard(countryCode);
        uc.payment.FillInternationalTextOfBill(countryCode);
    },

    LoadStatesOfByCountry: function() {
        var countryCode = jQuery("input[type=radio][name=country]:checked").val();
        if (String.IsNullOrEmpty(countryCode)) {
            countryCode = "US";
        }
        uc.payment.LoadStatesByCountry(countryCode, "credit_state");
        // uc.payment.SetZipMask(countryCode, "payment_bill_zip");
        // uc.payment.ShowMessageOfCreditCard(countryCode);
        //  uc.payment.FillInternationalTextOfBill(countryCode);
    },


    ShowMessageOfCreditCard: function(countryCode) {
        var item = jQuery("#messageOfCreditCard");
        if (!String.IsNullOrEmpty(countryCode) && countryCode != "US") {
            item.removeClass("hidden");
        } else {
            item.addClass("hidden");
        }
    },

    LoadInternationalText: function() {
        if (uc.payment.InternationalText.length > 0) {
            return;
        }
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetInternationalGeoDesc",
            data: {},
            success: function(result) {
                if (result.ResultFlag == true) {
                    uc.payment.InternationalText = result.DataSource;
                }
            },
            error: function(rep) {
            }
        });
    },

    FillInternationalTextOfContact: function(countryCode) {
        var texts = uc.payment.GetInternationalTextByCountry(countryCode);
        var stateText = null;
        var zipText = null;
        if (texts != null && texts.Values.length > 0) {
            for (var i = 0; i < texts.Values.length; i++) {
                if (texts.Values[i].TextName == "state") {
                    stateText = texts.Values[i];
                }
                if (texts.Values[i].TextName == "zipcode") {
                    zipText = texts.Values[i];
                }
            }
        }
        uc.payment.FillInternationalText(stateText, "contact_state", "State");
        uc.payment.FillInternationalText(zipText, "contact_zip", "Zip");
    },

    FillInternationalTextOfBill: function(countryCode) {
        var texts = uc.payment.GetInternationalTextByCountry(countryCode);
        var stateText = null;
        var zipText = null;
        if (texts != null && texts.Values.length > 0) {
            for (var i = 0; i < texts.Values.length; i++) {
                if (texts.Values[i].TextName == "state") {
                    stateText = texts.Values[i];
                }
                if (texts.Values[i].TextName == "zipcode") {
                    zipText = texts.Values[i];
                }
            }
        }
        uc.payment.FillInternationalText(stateText, "bill_state", "State");
        uc.payment.FillInternationalText(zipText, "bill_zip", "ZIP");
    },

    FillInternationalText: function(internationalText, elementId, defaultText) {
        var text = defaultText;
        if (internationalText != null) {
            text = internationalText.TextValue;
        }
        jQuery("#" + elementId).html(text);
    },

    GetInternationalTextByCountry: function(countryCode) {
        if (uc.payment.InternationalText.length > 0) {
            for (var i = 0; i < uc.payment.InternationalText.length; i++) {
                if (uc.payment.InternationalText[i].CountryCode == countryCode) {
                    return uc.payment.InternationalText[i];
                }
            }
        }
        return null;
    },

    GetInternationalValue: function(name, texts) {
        if (texts != null && texts.length > 0) {
            for (var i = 0; i < texts.length; i++) {
                if (texts[i].TextName == name) {
                    return texts[i];
                }
            }
        }
        return null;
    },

    SetZipMask: function(countryCode, targetElementId) {
        var zipMask = "99999";
        if (uc.payment.Countries.length > 0) {
            var country = null;
            for (var i = 0; i < uc.payment.Countries.length; i++) {
                country = uc.payment.Countries[i];
                if (country.CountryCode == countryCode) {
                    zipMask = country.ZipMask;
                    break;
                }
            }
        }
        jQuery("#" + targetElementId).setMask(zipMask);
    },

    LoadStatesByCountry: function(countryCode, targetElementId) {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetStatesByCountry",
            data: { countryCode: countryCode },
            async: false,
            success: function(result) {
                if (result.ResultFlag == true) {
                    framework.ui.fillDropDownList({
                        ElementId: targetElementId,
                        DataSource: result.DataSource,
                        ValueField: "StateCode",
                        TextField: "StateCode",
                        SelectValue: null
                    });



                }

            },
            error: function(rep) {
            },
            waitingElement: "ct_step_payment"
        });
    },

    LoadStates: function(countryCode, renderContact) {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetStatesByCountry",
            data: { countryCode: countryCode },
            success: function(result) {
                if (result.ResultFlag == true) {
                    //if myacxiompartner unregister site set default states is null
                    if (page.global.isMyAcxiomPartnerUSite) {
                        framework.ui.fillDropDownList({
                            ElementId: "payment_contact_state",
                            DataSource: result.DataSource,
                            ValueField: "StateCode",
                            TextField: "StateCode",
                            SelectValue: "",
                            EmptyValueSetting: { ValueField: '', TextField: '' }
                        });

                        framework.ui.fillDropDownList({
                            ElementId: "payment_bill_state",
                            DataSource: result.DataSource,
                            ValueField: "StateCode",
                            TextField: "StateCode",
                            SelectValue: "",
                            EmptyValueSetting: { ValueField: '', TextField: '' }
                        });
                    } else {
                        framework.ui.fillDropDownList({
                            ElementId: "payment_contact_state",
                            DataSource: result.DataSource,
                            ValueField: "StateCode",
                            TextField: "StateCode",
                            SelectValue: null
                        });

                        framework.ui.fillDropDownList({
                            ElementId: "payment_bill_state",
                            DataSource: result.DataSource,
                            ValueField: "StateCode",
                            TextField: "StateCode",
                            SelectValue: null
                        });
                    }

                    framework.ui.fillDropDownList({
                        ElementId: "credit_state",
                        DataSource: result.DataSource,
                        ValueField: "StateCode",
                        TextField: "StateCode",
                        SelectValue: null
                    });

                }
                if (renderContact) {
                    uc.payment.RenderOrderContact();
                }
            },
            error: function(rep) {
            },
            waitingElement: "ct_step_payment"
        });
        uc.payment.SetZipMask(countryCode, "payment_contact_zip");
        uc.payment.SetZipMask(countryCode, "payment_bill_zip");
        uc.payment.ShowMessageOfCreditCard(countryCode);
        uc.payment.FillInternationalTextOfContact(countryCode);
        uc.payment.FillInternationalTextOfBill(countryCode);
    },

    GetOrder: function() {
        uc.payment.RenderOrderDetails(page.placeorder.order);
        uc.payment.GetOrderContact();
        uc.payment.LoadCountries();
        uc.payment.ProcessContactInfor();
        uc.payment.RenderPaymentDetail();

    },

    ChangePaymentMethod: function(isCredit) {

        jQuery("#payment_contact_info").addClass("hidden");
        jQuery("#same_as_contact").addClass("hidden");
        jQuery("dl[grp='special_contact2']").removeClass("hidden");

        jQuery("#position_company").after(jQuery("dl[grp='special_contact2']"));
        jQuery("#position_email").after(jQuery("dl[grp='special_contact']"));

        jQuery("#payment_contact_ordername").removeClass("error");

        if (isCredit) {
            page.placeorder.order.PaymentMethod = entity.enums.PaymentMethod.CreditCard;
        }
        else {
            page.placeorder.order.PaymentMethod = uc.payment.CurrentPaymentMethod;
        }

        // check if user has complete contact address
        uc.payment.RenderOrderPayInfor();
    },


    FillPaymentMethod: function(paymentMethod) {
        uc.payment.CurrentPaymentMethod = paymentMethod;
    },

    RenderPaymentDetail: function() {
        if (page.placeorder.order.PaymentMethod == entity.enums.PaymentMethod.MonthlyBilling) {
            jQuery('#payment_bill_creditcard').addClass("hidden");
            jQuery("#orderNameRequired").removeClass("hidden");
        }
        else {
            jQuery('#payment_bill_creditcard').removeClass("hidden");
            jQuery("#orderNameRequired").addClass("hidden");
        }
    },

    RenderOrderDetails: function() {
        var order = page.placeorder.order;
        // attach the template
        $("#payment_orderdetails").setTemplateElement("orderdetails_template");

        // process the template
        $("#payment_orderdetails").processTemplate(order);

        if (page.global.IsVertaxEnabled && !page.global.HasExempt) {
            $("#results_tax_wording").removeClass("hidden");
        }

        uc.result.DisplayOrderMobileInfo(order.MobilePackages);
    },

    GetOrderContact: function() {
        var order = page.placeorder.order;
        var contact = order.OrderContactInformation;

        if (contact == null) {
            var user = null;
            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetUserInformation",
                async: false,
                success: function(result) {
                    if (result.ResultFlag == true) {
                        user = result.DataSource;
                        if (user != null) {
                            var contact = new entity.OrderContact();
                            contact.FirstName = user.FirstName;
                            contact.LastName = user.LastName;
                            contact.Company = user.Company;
                            contact.Email = user.Email;

                            contact.SANNumber = user.SANNumber;
                            contact.LicenseNumber = user.LicenseNumber;
                            contact.SANNumberLastUpdatedDateTime = user.SANNumberLastUpdatedDateTime;

                            if (!String.IsNullOrEmpty(user.HomePhone)) {
                                var phone = user.HomePhone;
                                phone = phone.replace("(", "").replace(")", "").replace(" ", "").replace("x", "").replace("-", "");
                                contact.Phone = String.format("({0}) {1}-{2}", phone.substr(0, 3), phone.substr(3, 3), phone.substr(6, 4));

                            }

                            if (uc.payment.IsContactAddressComplete) {
                                var address = user.UsersAddress[0];
                                contact.AddressLine = address.AddressLine;
                                contact.City = address.CityName;
                                contact.State = address.StateCode;
                                contact.Zipcode = address.ZipCode;
                                contact.CountryCode = address.CountryCode;

                                jQuery("#specail_contact_info").append(jQuery("dl[grp='special_contact']")).append(jQuery("dl[grp='special_contact2']"));

                                if (page.placeorder.order.PaymentMethod == entity.enums.PaymentMethod.MonthlyBilling) {
                                    jQuery("#payment_bill_creditcard").addClass("hidden");
                                }
                            }
                            else {
                                if (order.PaymentMethod == entity.enums.PaymentMethod.CreditCard) {
                                    jQuery("#same_as_contact").removeClass("hidden");
                                }
                                jQuery("#payment_contact_info").removeClass("hidden");
                            }

                            order.OrderContactInformation = contact;

                            uc.payment.RenderOrderContact();

                            //anna 20140509: comment out san number temporary
                            if (uc.payment.enableSanNumber) {
                                var dataSource = entity.lookup.DataSource.getByCode(order.ListType);

                                jQuery('#san_number_required').addClass("hidden");
                                jQuery('#san_exp_date_required').addClass("hidden");
                                jQuery('#license_name_required').addClass("hidden");
                                var currentDate = new Date();
                                var year = currentDate.getFullYear();
                                var month = currentDate.getMonth() + 1;
                                var day = currentDate.getDate();
                                var startDate = String.format("{0}/{1}/{2}", month, day + 1, year - 1);
                                $('#san_exp_date').datePicker({ san_exp_date: startDate });

                                if ((dataSource == entity.lookup.DataSource.Consumer || dataSource == entity.lookup.DataSource.NewHomeowner || dataSource == entity.lookup.DataSource.NewMover) &&
                                    (order.PhoneOption == 2 || order.PhoneOption == 3)) {

                                    if (contact.SANNumber == null || contact.SANNumber.length <= 0 || contact.LicenseNumber == null || contact.LicenseNumber.length <= 0 ||
                                        contact.SANNumberLastUpdatedDateTime == null || new Date() - contact.SANNumberLastUpdatedDateTime >= 365 * 24 * 60 * 60 * 1000) {
                                        jQuery('#san_number_required').removeClass("hidden");
                                        jQuery('#san_exp_date_required').removeClass("hidden");
                                        jQuery('#license_name_required').removeClass("hidden");
                                        uc.payment.SanNumberIsActive = true;
                                    }
                                }

                            }



                        }
                    }
                },
                error: function(rep) {

                },
                waitingElement: 'payment_contact_info'
            });

        }
        else {

            if (uc.payment.enableSanNumber) {
                jQuery('#san_number_required').addClass("hidden");
                jQuery('#san_exp_date_required').addClass("hidden");
                jQuery('#license_name_required').addClass("hidden");

                var dataSource = entity.lookup.DataSource.getByCode(order.ListType);
                if ((dataSource == entity.lookup.DataSource.Consumer || dataSource == entity.lookup.DataSource.NewHomeowner || dataSource == entity.lookup.DataSource.NewMover) &&
                                        (order.PhoneOption == 2 || order.PhoneOption == 3)) {

                    if (contact.SANNumber == null || contact.SANNumber.length <= 0 || contact.LicenseNumber == null || contact.LicenseNumber.length <= 0 ||
                                            contact.SANNumberLastUpdatedDateTime == null || new Date() - contact.SANNumberLastUpdatedDateTime >= 365 * 24 * 60 * 60 * 1000) {
                        jQuery('#san_number_required').removeClass("hidden");
                        jQuery('#san_exp_date_required').removeClass("hidden");
                        jQuery('#license_name_required').removeClass("hidden");
                        uc.payment.SanNumberIsActive = true;
                    }
                }
            }
            uc.payment.RenderOrderPayInfor();

        }
    },

    RenderOrderPayInfor: function() {
        // check if user has complete contact address
        if (uc.payment.IsContactAddressComplete) {
            jQuery("#specail_contact_info").append(jQuery("dl[grp='special_contact']")).append(jQuery("dl[grp='special_contact2']"));

            if (page.placeorder.order.PaymentMethod == entity.enums.PaymentMethod.MonthlyBilling) {
                jQuery("#payment_bill_creditcard").addClass("hidden");
            }
        }
        else {
            if (page.placeorder.order.PaymentMethod == entity.enums.PaymentMethod.CreditCard) {
                jQuery("#same_as_contact").removeClass("hidden");
                //jenny.xiao #5160
                jQuery("#payment_bill_info").removeClass("hidden");
            } else if (page.placeorder.order.PaymentMethod == entity.enums.PaymentMethod.MonthlyBilling) {
                jQuery("#payment_bill_info").addClass("hidden");
            }
            jQuery("#payment_contact_info").removeClass("hidden");
        }
    },

    RenderOrderContact: function() {
        var order = page.placeorder.order;
        var contact = order.OrderContactInformation;
        uc.payment.FillContact(contact);
    },

    FillContact: function(contact) {
        if (contact != null) {
            $("input[name='payment_contact_firstname']").val(contact.FirstName);
            $("input[name='payment_contact_lastname']").val(contact.LastName);
            $("input[name='payment_contact_company']").val(contact.Company);
            if (!String.IsNullOrEmpty(contact.Company)) {
                $("input[name='payment_contact_company']").attr("disabled", "disabled");
            } else {
                $("input[name='payment_contact_company']").removeAttr("disabled");
            }
            $("input[name='payment_contact_address']").val(contact.AddressLine);
            $("input[name='payment_contact_city']").val(contact.City);
            $("#payment_contact_state").val(contact.State);
            $("input[name='payment_contact_zip']").val(contact.Zipcode);
            $("input[name='payment_contact_phone']").val(contact.Phone);
            $("input[name='payment_contact_email']").val(contact.Email);
            $("input[name='payment_contact_ordername']").val(contact.OrderName);
        }
    },

    SubmitOrder: function() {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/SubmitOrder",
            data: { order: page.placeorder.order },
            success: function(result) {
                alert(result);

            },
            error: function(rep) {
            }
        });
    },

    CheckInputPrice: function(inputPrice) {
        if (String.IsNullOrEmpty(inputPrice) || Number(inputPrice) < page.placeorder.order.GoodsCost) {
            return false;
        }
        return true;
    },
    CheckUserPlcae4InfoOrder: function() {
        var userEmail = $("#payment_contact_email").val();
        var valid4InfoOrder = true;
        framework.common.Ajax({
            url: "PlaceOrder.aspx/CheckUserPlcae4InfoOrder",
            async: false,
            data: { email: userEmail },
            success: function(result) {
                if (result.ResultFlag == false) {
                    valid4InfoOrder = false;
                }

            },
            error: function(rep) {

            }

        });
        return valid4InfoOrder;
    },

    ProcessOrder: function() {

        //uc.result.SetErrorMessage(false, "");

        uc.result.Clear_Error();

        var o = page.placeorder.order;
        o.ListUsage = Number(jQuery("input[name='results_listusages']:checked").attr("data-mul"));
        OrderHelper.RecaculateTotalQty(o);
        OrderHelper.CaculatePrice(o, uc.result.UserPriceList, uc.result.GlobalPriceList, uc.result.Promotion, uc.result.MetaDataPriceList);
        //remove all 0 qty records then submit jack.xin 20120919
        if (o.TotalDesiredQty <= 0) {
            uc.result.Show_Error(" The quantity that you desired is can not be less than zero ");
            return;
        }

        if (page.placeorder.currentDataSource == entity.enums.DataSourceType.Mobile_Consumer_Advertising || page.placeorder.order.Chose4Info) {
            if (!uc.payment.CheckUserPlcae4InfoOrder()) {
                $.colorbox({ html: "<span style='color:red'>You can not place mobile order,please remove it to continue.</span>", width: 200, height: 150, opacity: 0.5, scrolling: false });
                return;
            }
        }

        if (o.TotalDesiredQty < page.placeorder.minQuantityOfOrder) {
            uc.result.Show_Error(String.format(" Minimum quantity of {0} is required for purchasing a mobile ad campaign. Please change your Target Area and Audience selections.", page.placeorder.minQuantityOfOrder));
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

        framework.common.LogClickEvent("Click Process Order button", null, "ProcessOrder.");

        var cardNumber = $("#payment_bill_cardnumber").val();
        var cardType = $("#payment_bill_cardtype").val();
        if (cardNumber.length > 0 && cardType == uc.payment.CreditCard.CCType &&
           (cardNumber == uc.payment.CreditCard.CCNumber || cardNumber == uc.payment.CreditCard.MaskNumber)) {
            uc.payment.CreditCard.NeedValidation = false;
        } else
            uc.payment.CreditCard.NeedValidation = true;

        //save data into order object
        uc.payment.Save_Data();
        
        //Erik Wang @20160628 #6531 - save the user geo key code
        if(page.placeorder.order.GeoType == entity.enums.GeoType.MultiCount){
            $("#adjustdt1").find("input[type='text'][rowtype='keycode']").each(function(){
                var index = $(this).attr("rowindex");
                page.placeorder.order.OrderGeos[index].GeoUserKeyCode = $(this).val();
            });
        }

        //Check Mobile Ad Campaign
        if (framework.common.IsRegisteredSite) {
            var isSuc = uc.result.PaymentCheckDigitalFileQty();
            if (!isSuc) {
                return;
            }
        }

        // DoValidation
        var isValid = false;
        if (o.PaymentMethod == entity.enums.PaymentMethod.MonthlyBilling) {
            isValid = uc.payment.DoValidation_OnlyContact();
        } else {
            isValid = uc.payment.DoValidation();
        }
        if (!isValid) {
            framework.ui.ShowDialog('payment_message_summary');
            return;
        }

        //check the browser session value. jack.xin 2012-09-10
        if (typeof (page.placeorder.CurrentSessionId) == null || typeof (page.placeorder.CurrentSessionId) == "undefined") {
            uc.payment.SetErrorMessage(true, "The browser didn't get session.");
            return;
        }
        if (page.placeorder.CurrentSessionId == "") {
            uc.payment.SetErrorMessage(true, "Browser session value is empty.");
            return;
        }

        //validate the email address
        var emailAddress = jQuery("#payment_contact_email").val();
        framework.common.Ajax({
            url: "PlaceOrder.aspx/ValidateEmailAddress",
            data: { emailAddress: emailAddress},
            success: function(result) {                
                if(result.DataSource && result.DataSource == true) {
                     //make ajax call to process order
                    if (isValid) {
                        uc.payment.Calculate_Tax();
                    }
                }
                else {
                    uc.payment.SetErrorMessage(true, "The email entered could not be validated. Please enter a valid email address.");
                    return;
                }
            },
            error: function(rep) {
                uc.payment.SetErrorMessage(true, "The email entered could not be validated. Please enter a valid email address.");
            },
            waitingElement: 'ct_main_panel'
        });
        
        
       
        return isValid;
    },

    ProcessOrder2: function() {
        var sanNumber = $("#san_number").val();
        var licenseName = $("#license_name").val();
        var sanExpDate = $("#san_exp_date").val();
        var pwd = "";
        var industry = "";
        if ((page.global.isMyAcxiomPartnerUSite || page.global.isDatabilitiesUSite) && $("#contact_signup").is(":checked")) {
            pwd = $("#signup_user_password").val();
            industry = $("#signup_user_industry").val();
        }

        framework.common.Ajax({
            url: "PlaceOrder.aspx/ProcessOrder",
            data: { order: page.placeorder.order,
                currentSessionId: page.placeorder.CurrentSessionId,
                sanNumber: sanNumber,
                licenseName: licenseName,
                sanExpDate: sanExpDate,
                password: pwd,
                industry: industry
            },
            success: function(result) {
                uc.payment.CancelTax_PlaceOrder();

                //add check  jack.xin 2012-07-18
                if (!result.ResultFlag) {
                    //show error message
                    uc.payment.SetErrorMessage(true, result.ResultMessage);
                    return;
                }
                if (!result.DataSource.IsSuccess) {
                    uc.payment.SetErrorMessage(true, result.DataSource.Message);
                    //                    if (framework.common.IsRegisteredSite) {
                    //                        uc.payment.SetErrorMessage(true, result.DataSource.Message);
                    //                    } else {
                    //                        uc.result.SetErrorMessage(true, result.DataSource.Message);
                    //                    }
                }
                else {
                    var o = page.placeorder.order;
                    var data = result.DataSource;
                    if (data != null) {
                        o.OrderId = data.OrderId;
                        o.OrderCode = data.OrderCode;
                        o.OrderDate = data.OrderSubmittedDate;
                        o.AccountName = data.AccountName;
                    }

                    o.NextStep = entity.enums.OrderStep.Success;
                    page.placeorder.GoNext();
                    //uc.payment.RenderOrderSuccess();
                }
            },
            error: function(rep) {
            },
            waitingElement: 'ct_main_panel'
        });
    },

    //
    DoValidation: function() {
        //validate
        var isValid = false;
        var rules = {};
        var messages = {};

        var contactRules = {
            payment_contact_firstname: { required: true },
            payment_contact_lastname: { required: true },
            payment_contact_address: { required: true },
            payment_contact_company: { required: true },
            payment_contact_city: { required: true },
            payment_contact_state: { required: true },
            payment_contact_zip: { required: true, minlength: 5 },
            payment_contact_phone: { required: true }
        };

        var paymentRules = {
            payment_bill_nameoncard: { required: true },
            payment_bill_address: { required: true },
            payment_bill_city: { required: true },
            payment_bill_state: { required: true },
            payment_bill_zip: { required: true, minlength: 5 },
            payment_bill_cardnumber: {
                creditcard2: function() {
                    var selection = $('#payment_bill_cardtype').val();
                    var cardType = null;
                    switch (selection) {
                        case "10": cardType = "Visa"; break;
                        case "20": cardType = "MasterCard"; break;
                        case "30": cardType = "AmEx"; break;
                        case "40": cardType = "Discover"; break;
                    }
                    return cardType;
                }
            },
            payment_bill_securitycode: { required: true },
            carddate_validate: {
                CommonIsValid: function(element) {
                    var month = $("#payment_bill_month").val();
                    var year = $("#payment_bill_year").val();

                    var date = new Date();
                    var currentyear = date.getFullYear();
                    var currentmonth = date.getMonth();
                    var result;
                    if (month != 0 && (currentyear < year || (currentyear == year && currentmonth <= month))) {
                        $(".carddate_validate").parent().removeClass('invalid_border');
                        return true;
                    }
                    else {
                        $(".carddate_validate").parent().addClass('invalid_border');
                        return false;
                    }
                }
            }

        };

        var commonRules = {
            payment_contact_email: { required: true, email: true },
            payment_contact_company: { required: true }
        };

        var sanNumberRules = {
            san_number: { required: true },
            license_name: { required: true },
            san_exp_date: {
                CommonIsValid: function(element) {
                    try {
                        var expDate = Date.fromString(jQuery('#san_exp_date').val());
                        if (expDate == null) return false;
                        return true;
                    }
                    catch (e) {
                        return false;
                    }
                }
            }
        };

        var agreementRule = {
            payment_payment_agreement: { required: true }
        };

        //add extralAgreementRule for myacxiom partner unregister site
        var extralAgreementRule = {
            payment_payment_agreement: { required: true },
            //            payment_payment_agreement_extral_1: { required: true },
            payment_payment_agreement_extral_2: { required: true },
            payment_payment_agreement_extral_3: { required: true }
        };

        //add signup user info for myacxiom partner unregister site
        var signUpRule = {
            signup_user_password: { required: true, passwordCheck: true },
            signup_user_repassword: { required: true, minlength: 10, maxlength: 20, equalTo: '#signup_user_password' },
            signup_user_industry: { required: true }
        };

        var countryCodeOfContact = jQuery("input[type=radio][name=countryOfContact]:checked").val();
        var stateDescOfContact = "state";
        var zipDescOfContact = "zip code";
        var internationalTexts = uc.payment.GetInternationalTextByCountry(countryCodeOfContact);
        if (internationalTexts != null) {
            var internationalText = uc.payment.GetInternationalValue("state", internationalTexts.Values);
            if (internationalText != null) {
                stateDescOfContact = internationalText.TextValue.toLowerCase();
            }

            internationalText = uc.payment.GetInternationalValue("zipcode", internationalTexts.Values);
            if (internationalText != null) {
                zipDescOfContact = internationalText.TextValue.toLowerCase();
            }
        }

        var countryCodeOfBill = jQuery("input[type=radio][name=countryOfBill]:checked").val();
        var stateDescOfBill = "state";
        var zipDescOfBill = "zip code";
        internationalTexts = uc.payment.GetInternationalTextByCountry(countryCodeOfBill);
        if (internationalTexts != null) {
            var internationalText = uc.payment.GetInternationalValue("state", internationalTexts.Values);
            if (internationalText != null) {
                stateDescOfBill = internationalText.TextValue.toLowerCase();
            }

            internationalText = uc.payment.GetInternationalValue("zipcode", internationalTexts.Values);
            if (internationalText != null) {
                zipDescOfBill = internationalText.TextValue.toLowerCase();
            }
        }

        var contactMessages = {
            payment_contact_firstname: { required: "Please enter your first name." },
            payment_contact_lastname: { required: "Please enter your last name." },
            payment_contact_company: { required: "Please enter your company name." },
            payment_contact_address: { required: "Please enter your address." },
            payment_contact_city: { required: "Please enter the city name." },
            payment_contact_state: { required: String.format("Please enter the {0}.", stateDescOfContact) },
            payment_contact_zip: { required: String.format("Please enter the {0}.", zipDescOfContact), minlength: String.format("Please enter a valid {0}.", zipDescOfContact) },
            payment_contact_phone: { required: "Please enter your phone number." }
        };

        var paymentMessages = {
            payment_bill_nameoncard: { required: "Please enter the name as it appears on your credit card." },
            payment_bill_address: { required: "Please enter your cardholder's address." },
            payment_bill_city: { required: "Please enter the cardholder's city." },
            payment_bill_state: { required: String.format("Please enter the cardholder's {0}.", stateDescOfBill) },
            payment_bill_zip: { required: String.format("Please enter the cardholder's {0}.", zipDescOfBill), minlength: String.format("Please enter a valid cardholder's {0}.", zipDescOfBill) },
            payment_bill_cardnumber: { creditcard2: "Invalid credit card number." },
            payment_bill_securitycode: { required: "Please enter the cardholder's security code." },
            carddate_validate: { CommonIsValid: "Expiration Date is invalid." }
        };

        var commonMessages = {
            payment_contact_email: { required: "Please enter your email address.", email: "The format of your email address is invalid. Please re-enter." },
            payment_contact_company: { required: "Please enter your company name." }
        };


        var sanNumberMessages = {
            san_number: { required: "A SAN Number (Subscription Account Number) is required for all consumer list orders that include telephone numbers." },
            san_exp_date: { CommonIsValid: "Please enter the expiration date of the SAN Number." },
            license_name: { required: "Please enter the name of the organization associated with this SAN Number." }
        };

        var agreementMessage = {
            payment_payment_agreement: { required: "You must agree to the terms and conditions of the Data Use Agreement before placing your order. Please check the box below and click 'Place Order' when you are ready to proceed." }
        };

        var extralAgreementMessage = {
            payment_payment_agreement: { required: "You must agree to all of the terms and conditions of the Data Use Agreement before placing your order. Please check all of the boxes below and click 'Place Order' when you are ready to proceed." },
            //            payment_payment_agreement_extral_1: { required: "You must agree to all of the terms and conditions of the Data Use Agreement before placing your order. Please check all of the boxes below and click 'Place Order' when you are ready to proceed." },
            payment_payment_agreement_extral_2: { required: "You must agree to all of the terms and conditions of the Data Use Agreement before placing your order. Please check all of the boxes below and click 'Place Order' when you are ready to proceed." },
            payment_payment_agreement_extral_3: { required: "You must agree to all of the terms and conditions of the Data Use Agreement before placing your order. Please check all of the boxes below and click 'Place Order' when you are ready to proceed." }
        };

        var signUpMessage = {
            signup_user_password: { required: "Please enter your password." },
            signup_user_repassword: { required: "Please enter Re-enter New Password.", minlength: "Please enter at least 10 characters.", maxlength: "Please enter at most 20 characters.", equalTo: "The passwords you've entered do not match. Please re-enter." },
            signup_user_industry: { required: "Please select your industry." }
        };

        if (framework.common.IsRegisteredSite) {
            jQuery.extend(rules, commonRules);
            jQuery.extend(messages, commonMessages);

            if (!uc.payment.IsContactAddressComplete) {
                jQuery.extend(rules, contactRules);
                jQuery.extend(messages, contactMessages);
            }

            if (uc.payment.enableSanNumber && uc.payment.SanNumberIsActive) {
                jQuery.extend(rules, sanNumberRules);
                jQuery.extend(messages, sanNumberMessages);
            }

            if (!uc.result.PassPay_For_DebitCard) {
                jQuery.extend(rules, paymentRules);
                jQuery.extend(messages, paymentMessages);
            }

            if (!uc.payment.CreditCard.NeedValidation) {
                rules.payment_bill_cardnumber = {};
                messages.payment_bill_cardnumber = {};
            }

        }
        else {
            jQuery.extend(rules, commonRules);
            jQuery.extend(messages, commonMessages);

            jQuery.extend(rules, contactRules);
            jQuery.extend(messages, contactMessages);

            if (!uc.result.PassPay_For_DebitCard) {
                jQuery.extend(rules, paymentRules);
                jQuery.extend(messages, paymentMessages);
            }

            if (uc.result.IsHaveOptionForSignInOrUp && jQuery("#contact_signup").is(":checked")) {
                jQuery.extend(rules, signUpRule);
                jQuery.extend(messages, signUpMessage);
            }
        }
        //        if (page.global.isMyAcxiomPartnerUSite) {
        //            jQuery.extend(rules, extralAgreementRule);
        //            jQuery.extend(messages, extralAgreementMessage);
        //        } else {
        jQuery.extend(rules, agreementRule);
        jQuery.extend(messages, agreementMessage);
        //        }


        if (page.global.isMyAcxiomPartnerUSite) {
            var validator = $("#aspnetForm").validate({
                //errorClass: "invalid_border",
                groups: { nameGroup: "payment_payment_agreement payment_payment_agreement_extral_2 payment_payment_agreement_extral_3" },
                rules: rules,
                messages: messages,
                errorContainer: jQuery('#payment_ValidateSummay'),
                errorLabelContainer: jQuery("ul", jQuery('#payment_ValidateSummay')),
                wrapper: 'li'
            });
        }
        else {
            var validator = $("#aspnetForm").validate({
                //errorClass: "invalid_border",
                rules: rules,
                messages: messages,
                errorContainer: jQuery('#payment_ValidateSummay'),
                errorLabelContainer: jQuery("ul", jQuery('#payment_ValidateSummay')),
                wrapper: 'li'
            });
        }

        validator.resetForm();
        if (!validator.form()) {
            jQuery('#payment_ValidateSummay').removeClass("hidden");
            isValid = false;
        } else {
            jQuery('#payment_ValidateSummay').addClass("hidden");
            isValid = true;
        };

        return isValid;
    },

    DoValidationForSaveCreditCard: function() {
        //validate
        var isValid = false;

        var rules = {
            payment_contact_firstname: { required: true },
            payment_contact_lastname: { required: true },
            payment_bill_nameoncard: { required: true },
            payment_bill_address: { required: true },
            payment_bill_city: { required: true },
            payment_bill_state: { required: true },
            payment_bill_zip: { required: true, minlength: 5 },
            /*payment_bill_cardnumber: {
            creditcard2: function() {
            var selection = $('#payment_bill_cardtype').val();
            var cardType = null;
            switch (selection) {
            case "10": cardType = "Visa"; break;
            case "20": cardType = "MasterCard"; break;
            case "30": cardType = "AmEx"; break;
            case "40": cardType = "Discover"; break;
            }

                    return cardType;
            }
            },*/
            payment_bill_securitycode: { required: true },
            carddate_validate: {
                CommonIsValid: function(element) {
                    var month = $("#payment_bill_month").val();
                    var year = $("#payment_bill_year").val();

                    var date = new Date();
                    var currentyear = date.getFullYear();
                    var currentmonth = date.getMonth();
                    var result;
                    if (month != 0 && (currentyear < year || (currentyear == year && currentmonth <= month))) {
                        $(".carddate_validate").parent().removeClass('invalid_border');
                        return true;
                    }
                    else {
                        $(".carddate_validate").parent().addClass('invalid_border');
                        return false;
                    }
                }
            }

        };

        var countryCodeOfBill = jQuery("input[type=radio][name=countryOfBill]:checked").val();
        var stateDescOfBill = "state";
        var zipDescOfBill = "zip code";
        internationalTexts = uc.payment.GetInternationalTextByCountry(countryCodeOfBill);
        if (internationalTexts != null) {
            var internationalText = uc.payment.GetInternationalValue("state", internationalTexts.Values);
            if (internationalText != null) {
                stateDescOfBill = internationalText.TextValue.toLowerCase();
            }

            internationalText = uc.payment.GetInternationalValue("zipcode", internationalTexts.Values);
            if (internationalText != null) {
                zipDescOfBill = internationalText.TextValue.toLowerCase();
            }
        }
        var messages = {
            payment_contact_firstname: { required: "Please enter your first name." },
            payment_contact_lastname: { required: "Please enter your last name." },
            payment_bill_nameoncard: { required: "Please enter the name as it appears on your credit card." },
            payment_bill_address: { required: "Please enter your cardholder's address." },
            payment_bill_city: { required: "Please enter the cardholder's city." },
            payment_bill_state: { required: String.format("Please enter the cardholder's {0}.", stateDescOfBill) },
            payment_bill_zip: { required: String.format("Please enter the cardholder's {0}.", zipDescOfBill), minlength: String.format("Please enter a valid cardholder's {0}.", zipDescOfBill) },
            //payment_bill_cardnumber: { creditcard2: "Invalid credit card number." },
            payment_bill_securitycode: { required: "Please enter the cardholder's security code." },
            carddate_validate: { CommonIsValid: "Expiration Date is invalid." }
        };

        if (!uc.payment.CreditCard.NeedValidation) {
            rules.payment_bill_cardnumber = {};
            messages.payment_bill_cardnumber = {};
        }

        var validator = $("#aspnetForm").validate({
            //errorClass: "invalid_border",
            rules: rules,
            messages: messages,
            errorContainer: jQuery('#payment_ValidateSummay'),
            errorLabelContainer: jQuery("ul", jQuery('#payment_ValidateSummay')),
            wrapper: 'li'
        });

        validator.resetForm();
        if (!validator.form()) {
            jQuery('#payment_ValidateSummay').removeClass("hidden");
            isValid = false;
        } else {
            jQuery('#payment_ValidateSummay').addClass("hidden");
            isValid = true;
        };

        return isValid;
    },

    DoValidationForCard: function() {
        //validate
        var isValid = false;

        var rules = {
            payment_contact_firstname: { required: true },
            payment_contact_lastname: { required: true },
            txtCardName: { required: true },
            txtAddress: { required: true },
            txtCity: { required: true },
            credit_state: { required: true },
            txtZip: { required: true, minlength: 5 },
            txtCardNumber: {
                creditcard2: function() {
                    var selection = $('#slCardType').val();
                    var cardType = null;
                    switch (selection) {
                        case "10": cardType = "Visa"; break;
                        case "20": cardType = "MasterCard"; break;
                        case "30": cardType = "AmEx"; break;
                        case "40": cardType = "Discover"; break;
                    }

                    return cardType;
                }
            },
            txtSecurityCode: { required: true },
            card_date_validate: {
                CommonIsValid: function(element) {
                    var month = $("#slMonth").val();
                    var year = $("#slYear").val();

                    var date = new Date();
                    var currentyear = date.getFullYear();
                    var currentmonth = date.getMonth();
                    var result;
                    if (month != 0 && (currentyear < year || (currentyear == year && currentmonth <= month))) {
                        $(".carddate_validate").parent().removeClass('invalid_border');
                        return true;
                    }
                    else {
                        $(".carddate_validate").parent().addClass('invalid_border');
                        return false;
                    }
                }
            }

        };

        var countryCodeOfBill = jQuery("input[type=radio][name=country]:checked").val();
        var stateDescOfBill = "state";
        var zipDescOfBill = "zip code";
        internationalTexts = uc.payment.GetInternationalTextByCountry(countryCodeOfBill);
        if (internationalTexts != null) {
            var internationalText = uc.payment.GetInternationalValue("state", internationalTexts.Values);
            if (internationalText != null) {
                stateDescOfBill = internationalText.TextValue.toLowerCase();
            }

            internationalText = uc.payment.GetInternationalValue("zipcode", internationalTexts.Values);
            if (internationalText != null) {
                zipDescOfBill = internationalText.TextValue.toLowerCase();
            }
        }
        var messages = {
            payment_contact_firstname: { required: "Please enter your first name." },
            payment_contact_lastname: { required: "Please enter your last name." },
            txtCardName: { required: "Please enter the name as it appears on your credit card." },
            txtAddress: { required: "Please enter your cardholder's address." },
            txtCity: { required: "Please enter the cardholder's city." },
            credit_state: { required: String.format("Please enter the cardholder's {0}.", stateDescOfBill) },
            txtZip: { required: String.format("Please enter the cardholder's {0}.", zipDescOfBill), minlength: String.format("Please enter a valid cardholder's {0}.", zipDescOfBill) },
            txtCardNumber: { creditcard2: "Invalid credit card number." },
            txtSecurityCode: { required: "Please enter the cardholder's security code." },
            card_date_validate: { CommonIsValid: "Expiration Date is invalid." }
            //payment_input_cost: { required: "Please enter your cost.", CommonIsValid: "Cost is invalid" }
        };
        var validator = $("form[name='PopupForm']").validate({
            //errorClass: "invalid_border",
            rules: rules,
            messages: messages,
            errorContainer: jQuery('#card_ValidateSummay'),
            errorLabelContainer: jQuery("ul", jQuery('#card_ValidateSummay')),
            wrapper: 'li'
        });

        validator.resetForm();
        if (!validator.form()) {
            jQuery('#card_ValidateSummay').removeClass("hidden");
            isValid = false;
        } else {
            jQuery('#card_ValidateSummay').addClass("hidden");
            isValid = true;
        };

        return isValid;
    },



    DoValidation_OnlyContact: function() {
        //validate
        var isValid = false;
        var rules = {};
        var messages = {};

        var contactRules = {
            payment_contact_firstname: { required: true },
            payment_contact_lastname: { required: true },
            payment_contact_address: { required: true },
            payment_contact_city: { required: true },
            payment_contact_state: { required: true },
            payment_contact_zip: { required: true, minlength: 5 },
            payment_contact_phone: { required: true }
        };

        var mustRules = {
            payment_contact_email: { required: true, email: true },
            payment_contact_ordername: { required: true },
            payment_contact_company: { required: true },
            payment_payment_agreement: { required: true }
        };

        var countryCodeOfContact = jQuery("input[type=radio][name=countryOfContact]:checked").val();
        var stateDescOfContact = "state";
        var zipDescOfContact = "zip code";
        var internationalTexts = uc.payment.GetInternationalTextByCountry(countryCodeOfContact);
        if (internationalTexts != null) {
            var internationalText = uc.payment.GetInternationalValue("state", internationalTexts.Values);
            if (internationalText != null) {
                stateDescOfContact = internationalText.TextValue.toLowerCase();
            }

            internationalText = uc.payment.GetInternationalValue("zipcode", internationalTexts.Values);
            if (internationalText != null) {
                zipDescOfContact = internationalText.TextValue.toLowerCase();
            }
        }

        var countryCodeOfBill = jQuery("input[type=radio][name=countryOfBill]:checked").val();
        var stateDescOfBill = "state";
        var zipDescOfBill = "zip code";
        internationalTexts = uc.payment.GetInternationalTextByCountry(countryCodeOfBill);
        if (internationalTexts != null) {
            var internationalText = uc.payment.GetInternationalValue("state", internationalTexts.Values);
            if (internationalText != null) {
                stateDescOfBill = internationalText.TextValue.toLowerCase();
            }

            internationalText = uc.payment.GetInternationalValue("zipcode", internationalTexts.Values);
            if (internationalText != null) {
                zipDescOfBill = internationalText.TextValue.toLowerCase();
            }
        }


        var contactMessages = {
            payment_contact_firstname: { required: "Please enter your first name." },
            payment_contact_lastname: { required: "Please enter your last name." },
            payment_contact_address: { required: "Please enter your address." },
            payment_contact_city: { required: "Please enter the city name." },
            payment_contact_state: { required: String.format("Please enter the {0}.", stateDescOfContact) },
            payment_contact_zip: { required: String.format("Please enter the {0}.", zipDescOfContact), minlength: String.format("Please enter a valid {0}.", zipDescOfContact) },
            payment_contact_phone: { required: "Please enter your phone number." }
        };

        var mustMessages = {
            payment_contact_email: { required: "Please enter your email address.", email: "The format of your email address is invalid. Please re-enter." },
            payment_contact_ordername: { required: "Please enter your order name." },
            payment_contact_company: { required: "Please enter your company name." },
            payment_payment_agreement: { required: "You must agree to the terms and conditions of the Data Use Agreement before placing your order. Please check the box below and click 'Place Order' when you are ready to proceed." }
        };

        var sanNumberRules = {
            san_number: { required: true },
            license_name: { required: true },
            san_exp_date: {
                CommonIsValid: function(element) {
                    try {
                        var expDate = Date.fromString(jQuery('#san_exp_date').val());
                        return true;
                    }
                    catch (e) {
                        return false;
                    }
                }
            }
        };

        var sanNumberMessages = {
            san_number: { required: "A SAN Number (Subscription Account Number) is required for all consumer list orders that include telephone numbers." },
            san_exp_date: { CommonIsValid: "Please enter the expiration date of the SAN Number." },
            license_name: { required: "Please enter the name of the organization associated with this SAN Number." }
        };

        jQuery.extend(rules, mustRules);
        jQuery.extend(messages, mustMessages);

        if (!uc.payment.IsContactAddressComplete) {
            jQuery.extend(rules, contactRules);
            jQuery.extend(messages, contactMessages);
        }

        if (uc.payment.enableSanNumber && uc.payment.SanNumberIsActive) {
            jQuery.extend(rules, sanNumberRules);
            jQuery.extend(messages, sanNumberMessages);
        }

        var validator = $("#aspnetForm").validate({
            //errorClass: "invalid_border",
            rules: rules,
            messages: messages,
            errorContainer: jQuery('#payment_ValidateSummay'),
            errorLabelContainer: jQuery("ul", jQuery('#payment_ValidateSummay')),
            wrapper: 'li'
        });

        validator.resetForm();
        if (!validator.form()) {
            jQuery('#payment_ValidateSummay').removeClass("hidden");
            isValid = false;
        } else {
            jQuery('#payment_ValidateSummay').addClass("hidden");
            isValid = true;
        };

        return isValid;
    },

    //    Load_Google_Analytics_Js: function() {
    //        $.getScript("//www.googleadservices.com/pagead/conversion.js");

    //        $("#uxPayment_Google_Analytics_Js")[0].innerHTML =
    //			"<script type=\"text/javascript\">" +
    //            "try {" +
    //                "var pageTracker = _gat._getTracker(\"UA-3481158-4\");" +
    //                "pageTracker._trackPageview(\"/0480296263/goal\");" +
    //            "} catch (err) { }" +
    //			"<\/script>" +
    //			"<noscript>" +
    //                "<img height=1 width=1 border=0 src='http://www.googleadservices.com/pagead/conversion/1072646300/?value=2&label=Zl1MCNHaRhCckb3_Aw&script=0' ></img>"
    //        "</noscript>;";
    //    },

    RenderOrderSuccess: function() {
        jQuery("td[attr='order_another_button']").removeClass("hidden");
        jQuery("td[attr='back_button']").addClass("hidden");

        var order = page.placeorder.order;
        var contact = order.OrderContactInformation;
        if (contact == null) return;

        $("div[name='payment_information']").addClass("hidden");

        // attach the template
        $("#payment_ordersuccess").setTemplateElement("ordersuccess_blue_template");

        // process the template
        $("#payment_ordersuccess").processTemplate(order);

        var step = entity.enums.OrderStep.Success;
        page.placeorder.SetVideo(step);
        page.placeorder.SetScreen(step, page.placeorder.order.ListType);
    },

    ProcessContactInfor: function() {
        $("#payment_contact_phone").setMask("(999) 999-9999");
        $("#payment_contact_phoneext").setMask("99999");
        //$("#payment_contact_zip").setMask("99999");
        //$("#payment_bill_zip").setMask("99999");


        //Clean up first
        $("#payment_contact_info #payment_contact_firstname").unbind("keyup");
        $("#payment_contact_info #payment_contact_lastname").unbind("keyup");
        $("#payment_contact_info #payment_contact_address").unbind("keyup");
        $("#payment_contact_info #payment_contact_city").unbind("keyup");
        $("#payment_contact_info #payment_contact_state").unbind("click");
        $("#payment_contact_info #payment_contact_zip").unbind("keyup");

        $("#aMyCardList").click(function() {
            framework.ui.ShowDialog('ct_results_save_creditCard', { appendForm: true, hermesTheme: true, fixedOnScroll: false, css: { cursor: "default", top: '15%', left: '20%', border: '0px solid #aaa'} });
            framework.common.Ajax({
                url: "PlaceOrder.aspx/GetCardList",
                async: false,
                success: function(result) {
                    if (result.ResultFlag == true) {
                        $("#CardsSummary").setTemplateElement("Users_Cards_summary_template");
                        // process the template
                        $("#CardsSummary").processTemplate(result.DataSource);
                    } else {

                    }
                },
                error: function(rep) {

                },
                waitingElement: 'payment_contact_info'
            });



        });

        $("#payment_agreement").click(function() {
            $("#payment_agreement").colorbox({ href: "Dialogs/OrderLicenseTerms.aspx", iframe: true, opacity: 0.5, width: 680, height: 600, scrolling: false });
        });


        $("#saveCreditCard").click(function() {
            var isValid = uc.payment.DoValidationForSaveCreditCard();
            if (!isValid) {
                framework.ui.ShowDialog('payment_message_summary');
                return;

            }

            var cardNumber = jQuery("#payment_bill_cardnumber").val().replace(/ /g, "");
            if (!uc.payment.CreditCard.NeedValidation) {
                cardNumber = uc.payment.CreditCard.CCNumber;
            }

            framework.common.Ajax({
                url: "PlaceOrder.aspx/SaveCreditCardInfo",
                data: { cardType: jQuery("#payment_bill_cardtype").val(), cardName: jQuery("#payment_bill_nameoncard").val(),
                    cardNumber: cardNumber, securityCode: jQuery("#payment_bill_securitycode").val(),
                    expirationYear: jQuery("#payment_bill_year").val(), expirationMonth: jQuery("#payment_bill_month").val(),
                    countryCode: jQuery("input[type=radio][name=countryOfBill]:checked").val(), stateCode: jQuery("#payment_bill_state").val(),
                    zipCode: jQuery("#payment_bill_zip").val(), cityName: jQuery("#payment_bill_city").val(), address: jQuery("#payment_bill_address").val()
                },
                async: false,
                success: function(result) {
                    if (result.ResultFlag == true) {
                        alert("successfully saved.");
                    } else {
                        alert(result.ResultMessage);
                    }
                },
                error: function(rep) {

                },
                waitingElement: 'payment_contact_info'
            });


        });

        $("#payment_bill_same_as_contact").click(function() {

            if ($(this).is(":checked") == true) {
                $("#payment_bill_nameoncard").val($("#payment_contact_info #payment_contact_firstname").val() + " " + $("#payment_contact_info #payment_contact_lastname").val());
                $("#payment_bill_address").val($("#payment_contact_info #payment_contact_address").val());
                $("#payment_bill_city").val($("#payment_contact_info #payment_contact_city").val());
                $("#payment_bill_state").val($("#payment_contact_info #payment_contact_state").val());
                $("#payment_bill_zip").val($("#payment_contact_info #payment_contact_zip").val());

                $("#payment_contact_info #payment_contact_firstname").keyup(function() {
                    $("#payment_bill_nameoncard").val($(this).val() + " " + $("#payment_contact_info #payment_contact_lastname").val());
                });
                $("#payment_contact_info #payment_contact_lastname").keyup(function() {
                    $("#payment_bill_nameoncard").val($("#payment_contact_info #payment_contact_firstname").val() + " " + $(this).val());
                });
                var countryCode = jQuery("input[type=radio][name=countryOfContact]:checked").val();
                var countryCodeOfBill = jQuery("input[type=radio][name=countryOfBill]:checked").val();
                if (countryCode != countryCodeOfBill) {
                    jQuery("input[type=radio][name=countryOfBill][value=" + countryCode + "]").attr("checked", "checked");
                    //uc.payment.FillInternationalTextOfBill(countryCode);

                    uc.payment.LoadStatesOfBillByCountry();
                    $("#payment_bill_state").val($("#payment_contact_state").val());
                    //uc.payment.LoadStatesOfBillByCountry();
                }

                $("#payment_contact_info #payment_contact_address").keyup(function() {
                    $("#payment_bill_address").val($(this).val());
                });
                $("#payment_contact_info #payment_contact_city").keyup(function() {
                    $("#payment_bill_city").val($(this).val());
                });
                $("#payment_contact_info #payment_contact_state").click(function() {
                    $("#payment_bill_state").val($(this).val());
                });
                $("#payment_contact_info #payment_contact_zip").keyup(function() {
                    $("#payment_bill_zip").val($(this).val());
                });

            } else if ($(this).is(":checked") == false) {

                //clear the text of same as contact area 20150407
                $("#payment_bill_nameoncard").val("");
                $("#payment_bill_address").val("");
                $("#payment_bill_city").val("");
                $("#payment_bill_state").val("");
                $("#payment_bill_zip").val("");

                $("#payment_contact_info #payment_contact_firstname").unbind("keyup");
                $("#payment_contact_info #payment_contact_lastname").unbind("keyup");
                $("#payment_contact_info #payment_contact_address").unbind("keyup");
                $("#payment_contact_info #payment_contact_city").unbind("keyup");
                $("#payment_contact_info #payment_contact_state").unbind("click");
                $("#payment_contact_info #payment_contact_zip").unbind("keyup");
            }
        });



    },

    SetErrorMessage: function(bShow, msg) {
        if (bShow) {
            jQuery('#payment_message_error').removeClass("hidden").html(msg);
        } else {
            jQuery('#payment_message_error').addClass("hidden")
        }
    },

    Click_Next: function() {
        uc.payment.ProcessOrder();
    },

    Click_Back: function() {
        page.placeorder.GoBack();
    },

    Save_Data: function() {
        var o = page.placeorder.order;
        // o.PaymentMethod = entity.enums.PaymentMethod.CreditCard;
        //        if (jQuery("#payment_input_cost").val() != undefined) {
        //            o.TotalEstmCost = jQuery("#payment_input_cost").val();
        //        }
        //contact
        var contact = new entity.OrderContact();
        contact.FirstName = jQuery("#payment_contact_firstname").val();
        contact.LastName = jQuery("#payment_contact_lastname").val();
        contact.Company = jQuery("#payment_contact_company").val();
        contact.Phone = jQuery("#payment_contact_phone").val();
        contact.Email = jQuery("#payment_contact_email").val();
        contact.AddressLine = jQuery('#payment_contact_address').val();
        contact.City = jQuery("#payment_contact_city").val();
        contact.State = jQuery("#payment_contact_state").val();
        contact.Zipcode = jQuery("#payment_contact_zip").val();
        contact.OrderName = jQuery("#payment_contact_ordername").val();
        contact.CountryCode = jQuery("input[type=radio][name=countryOfContact]:checked").val();
        contact.IsSendEmailToAudience = jQuery("#payment_send_email_to_audience").attr("checked") == "checked" ? true : false;
        contact.IsSendMobileFacebookToAudience = jQuery("#send_mobile_facebook_email_to_audience").attr("checked") == "checked" ? true : false;
        o.OrderContactInformation = contact;

        o.IsContactAddressComplete = uc.payment.IsContactAddressComplete;

        if (!framework.common.IsSubmitOrder) {
            if (o.PaymentMethod != entity.enums.PaymentMethod.MonthlyBilling) {
                //payment
                var payment = new entity.OrderPayment();
                payment.CardType = jQuery("#payment_bill_cardtype").val();
                payment.HolderName = jQuery("#payment_bill_nameoncard").val();
                payment.Number = jQuery("#payment_bill_cardnumber").val().replace(/ /g, "");

                if (!uc.payment.CreditCard.NeedValidation) {
                    payment.Number = uc.payment.CreditCard.CCNumber;
                }

                payment.ExpiredYear = jQuery("#payment_bill_year").val();
                payment.ExpiredMonth = jQuery("#payment_bill_month").val();
                payment.SecurityCode = jQuery("#payment_bill_securitycode").val();

                payment.Email = jQuery("#payment_contact_email").val();
                payment.Phone = jQuery("#payment_contact_phone").val();
                payment.AddressLine = jQuery("#payment_bill_address").val();
                payment.City = jQuery("#payment_bill_city").val();
                payment.State = jQuery("#payment_bill_state").val();
                payment.Zipcode = jQuery("#payment_bill_zip").val();
                payment.CountryCode = jQuery("input[type=radio][name=countryOfBill]:checked").val();
                o.OrderPaymentInformation = payment;
            } else {
                o.OrderPaymentInformation = payment = null;
            }
        }

        uc.payment.GetSpecificalCookie(o);

        o.IsNeedNotifyMe = $("#result_is_need_notify_me").attr("checked") == "checked";

    },

    GetSpecificalCookie: function(o) {
        var cookieStr = document.cookie;
        var cookieArr = cookieStr.split(";");
        var orderSource = "";
        for (var i = 0; i < cookieArr.length; i++) {
            var cookieValue = cookieArr[i].split("=");
            if (cookieValue[0].trim() == page.placeorder.OrderSourceParameter) {
                orderSource = cookieValue[1];
            }
        }
        if (orderSource != "") {
            o.OrderSource = orderSource;
        }
    },

    Calculate_Tax: function() {
        uc.result.Clear_Error();

        if (!page.global.IsVertaxEnabled ||
            page.placeorder.order.ListType == entity.enums.DataSourceType.Mobile_Consumer_Advertising) {

            uc.payment.GetToken_BeanStream();
            return;
        }

        var messageHtml = "<img alt='Waiting..' style='vertical-align:middle;' src='" + framework.common.SiteRootPath + "/themes/default/assets/images/spinner2.gif' />";
        messageHtml += "<span style='margin-left:5px;'>System is calculating sales tax...</span>";

        var defaultOpts = {
            message: messageHtml,
            css: { cursor: "default", border: '0px solid #aaa', opacity: 1, backgroundColor: 'transparent' },
            overlayCSS: { opacity: 0.5, backgroundColor: '#ccc' },
            showOverlay: true,
            centerY: true,
            centerX: true,
            fadeIn: 0
        };

        var mainSelector = "#ct_main_panel";

        jQuery(mainSelector).block(defaultOpts);

        var o = page.placeorder.order;
        var request = new entity.TaxRequest();
        request.OrderAmount = o.TotalPretaxCost;
        request.DesiredQty = o.TotalDesiredQty;
        request.Country = "USA";
        request.AddressLine = o.OrderContactInformation.AddressLine;
        request.City = o.OrderContactInformation.City;
        request.State = o.OrderContactInformation.State;
        request.Zip = o.OrderContactInformation.Zipcode;

        framework.common.Ajax({
            url: "PlaceOrder.aspx/CalculateTax",
            data: { req: request },
            success: function(result) {
                if (result.ResultFlag) {
                    uc.payment.TaxResult = result.DataSource;
                    jQuery("#ct_result_taxconfirm_subtotal").html(framework.common.formatMoney(result.DataSource.SubTotal));
                    jQuery("#ct_result_taxconfirm_tax").html(framework.common.formatMoney(result.DataSource.TotalTax));
                    jQuery("#ct_result_taxconfirm_total").html(framework.common.formatMoney(result.DataSource.Total));

                    var setting = {
                        message: $('#ct_result_confirm_tax'),
                        css: { cursor: "pointer", border: 'none', backgroundColor: 'white' }
                    };

                    jQuery(mainSelector).block(jQuery.extend({}, defaultOpts, setting));
                }
                else {
                    uc.payment.SetErrorMessage(true, "Fail to calculate sales tax, please try again later.");
                    jQuery(mainSelector).unblock();
                }
            },
            error: function(rep) {
                uc.payment.SetErrorMessage(true, "Fail to calculate sales tax, please try again later.");
                jQuery(mainSelector).unblock();
            }
        });

    },

    ConfirmTax_PlaceOrder: function() {
        $el = $(this);
        var v = $el.attr("disabled");
        if (v == undefined) {
            $el.attr("disabled", "disabled");
            var mainSelector = "#ct_main_panel";
            jQuery(mainSelector).unblock();

            page.placeorder.order.TaxCharge = uc.payment.TaxResult.TotalTax;
            page.placeorder.order.TotalPretaxCost = uc.payment.TaxResult.SubTotal;
            page.placeorder.order.TotalEstmCost = uc.payment.TaxResult.Total;

            uc.payment.GetToken_BeanStream();
            //$el.removeAttr("disabled");
            $el.removeProp("disabled");
        }
    },

    CancelTax_PlaceOrder: function() {
        jQuery("#ct_main_panel").unblock();
    },


    WirterLogs: function(sMessage) {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/PaymentError",
            async: false,
            data: { paymentMessage: sMessage },
            success: function() {
                //
            },
            error: function(rep) {
                //
            }
        });
    },



    FetchBeanstreamToken: function(successsCallback) {
        uc.payment.SetErrorMessage(false, "");
        getLegato(function(legato) {
            page.placeorder.order.OrderPaymentInformation.Token = "";
            if (legato.success) {
                page.placeorder.order.OrderPaymentInformation.Token = legato.token;
            }
            else {
                page.placeorder.order.OrderPaymentInformation.LegatoMessage = legato.message;
            }

            if (!String.IsNullOrEmpty(page.placeorder.order.OrderPaymentInformation.Token)) {
                successsCallback()
            }
            else {
                if (uc.payment.Retries < uc.payment.MaxRetries) {
                    uc.payment.Retries++;
                    uc.payment.WirterLogs("Try to get token with retries " + uc.payment.Retries);
                    uc.payment.FetchBeanstreamToken(successsCallback);
                }
                else {
                    uc.payment.WirterLogs("after max retries " + uc.payment.MaxRetries + ", failed to get token");
                    uc.payment.SetErrorMessage(true, "Unfortunately, the system is unable to process your request. Our technical support specialists have been notified. Thank you for your patience while we work to resolve the error.");
                    return;
                }
            }
        });
    },


    GetToken_BeanStream: function() {

        // If CC processor is BeanStream, we need to get token before submitting to back end
        if (page.placeorder.order.PaymentMethod != entity.enums.PaymentMethod.MonthlyBilling && page.global.CreditCardProcessorType == 3 && getLegato) {
            $("#trnCardNumber").val(page.placeorder.order.OrderPaymentInformation.Number);
            $("#trnExpYear").val(page.placeorder.order.OrderPaymentInformation.ExpiredYear.slice(2));
            $("#trnExpMonth").val(page.placeorder.order.OrderPaymentInformation.ExpiredMonth);
            $("#trnCardCvd").val(page.placeorder.order.OrderPaymentInformation.SecurityCode);

            //#5818 get token error, we will try 3 times by lisa
            uc.payment.Retries = 0;
            uc.payment.FetchBeanstreamToken(uc.payment.ProcessOrder2);
        }
        else {
            uc.payment.ProcessOrder2();
        }
    }
};
