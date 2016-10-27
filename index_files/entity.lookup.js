Ext.namespace("entity.lookup");

entity.lookup.LookUpBase = function() {
	this.getList = function() { };
	this.getByCode = function(code) {
		if (code != null) {
			var list = this.getList() || [];
			for (var i = 0; i < list.length; i++) {
				if (list[i].Code == code) {
					return list[i];
				}
			}
		}
		return null;
	};

	this.getByDisplayName = function(displayName) {
		if (displayName != null) {
			var list = this.getList() || [];
			for (var i = 0; i < list.length; i++) {
				if (list[i].DisplayName.toLowerCase() == displayName.toLowerCase()) {
					return list[i];
				}
			}
		}
		return null;
	};
	;
	this.getListWithEmpty = function() {
		var newlist = [];
		var emptySelection = { Code: -1, DisplayName: "Select" };
		newlist.push(emptySelection)
		var list = this.getList() || [];
		for (var i = 0; i < list.length; i++) {
			newlist.push(list[i]);
		}
		return newlist;
	};
};




// TODO: follow class should inherit from entity.lookup.LookUpBase
 
//Extend the super class
GeoType = Ext.extend(entity.lookup.LookUpBase, {});//Create the object
entity.lookup.GeoType = new GeoType();
Ext.apply(entity.lookup.GeoType, {
	Unknown: { Code: 0, DisplayName: 'Unknown', Description: 'Unknown' },
	Country: { Code: 1, DisplayName: 'Country', Description: 'Country' },
	State: { Code: 2, DisplayName: 'State', Description: 'State' },
	County: { Code: 3, DisplayName: 'County', Description: 'County (State)' },
	City: { Code: 4, DisplayName: 'City', Description: 'City (State)' },
	Zip: { Code: 5, DisplayName: 'Zip', Description: 'ZIP (City)' },
	Ziprange: { Code: 6, DisplayName: 'Zip Range', Description: 'ZIP Range' },
	//Radius: { Code: 7, DisplayName: 'Radius', Description: 'Radius Around Single/Multi Address(es)' },
	Radius: { Code: 7, DisplayName: 'Radius', Description: 'Radius around an Address' },
	Scf: { Code: 8, DisplayName: 'SCF', Description: 'SCF' },
	ZipUpload: { Code: 9, DisplayName: 'ZipUpload', Description: 'ZipUpload' },
	Msa: { Code: 10, DisplayName: 'MSA', Description: 'Metro Area' },
	ZipRadius: { Code: 11, DisplayName: 'Zip Radius', Description: 'Radius around ZIP' },
	//Closex: { Code: 12, DisplayName: 'Closest Records', Description: 'Closest Records Single/Multiple Address(es)' },
	Closex: { Code: 12, DisplayName: 'Closest Records', Description: 'Closest Records to an Address' },
	Polygon: { Code: 13, DisplayName: 'Polygon Map', Description: 'Polygon Map' },
	MultiRadius: { Code: 14, DisplayName: 'Multi-Radius', Description: 'Radius around Multiple Addresses' },
	MultiClosex: { Code: 15, DisplayName: 'Multi-Closest Records', Description: 'Closest Records to Multiple Addresses' },
	AcxiomMultiRadius: { Code: 16, DisplayName: 'Multi-Radius', Description: 'Acxiom Multi-Radius around Address' },
	AcxiomZipRadius: { Code: 17, DisplayName: 'Multi-ZipRadius', Description: 'Acxiom Multi-Radius around Zip' },
	ZipMap: { Code: 18, DisplayName: 'Zip Map', Description: 'ZIP Codes or Carrier Routes from Map' },
	NationWide: { Code: 20, DisplayName: 'NationWide', Description: 'NationWide' },
	CongressionalDistrict: { Code: 22, DisplayName: 'Congressional-District', Description: 'Congressional District' }, //lisa for 5720
	MultiGeo: { Code: 23, DisplayName: 'MultiGeo', Description: 'Multi Geo' }, //lisa 5752
	MultiCount: { Code: 24, DisplayName: 'MultiCount', Description: 'Multi Count' },
	getList: function() {
		var list = [];
		list.push(entity.lookup.GeoType.Unknown);
		list.push(entity.lookup.GeoType.Country);
		list.push(entity.lookup.GeoType.State);
		list.push(entity.lookup.GeoType.County);
		list.push(entity.lookup.GeoType.City);
		list.push(entity.lookup.GeoType.Zip);
		list.push(entity.lookup.GeoType.Ziprange);
		list.push(entity.lookup.GeoType.Radius);
		list.push(entity.lookup.GeoType.Scf);
		list.push(entity.lookup.GeoType.ZipUpload);
		list.push(entity.lookup.GeoType.Msa);
		list.push(entity.lookup.GeoType.ZipRadius);
		list.push(entity.lookup.GeoType.Closex);
		list.push(entity.lookup.GeoType.Polygon);
		list.push(entity.lookup.GeoType.MultiRadius);
		list.push(entity.lookup.GeoType.MultiClosex);
		list.push(entity.lookup.GeoType.AcxiomMultiRadius);
		list.push(entity.lookup.GeoType.AcxiomZipRadius);
		list.push(entity.lookup.GeoType.ZipMap);
		list.push(entity.lookup.GeoType.NationWide);
		list.push(entity.lookup.GeoType.CongressionalDistrict); // lisa for 5720
		list.push(entity.lookup.GeoType.MultiGeo);  //lisa for 5752
		list.push(entity.lookup.GeoType.MultiCount);
		return list;
	}
});


