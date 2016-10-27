ni.RegisterNameSpace("page");

page.placeorder = {
    order: null,
    orderflow: null,
    accountId: null,
    DataSourcePage: 'resellerlanding.aspx', // this one will be initialized from backend
    minQuantityOfOrder: 100, // minimum quantity of an order
    isDemoBreakdownEnabled: false,
    isTwoDimensionalMatrixEnabled: false,
    isDLGReseller: false,
    //isReseller: false,
    isOrderQuoteEnabled: false,
    defaultPhoneOption: entity.enums.PhoneOption.NoPhoneNumber,

    footerOfDatasource: "",

    showPromotion: false,
    ZipMask: "99999",
    ZipRegularExpression: "^[0-9]{5}$",
    Zip4RegularExpression: "^[0-9]{9}$",
    CRRTRegularExpression: "^[0-9]{5}[:]{1}[A-Za-z]{1}[0-9]{3}$",
    ScfMask: "999",
    ScfRegExp: "^[0-9]{3}$",
    MapCenter: [38.20365531807151, -98.61328125],
    MaxZipcodeOriginalType: entity.enums.ZipcodeOrignalType.ZIP_RANGE_INPUT,
    MaxScfcodeOriginalType: entity.enums.ZipcodeOrignalType.SCF_RANGE_INPUT,
    GeoTypeNames: [],
    GeoTypeTitles: [],
    GeoTypeDescs: [],
    GeoTypeTexts: [],
    ZipcodeOriginalTypeDescs: [],
    AvailableStateDescs: [],
    SampleOutputInfo: null,

    //Flag use to config two different site.
    isBlue: false,
    currentDataSource: null,
    priorVersionLink: null,
    IsShowOrderGeoDetailQuantity: true,
    IsInternationalPayment: false,
    IsPlaceOrderEnabled: true,
    IsMultipleAddress: false,
    isEnableMultiGeo: false, //#5752 multi geo
    RadiusUnit: entity.enums.UmCodeType.MILE,
    AllHouseholdDesc: null,
    IsAcxiomMultiRadius: true,
    // UserRoleForInputPrice: 'SF Reseller',
    IsInputPrice: false,

    //Session[Guid]
    CurrentSessionId: "",

    //This is the default value;
    dataSource: 10,

    demoTabActive: "",
    HelpMsgStepDesc: "",
    DataSourceOfHideZip4: "",
    BusinessShortcutsName: "Business QuickPicks",
    Enable_AN_BusinessQP: false,
    Enable_DomainSuppression: false,
    Days_DomainSuppression: 0,
    Allow_CustomDomainSuppression: false,
    ConsumerListType: 0,
    FacebkText: "",
    OrderSourceParameter: "",
    

    Init: function(dataSource) {

        if (page.placeorder.orderflow == null) {
            var step = new entity.OrderFlow();
            step.CurrentStep = entity.enums.OrderStep.GeoType;
            page.placeorder.orderflow = step;
        };

        page.placeorder.currentDataSource = dataSource == null ? page.placeorder.dataSource : dataSource;
        if (page.placeorder.order == null) {
            var o = new entity.Order();
            o.NextStep = entity.enums.OrderStep.GeoType;
            o.ListType = dataSource;
            o.ListUsage = entity.enums.ListUsageType.OneTimes;
            //6389 - ANICO pricing module is missing
            if (page.global.isAnicoUSite && dataSource == entity.enums.DataSourceType.Compass) {
                o.ListUsage = entity.enums.ListUsageType.MultiTimes;
            }

            if (dataSource == entity.enums.DataSourceType.HomeData) {
                o.DemoType = entity.enums.DemoType.Standard;
            }
            if (page.placeorder.accountId != null) {
                o.AccountId = page.placeorder.accountId;
            }

            page.placeorder.order = o;
        }
        
        page.global.LoadJSApi_BeanStream();
        
        if (page.placeorder.order.ListType == entity.enums.DataSourceType.CanadaConsumer) {
            page.placeorder.MaxZipcodeOriginalType = entity.enums.ZipcodeOrignalType.ZIP_PASTED;
            page.placeorder.MaxScfcodeOriginalType = entity.enums.ZipcodeOrignalType.SCF_INPUT;

        }

        if (String.IsNullOrEmpty(page.placeorder.SampleOutputInfo)) {
            jQuery("#sampleOutputExample").addClass("hidden");
        } else {
            jQuery("#sampleOutputExample").html(page.placeorder.SampleOutputInfo);
            jQuery("#sampleOutputExample").removeClass("hidden");
        }

        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetGeoTypesInternationalTexts",
            data: { timeZone: page.global.Timezone },
            async: false,
            success: function(result) {
                if (result.ResultFlag == true) {
                    page.placeorder.GeoTypeNames = result.DataSource.GeoTypeNames;
                    page.placeorder.GeoTypeTitles = result.DataSource.GeoTypeTitles;
                    page.placeorder.GeoTypeDescs = result.DataSource.GeoTypeDescs;
                    page.placeorder.GeoTypeTexts = result.DataSource.GeoTypeTexts;
                    page.placeorder.ZipcodeOriginalTypeDescs = result.DataSource.ZipcodeOriginalTypeDescs;
                    page.placeorder.AvailableStateDescs = result.DataSource.AvailableStateDescs;
                }

            },
            error: function(rep) {
            },
            waitingElement: 'ct_geo'
        });

        //jQuery("title").val(entity.lookup.DataSource.getByCode(page.placeorder.order.ListType).DisplayName);

        //for test!
        //var paymentorder = {"__type":"Nirvana.SalesLeads.DTO.Order","AccountNumber":null,"ActuralPrice":null,"ApplicationId":null,"BillingAddrId":null,"CardExpirationDate":null,"CardType":0,"CallMeFlag":false,"ContactNameOption":null,"CostPrice":0.042,"CountId":null,"CrtTimestamp":null,"CrtUser":null,"DemoType":99,"ExpirationDate":null,"FailedType":null,"FulfillmentRequest":null,"GeoType":2,"IncludeOcr":null,"LabelCharge":0,"ListType":20,"ListUsage":1,"MailLabelsCount":0,"AddToMailingListFlag":false,"NameOnCard":null,"OnlineOrder":true,"OrderCharge":42,"OrderCode":null,"OrderDate": new Date(),"OrderDesc":null,"OrderId":0,"OrderType":0,"OrgId":null,"OwnerUserId":101,"PaymentMethod":1,"PhoneOption":1,"PreviousStatus":null,"PromoCode":null,"PromotionAmount":0,"QpId":0,"Radius":0,"RadiusType":0,"RouteOption":7,"SecurityCode":null,"SessionId":"8f9c0f0f-0ef5-4d6a-b650-2a64715790ae","ShippingCharge":0,"Status":0,"SuppressionEndDate":null,"SuppressionOption":null,"SuppressionStartDate":null,"SuppressionType":0,"TargetOption":7,"TestMode":null,"TotalActualCharge":null,"TotalActualCost":null,"TotalAvailableQty":2233144,"TotalDesiredQty":1000,"TotalEstmCost":50,"TotalFulfillQty":null,"TotalMinQty":null,"UmCode":0,"UpdTimestamp":null,"UpdUser":null,"Userid":0,"ValidationStatus":null,"AccountId":null,"OrderGeos":[{"ActualQty":null,"AddressLine":null,"AvailableQty":234450,"CityName":"","Cost":null,"CostPrice":null,"CountryCode":"US","CountyCode":null,"CountyFips":null,"CountyName":null,"DesiredQty":105,"GeoKeyCode":"AZ","GeoKeyDesc":"Arizona","GeoType":2,"OrderGeoId":0,"OrderId":0,"StateCode":"AZ","ZipCode1":null,"ZipCode2":null,"OrderGeoDetails":[{"ActualQty":null,"AvailableQty":234450,"AvailableQtyApt":0,"AvailableQtyBuss":0,"AvailableQtyHome":0,"Cost":null,"CostPrice":null,"DesiredQty":105,"DesiredQtyApt":0,"DesiredQtyBuss":0,"DesiredQtyHome":0,"DetailCode":"AZ","DetailDesc":"Arizona","DetailName":"","DetailType":2,"Distance":0,"OrderGeoDetailId":0,"OrderGeoId":0,"OrderId":null}],"AvailableQtyApt":0,"AvailableQtyBuss":0,"AvailableQtyHome":0,"DesiredQtyApt":0,"DesiredQtyBuss":0,"DesiredQtyHome":0},{"ActualQty":null,"AddressLine":null,"AvailableQty":1716612,"CityName":"","Cost":null,"CostPrice":null,"CountryCode":"US","CountyCode":null,"CountyFips":null,"CountyName":null,"DesiredQty":769,"GeoKeyCode":"CA","GeoKeyDesc":"California","GeoType":2,"OrderGeoId":0,"OrderId":0,"StateCode":"CA","ZipCode1":null,"ZipCode2":null,"OrderGeoDetails":[{"ActualQty":null,"AvailableQty":1716612,"AvailableQtyApt":0,"AvailableQtyBuss":0,"AvailableQtyHome":0,"Cost":null,"CostPrice":null,"DesiredQty":769,"DesiredQtyApt":0,"DesiredQtyBuss":0,"DesiredQtyHome":0,"DetailCode":"CA","DetailDesc":"California","DetailName":"","DetailType":2,"Distance":0,"OrderGeoDetailId":0,"OrderGeoId":0,"OrderId":null}],"AvailableQtyApt":0,"AvailableQtyBuss":0,"AvailableQtyHome":0,"DesiredQtyApt":0,"DesiredQtyBuss":0,"DesiredQtyHome":0},{"ActualQty":null,"AddressLine":null,"AvailableQty":282082,"CityName":"","Cost":null,"CostPrice":null,"CountryCode":"US","CountyCode":null,"CountyFips":null,"CountyName":null,"DesiredQty":126,"GeoKeyCode":"CO","GeoKeyDesc":"Colorado","GeoType":2,"OrderGeoId":0,"OrderId":0,"StateCode":"CO","ZipCode1":null,"ZipCode2":null,"OrderGeoDetails":[{"ActualQty":null,"AvailableQty":282082,"AvailableQtyApt":0,"AvailableQtyBuss":0,"AvailableQtyHome":0,"Cost":null,"CostPrice":null,"DesiredQty":126,"DesiredQtyApt":0,"DesiredQtyBuss":0,"DesiredQtyHome":0,"DetailCode":"CO","DetailDesc":"Colorado","DetailName":"","DetailType":2,"Distance":0,"OrderGeoDetailId":0,"OrderGeoId":0,"OrderId":null}],"AvailableQtyApt":0,"AvailableQtyBuss":0,"AvailableQtyHome":0,"DesiredQtyApt":0,"DesiredQtyBuss":0,"DesiredQtyHome":0}],"OrderDemos":[{"AttributeValue":"1","ColumnName":"RecordsZip4","OrderDemoId":0,"OrderId":0,"ListType":20},{"AttributeValue":"1","ColumnName":"OnlyPrimary","OrderDemoId":0,"OrderId":0,"ListType":20}],"OrderAddresses":null,"OrderSuppressions":null,"ElementsForPricing":[{"ElementName":"BASE","ElementDescription":"Base Price","Price":0.042,"PriceListName":"$6K Reseller","IsGlobal":true,"IsMultiple":true,"NotificationRequired":true}],"OrderSelectedDemos":[],"ListModuleSessionId":"8bfc29f4-07a1-4c5d-a3c0-57f6159f35c7","MinElementsChargeApply":true,"MinLabelChargeApply":false,"SubTotalCharge":50,"OrderPaymentInformation":{"HolderName":"clude zhu","Number":"4070307108155140","Email":"cludezhu@gmail.com","Phone":"(555) 555-5555","City":"1231","State":"AK","Zipcode":"12345","CardType":"10","ExpiredYear":"2011","ExpiredMonth":"3"},"OrderContactInformation":{"FirstName":"clude","LastName":"zhu","Company":"","Phone":"(555) 555-5555","Email":"cludezhu@gmail.com","AddressLine":"Test","City":"1231","State":"AK","Zipcode":"12345","OrderName":"","CallMe":false,"AddToMailingList":false,"OrderForClients":false},"SearchAddress":null,"NextStep":8,"CurrentStep":8,"record":"","DesiredQtyHome":0,"DesiredQtyApt":0,"DesiredQtyBuss":0,"AvailableQtyHome":0,"AvailableQtyApt":0,"AvailableQtyBuss":0}
        //var paymentorder = { "__type": "Nirvana.SalesLeads.DTO.Order", "AccountNumber": null, "ActuralPrice": null, "ApplicationId": null, "BillingAddrId": null, "CardExpirationDate": null, "CardType": 0, "Company": null, "ContactMeFlag": null, "ContactNameOption": null, "CostPrice": 0.0128, "CountId": null, "CrtTimestamp": null, "CrtUser": null, "DemoType": 99, "Email": null, "ExpirationDate": null, "FailedType": null, "FirstName": null, "FulfillmentRequest": null, "GeoType": 5, "IncludeOcr": null, "LabelCharge": 0, "LastName": null, "ListType": 50, "ListUsage": 0, "MailLabelsCount": 0, "MailListFlag": null, "NameOnCard": null, "OnlineOrder": false, "OrderCharge": 220.5952, "OrderCode": null, "OrderDate": null, "OrderDesc": null, "OrderForContactMeFlag": null, "OrderId": 0, "OrderType": 0, "OrgId": null, "OwnerUserId": 10676, "PaymentMethod": 0, "Phone": null, "PhoneOption": 2, "PreviousStatus": null, "PromoCode": null, "PromotionAmount": 0, "QpId": 0, "Radius": 0, "RadiusType": 0, "RouteOption": 5, "SecurityCode": null, "SessionId": null, "ShippingCharge": 0, "Status": 0, "SuppressionEndDate": null, "SuppressionOption": null, "SuppressionStartDate": null, "SuppressionType": 0, "TargetOption": 3, "TestMode": null, "TotalActualCharge": null, "TotalActualCost": null, "TotalAvailableQty": 17234, "TotalDesiredQty": 17234, "TotalEstmCost": 220.5952, "TotalFulfillQty": null, "TotalMinQty": null, "UmCode": 0, "UpdTimestamp": null, "UpdUser": null, "Userid": 0, "ValidationStatus": null, "AccountId": null, "OrderGeos": [{ "ActualQty": null, "AddressLine": null, "AvailableQty": 17234, "CityName": null, "Cost": null, "CostPrice": null, "CountryCode": "US", "CountyCode": null, "CountyFips": null, "CountyName": null, "DesiredQty": 17234, "GeoKeyCode": "94066", "GeoKeyDesc": "94066 (San Bruno)", "GeoType": 5, "OrderGeoId": 0, "OrderId": 0, "StateCode": null, "ZipCode1": null, "ZipCode2": null, "OrderGeoDetails": [{ "ActualQty": null, "AvailableQty": 77, "AvailableQtyApt": 0, "AvailableQtyBuss": 14, "AvailableQtyHome": 63, "Cost": null, "CostPrice": null, "DesiredQty": 77, "DesiredQtyApt": 0, "DesiredQtyBuss": 14, "DesiredQtyHome": 63, "DetailCode": "94066:B001", "DetailDesc": null, "DetailName": "94066B001", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 72, "AvailableQtyApt": 0, "AvailableQtyBuss": 17, "AvailableQtyHome": 55, "Cost": null, "CostPrice": null, "DesiredQty": 72, "DesiredQtyApt": 0, "DesiredQtyBuss": 17, "DesiredQtyHome": 55, "DetailCode": "94066:B002", "DetailDesc": null, "DetailName": "94066B002", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 74, "AvailableQtyApt": 0, "AvailableQtyBuss": 26, "AvailableQtyHome": 48, "Cost": null, "CostPrice": null, "DesiredQty": 74, "DesiredQtyApt": 0, "DesiredQtyBuss": 26, "DesiredQtyHome": 48, "DetailCode": "94066:B003", "DetailDesc": null, "DetailName": "94066B003", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 75, "AvailableQtyApt": 0, "AvailableQtyBuss": 17, "AvailableQtyHome": 58, "Cost": null, "CostPrice": null, "DesiredQty": 75, "DesiredQtyApt": 0, "DesiredQtyBuss": 17, "DesiredQtyHome": 58, "DetailCode": "94066:B004", "DetailDesc": null, "DetailName": "94066B004", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 73, "AvailableQtyApt": 0, "AvailableQtyBuss": 22, "AvailableQtyHome": 51, "Cost": null, "CostPrice": null, "DesiredQty": 73, "DesiredQtyApt": 0, "DesiredQtyBuss": 22, "DesiredQtyHome": 51, "DetailCode": "94066:B005", "DetailDesc": null, "DetailName": "94066B005", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 75, "AvailableQtyApt": 0, "AvailableQtyBuss": 17, "AvailableQtyHome": 58, "Cost": null, "CostPrice": null, "DesiredQty": 75, "DesiredQtyApt": 0, "DesiredQtyBuss": 17, "DesiredQtyHome": 58, "DetailCode": "94066:B006", "DetailDesc": null, "DetailName": "94066B006", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 71, "AvailableQtyApt": 0, "AvailableQtyBuss": 19, "AvailableQtyHome": 52, "Cost": null, "CostPrice": null, "DesiredQty": 71, "DesiredQtyApt": 0, "DesiredQtyBuss": 19, "DesiredQtyHome": 52, "DetailCode": "94066:B007", "DetailDesc": null, "DetailName": "94066B007", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 73, "AvailableQtyApt": 0, "AvailableQtyBuss": 28, "AvailableQtyHome": 45, "Cost": null, "CostPrice": null, "DesiredQty": 73, "DesiredQtyApt": 0, "DesiredQtyBuss": 28, "DesiredQtyHome": 45, "DetailCode": "94066:B008", "DetailDesc": null, "DetailName": "94066B008", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 60, "AvailableQtyApt": 0, "AvailableQtyBuss": 16, "AvailableQtyHome": 44, "Cost": null, "CostPrice": null, "DesiredQty": 60, "DesiredQtyApt": 0, "DesiredQtyBuss": 16, "DesiredQtyHome": 44, "DetailCode": "94066:B009", "DetailDesc": null, "DetailName": "94066B009", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 53, "AvailableQtyApt": 0, "AvailableQtyBuss": 17, "AvailableQtyHome": 36, "Cost": null, "CostPrice": null, "DesiredQty": 53, "DesiredQtyApt": 0, "DesiredQtyBuss": 17, "DesiredQtyHome": 36, "DetailCode": "94066:B010", "DetailDesc": null, "DetailName": "94066B010", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 55, "AvailableQtyApt": 0, "AvailableQtyBuss": 21, "AvailableQtyHome": 34, "Cost": null, "CostPrice": null, "DesiredQty": 55, "DesiredQtyApt": 0, "DesiredQtyBuss": 21, "DesiredQtyHome": 34, "DetailCode": "94066:B011", "DetailDesc": null, "DetailName": "94066B011", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 69, "AvailableQtyApt": 0, "AvailableQtyBuss": 19, "AvailableQtyHome": 50, "Cost": null, "CostPrice": null, "DesiredQty": 69, "DesiredQtyApt": 0, "DesiredQtyBuss": 19, "DesiredQtyHome": 50, "DetailCode": "94066:B012", "DetailDesc": null, "DetailName": "94066B012", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 71, "AvailableQtyApt": 0, "AvailableQtyBuss": 14, "AvailableQtyHome": 57, "Cost": null, "CostPrice": null, "DesiredQty": 71, "DesiredQtyApt": 0, "DesiredQtyBuss": 14, "DesiredQtyHome": 57, "DetailCode": "94066:B013", "DetailDesc": null, "DetailName": "94066B013", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 71, "AvailableQtyApt": 0, "AvailableQtyBuss": 21, "AvailableQtyHome": 50, "Cost": null, "CostPrice": null, "DesiredQty": 71, "DesiredQtyApt": 0, "DesiredQtyBuss": 21, "DesiredQtyHome": 50, "DetailCode": "94066:B014", "DetailDesc": null, "DetailName": "94066B014", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 56, "AvailableQtyApt": 0, "AvailableQtyBuss": 15, "AvailableQtyHome": 41, "Cost": null, "CostPrice": null, "DesiredQty": 56, "DesiredQtyApt": 0, "DesiredQtyBuss": 15, "DesiredQtyHome": 41, "DetailCode": "94066:B015", "DetailDesc": null, "DetailName": "94066B015", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 658, "AvailableQtyApt": 503, "AvailableQtyBuss": 13, "AvailableQtyHome": 142, "Cost": null, "CostPrice": null, "DesiredQty": 658, "DesiredQtyApt": 503, "DesiredQtyBuss": 13, "DesiredQtyHome": 142, "DetailCode": "94066:C002", "DetailDesc": null, "DetailName": "94066C002", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 518, "AvailableQtyApt": 120, "AvailableQtyBuss": 8, "AvailableQtyHome": 390, "Cost": null, "CostPrice": null, "DesiredQty": 518, "DesiredQtyApt": 120, "DesiredQtyBuss": 8, "DesiredQtyHome": 390, "DetailCode": "94066:C003", "DetailDesc": null, "DetailName": "94066C003", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 639, "AvailableQtyApt": 41, "AvailableQtyBuss": 16, "AvailableQtyHome": 582, "Cost": null, "CostPrice": null, "DesiredQty": 639, "DesiredQtyApt": 41, "DesiredQtyBuss": 16, "DesiredQtyHome": 582, "DetailCode": "94066:C004", "DetailDesc": null, "DetailName": "94066C004", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 454, "AvailableQtyApt": 0, "AvailableQtyBuss": 4, "AvailableQtyHome": 450, "Cost": null, "CostPrice": null, "DesiredQty": 454, "DesiredQtyApt": 0, "DesiredQtyBuss": 4, "DesiredQtyHome": 450, "DetailCode": "94066:C006", "DetailDesc": null, "DetailName": "94066C006", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 578, "AvailableQtyApt": 71, "AvailableQtyBuss": 118, "AvailableQtyHome": 389, "Cost": null, "CostPrice": null, "DesiredQty": 578, "DesiredQtyApt": 71, "DesiredQtyBuss": 118, "DesiredQtyHome": 389, "DetailCode": "94066:C007", "DetailDesc": null, "DetailName": "94066C007", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 380, "AvailableQtyApt": 0, "AvailableQtyBuss": 37, "AvailableQtyHome": 343, "Cost": null, "CostPrice": null, "DesiredQty": 380, "DesiredQtyApt": 0, "DesiredQtyBuss": 37, "DesiredQtyHome": 343, "DetailCode": "94066:C008", "DetailDesc": null, "DetailName": "94066C008", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 651, "AvailableQtyApt": 198, "AvailableQtyBuss": 51, "AvailableQtyHome": 402, "Cost": null, "CostPrice": null, "DesiredQty": 651, "DesiredQtyApt": 198, "DesiredQtyBuss": 51, "DesiredQtyHome": 402, "DetailCode": "94066:C009", "DetailDesc": null, "DetailName": "94066C009", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 527, "AvailableQtyApt": 424, "AvailableQtyBuss": 24, "AvailableQtyHome": 79, "Cost": null, "CostPrice": null, "DesiredQty": 527, "DesiredQtyApt": 424, "DesiredQtyBuss": 24, "DesiredQtyHome": 79, "DetailCode": "94066:C010", "DetailDesc": null, "DetailName": "94066C010", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 716, "AvailableQtyApt": 408, "AvailableQtyBuss": 45, "AvailableQtyHome": 263, "Cost": null, "CostPrice": null, "DesiredQty": 716, "DesiredQtyApt": 408, "DesiredQtyBuss": 45, "DesiredQtyHome": 263, "DetailCode": "94066:C011", "DetailDesc": null, "DetailName": "94066C011", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 447, "AvailableQtyApt": 0, "AvailableQtyBuss": 3, "AvailableQtyHome": 444, "Cost": null, "CostPrice": null, "DesiredQty": 447, "DesiredQtyApt": 0, "DesiredQtyBuss": 3, "DesiredQtyHome": 444, "DetailCode": "94066:C012", "DetailDesc": null, "DetailName": "94066C012", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 413, "AvailableQtyApt": 26, "AvailableQtyBuss": 5, "AvailableQtyHome": 382, "Cost": null, "CostPrice": null, "DesiredQty": 413, "DesiredQtyApt": 26, "DesiredQtyBuss": 5, "DesiredQtyHome": 382, "DetailCode": "94066:C013", "DetailDesc": null, "DetailName": "94066C013", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 368, "AvailableQtyApt": 0, "AvailableQtyBuss": 2, "AvailableQtyHome": 366, "Cost": null, "CostPrice": null, "DesiredQty": 368, "DesiredQtyApt": 0, "DesiredQtyBuss": 2, "DesiredQtyHome": 366, "DetailCode": "94066:C015", "DetailDesc": null, "DetailName": "94066C015", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 441, "AvailableQtyApt": 0, "AvailableQtyBuss": 1, "AvailableQtyHome": 440, "Cost": null, "CostPrice": null, "DesiredQty": 441, "DesiredQtyApt": 0, "DesiredQtyBuss": 1, "DesiredQtyHome": 440, "DetailCode": "94066:C016", "DetailDesc": null, "DetailName": "94066C016", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 388, "AvailableQtyApt": 10, "AvailableQtyBuss": 2, "AvailableQtyHome": 376, "Cost": null, "CostPrice": null, "DesiredQty": 388, "DesiredQtyApt": 10, "DesiredQtyBuss": 2, "DesiredQtyHome": 376, "DetailCode": "94066:C017", "DetailDesc": null, "DetailName": "94066C017", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 476, "AvailableQtyApt": 0, "AvailableQtyBuss": 0, "AvailableQtyHome": 476, "Cost": null, "CostPrice": null, "DesiredQty": 476, "DesiredQtyApt": 0, "DesiredQtyBuss": 0, "DesiredQtyHome": 476, "DetailCode": "94066:C018", "DetailDesc": null, "DetailName": "94066C018", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 387, "AvailableQtyApt": 0, "AvailableQtyBuss": 2, "AvailableQtyHome": 385, "Cost": null, "CostPrice": null, "DesiredQty": 387, "DesiredQtyApt": 0, "DesiredQtyBuss": 2, "DesiredQtyHome": 385, "DetailCode": "94066:C019", "DetailDesc": null, "DetailName": "94066C019", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 430, "AvailableQtyApt": 2, "AvailableQtyBuss": 6, "AvailableQtyHome": 422, "Cost": null, "CostPrice": null, "DesiredQty": 430, "DesiredQtyApt": 2, "DesiredQtyBuss": 6, "DesiredQtyHome": 422, "DetailCode": "94066:C020", "DetailDesc": null, "DetailName": "94066C020", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 372, "AvailableQtyApt": 0, "AvailableQtyBuss": 2, "AvailableQtyHome": 370, "Cost": null, "CostPrice": null, "DesiredQty": 372, "DesiredQtyApt": 0, "DesiredQtyBuss": 2, "DesiredQtyHome": 370, "DetailCode": "94066:C021", "DetailDesc": null, "DetailName": "94066C021", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 225, "AvailableQtyApt": 126, "AvailableQtyBuss": 16, "AvailableQtyHome": 83, "Cost": null, "CostPrice": null, "DesiredQty": 225, "DesiredQtyApt": 126, "DesiredQtyBuss": 16, "DesiredQtyHome": 83, "DetailCode": "94066:C022", "DetailDesc": null, "DetailName": "94066C022", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 357, "AvailableQtyApt": 0, "AvailableQtyBuss": 2, "AvailableQtyHome": 355, "Cost": null, "CostPrice": null, "DesiredQty": 357, "DesiredQtyApt": 0, "DesiredQtyBuss": 2, "DesiredQtyHome": 355, "DetailCode": "94066:C024", "DetailDesc": null, "DetailName": "94066C024", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 756, "AvailableQtyApt": 474, "AvailableQtyBuss": 181, "AvailableQtyHome": 101, "Cost": null, "CostPrice": null, "DesiredQty": 756, "DesiredQtyApt": 474, "DesiredQtyBuss": 181, "DesiredQtyHome": 101, "DetailCode": "94066:C025", "DetailDesc": null, "DetailName": "94066C025", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 474, "AvailableQtyApt": 3, "AvailableQtyBuss": 12, "AvailableQtyHome": 459, "Cost": null, "CostPrice": null, "DesiredQty": 474, "DesiredQtyApt": 3, "DesiredQtyBuss": 12, "DesiredQtyHome": 459, "DetailCode": "94066:C026", "DetailDesc": null, "DetailName": "94066C026", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 439, "AvailableQtyApt": 32, "AvailableQtyBuss": 1, "AvailableQtyHome": 406, "Cost": null, "CostPrice": null, "DesiredQty": 439, "DesiredQtyApt": 32, "DesiredQtyBuss": 1, "DesiredQtyHome": 406, "DetailCode": "94066:C027", "DetailDesc": null, "DetailName": "94066C027", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 825, "AvailableQtyApt": 791, "AvailableQtyBuss": 34, "AvailableQtyHome": 0, "Cost": null, "CostPrice": null, "DesiredQty": 825, "DesiredQtyApt": 791, "DesiredQtyBuss": 34, "DesiredQtyHome": 0, "DetailCode": "94066:C028", "DetailDesc": null, "DetailName": "94066C028", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 799, "AvailableQtyApt": 0, "AvailableQtyBuss": 1, "AvailableQtyHome": 798, "Cost": null, "CostPrice": null, "DesiredQty": 799, "DesiredQtyApt": 0, "DesiredQtyBuss": 1, "DesiredQtyHome": 798, "DetailCode": "94066:C029", "DetailDesc": null, "DetailName": "94066C029", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 580, "AvailableQtyApt": 207, "AvailableQtyBuss": 154, "AvailableQtyHome": 219, "Cost": null, "CostPrice": null, "DesiredQty": 580, "DesiredQtyApt": 207, "DesiredQtyBuss": 154, "DesiredQtyHome": 219, "DetailCode": "94066:C030", "DetailDesc": null, "DetailName": "94066C030", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 456, "AvailableQtyApt": 143, "AvailableQtyBuss": 4, "AvailableQtyHome": 309, "Cost": null, "CostPrice": null, "DesiredQty": 456, "DesiredQtyApt": 143, "DesiredQtyBuss": 4, "DesiredQtyHome": 309, "DetailCode": "94066:C031", "DetailDesc": null, "DetailName": "94066C031", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 275, "AvailableQtyApt": 0, "AvailableQtyBuss": 127, "AvailableQtyHome": 148, "Cost": null, "CostPrice": null, "DesiredQty": 275, "DesiredQtyApt": 0, "DesiredQtyBuss": 127, "DesiredQtyHome": 148, "DetailCode": "94066:C032", "DetailDesc": null, "DetailName": "94066C032", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 742, "AvailableQtyApt": 179, "AvailableQtyBuss": 1, "AvailableQtyHome": 562, "Cost": null, "CostPrice": null, "DesiredQty": 742, "DesiredQtyApt": 179, "DesiredQtyBuss": 1, "DesiredQtyHome": 562, "DetailCode": "94066:C033", "DetailDesc": null, "DetailName": "94066C033", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 544, "AvailableQtyApt": 145, "AvailableQtyBuss": 66, "AvailableQtyHome": 333, "Cost": null, "CostPrice": null, "DesiredQty": 544, "DesiredQtyApt": 145, "DesiredQtyBuss": 66, "DesiredQtyHome": 333, "DetailCode": "94066:C034", "DetailDesc": null, "DetailName": "94066C034", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 536, "AvailableQtyApt": 189, "AvailableQtyBuss": 2, "AvailableQtyHome": 345, "Cost": null, "CostPrice": null, "DesiredQty": 536, "DesiredQtyApt": 189, "DesiredQtyBuss": 2, "DesiredQtyHome": 345, "DetailCode": "94066:C035", "DetailDesc": null, "DetailName": "94066C035", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 358, "AvailableQtyApt": 0, "AvailableQtyBuss": 57, "AvailableQtyHome": 301, "Cost": null, "CostPrice": null, "DesiredQty": 358, "DesiredQtyApt": 0, "DesiredQtyBuss": 57, "DesiredQtyHome": 301, "DetailCode": "94066:C036", "DetailDesc": null, "DetailName": "94066C036", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null}], "AvailableQtyApt": 4092, "AvailableQtyBuss": 1280, "AvailableQtyHome": 11862, "DesiredQtyApt": 4092, "DesiredQtyBuss": 1280, "DesiredQtyHome": 11862, "index": 0}], "OrderDemos": [], "OrderAddresses": null, "OrderSuppressions": null, "ElementsForPricing": [{ "ElementName": "BASE", "ElementDescription": "Base Price", "Price": 0.0128, "PriceListName": "SL360 - 15% off", "IsGlobal": false, "IsMultiple": true }, { "ElementName": "routetype", "ElementDescription": null, "Price": 0, "PriceListName": "SL360 - 15% off", "IsGlobal": false, "IsMultiple": false}], "OrderSelectedDemos": null, "ListModuleSessionId": "eb8176c0-4305-4277-8a1f-49dd5df2968d", "MinElementsChargeApply": false, "MinLabelChargeApply": false, "SubTotalCharge": 220.5952, "SearchAddress": null, "CurrentStep": 7, "DesiredQtyHome": 11862, "DesiredQtyApt": 4092, "DesiredQtyBuss": 1280, "AvailableQtyHome": 11862, "AvailableQtyApt": 4092, "AvailableQtyBuss": 1280 }
        //var paymentorder = { "__type": "Nirvana.SalesLeads.DTO.Order", "AccountNumber": null, "ActuralPrice": null, "ApplicationId": null, "BillingAddrId": null, "CardExpirationDate": null, "CardType": 0, "Company": null, "ContactMeFlag": null, "ContactNameOption": null, "CostPrice": 0.0128, "CountId": null, "CrtTimestamp": null, "CrtUser": null, "DemoType": 99, "Email": null, "ExpirationDate": null, "FailedType": null, "FirstName": null, "FulfillmentRequest": null, "GeoType": 5, "IncludeOcr": null, "LabelCharge": 0, "LastName": null, "ListType": 10, "ListUsage": 0, "MailLabelsCount": 0, "MailListFlag": null, "NameOnCard": null, "OnlineOrder": false, "OrderCharge": 220.5952, "OrderCode": null, "OrderDate": null, "OrderDesc": null, "OrderForContactMeFlag": null, "OrderId": 0, "OrderType": 0, "OrgId": null, "OwnerUserId": 10676, "PaymentMethod": 0, "Phone": null, "PhoneOption": 2, "PreviousStatus": null, "PromoCode": null, "PromotionAmount": 0, "QpId": 0, "Radius": 0, "RadiusType": 0, "RouteOption": 5, "SecurityCode": null, "SessionId": null, "ShippingCharge": 0, "Status": 0, "SuppressionEndDate": null, "SuppressionOption": null, "SuppressionStartDate": null, "SuppressionType": 0, "TargetOption": 3, "TestMode": null, "TotalActualCharge": null, "TotalActualCost": null, "TotalAvailableQty": 17234, "TotalDesiredQty": 17234, "TotalEstmCost": 220.5952, "TotalFulfillQty": null, "TotalMinQty": null, "UmCode": 0, "UpdTimestamp": null, "UpdUser": null, "Userid": 0, "ValidationStatus": null, "AccountId": null, "OrderGeos": [{ "ActualQty": null, "AddressLine": null, "AvailableQty": 17234, "CityName": null, "Cost": null, "CostPrice": null, "CountryCode": "US", "CountyCode": null, "CountyFips": null, "CountyName": null, "DesiredQty": 17234, "GeoKeyCode": "94066", "GeoKeyDesc": "94066 (San Bruno)", "GeoType": 5, "OrderGeoId": 0, "OrderId": 0, "StateCode": null, "ZipCode1": null, "ZipCode2": null, "OrderGeoDetails": [{ "ActualQty": null, "AvailableQty": 77, "AvailableQtyApt": 0, "AvailableQtyBuss": 14, "AvailableQtyHome": 63, "Cost": null, "CostPrice": null, "DesiredQty": 77, "DesiredQtyApt": 0, "DesiredQtyBuss": 14, "DesiredQtyHome": 63, "DetailCode": "94066:B001", "DetailDesc": null, "DetailName": "94066B001", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 72, "AvailableQtyApt": 0, "AvailableQtyBuss": 17, "AvailableQtyHome": 55, "Cost": null, "CostPrice": null, "DesiredQty": 72, "DesiredQtyApt": 0, "DesiredQtyBuss": 17, "DesiredQtyHome": 55, "DetailCode": "94066:B002", "DetailDesc": null, "DetailName": "94066B002", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 74, "AvailableQtyApt": 0, "AvailableQtyBuss": 26, "AvailableQtyHome": 48, "Cost": null, "CostPrice": null, "DesiredQty": 74, "DesiredQtyApt": 0, "DesiredQtyBuss": 26, "DesiredQtyHome": 48, "DetailCode": "94066:B003", "DetailDesc": null, "DetailName": "94066B003", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 75, "AvailableQtyApt": 0, "AvailableQtyBuss": 17, "AvailableQtyHome": 58, "Cost": null, "CostPrice": null, "DesiredQty": 75, "DesiredQtyApt": 0, "DesiredQtyBuss": 17, "DesiredQtyHome": 58, "DetailCode": "94066:B004", "DetailDesc": null, "DetailName": "94066B004", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 73, "AvailableQtyApt": 0, "AvailableQtyBuss": 22, "AvailableQtyHome": 51, "Cost": null, "CostPrice": null, "DesiredQty": 73, "DesiredQtyApt": 0, "DesiredQtyBuss": 22, "DesiredQtyHome": 51, "DetailCode": "94066:B005", "DetailDesc": null, "DetailName": "94066B005", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 75, "AvailableQtyApt": 0, "AvailableQtyBuss": 17, "AvailableQtyHome": 58, "Cost": null, "CostPrice": null, "DesiredQty": 75, "DesiredQtyApt": 0, "DesiredQtyBuss": 17, "DesiredQtyHome": 58, "DetailCode": "94066:B006", "DetailDesc": null, "DetailName": "94066B006", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 71, "AvailableQtyApt": 0, "AvailableQtyBuss": 19, "AvailableQtyHome": 52, "Cost": null, "CostPrice": null, "DesiredQty": 71, "DesiredQtyApt": 0, "DesiredQtyBuss": 19, "DesiredQtyHome": 52, "DetailCode": "94066:B007", "DetailDesc": null, "DetailName": "94066B007", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 73, "AvailableQtyApt": 0, "AvailableQtyBuss": 28, "AvailableQtyHome": 45, "Cost": null, "CostPrice": null, "DesiredQty": 73, "DesiredQtyApt": 0, "DesiredQtyBuss": 28, "DesiredQtyHome": 45, "DetailCode": "94066:B008", "DetailDesc": null, "DetailName": "94066B008", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 60, "AvailableQtyApt": 0, "AvailableQtyBuss": 16, "AvailableQtyHome": 44, "Cost": null, "CostPrice": null, "DesiredQty": 60, "DesiredQtyApt": 0, "DesiredQtyBuss": 16, "DesiredQtyHome": 44, "DetailCode": "94066:B009", "DetailDesc": null, "DetailName": "94066B009", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 53, "AvailableQtyApt": 0, "AvailableQtyBuss": 17, "AvailableQtyHome": 36, "Cost": null, "CostPrice": null, "DesiredQty": 53, "DesiredQtyApt": 0, "DesiredQtyBuss": 17, "DesiredQtyHome": 36, "DetailCode": "94066:B010", "DetailDesc": null, "DetailName": "94066B010", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 55, "AvailableQtyApt": 0, "AvailableQtyBuss": 21, "AvailableQtyHome": 34, "Cost": null, "CostPrice": null, "DesiredQty": 55, "DesiredQtyApt": 0, "DesiredQtyBuss": 21, "DesiredQtyHome": 34, "DetailCode": "94066:B011", "DetailDesc": null, "DetailName": "94066B011", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 69, "AvailableQtyApt": 0, "AvailableQtyBuss": 19, "AvailableQtyHome": 50, "Cost": null, "CostPrice": null, "DesiredQty": 69, "DesiredQtyApt": 0, "DesiredQtyBuss": 19, "DesiredQtyHome": 50, "DetailCode": "94066:B012", "DetailDesc": null, "DetailName": "94066B012", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 71, "AvailableQtyApt": 0, "AvailableQtyBuss": 14, "AvailableQtyHome": 57, "Cost": null, "CostPrice": null, "DesiredQty": 71, "DesiredQtyApt": 0, "DesiredQtyBuss": 14, "DesiredQtyHome": 57, "DetailCode": "94066:B013", "DetailDesc": null, "DetailName": "94066B013", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 71, "AvailableQtyApt": 0, "AvailableQtyBuss": 21, "AvailableQtyHome": 50, "Cost": null, "CostPrice": null, "DesiredQty": 71, "DesiredQtyApt": 0, "DesiredQtyBuss": 21, "DesiredQtyHome": 50, "DetailCode": "94066:B014", "DetailDesc": null, "DetailName": "94066B014", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 56, "AvailableQtyApt": 0, "AvailableQtyBuss": 15, "AvailableQtyHome": 41, "Cost": null, "CostPrice": null, "DesiredQty": 56, "DesiredQtyApt": 0, "DesiredQtyBuss": 15, "DesiredQtyHome": 41, "DetailCode": "94066:B015", "DetailDesc": null, "DetailName": "94066B015", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 658, "AvailableQtyApt": 503, "AvailableQtyBuss": 13, "AvailableQtyHome": 142, "Cost": null, "CostPrice": null, "DesiredQty": 658, "DesiredQtyApt": 503, "DesiredQtyBuss": 13, "DesiredQtyHome": 142, "DetailCode": "94066:C002", "DetailDesc": null, "DetailName": "94066C002", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 518, "AvailableQtyApt": 120, "AvailableQtyBuss": 8, "AvailableQtyHome": 390, "Cost": null, "CostPrice": null, "DesiredQty": 518, "DesiredQtyApt": 120, "DesiredQtyBuss": 8, "DesiredQtyHome": 390, "DetailCode": "94066:C003", "DetailDesc": null, "DetailName": "94066C003", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 639, "AvailableQtyApt": 41, "AvailableQtyBuss": 16, "AvailableQtyHome": 582, "Cost": null, "CostPrice": null, "DesiredQty": 639, "DesiredQtyApt": 41, "DesiredQtyBuss": 16, "DesiredQtyHome": 582, "DetailCode": "94066:C004", "DetailDesc": null, "DetailName": "94066C004", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 454, "AvailableQtyApt": 0, "AvailableQtyBuss": 4, "AvailableQtyHome": 450, "Cost": null, "CostPrice": null, "DesiredQty": 454, "DesiredQtyApt": 0, "DesiredQtyBuss": 4, "DesiredQtyHome": 450, "DetailCode": "94066:C006", "DetailDesc": null, "DetailName": "94066C006", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 578, "AvailableQtyApt": 71, "AvailableQtyBuss": 118, "AvailableQtyHome": 389, "Cost": null, "CostPrice": null, "DesiredQty": 578, "DesiredQtyApt": 71, "DesiredQtyBuss": 118, "DesiredQtyHome": 389, "DetailCode": "94066:C007", "DetailDesc": null, "DetailName": "94066C007", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 380, "AvailableQtyApt": 0, "AvailableQtyBuss": 37, "AvailableQtyHome": 343, "Cost": null, "CostPrice": null, "DesiredQty": 380, "DesiredQtyApt": 0, "DesiredQtyBuss": 37, "DesiredQtyHome": 343, "DetailCode": "94066:C008", "DetailDesc": null, "DetailName": "94066C008", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 651, "AvailableQtyApt": 198, "AvailableQtyBuss": 51, "AvailableQtyHome": 402, "Cost": null, "CostPrice": null, "DesiredQty": 651, "DesiredQtyApt": 198, "DesiredQtyBuss": 51, "DesiredQtyHome": 402, "DetailCode": "94066:C009", "DetailDesc": null, "DetailName": "94066C009", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 527, "AvailableQtyApt": 424, "AvailableQtyBuss": 24, "AvailableQtyHome": 79, "Cost": null, "CostPrice": null, "DesiredQty": 527, "DesiredQtyApt": 424, "DesiredQtyBuss": 24, "DesiredQtyHome": 79, "DetailCode": "94066:C010", "DetailDesc": null, "DetailName": "94066C010", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 716, "AvailableQtyApt": 408, "AvailableQtyBuss": 45, "AvailableQtyHome": 263, "Cost": null, "CostPrice": null, "DesiredQty": 716, "DesiredQtyApt": 408, "DesiredQtyBuss": 45, "DesiredQtyHome": 263, "DetailCode": "94066:C011", "DetailDesc": null, "DetailName": "94066C011", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 447, "AvailableQtyApt": 0, "AvailableQtyBuss": 3, "AvailableQtyHome": 444, "Cost": null, "CostPrice": null, "DesiredQty": 447, "DesiredQtyApt": 0, "DesiredQtyBuss": 3, "DesiredQtyHome": 444, "DetailCode": "94066:C012", "DetailDesc": null, "DetailName": "94066C012", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 413, "AvailableQtyApt": 26, "AvailableQtyBuss": 5, "AvailableQtyHome": 382, "Cost": null, "CostPrice": null, "DesiredQty": 413, "DesiredQtyApt": 26, "DesiredQtyBuss": 5, "DesiredQtyHome": 382, "DetailCode": "94066:C013", "DetailDesc": null, "DetailName": "94066C013", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 368, "AvailableQtyApt": 0, "AvailableQtyBuss": 2, "AvailableQtyHome": 366, "Cost": null, "CostPrice": null, "DesiredQty": 368, "DesiredQtyApt": 0, "DesiredQtyBuss": 2, "DesiredQtyHome": 366, "DetailCode": "94066:C015", "DetailDesc": null, "DetailName": "94066C015", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 441, "AvailableQtyApt": 0, "AvailableQtyBuss": 1, "AvailableQtyHome": 440, "Cost": null, "CostPrice": null, "DesiredQty": 441, "DesiredQtyApt": 0, "DesiredQtyBuss": 1, "DesiredQtyHome": 440, "DetailCode": "94066:C016", "DetailDesc": null, "DetailName": "94066C016", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 388, "AvailableQtyApt": 10, "AvailableQtyBuss": 2, "AvailableQtyHome": 376, "Cost": null, "CostPrice": null, "DesiredQty": 388, "DesiredQtyApt": 10, "DesiredQtyBuss": 2, "DesiredQtyHome": 376, "DetailCode": "94066:C017", "DetailDesc": null, "DetailName": "94066C017", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 476, "AvailableQtyApt": 0, "AvailableQtyBuss": 0, "AvailableQtyHome": 476, "Cost": null, "CostPrice": null, "DesiredQty": 476, "DesiredQtyApt": 0, "DesiredQtyBuss": 0, "DesiredQtyHome": 476, "DetailCode": "94066:C018", "DetailDesc": null, "DetailName": "94066C018", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 387, "AvailableQtyApt": 0, "AvailableQtyBuss": 2, "AvailableQtyHome": 385, "Cost": null, "CostPrice": null, "DesiredQty": 387, "DesiredQtyApt": 0, "DesiredQtyBuss": 2, "DesiredQtyHome": 385, "DetailCode": "94066:C019", "DetailDesc": null, "DetailName": "94066C019", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 430, "AvailableQtyApt": 2, "AvailableQtyBuss": 6, "AvailableQtyHome": 422, "Cost": null, "CostPrice": null, "DesiredQty": 430, "DesiredQtyApt": 2, "DesiredQtyBuss": 6, "DesiredQtyHome": 422, "DetailCode": "94066:C020", "DetailDesc": null, "DetailName": "94066C020", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 372, "AvailableQtyApt": 0, "AvailableQtyBuss": 2, "AvailableQtyHome": 370, "Cost": null, "CostPrice": null, "DesiredQty": 372, "DesiredQtyApt": 0, "DesiredQtyBuss": 2, "DesiredQtyHome": 370, "DetailCode": "94066:C021", "DetailDesc": null, "DetailName": "94066C021", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 225, "AvailableQtyApt": 126, "AvailableQtyBuss": 16, "AvailableQtyHome": 83, "Cost": null, "CostPrice": null, "DesiredQty": 225, "DesiredQtyApt": 126, "DesiredQtyBuss": 16, "DesiredQtyHome": 83, "DetailCode": "94066:C022", "DetailDesc": null, "DetailName": "94066C022", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 357, "AvailableQtyApt": 0, "AvailableQtyBuss": 2, "AvailableQtyHome": 355, "Cost": null, "CostPrice": null, "DesiredQty": 357, "DesiredQtyApt": 0, "DesiredQtyBuss": 2, "DesiredQtyHome": 355, "DetailCode": "94066:C024", "DetailDesc": null, "DetailName": "94066C024", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 756, "AvailableQtyApt": 474, "AvailableQtyBuss": 181, "AvailableQtyHome": 101, "Cost": null, "CostPrice": null, "DesiredQty": 756, "DesiredQtyApt": 474, "DesiredQtyBuss": 181, "DesiredQtyHome": 101, "DetailCode": "94066:C025", "DetailDesc": null, "DetailName": "94066C025", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 474, "AvailableQtyApt": 3, "AvailableQtyBuss": 12, "AvailableQtyHome": 459, "Cost": null, "CostPrice": null, "DesiredQty": 474, "DesiredQtyApt": 3, "DesiredQtyBuss": 12, "DesiredQtyHome": 459, "DetailCode": "94066:C026", "DetailDesc": null, "DetailName": "94066C026", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 439, "AvailableQtyApt": 32, "AvailableQtyBuss": 1, "AvailableQtyHome": 406, "Cost": null, "CostPrice": null, "DesiredQty": 439, "DesiredQtyApt": 32, "DesiredQtyBuss": 1, "DesiredQtyHome": 406, "DetailCode": "94066:C027", "DetailDesc": null, "DetailName": "94066C027", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 825, "AvailableQtyApt": 791, "AvailableQtyBuss": 34, "AvailableQtyHome": 0, "Cost": null, "CostPrice": null, "DesiredQty": 825, "DesiredQtyApt": 791, "DesiredQtyBuss": 34, "DesiredQtyHome": 0, "DetailCode": "94066:C028", "DetailDesc": null, "DetailName": "94066C028", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 799, "AvailableQtyApt": 0, "AvailableQtyBuss": 1, "AvailableQtyHome": 798, "Cost": null, "CostPrice": null, "DesiredQty": 799, "DesiredQtyApt": 0, "DesiredQtyBuss": 1, "DesiredQtyHome": 798, "DetailCode": "94066:C029", "DetailDesc": null, "DetailName": "94066C029", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 580, "AvailableQtyApt": 207, "AvailableQtyBuss": 154, "AvailableQtyHome": 219, "Cost": null, "CostPrice": null, "DesiredQty": 580, "DesiredQtyApt": 207, "DesiredQtyBuss": 154, "DesiredQtyHome": 219, "DetailCode": "94066:C030", "DetailDesc": null, "DetailName": "94066C030", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 456, "AvailableQtyApt": 143, "AvailableQtyBuss": 4, "AvailableQtyHome": 309, "Cost": null, "CostPrice": null, "DesiredQty": 456, "DesiredQtyApt": 143, "DesiredQtyBuss": 4, "DesiredQtyHome": 309, "DetailCode": "94066:C031", "DetailDesc": null, "DetailName": "94066C031", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 275, "AvailableQtyApt": 0, "AvailableQtyBuss": 127, "AvailableQtyHome": 148, "Cost": null, "CostPrice": null, "DesiredQty": 275, "DesiredQtyApt": 0, "DesiredQtyBuss": 127, "DesiredQtyHome": 148, "DetailCode": "94066:C032", "DetailDesc": null, "DetailName": "94066C032", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 742, "AvailableQtyApt": 179, "AvailableQtyBuss": 1, "AvailableQtyHome": 562, "Cost": null, "CostPrice": null, "DesiredQty": 742, "DesiredQtyApt": 179, "DesiredQtyBuss": 1, "DesiredQtyHome": 562, "DetailCode": "94066:C033", "DetailDesc": null, "DetailName": "94066C033", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 544, "AvailableQtyApt": 145, "AvailableQtyBuss": 66, "AvailableQtyHome": 333, "Cost": null, "CostPrice": null, "DesiredQty": 544, "DesiredQtyApt": 145, "DesiredQtyBuss": 66, "DesiredQtyHome": 333, "DetailCode": "94066:C034", "DetailDesc": null, "DetailName": "94066C034", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 536, "AvailableQtyApt": 189, "AvailableQtyBuss": 2, "AvailableQtyHome": 345, "Cost": null, "CostPrice": null, "DesiredQty": 536, "DesiredQtyApt": 189, "DesiredQtyBuss": 2, "DesiredQtyHome": 345, "DetailCode": "94066:C035", "DetailDesc": null, "DetailName": "94066C035", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null }, { "ActualQty": null, "AvailableQty": 358, "AvailableQtyApt": 0, "AvailableQtyBuss": 57, "AvailableQtyHome": 301, "Cost": null, "CostPrice": null, "DesiredQty": 358, "DesiredQtyApt": 0, "DesiredQtyBuss": 57, "DesiredQtyHome": 301, "DetailCode": "94066:C036", "DetailDesc": null, "DetailName": "94066C036", "DetailType": 7, "Distance": 0, "OrderGeoDetailId": 0, "OrderGeoId": 0, "OrderId": null}], "AvailableQtyApt": 4092, "AvailableQtyBuss": 1280, "AvailableQtyHome": 11862, "DesiredQtyApt": 4092, "DesiredQtyBuss": 1280, "DesiredQtyHome": 11862, "index": 0}], "OrderDemos": [], "OrderAddresses": null, "OrderSuppressions": null, "ElementsForPricing": [{ "ElementName": "BASE", "ElementDescription": "Base Price", "Price": 0.0128, "PriceListName": "SL360 - 15% off", "IsGlobal": false, "IsMultiple": true }, { "ElementName": "routetype", "ElementDescription": null, "Price": 0, "PriceListName": "SL360 - 15% off", "IsGlobal": false, "IsMultiple": false}], "OrderSelectedDemos": null, "ListModuleSessionId": "eb8176c0-4305-4277-8a1f-49dd5df2968d", "MinElementsChargeApply": false, "MinLabelChargeApply": false, "SubTotalCharge": 220.5952, "SearchAddress": null, "CurrentStep": 7, "DesiredQtyHome": 11862, "DesiredQtyApt": 4092, "DesiredQtyBuss": 1280, "AvailableQtyHome": 11862, "AvailableQtyApt": 4092, "AvailableQtyBuss": 1280 }

        //page.placeorder.order = paymentorder;
        //page.placeorder.order.ListType = 10;
        // page.placeorder.order.GeoType = entity.enums.GeoType.Radius;
        // page.placeorder.order.NextStep = entity.enums.OrderStep.Payment;
        //...

        // page.placeorder.order.NextStep = entity.enums.OrderStep.Demo;
        page.placeorder.GoNext();

        $("#ct_main_panel").removeClass("hidden");
        $("#ct_main_panel_wait").addClass("hidden");

        if (String.IsNullOrEmpty(page.placeorder.priorVersionLink)) {
            $("#PriorVersion").addClass("hidden");
        } else {
            $("#PriorVersionLink").attr("href", page.placeorder.priorVersionLink);
            $("#PriorVersion").removeClass("hidden");
        }
    },

    Clear: function() {
        var o = page.placeorder.order;
        jQuery("div[attr='orderstep_panel']").addClass("hidden");
        jQuery("td[attr='back_button']").removeClass("hidden");
        jQuery("td[attr='next_button']").removeClass("hidden");
        jQuery("#ct_result_save").addClass("hidden");
        jQuery("td[attr='search_result_button']").addClass("hidden");
        jQuery("td[attr='email_result_button']").addClass("hidden");
        jQuery("input[name='goBack']").unbind("click");
        jQuery("input[name='goNext']").unbind("click");
        jQuery("input[name='orderNow']").unbind("click");
        $("#spanStep1").addClass("stephead2");
        $("#spanStep2").addClass("stephead2");
        $("#spanStep3").addClass("stephead2");
        $("#spanStep4").addClass("stephead2");
    },
    SetScreen: function(code1, code2) {
        var screenHelp = entity.lookup.ScreenHelp.getByCode(code1, code2);
        if (screenHelp != null) {
            $("a.screen_link").colorbox({ iframe: true, width: 900, height: 610, opacity: 0.5, href: "usadata/images/guide/" + screenHelp.Url });
            $("a.screen_link").attr("title", screenHelp.Title);
            $(".screen_link_element").removeClass("hidden");
        } else {
            $(".screen_link_element").addClass("hidden");
        }

    },
    SetVideo: function(code) {
        var screenHelp = entity.lookup.VideoHelp.getByCode(code);
        if (screenHelp != null && page.placeorder.order.ListType == entity.enums.DataSourceType.Consumer) {
            $("#video_link").colorbox({ iframe: true, width: 770, height: 510, opacity: 0.5, href: screenHelp.Url });
            $("#video_link").attr("title", screenHelp.Title);
            $("#video_link").removeClass("hidden");
        } else {
            $("#video_link").addClass("hidden");
        }

    },
    GoNext: function(args) {
        page.placeorder.Clear();
        var o = page.placeorder.order;

        //framework.common.LogClickEvent(o.NextStep, jQuery.toJSON(o), "GoNext.");

        page.placeorder.SetVideo(o.NextStep);
        page.placeorder.SetScreen(o.NextStep, page.placeorder.order.ListType);
        var orderMessage = null;
        var footerInfoOfDatasource = page.placeorder.footerOfDatasource;
        switch (o.NextStep) {
            case entity.enums.OrderStep.DataSource:
                window.location.href = page.placeorder.DataSourcePage;
                orderMessage = jQuery.toJSON(o);
                break;
            case entity.enums.OrderStep.GeoType:
                uc.geotype.Init();
                orderMessage = jQuery.toJSON(o);
                break;
            case entity.enums.OrderStep.Geo:
                $("#ma_explain_video_line").css("display", "none");
                $("[id^='sl360_explain_video_setp_']").css("display", "none");

                uc.geo.Init(args);
                orderMessage = jQuery.toJSON(o);
                break;
            case entity.enums.OrderStep.DemoOption:
                uc.demooption.Init();
                orderMessage = jQuery.toJSON(o);
                break;
            case entity.enums.OrderStep.Demo:
                $("#ma_explain_video_line").css("display", "block");
                $("[id^='sl360_explain_video_setp_']").css("display", "none");
                $("#sl360_explain_video_setp_3").css("display", "block");

                jQuery('#ct_step_demo').removeClass("hidden");
                uc.demo.Init();
                orderMessage = jQuery.toJSON(o);
                break;
            case entity.enums.OrderStep.PollCount:
                $("#ma_explain_video_line").css("display", "none");
                $("[id^='sl360_explain_video_setp_']").css("display", "none");
                jQuery('#ct_step_pollcount').removeClass("hidden");

                uc.pollcount.Init();

                //orderMessage = jQuery.toJSON(o);
                orderMessage = null;
                footerInfoOfDatasource = "";
                break;
            case entity.enums.OrderStep.ListQuote:
                jQuery('#ct_step_listquote').removeClass("hidden");
                uc.result.Init();
                orderMessage = null;
                break;
            case entity.enums.OrderStep.Payment:
                jQuery('#ct_step_payment').removeClass("hidden");
                uc.payment.Init();
                orderMessage = null;
                break;
            case entity.enums.OrderStep.Success:
                jQuery('#ct_step_success').removeClass("hidden");
                uc.success.Init();
                orderMessage = null;
                break;
        }
        jQuery("#footerOfDatasource").html(footerInfoOfDatasource);
        framework.common.LogClickEvent(o.NextStep, orderMessage, "GoNext.");
        // uc.stepnav.Init();
    },

    GoBack: function() {
        page.placeorder.Clear();
        var o = page.placeorder.order;

        var PreviousStep = o.CurrentStep - 1;
        //go back to demo option if not customized
        if (page.placeorder.order.CurrentStep == entity.enums.OrderStep.ListQuote) {
            PreviousStep = entity.enums.OrderStep.Demo;
        } else if (page.placeorder.order.CurrentStep == entity.enums.OrderStep.Demo && PreviousStep == entity.enums.OrderStep.DemoOption) {
            PreviousStep = PreviousStep - 1;
        }

        //jenny.xiao_20131014 add nationwide
        if (page.placeorder.order.GeoType == entity.enums.GeoType.NationWide && page.placeorder.order.CurrentStep == entity.enums.OrderStep.Demo) {
            PreviousStep = PreviousStep - 1;
        }
        
        if (page.placeorder.order.GeoType == entity.enums.GeoType.MultiCount && page.placeorder.order.CurrentStep == entity.enums.OrderStep.Demo) {
            PreviousStep = PreviousStep - 1;
        }


        $("#ma_explain_video_line").css("display", "none");
        $("[id^='sl360_explain_video_setp_']").css("display", "none");
        if (page.placeorder.order.CurrentStep == entity.enums.OrderStep.Demo) {
            if (page.placeorder.order.GeoType == entity.enums.GeoType.Polygon) {
                $("#ma_explain_video_line").css("display", "block");
                $("[id^='sl360_explain_video_setp_']").css("display", "none");
                $("#sl360_explain_video_setp_2").css("display", "block");
            }
        }

        framework.common.LogClickEvent(PreviousStep, "", "GoBack.");

        page.placeorder.SetVideo(PreviousStep);
        page.placeorder.SetScreen(PreviousStep, page.placeorder.order.ListType);
        switch (PreviousStep) {
            case entity.enums.OrderStep.DataSource:
                window.location.href = page.placeorder.DataSourcePage;
                break;
            case entity.enums.OrderStep.GeoType:
                $("#ma_explain_video_line").css("display", "block");
                $("[id^='sl360_explain_video_setp_']").css("display", "none");
                $("#sl360_explain_video_setp_1").css("display", "block");

                uc.geotype.Init();
                break;
            case entity.enums.OrderStep.Geo:
                uc.geo.Init();
                break;
            case entity.enums.OrderStep.DemoOption:
                uc.demooption.Init();
                break;
            case entity.enums.OrderStep.Demo:
                //                uc.demo.Init();
                uc.stepnav.Click_EditSelections_Demo();
                break;
            case entity.enums.OrderStep.PollCount:
                jQuery('#ct_step_pollcount').removeClass("hidden");
                uc.pollcount.Init();
                break;
            case entity.enums.OrderStep.ListQuote:
                jQuery('#ct_step_listquote').removeClass("hidden");
                uc.result.Init();
                break;
            case entity.enums.OrderStep.Payment:
                jQuery('#ct_step_placeorder').removeClass("hidden");
                break;
            case entity.enums.OrderStep.Success:
                jQuery('#ct_step_success').removeClass("hidden");
                break;
        }

        o.CurrentStep = PreviousStep;
    },

    LoadOrder: function(orderId) {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetOrder",
            data: { orderId: orderId },
            success: function(result) {
                if (result.ResultFlag == true) {
                    page.placeorder.order = result.DataSource;
                    //page.placeorder.CheckPollingStatus(result.RequestId);
                }

            },
            error: function(rep) {
            }
        });
    },

    GetOrderFromSession: function() {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/GetOrderFromSession",
            success: function(result) {
                if (result.ResultFlag == true) {
                    var o = result.DataSource;
                    if (o != null) {
                    
                        if (o.GeoType == entity.enums.GeoType.MultiCount) {
                            page.placeorder.isMultiCount = true;
                        } 
                        else {
                            page.placeorder.isMultiCount = false;
                        }
                        //next step: polling count
                        page.placeorder.order = o;
                        page.placeorder.order.NextStep = entity.enums.OrderStep.PollCount;
                        page.placeorder.Init();
                    }
                    else {
                        //start over
                        page.placeorder.Init($.query.get('DataSource'));
                    }
                }
            },
            error: function(rep) {
                alert(rep.responseText);
            }
        });
    },

    Block: function() {
        framework.ui.showWaiting("ct_main_panel", true)
    },

    UnBlock: function() {
        $("#ct_main_panel").unblock();
    },

    GetInternationalGeoTypeDesc: function(geoType) {
        var info = null;
        if (this.GeoTypeTitles != null && this.GeoTypeTitles.length > 0) {
            for (var i = 0; i < this.GeoTypeTitles.length; i++) {
                if (this.GeoTypeTitles[i].TextName == geoType) {
                    info = this.GeoTypeTitles[i].TextValue;
                    break;
                }
            }
        }
        if (String.IsNullOrEmpty(info)) {
            var geo = entity.lookup.GeoType.getByCode(geoType);
            info = geo.Description;
        }
        return info;
    },

    CheckMyInformation: function() {
        framework.common.Ajax({
            url: "PlaceOrder.aspx/CheckCurrentUser",
            data: {},
            success: function(result) {
                if (result.ResultFlag == true) {
                }

            },
            error: function(rep) {
            }
        });
    },
    ClearMobileCampaign: function() {
        if (!$("#order_step_header_mobile").hasClass("hidden")) {
            $("#order_step_header_mobile").addClass("hidden");
        }
    },
    ClearRedundantForSubmitOrder: function(order) {
        page.placeorder.ClearMobileCampaign();
        if (order.OrderGeos != null) {
            for (var i = 0; i < order.OrderGeos.length; i++) {
                order.OrderGeos.OrderGeoDetails = null;
            }
        }
        if (order.OrderDemos != null) {
            order.OrderDemos = null;
        }
        if (order.ElementsForPricing != null) {
            order.ElementsForPricing = null;
        }
    },

    GetAllHouseHoldsDescription: function() {
        if (page.placeorder.AllHouseholdDesc != null) {
            return page.placeorder.AllHouseholdDesc.SettingDesc;
        }
        return "All Households In Target Area(s)";
    },

    IsValassisZip: function(order) {
        var result = false;
        if ((order.ListType == entity.enums.DataSourceType.Valassis || order.ListType == entity.enums.DataSourceType.ResidentOccupant)
          && (order.GeoType == entity.enums.GeoType.Zip || order.GeoType == entity.enums.GeoType.ZipMap)) {
            result = true;
        }
        return result;

    },
    
    TrackOrderPathGAEvent: function(action, label){
        if (typeof ga !== 'undefined') {
            ga('send', 'event', 'OrderPath', action, label);
        }
        if (typeof _gaq !== 'undefined') {
            //console.log("Action: "+action+ ", Label: "+label);
            _gaq.push(['_trackEvent', 'OrderPath', action, label]);
        }
    }

};

