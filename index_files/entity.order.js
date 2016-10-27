ni.RegisterNameSpace("entity");

entity.OrderFlow = function() {
	this.CurrentStep = entity.enums.OrderStep.GeoType;
	this.NextStep = 0;
	this.GeoType = 0;
	this.ListType = entity.enums.DataSourceType.Consumer;
	this.StepTitle = "";
	this.StepDescription = "";
	this.StepButtonsStatus = 0;  //checked all
	this.StepButtonsEvent = [];  //{ButtonKey: 0, ButtonEvent: fn}

	this.GetButtonEvent = function(buttonKey) {
		for (var i = 0; i < this.StepButtonsEvent.length; i++) {
			if (this.StepButtonsEvent[i].ButtonKey == buttonKey) {
				return this.StepButtonsEvent[i].ButtonEvent;
			}
		}
	};
};


entity.Order = function() {
    this.CurrentStep = entity.enums.OrderStep.GeoType;
    this.NextStep = 0;
    this.GeoType = 0;
    this.ListType = entity.enums.DataSourceType.Consumer;
    this.DemoType = entity.enums.DemoType.Standard;
    this.PhoneOption = entity.enums.PhoneOption.None;
    this.TargetOption = 7;  //checked all
    this.RouteOption = 7;   //checked all
    this.ContactNameFlag = 0;
    this.ContactNameOption = 0;
    this.OrderType = entity.enums.OrderType.Standard; //Standard
    this.OrderDate = new Date();
    this.SuppressionType = entity.enums.SuppressionType.NONE;
    this.ListUsage = entity.enums.ListUsageType.OneTimes;
    this.AccountId = null;
    this.Radius = 0;
    this.ZipcodeOriginalType = entity.enums.ZipcodeOrignalType.UNKNOWN;
    this.RadiusTypeChoice = entity.enums.RadiusTypeChoice.ATUO;
    this.UmCode = entity.enums.UmCodeType.UNKNOWN;
    this.IsSaveCreative = false;
    this.CreativeId = 0;
    this.SuppressionByDomain = false;
    this.TaxCharge = 0;
    this.TotalPretaxCost = 0;
    this.SeeBreakDown = true;

};

entity.OrderGeo = function() {
    //	this.ActualQty = 0;
    //	this.AddressLine;
    this.AvailableQty = 0;
    this.CityName = "";
    //	this.Cost;
    //	this.CostPrice;
    this.CountryCode = "US";
    //	this.CountyCode;
    this.CountyFips;
    //	this.CountyName;
    //	this.DesiredQty = 0;
    this.GeoKeyCode;
    this.GeoKeyDesc;
    this.GeoType;
    //	this.OrderGeoId;
    //	this.OrderId;
    this.StateCode;
    //	this.ZipCode1;
    //	this.ZipCode2;
    this.OrderGeoDetails = null;
};

entity.OrderGeoDetail = function() {
    this.ActualQty = 0;
    //	this.AvailableQty = 0;
    //	this.AvailableQtyApt = 0;
    //	this.AvailableQtyBuss = 0;
    //	this.AvailableQtyHome = 0;
    //	this.Cost;
    //	this.CostPrice;
    this.DesiredQty = 0;
    //	this.DesiredQtyApt = 0;
    //	this.DesiredQtyBuss = 0;
    //	this.DesiredQtyHome = 0;
    this.DetailCode;
    this.DetailDesc;
    this.DetailName;
    //	this.DetailType;
    //	this.OrderGeoDetailId;
    //	this.OrderGeoId;
    //	this.OrderId;
};

entity.OrderAddress = function() {
	this.AddrSearchString;
	this.AddrUsageType;
	this.AddressLine = "";
	this.AddressName = "";
	this.CityName = "";
	this.CountryCode = "";
	this.Latitude;
	this.Longitude;
	//	this.OrderAddressId;
	//	this.OrderId;
	this.StateCode = "";
	this.ZipCode;
	this.Quantity = 0;
	this.Radius = 0;
};


