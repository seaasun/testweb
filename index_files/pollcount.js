ni.RegisterNameSpace("uc");
uc.pollcount = {
    progress: 0,

    // Initial Step Setting
    InitStepSetting: function(order) {
        var step = page.placeorder.orderflow || new entity.OrderFlow();
        step.CurrentStep = entity.enums.OrderStep.PollCount;
        step.StepTitle = "";
        step.StepDescription = "";
        step.StepButtonsStatus = 0; // entity.enums.StepButtons.Back;
        step.StepButtonsEvent = [
			{ ButtonKey: entity.enums.StepButtons.Back, ButtonEvent: uc.pollcount.Click_Back }
		];
        return step;
    },

    Init: function() {
        page.placeorder.order.CurrentStep = entity.enums.OrderStep.PollCount;

        // ToDo: moving follow codes, use orderflow object and fire the init step listener
        var step = uc.pollcount.InitStepSetting();
        framework.listener.FireListener(framework.listener.LISTENER_INIT_STEP, step);

        uc.pollcount.progress = 0;

        uc.pollcount.SetErrorMessage(false);
        uc.pollcount.SubmitOrder();
    },
    intervalId: null,
    SubmitOrder: function() {
        uc.pollcount.SetErrorMessage(false);
        framework.common.Ajax({
            url: "PlaceOrder.aspx/PollCount",
            data: { orderId: 13402 },
            success: function(result) {
                if (page.placeorder.order.CurrentStep != entity.enums.OrderStep.PollCount) return;
                if (result.ResultFlag == true) {
                    page.placeorder.order = result.DataSource.Order;
                    page.placeorder.order.CurrentStep = entity.enums.OrderStep.PollCount;

                    //Start to check count status
                    setTimeout(function() { uc.pollcount.CheckPollingStatus(result.DataSource.RequestId); }, 1000);
                }

            },
            error: function(rep) {
                if (page.placeorder.order.CurrentStep != entity.enums.OrderStep.PollCount) return;
                //uc.pollcount.SetErrorMessage(true, "Sorry, we're failed to retrieve counts for you, please try again later.");
                uc.pollcount.SetErrorMessage(true, String.format('We seem to be having an issue retrieving this count. Please press the "Back" button and try again or call one of our Data Specialists at {0}.', page.global.PhoneNumber));
                uc.pollcount.SetButtonStatus();
                var o = page.placeorder.order;
                framework.common.LogClickEvent("Fail to get count", null, rep == null ? "Fail to get count" : rep.responseText);
            }
        });
    },

    CheckPollingStatus: function(requestId) {
        uc.pollcount.progress = uc.pollcount.progress + 1;
        var getCountStatusURL = "PlaceOrder.aspx/CheckPollingStatus?retry=" + uc.pollcount.progress;
        framework.common.Ajax({
            url: getCountStatusURL,
            data: { requestId: requestId },
            timeout: 600000,
            success: function(result) {
                if (page.placeorder.order.CurrentStep != entity.enums.OrderStep.PollCount) return;
                if (result.ResultFlag == true) {
                    if (result.DataSource.PercentComplete < 100) {
                        setTimeout(function() { uc.pollcount.CheckPollingStatus(requestId); }, 1000);
                    } else {
                        page.placeorder.order.NextStep = entity.enums.OrderStep.ListQuote;
                        page.placeorder.GoNext();
                    }
                } else {
                   uc.pollcount.SetErrorMessage(true, String.format('We seem to be having an issue retrieving this count.  Please press the "Back" button and try again or call one of our Data Specialists at {0}.', page.global.PhoneNumber));
                   uc.pollcount.SetButtonStatus();
                }
            },
            error: function(rep) {
                if (page.placeorder.order.CurrentStep != entity.enums.OrderStep.PollCount) return;
                //uc.pollcount.SetErrorMessage(true, "Sorry, we're failed to retrieve counts for you, please try again later.");
                uc.pollcount.SetErrorMessage(true, String.format('We seem to be having an issue retrieving this count.  Please press the "Back" button and try again or call one of our Data Specialists at {0}.', page.global.PhoneNumber));
                uc.pollcount.SetButtonStatus();
                framework.common.LogClickEvent("Fail to check polling status", null, rep == null ? "Fail to check polling status" : rep.responseText);
            }
        });
    },

    SetButtonStatus: function() {
        // ToDo: set cancel button visible
        var step = uc.pollcount.InitStepSetting();
        step.StepButtonsStatus = entity.enums.StepButtons.Back;
        step.StepButtonsEvent = [
						{ ButtonKey: entity.enums.StepButtons.Back, ButtonEvent: uc.pollcount.Click_Back }
					];
        framework.listener.FireListener(framework.listener.LISTENER_SET_BUTTONS, step);
    },

    Click_Back: function() {
        page.placeorder.GoBack();
    },

    SetErrorMessage: function(bShow, msg) {
        if (bShow) {
            jQuery('#pollcount_message_error').removeClass("hidden").html(msg);
        } else {
            jQuery('#pollcount_message_error').addClass("hidden").html("");
        }
    }
};

uc.pollcount.demobreakdown = {
    georow: 0,
    SubmitOrder: function() {
        uc.pollcount.SetErrorMessage(false);

        framework.common.Ajax({
            url: "PlaceOrder.aspx/PollCountDemoBreakdown",
            data: { georow: uc.pollcount.demobreakdown.georow },
            success: function(result) {
                if (page.placeorder.order.CurrentStep != entity.enums.OrderStep.PollCount) return;
                if (result.ResultFlag == true) {
                    setTimeout(function() { uc.pollcount.demobreakdown.CheckPollingStatus(result.DataSource.RequestId); }, 1000);
                }

            },
            error: function(rep) {
                if (page.placeorder.order.CurrentStep != entity.enums.OrderStep.PollCount) return;
                uc.pollcount.SetErrorMessage(true, String.format('We seem to be having an issue retrieving this count. Please press the "Back" button and try again or call one of our Data Specialists at {0}.', page.global.PhoneNumber));
                uc.pollcount.SetButtonStatus();
            }
        });
    },

    CheckPollingStatus: function(requestId) {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/CheckPollingStatusDemoBreakdown",
            data: { requestId: requestId },
            success: function(result) {
                if (page.placeorder.order.CurrentStep != entity.enums.OrderStep.PollCount) return;
                if (result.ResultFlag == true) {
                    if (result.DataSource.PercentComplete < 100) {
                        setTimeout(function() { uc.pollcount.demobreakdown.CheckPollingStatus(requestId); }, 1000);
                    } else {
                        uc.pollcount.demobreakdown.georow = uc.pollcount.demobreakdown.georow + 1;
                        if (uc.pollcount.demobreakdown.georow < page.placeorder.order.OrderGeos.length) {
                            uc.pollcount.demobreakdown.SubmitOrder();
                        } else {
                            page.placeorder.order.NextStep = entity.enums.OrderStep.ListQuote;
                            page.placeorder.GoNext();
                        }
                           
                    }
                }

            },
            error: function(rep) {
                if (page.placeorder.order.CurrentStep != entity.enums.OrderStep.PollCount) return;
                uc.pollcount.SetErrorMessage(true, String.format('We seem to be having an issue retrieving this count.  Please press the "Back" button and try again or call one of our Data Specialists at {0}.', page.global.PhoneNumber));
                uc.pollcount.SetButtonStatus();
            }
        });
    }
};
