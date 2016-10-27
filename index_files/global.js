Ext.namespace("page");

page.global = function() { };
page.global = new page.global();

Ext.apply(page.global, {
    PhoneNumber: '800.399.8611', // TODO: it should be initialize from backend
    MaxNumberOfPastedZips: 2000,
    MaxNumberOfZipcodeBySCF: 500,
    ContactEmail: 'orders@usadata.com',
    SenderEmail: 'info@usadata.com',
    SiteName: 'USADATA',
    SiteId: 0,
    HelpUrl: 'http://www.usadata.com/sl360_helper/HelpGateway.aspx',
    MAHelpUrl: 'http://www.usadata.com/sl360_helper/MAViewToc.aspx',
    CustomizedInfoBySite: null,
    DataSpecialistDesc: 'a Data Specialist',
    MapGetDataUrl: 'http://ffig.usadatadev.com/map/GetData.ashx?',
    MapWidth: 640,
    MapHeight: 400,
    LogEvent: false,
    Timezone: "",
    isMarketingUser: false,
    REXURL: "^(?:https?:\/\/)(?:[-a-zA-Z0-9]+\\.)+[-a-zA-Z0-9]+(?:(?:(?:\/[-=&?.#!A-Za-z0-9_]+)+)\/?)?$",
    isAnicoUSite: false,

//    REXURL: "^(?<!=http://)([\\w-]+\\.)+[\\w-]+(/[\\w-\\./?%=]*)?",
    User_FullName: null,
    CreditCardProcessorType: 0,
    IsVertaxEnabled: false,
    HasExempt: false,
    UserRewards: "",
    homePageUrl: "",
    MAPhoneDesc: "If you have questions or need help, please contact an Acxiom representative at 866-977-6018.",

    IsPlacingOrder: function() {
        if (page.placeorder == null || page.placeorder.order == null) {
            return false;
        }
        if (page.placeorder.order != null && page.placeorder.orderflow != null
           && page.placeorder.orderflow != entity.enums.OrderStep.Success) {
            return true;
        }
        return false;

    },

    ConfirmToLeave: function() {
        if (this.IsPlacingOrder()) {
            return confirm("Your chosen selections will be lost, do you wish to continue?");
        }
        return true;
    },

    LoadJSApi_BeanStream: function() {
        if (page.global.CreditCardProcessorType == 3) {
            //TODO: read html setting from db
            $("#frmPaymentContainer").append('<script type="text/javascript" src="https://www.beanstream.com/scripts/tokenization/legato-1.1.min.js"></script>');
            $("#frmPaymentContainer").append('<p><input type="text" id="trnCardNumber" /></p>');
            $("#frmPaymentContainer").append('<p><input type="text" id="trnExpMonth" /></p>');
            $("#frmPaymentContainer").append('<p><input type="text" id="trnExpYear" /></p>');
            $("#frmPaymentContainer").append('<p><input type="text" id="trnCardCvd" /></p>');
        }
    }
    
});

/***** Initialize Javascript for all pages  **********/
jQuery(document).ready(function() {
	// trigger button
	jQuery('input[type=text][triggerbutton]').triggerbutton();

	// ToDo follow two scripts should be directly add on the button in the future
	jQuery("a[rel='colorbox_livehelp']").colorbox({ iframe: true, innerWidth: 520, innerHeight: 480, opacity: 0.5, scrolling: false, overlayClose: false });
	jQuery("a[rel='colorbox']").colorbox({ iframe: true, innerWidth: 880, innerHeight: 600, opacity: 0.5 });

	// Set Help action
	jQuery(".slhelp").live("click", function() {

		var primaryKey = jQuery(this).attr('primaryKey');
		var secondaryKey = jQuery(this).attr('secondaryKey');

		var key = primaryKey;
		if (!String.IsNullOrEmpty(secondaryKey)) {
			key = String.format("{1} - {0}", primaryKey, secondaryKey);
		}

		var pWidth = 730;
		var pHeight = 610;
		var attrWidth = jQuery(this).attr('helpWidth');
		var attrHeight = jQuery(this).attr('helpHeight');
		if (!String.IsNullOrEmpty(attrWidth)) {
			pWidth = Number(attrWidth);
		}

		if (!String.IsNullOrEmpty(attrHeight)) {
			pHeight = Number(attrHeight);
		}

		var hrefUrl = page.global.HelpUrl;
		if (document.location.protocol == 'https:') {
			hrefUrl = hrefUrl.replace("http://", "https://");
		}

		// ToDo: Move the helping site configuration to web.config
		$.fn.colorbox({ href: hrefUrl + "?pname=" + escape(key) + "&siteId=" + page.global.SiteId + "&showEdit=false", iframe: true, width: pWidth, height: pHeight, opacity: 0.5, scrolling: false });

	});

	// fox fixing browser resize layout bug
	if (jQuery.browser.msie) {
		window.onresize = function() {
			jQuery('body').addClass('hidden').removeClass('hidden');
		};
	}


});