//*********************Order Step LookUp********************************/   
OrderStep = Ext.extend(entity.lookup.LookUpBase, {});
entity.lookup.OrderStep = new OrderStep();
Ext.apply(entity.lookup.OrderStep, {
	DataSource: {
		Code: 1,
		DisplayName: 'DataSource',
		StepTitleHtml: "Select Data Source"
	},
	GeoType: {
		Code: 2,
		DisplayName: 'GeoType',
		StepTitleHtml: "Step 1: Select Target Area(s)"
	},
	Geo: {
		Code: 3,
		DisplayName: 'Geo',
		StepTitleHtml: "Step 1: Select Target Area(s)"
	},
	DemoOption: {
		Code: 4,
		DisplayName: 'DemoOption',
		StepTitleHtml: " Step 2: Define Target Audience"
	},
	Demo: {
		Code: 5,
		DisplayName: 'Demo',
		StepTitleHtml: " Step 2: Define Target Audience"
	},
	PollCount: {
		Code: 6,
		DisplayName: 'PollCount',
		StepTitleHtml: "Polling Count"
	},
	ListQuote: {
		Code: 7,
		DisplayName: 'ListQuote',
		StepTitleHtml: ' Step 3: Review Count & Quote'
	},
	Payment: {
		Code: 8,
		DisplayName: 'Payment',
		StepTitleHtml: 'Step 4: Enter Payment Information'
	},
	Success: {
		Code: 9,
		DisplayName: 'Success',
		StepTitleHtml: 'Step 5: Success'
	},

	getList: function() {
		var list = [];
		list.push(this.DataSource);
		list.push(this.GeoType);
		list.push(this.Geo);
		list.push(this.DemoOption);
		list.push(this.Demo);
		list.push(this.PollCount);
		list.push(this.ListQuote);
		list.push(this.Payment);
		list.push(this.Success);
		return list;
	}
});

// TODO: follow class should inherit from entity.lookup.LookUpBase
PhoneOption = Ext.extend(entity.lookup.LookUpBase, {});
entity.lookup.PhoneOption = new PhoneOption();
Ext.apply(entity.lookup.PhoneOption, {
	getList : function() {
		var list = [{Code:1, DisplayName: "No Phones"},
					{Code:2, DisplayName: "Phones Where Available"},
					{Code:3, DisplayName: "Only Records With Phones"}]
					
		return list;
	}
});