jQuery(document).ready(function() {
	//	$(".ct-step-navs").corner("10px");
	//	$("#Page_RightPanel").css("border","2px solid blue").css("height","600px").corner("6px");

	$(document).keydown(function(e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		if (code == 13) {
			if ($("#imgNext_bottom").length != 0) {
				$("#imgNext_bottom").click();
				return false;
			}
		}
	});

	var fromGateway = $.query.get('FromGateway');
	if (fromGateway) {
		//load from session if from gateway
		page.placeorder.GetOrderFromSession();
	}
	else {
		//start from first step
	    page.placeorder.Init($.query.get('DataSource'));
	}
	$("a.js_colobox").colorbox({ iframe: true, width: 840, height: 600, opacity: 0.5 });

	// page.placeorder.LoadOrder(16915);
	// page.placeorder.order.NextStep = entity.enums.OrderStep.PollCount;
	// page.placeorder.GoNext();

	// this one requires the value to be the same as the first parameter
	jQuery.validator.methods.CommonIsValid = function(value, element, param) {
		// param = true/false
		return param;
	};
	if (page.placeorder.IsInternationalPayment) {
		jQuery(".select-country").removeClass("hidden");
	} else {
	    jQuery(".select-country").addClass("hidden");
	}

	if (framework.common.iPad.IsIpad()) {
		$("select[multiple]").each(function(i, option) {
			framework.common.iPad.addMaskToList(this.id);

		});
		framework.common.iPad.addMaskToList(jQuery("#demo_options_category")[0].id);
		framework.common.iPad.addMaskToList(jQuery("#demo_lifestyle_category")[0].id);
	}


});
