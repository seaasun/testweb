ni.RegisterNameSpace("entity.enums");

entity.enums = {
    StepButtons: {
        Back: 1,
        Next: 2,
        SaveCount: 4,
        PlaceOrder: 8,
        PlaceAnotherOrder: 16,
        StartOver: 32,
        OrderQuote: 64,
        SubmitOrder: 128,
        PrintOrder: 256
    },

    OrderStep: {
        DataSource: 1,
        GeoType: 2,
        Geo: 3,
        DemoOption: 4,
        Demo: 5,
        PollCount: 6,
        ListQuote: 7,
        Payment: 8,
        Success: 9
    },

    GeoType: {
        Country: 1,
        State: 2,
        County: 3,
        City: 4,
        Zip: 5,
        Ziprange: 6,
        Radius: 7,
        Scf: 8,
        ZipUpload: 9,
        Msa: 10,
        ZipRadius: 11,
        Closex: 12,
        Polygon: 13,
        MultiRadius: 14,
        MultiClosex: 15,
        AcxiomMultiRadius: 16,
        AcxiomZipRadius: 17,
        ZipMap: 18,
        ACXIOM_CloseX: 19,
        NationWide: 20,
        GeograghyFromFile: 21,
        CongressionalDistrict: 22,
        MultiGeo:23,
        MultiCount: 24
    },

    DemoTab: {
        BusinessQuickPicks: 0,
        BusinessType: 1,
        DemoOptions: 2,
        LifeStyle: 3,
        QuickPicks: 4,
        Suppression: 5,
        AutoSuggestion: 6,
        Propensities: 7,
        CharitableGiving: 8
    },

    //add by lisa at 06/03/2015 for 5752 begin
    MultiGeoTab: {
        ZipCode: 0,
        City: 1,
        County: 2,
        State: 3
    },
    //add by lisa at 06/03/2015 for 5752 end

    PromotionType: {
        PERCENT_OFF_TOTAL_PRICE: 1,
        FREE_LEADS: 2,
        FLAT_DOLLAR_TOTAL_PRICE: 3,
        XNUMBER_OF_POINT: 4,
        NUMBER_OF_POINT: 5,
        DEBIT_CARD: 6,
        DOLLAR_MOBILE_ONLY: 7,
        DOLLAR_MOBILE_LIST_BOTH: 8,
        PERCENT_OFF_MOBILE_ONLY: 9,
        PERCENT_OFF_MOBILE_LIST_BOTH: 10
    },

    PromotionMinPurAmtType: {
        BY_TOTAL_SPEND: 1,
        BY_TOTAL_RECORDS: 2,
        BY_TOTAL_SPEND_RECORDS: 3
    },

    ListUsageType: {
        OneTimes: 1,
        TwoTimes: 2,
        ThreeTimes: 2,
        FourTimes: 4,
        FiveTimes: 5,
        SixTimes: 6,
        MultiTimes: 100
    },
    ListTypeUsage: {
        DirectMailing: 1,
        Email: 2
    },

    CalculatePriceMethod: {
        WholeOrder: 0,
        OnlyBase: 1
    },

    SelectedDemoType: {
        LifeStyle: 1,
        QuickPickup: 2,
        Demography: 3,
        Industry: 4,
        IndustryQuickPickup: 5,
        IndustryOmit: 6,
        SiteQuickPickup: 7,
        PostSupPhone:8,
        CharitableGiving: 9
    },
    //    todo: should map top database
    DataSourceType: {
        Consumer: 10,
        Business: 20,
        HomeData: 30,
        NewMover: 40,
        Occupant: 50,
        NewHomeowner: 60,
        Equifaxc: 70,
        Experian: 80,
        Compass: 90,
        CanadaConsumer: 100,
        InfoUSAConsumer: 110,
        InfoUSABusiness: 120,
        Valassis: 130,
        ResidentOccupant: 140,
        InfoUSA_Consumer: 150,
        InfoUSA_Business: 160,
        InfoBase_BusinessList: 170,
        InfoUSA_IDMS_Business: 180,
        Mobile_Consumer_Advertising: 190
    },

    DemoType: {
        Standard: 1,
        All: 99
    },

    PhoneOption: {
        None: 0,
        NoPhoneNumber: 1,
        PhoneNumberWithAvailable: 2,
        PhoneNumberOnly: 3
    },

    TargetOption: {
        Homes: 1,
        Apartments: 2,
        Businesses: 4
    },

    RouteOption: {
        Carrier: 1,
        PoBoxes: 2,
        Rural: 4
    },

    DemoInputType: {
        Listbox: 0,
        InputDate: 1,
        InputInteger: 2,
        InputMonthyear: 3,
        InputYear: 4,
        InputMonth: 5,
        SICCode: 6,
        InputString: 7,
        RadioSelectBox: 8
    },

    PaymentMethod: {
        CreditCard: 1,
        MonthlyBilling: 2,
        Authorize: 3
    },

    SuppressionType: {
        NONE: 0, //no suppression
        DATE: 1, //suppress by date range
        ORDERLIST: 2, //suppress select orders
        CUSTOMORDER: 3,// suppress by custom order
        CUSTOMDATE:6,
        DATE_CUSTOMDATE:7,
        DATE_CUSTOMORDERS: 4,// suppress by date range and custom orders
        ORDERLIST_CUSTOMORDERS: 5,//suppress select orders and custom orders
        ORDERLIST_CUSTOMDATE: 8,
        
        SAVEDCOUNTORDER: 9,
        SAVEDCOUNTDATA: 10,
        DATE_SAVEDCOUNTORDER: 11,
        DATE_SAVEDCOUNTDATA: 12,
        ORDERLIST_SAVEDCOUNTORDER: 13,
        ORDERLIST_SAVEDCOUNTDATA: 14,
        SAVEDCOUNTDATA_CUSTOMORDERS: 15,
        SAVEDCOUNTDATA_CUSTOMDATE: 16,
        SAVEDCOUNTORDER_CUSTOMORDERS: 17,
        SAVEDCOUNTORDER_CUSTOMDATE: 18,
        // three suppression type combine
        DATE_CDATE_SDATE: 19,
        DATE_CDATE_SORDER: 20,
        DATE_CORDER_SDATE: 21,
        DATE_CORDER_SORDER: 22,
        OL_CDATE_SDATE: 23,
        OL_CDATE_SORDER: 24,
        OL_CORDER_SDATE: 25,
        OL_CORDER_SORDER: 26
    },

    OrderType:
    {
        UNKNOWN: 0,
        Standard: 10,
        Schedule: 20,
        NCOA_Upload: 30,
        NCOA_Submission: 40,
        Other: 99,
        Submit:100,
        MOBILE_UPSELL: 60,
        MOBILE_DIRECT: 70,
        FACEBOOK: 80,
        MOBILE_FACEBOOK: 110
    },

    MA_OrderType:
    {
        CleanList: 0,
        EnhanceList: 1,
        PortraitReports: 2,
        BridgeEmail: 3,
        EmailVerification: 4,
        PhoneAppend: 5, 
        PhoneVerification: 6,
        ReversePhoneAppend: 7
    },

    AddressType:
    {
        BillingAddress: 1,
        SearchCenterAddress: 2,
        UserAddress: 3
    },

    RadiusTypeChoice:
    {
        UNKNOWN: 0,
        ATUO: 1,
        ZIP4: 2,
        CRRT: 3,
        ZIP5: 4
    },

    ZipcodeOrignalType:
    {
        UNKNOWN: 0,
        ZIP_INPUT: 1,
        ZIP_PASTED: 2,
        ZIP_RANGE_INPUT: 3,
        SCF_INPUT: 4,
        SCF_RANGE_INPUT: 5

    },

    UmCodeType:
   {
       UNKNOWN: 0,
       KM: 1,
       MILE: 2
   }
}