// TODO: follow class should inherit from entity.lookup.LookUpBase
DataSource = Ext.extend(entity.lookup.LookUpBase, {});
entity.lookup.DataSource = new DataSource();
Ext.apply(entity.lookup.DataSource, {
    Consumer: {
        Code: 10,
        DisplayName: 'Consumer',
        Description: "Consumer Lists/Leads"
    },
    Business: {
        Code: 20,
        DisplayName: 'Business',
        Description: "Business Lists/Leads"
    },
    HomeData: {
        Code: 30,
        DisplayName: 'HomeData',
        Description: "New Homeowners Lists/Leads"
    },
    NewMover: {
        Code: 40,
        DisplayName: 'New Mover',
        Description: " New Mover"
    },
    Occupant: {
        Code: 50,
        DisplayName: 'Occupant',
        Description: "Resident Occupant Lists"
    },
    NewHomeowner: {
        Code: 60,
        DisplayName: 'New Homeowner',
        Description: " New Homeowner"
    },
    Equifaxc: {
        Code: 70,
        DisplayName: 'Equifax',
        Description: 'Consumer Mailing Lists & Sales Leads – Equifax'
    },

    Experian: {
        Code: 80,
        DisplayName: 'Experian',
        Description: 'Consumer Lists'
    },

    Compass: {
        Code: 90,
        DisplayName: 'Compass',
        Description: 'Business'

    },

    CompassCanadianConsumer: {
        Code: 100,
        DisplayName: 'Canadian Consumer',
        Description: 'Canadian Consumer'
    },

    InfoUSAConsumer: {
        Code: 110,
        DisplayName: 'InfoUSA Consumer',
        Description: 'InfoUSA Consumer Lists'
    },

    InfoUSABusiness: {
        Code: 120,
        DisplayName: 'InfoUSA Business',
        Description: 'Business Lists'
    },

    Valassis: {
        Code: 130,
        DisplayName: 'Valassis',
        Description: 'Occupant/Saturation Lists'
    },
    ResidentOccupant: {
        Code: 140,
        DisplayName: 'Resident Occupant',
        Description: 'Resident Occupant'
    },

    InfoUSA_Consumer: {
        Code: 150,
        DisplayName: 'InfoUSA Consumer',
        Description: 'InfoUSA Consumer Lists'
    },

    InfoUSA_Business: {
        Code: 160,
        DisplayName: 'InfoUSA Business',
        Description: 'InfoUSA Business Lists'
    },

    InfoBase_BusinessList: {
        Code: 170,
        DisplayName: 'InfoBase Business',
        Description: "InfoBase Business List"
    },

    InfoUSA_IDMS_Business: {
        Code: 180,
        DisplayName: 'InfoUSA Business',
        Description: "Business List"
    },
    
    Mobile_Consumer_Advertising: {
        Code: 190,
        DisplayName: 'Mobile Consumer Advertising',
        Description: "Mobile Consumer Advertising"
    },
    

    getList: function() {
        var list = [];
        list.push(this.Consumer);
        list.push(this.Business);
        list.push(this.HomeData);
        list.push(this.NewMover);
        list.push(this.Occupant);
        list.push(this.NewHomeowner);
        list.push(this.Equifaxc);
        list.push(this.Experian);
        list.push(this.Compass);
        list.push(this.CompassCanadianConsumer);
        list.push(this.InfoUSAConsumer);
        list.push(this.InfoUSABusiness);
        list.push(this.Valassis);
        list.push(this.ResidentOccupant);
        list.push(this.InfoUSA_Consumer);
        list.push(this.InfoUSA_Business);
        list.push(this.InfoBase_BusinessList);
        list.push(this.InfoUSA_IDMS_Business);
        list.push(this.Mobile_Consumer_Advertising);
        return list;
    }
});


// TODO: follow class should inherit from entity.lookup.LookUpBase
OrderType = Ext.extend(entity.lookup.LookUpBase, {});
entity.lookup.OrderType = new OrderType();
Ext.apply(entity.lookup.OrderType, {
    CleanList: {
        Code: 0,
        DisplayName: 'Clean a List',
        Description: "Clean a List"
    },
    EnhanceList: {
        Code: 1,
        DisplayName: 'Enhance a List',
        Description: "Enhance a List"
    },
    PortraitReports: {
        Code: 2,
        DisplayName: 'Portait Reports',
        Description: "Portait Reports"
    },

    BridgeEmailAppend: {
        Code: 3,
        DisplayName: 'Email Append',
        Description: "Email Append"
    },

    getList: function() {
        var list = [];
        list.push(this.CleanList);
        list.push(this.EnhanceList);
        list.push(this.PortraitReports);
        list.push(this.BridgeEmailAppend);
        return list;
    }
});