entity.SelectedDemoCategory = function() {
	this.DemoCategoryType;
	this.ColumnName;
	this.AttributeName;
	//this.ListType;
	this.Values = [];

	this.addValue = function(value, name, sortSeq) {
		for (var i = 0; i < this.Values.length; i++) {
			if (this.Values[i].AttributeValue == value) {
				return;
			}
		}

		var demoValue = new entity.SelectedDemoCategoryValue();
		demoValue.ColumnName = this.ColumnName;
		demoValue.AttributeValue = value;
		demoValue.AttributeValueName = name;
		demoValue.SortSeq = sortSeq || 0;
		this.Values.push(demoValue);

		framework.common.sortJson(this.Values, "SortSeq", "asc", Number);
	},

    this.removeValue = function(value) {
    	this.Values = $.grep(this.Values, function(item) {
    		return item.AttributeValue != value;
    	});
    }
};

entity.SelectedDemoCategoryValue = function() {
    this.ColumnName;
    this.AttributeValue;
    this.AttributeValueName;
    this.SortSeq;
};

entity.SelectedDemoCategoryGroup = function() {
    this.DemoCategoryType;
    this.DemoCategoryName;
    this.Demos = [];

    this.getName = function(demoCategoryType) {
        if (demoCategoryType == entity.enums.SelectedDemoType.LifeStyle) {
            return "Life Style";
        }
        if (demoCategoryType == entity.enums.SelectedDemoType.QuickPickup) {
            return "QuickPicks";
        }
        if (demoCategoryType == entity.enums.SelectedDemoType.Demography) {
            return "Demographic Options";
        }
        if (demoCategoryType == entity.enums.SelectedDemoType.Industry) {
            return "Business Type";
        }
        if (demoCategoryType == entity.enums.SelectedDemoType.IndustryQuickPickup) {
            return "Business QuickPicks";
        }
        if (demoCategoryType == entity.enums.SelectedDemoType.IndustryOmit) {
            return "Omitted Industries";
        }
        if (demoCategoryType == entity.enums.SelectedDemoType.SiteQuickPickup) {
            return "Site QuickPicks";
        }
        return "Unknown";
    }

};
entity.OrderPayment = function() {
    this.MaxYear;
    this.CardType;
    this.HolderName = "";
    this.Number = "";
    this.SecurityCode;
    this.ExpiredYear;
    this.ExpiredMonth;
    //address and contact
    this.Email = "";
    this.Phone = "";
    this.AddressLine = "";
    this.City = "";
    this.State = "";
    this.Zipcode = "";
    this.CountryCode = "US";
    this.Token = "";
    this.LegatoMessage = "";

};

entity.OrderContact = function() {
    this.FirstName = "";
    this.LastName = "";
    this.Company = "";
    this.Phone = "";
    this.Email = "";
    this.AddressLine = "";
    this.City = "";
    this.State = "";
    this.Zipcode = "";
    this.OrderName = "";
    this.CountryCode = "US";
    //option
    this.CallMe = false;
    this.AddToMailingList = false;
    this.OrderForClients = false;
    this.IsContactMeByEmail = false;
    this.IsSendEmailToList = false;
    this.IsSendEmailToAudience = false;
    this.IsSendMobileFacebookToAudience = false;
};

entity.OrderSuppression = function() {
	this.OrderId;
	this.OriginalOrderId;
	this.SuppressedOrderId;
	this.SuppressionName = "";
	this.SuppressionValue = "";
	this.SuppressedOrderCode = "";
	this.SuppressedOrderDesc = "";
};
entity.OrderCustomSuppression = function() {
    this.SuppressionName = "";
    this.SuppressionValue = "";
    this.OrderDate = null;
    this.FileName = "";
};

entity.SaveCountSuppression = function() {
    this.CountId;
    this.OriginalCountId;
    this.SuppressedCountId;
    this.SuppressionName = "";
    this.SuppressionValue = "";
    this.SuppressedCountCode = "";
    this.SuppressedCountDesc = "";
};

entity.UserSuppression = function() {
    this.OrderId;
    this.SuppressionName = "";
    this.SuppressionValue = "";
    this.SuppressionDesc = "";
    this.OrderDate = null;

}

entity.TaxRequest = function() {
    this.OrderNumber = "";
    this.OrderAmount = 0;
    this.DesiredQty = 0;
    this.TaxAmount = 0;

    this.AddressLine = "";
    this.City = "";
    this.State = "";
    this.Zip = "";
    this.Country = "USA";

    this.ListType = entity.enums.DataSourceType.Consumer;
    this.UserId = 0;
};