// TODO: follow class should inherit from entity.lookup.LookUpBase
ListUsage = Ext.extend(entity.lookup.LookUpBase, {});
entity.lookup.ListUsage = new ListUsage();
Ext.apply(entity.lookup.ListUsage, { 
    getList : function() {
    var list = [{ Code: 1, DisplayName: "One Time", PaymentDisplayName: "SINGLE" },
        { Code: 2, DisplayName: "Two Times", PaymentDisplayName: "TWO"},
        { Code: 3, DisplayName: "Three Times", PaymentDisplayName: "THREE"},
        { Code: 4, DisplayName: "Four Times", PaymentDisplayName: "FOUR"},
        { Code: 5, DisplayName: "Five Times", PaymentDisplayName: "FIVE"},
        { Code: 6, DisplayName: "Six Times", PaymentDisplayName: "SIX"},
		{ Code: 100, DisplayName: "Multiple Times", PaymentDisplayName: "MULTI"}]

        return list;
    }
});

// TODO: follow class should inherit from entity.lookup.LookUpBase
VideoHelp = Ext.extend(entity.lookup.LookUpBase, {});
entity.lookup.VideoHelp = new VideoHelp();
Ext.apply(entity.lookup.VideoHelp, {

	getList : function() {
		var list = [{ Code: entity.enums.OrderStep.GeoType, Url: "http://www.usadata.com/mailinglists/help_videos/screenhelp-step1.html", Title: "Guide for Select Geography Type" },
				{ Code: entity.enums.OrderStep.DemoOption, Url: "http://www.usadata.com/mailinglists/help_videos/screenhelp-step2.html", Title: "Guide for Select List Product" },
				{ Code: entity.enums.OrderStep.Demo, Url: "http://www.usadata.com/mailinglists/help_videos/screenhelp-step2-2.html", Title: "Guide for Select Demographic Criteria" },
				{ Code: entity.enums.OrderStep.ListQuote, Url: "http://www.usadata.com/mailinglists/help_videos/screenhelp-step3.html", Title: "Guide for Count Results" },
				{ Code: entity.enums.OrderStep.Payment, Url: "http://www.usadata.com/mailinglists/help_videos/screenhelp-step4.html", Title: "Guide for Payment"}];
		return list;
	}
});

// TODO: follow class should inherit from entity.lookup.LookUpBase
ScreenHelp = Ext.extend(entity.lookup.LookUpBase, {});
entity.lookup.ScreenHelp = new ScreenHelp();
Ext.apply(entity.lookup.ScreenHelp, { 
	getList : function() {
		var list = [
					{ Code1: entity.enums.OrderStep.GeoType, Code2:entity.enums.DataSourceType.Consumer, Url: "guide-2-10.gif"},
					{ Code1: entity.enums.OrderStep.GeoType, Code2:entity.enums.DataSourceType.Business, Url: "guide-2-20.gif"},
					{ Code1: entity.enums.OrderStep.GeoType, Code2:entity.enums.DataSourceType.HomeData, Url: "guide-2-30.gif"},
					{ Code1: entity.enums.OrderStep.GeoType, Code2:entity.enums.DataSourceType.NewMover, Url: "guide-2-40.gif"},
					{ Code1: entity.enums.OrderStep.GeoType, Code2:entity.enums.DataSourceType.Occupant, Url: "guide-2-50.gif"},
					
					{ Code1: entity.enums.OrderStep.DemoOption, Code2:entity.enums.DataSourceType.Consumer, Url: "guide-4-10.gif"},
					{ Code1: entity.enums.OrderStep.DemoOption, Code2:entity.enums.DataSourceType.Business, Url: "guide-4-20.gif"},
					{ Code1: entity.enums.OrderStep.DemoOption, Code2:entity.enums.DataSourceType.NewMover, Url: "guide-4-40.gif"},
					{ Code1: entity.enums.OrderStep.DemoOption, Code2:entity.enums.DataSourceType.Occupant, Url: "guide-4-50.gif"},
					
					{ Code1: entity.enums.OrderStep.Demo, Code2:entity.enums.DataSourceType.Consumer, Url:"guide-5-10.gif"},
					{ Code1: entity.enums.OrderStep.Demo, Code2:entity.enums.DataSourceType.Business, Url:"guide-5-20.gif"},
					{ Code1: entity.enums.OrderStep.Demo, Code2:entity.enums.DataSourceType.HomeData, Url:"guide-5-30.gif"},
					{ Code1: entity.enums.OrderStep.Demo, Code2:entity.enums.DataSourceType.NewMover, Url:"guide-5-40.gif"},
					
					{ Code1: entity.enums.OrderStep.ListQuote, Code2:entity.enums.DataSourceType.Consumer, Url: "guide-7-10.gif"},
					{ Code1: entity.enums.OrderStep.ListQuote, Code2:entity.enums.DataSourceType.Business, Url:"guide-7-20.gif"},
					{ Code1: entity.enums.OrderStep.ListQuote, Code2:entity.enums.DataSourceType.HomeData, Url:"guide-7-30.gif"},
					{ Code1: entity.enums.OrderStep.ListQuote, Code2:entity.enums.DataSourceType.NewMover, Url:"guide-7-40.gif"},
					{ Code1: entity.enums.OrderStep.ListQuote, Code2:entity.enums.DataSourceType.Occupant, Url:"guide-7-50.gif"},
					
					{ Code1: entity.enums.OrderStep.Payment, Code2:entity.enums.DataSourceType.Consumer, Url: "guide-8-10.gif"},
					{ Code1: entity.enums.OrderStep.Payment, Code2:entity.enums.DataSourceType.Business, Url:"guide-8-20.gif"},
					{ Code1: entity.enums.OrderStep.Payment, Code2:entity.enums.DataSourceType.HomeData, Url:"guide-8-30.gif"},
					{ Code1: entity.enums.OrderStep.Payment, Code2:entity.enums.DataSourceType.NewMover, Url:"guide-8-40.gif"},
					{ Code1: entity.enums.OrderStep.Payment, Code2:entity.enums.DataSourceType.Occupant, Url:"guide-8-50.gif"}
				];

		return list;
	}

});

// we can get follow data from database industry table, put it here to just make the performance better
TopIndustryLevels = Ext.extend(entity.lookup.LookUpBase, {});
entity.lookup.TopIndustryLevels = new TopIndustryLevels();
Ext.apply(entity.lookup.TopIndustryLevels, {
	getList: function() {
	var list = [{ Code: '1', DisplayName: "Agriculture, Forestry & Fishing" },
					{ Code: '2', DisplayName: "Mining" },
					{ Code: '3', DisplayName: "Construction" },
					{ Code: '4', DisplayName: "Manufacturing" },
					{ Code: '5', DisplayName: "Transportation, Communication, & Utilities " },
					{ Code: '6', DisplayName: "Wholesale Trade" },
					{ Code: '7', DisplayName: "Retail Trade" },
					{ Code: '8', DisplayName: "Finance, Insurance & Real Estate" },
					{ Code: '9', DisplayName: "Services" },
					{ Code: 'A', DisplayName: "Public Administration" },
					{ Code: 'B', DisplayName: "Nonclassifiable Establishments" }]

		return list;
	}
});

//Extend the super class
CreditCardType = Ext.extend(entity.lookup.LookUpBase, {});
//Create the object
entity.lookup.CreditCardType = new CreditCardType();
Ext.apply(entity.lookup.CreditCardType, {
	Visa: { Code: 10, DisplayName: 'VISA'},
	MasterCard: { Code: 20, DisplayName: 'MasterCard'},
	AmericanExpress: { Code: 30, DisplayName: 'American Express'},
	Discover: { Code: 40, DisplayName: 'Discover'},
	getList: function() {
		var list = [];
		list.push(entity.lookup.CreditCardType.Visa);
		list.push(entity.lookup.CreditCardType.MasterCard);
		list.push(entity.lookup.CreditCardType.AmericanExpress);
		list.push(entity.lookup.CreditCardType.Discover);
		return list;
	}
});