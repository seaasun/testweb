ni.RegisterNameSpace("helper");

helper.Order = function() {
    this.RecaculateTotalQty = function(order) {
        if (order.OrderGeos.length > 0) {
            order.DesiredQtyHome = 0;
            order.DesiredQtyApt = 0;
            order.DesiredQtyBuss = 0;
            order.AvailableQtyHome = 0;
            order.AvailableQtyApt = 0;
            order.AvailableQtyBuss = 0;
            order.TotalDesiredQty = 0;
            order.TotalAvailableQty = 0;
            order.TotalEmailDesiredQty = 0;
            $.each(order.OrderGeos, function(index, value) {
                order.DesiredQtyHome += value.DesiredQtyHome;
                order.DesiredQtyApt += value.DesiredQtyApt;
                order.DesiredQtyBuss += value.DesiredQtyBuss;
                order.AvailableQtyHome += value.AvailableQtyHome;
                order.AvailableQtyApt += value.AvailableQtyApt;
                order.AvailableQtyBuss += value.AvailableQtyBuss;
                order.TotalDesiredQty += value.DesiredQty;
                order.TotalAvailableQty += value.AvailableQty;
                order.TotalEmailDesiredQty += value.EmailDesiredQty;

            });
        }
        // order.TotalDesiredQty = order.DesiredQtyHome + order.DesiredQtyApt + order.DesiredQtyBuss;
        // order.TotalAvailableQty = order.AvailableQtyHome + order.AvailableQtyApt + order.AvailableQtyBuss;
    };

    this.RecaculateTotalGeoQtyAll = function(order) {

        for (var i = 0; i < order.OrderGeos.length; i++) {
            var geo = order.OrderGeos[i];
            geo.DesiredQtyHome = 0;
            geo.DesiredQtyApt = 0;
            geo.DesiredQtyBuss = 0;
            geo.AvailableQtyHome = 0;
            geo.AvailableQtyApt = 0;
            geo.AvailableQtyBuss = 0;
            $.each(order.OrderGeos[i].OrderGeoDetails, function(index, value) {
                geo.DesiredQtyHome += value.DesiredQtyHome;
                geo.DesiredQtyApt += value.DesiredQtyApt;
                geo.DesiredQtyBuss += value.DesiredQtyBuss;
                geo.AvailableQtyHome += value.AvailableQtyHome;
                geo.AvailableQtyApt += value.AvailableQtyApt;
                geo.AvailableQtyBuss += value.AvailableQtyBuss;
            });
            geo.DesiredQty = geo.DesiredQtyHome + geo.DesiredQtyApt + geo.DesiredQtyBuss;
            geo.AvailableQty = geo.AvailableQtyHome + geo.AvailableQtyApt + geo.AvailableQtyBuss;
        }



        this.RecaculateTotalQty(order);
    };


    this.RecaculateTotalGeoQty = function(order, geoIndex) {
        var geo = order.OrderGeos[geoIndex];
        geo.DesiredQtyHome = 0;
        geo.DesiredQtyApt = 0;
        geo.DesiredQtyBuss = 0;
        geo.AvailableQtyHome = 0;
        geo.AvailableQtyApt = 0;
        geo.AvailableQtyBuss = 0;
        geo.DesiredQty = 0;
        geo.AvailableQty = 0;
        geo.EmailDesiredQty = 0;
        geo.EmailAvailableQty = 0;
        $.each(order.OrderGeos[geoIndex].OrderGeoDetails, function(index, value) {
            if (order.ListType == 50) {
                geo.DesiredQtyHome += value.DesiredQtyHome;
                geo.DesiredQtyApt += value.DesiredQtyApt;
                geo.DesiredQtyBuss += value.DesiredQtyBuss;
                geo.AvailableQtyHome += value.AvailableQtyHome;
                geo.AvailableQtyApt += value.AvailableQtyApt;
                geo.AvailableQtyBuss += value.AvailableQtyBuss;
            } else {
                geo.DesiredQty += value.DesiredQty;
                geo.AvailableQty += value.AvailableQty;
                geo.EmailDesiredQty = value.Email_DesiredQty;
                geo.EmailAvailableQty = value.Email_AvailableQty;

            }
        });

        if (order.ListType == 50) {
            geo.DesiredQty = geo.DesiredQtyHome + geo.DesiredQtyApt + geo.DesiredQtyBuss;
            geo.AvailableQty = geo.AvailableQtyHome + geo.AvailableQtyApt + geo.AvailableQtyBuss;
        }

        this.RecaculateTotalQty(order);
    };


    this.CaculatePrice = function(order, plUser, plGlobal, promotion, metadataPriceList) {
        if (page.placeorder.order.ListType == entity.enums.DataSourceType.Mobile_Consumer_Advertising) { return; }
        order.CostPrice = this.GetSinglePrice(order, plUser, plGlobal);
        order.GoodsCost = this.GetSingleGoodsPrice(order, metadataPriceList) * order.TotalDesiredQty;
        if (metadataPriceList != undefined && metadataPriceList != null && order.GoodsCost < metadataPriceList.MapMinPrice) {
            order.GoodsCost = metadataPriceList.MapMinPrice;
        }
        // get order charge
        order.OrderCharge = order.CostPrice * order.TotalDesiredQty;
        if (order.OrderCharge < plUser.MinElementsCharge) {
            order.OrderCharge = plUser.MinElementsCharge;
        }

        // get shipping charge
        order.ShippingCharge = this.GetLabelShipCharge(order, plGlobal);
        order.LabelCharge = this.GetLabelBaseCharge(order, plGlobal);
        order.PromotionAmount = this.GetPromotionCharge(order, promotion);
        order.ServiceCharge = this.GetServiceCharge(order, plUser);
        order.GeographyCharge = this.GetGeographyCharge(order, plUser);

        if (promotion && promotion.PromotionType == entity.enums.PromotionType.DEBIT_CARD && order.PromotionAmount > 0) {
            var total = order.OrderCharge + order.ShippingCharge + order.LabelCharge + order.ServiceCharge + order.GeographyCharge;

            if (total <= plUser.MinElementsCharge) {
                total = plUser.MinElementsCharge;
                order.MinElementsChargeApply = true;
            }

            if (promotion.IsNoRequired) {
                if (total > order.PromotionAmount) {
                    order.TotalEstmCost = total - order.PromotionAmount;
                }
                else {
                    order.PromotionAmount = total;
                    order.TotalEstmCost = 0;
                }
            }
            else {
                var cost = total - plUser.MinElementsCharge;
                if (cost > 0) {
                    if (cost > promotion.PromotionBalance) {
                        order.TotalEstmCost = total - promotion.PromotionBalance;
                    }
                    else {
                        order.TotalEstmCost = total - cost;
                        order.PromotionAmount = cost;
                    }
                }
                else if (cost <= 0) {
                    order.TotalEstmCost = total;
                    order.PromotionAmount = 0;
                }
            }

        }
        else {

            // get sub total charge
            var subTotalCharge = order.OrderCharge - order.PromotionAmount;
            if (promotion) {
                if (promotion.IsNoRequired) {

                }
                else {
                    if (order.OrderCharge <= plUser.MinElementsCharge) {
                        subTotalCharge = plUser.MinElementsCharge;
                        order.PromotionAmount = 0;
                    }
                    else if (order.OrderCharge > plUser.MinElementsCharge) {
                        var cost = order.OrderCharge - plUser.MinElementsCharge;
                        if (cost <= order.PromotionAmount) {
                            order.OrderCharge = plUser.MinElementsCharge;
                            order.PromotionAmount = cost;
                        }
                        else {
                            order.OrderCharge = subTotalCharge;
                        }
                    }
                }

            }
            else {
                if (subTotalCharge < plUser.MinElementsCharge) {
                    subTotalCharge = plUser.MinElementsCharge;
                }
            }
            order.SubTotalCharge = subTotalCharge;

            order.TotalEstmCost = order.SubTotalCharge + order.ShippingCharge + order.LabelCharge + order.ServiceCharge + order.GeographyCharge;
            order.TotalEmailEstmCost = order.CostPrice * order.TotalEmailDesiredQty;
            order.RetailCost = order.TotalEstmCost;
            order.MinElementsChargeApply = (order.SubTotalCharge == plUser.MinElementsCharge);
            order.MinLabelChargeApply = (order.LabelCharge == plGlobal.MinLabelCharge);
            var orderAmount = order.OrderCharge - order.PromotionAmount + order.ShippingCharge + order.LabelCharge;
            order.MinOrderAmountApply = (orderAmount < plUser.MinElementsCharge);
        }

        order.TotalPretaxCost = order.TotalEstmCost;

    };
    //TODO: #5036 Promot Code Start
    this.CheckPromotCode = function(order) {
        var PCode = order.PromoCode;
        if (PCode == null || PCode.Length == 0) {
            return false;
        } else {
            return true;
        }
    },
    this.GetMobilePackagePromotionValue = function(promotionCode, mobilePackageId) {
        var value = 0;
        if (promotionCode == null || promotionCode.Length == 0) {
            return 0;
        }
        if (uc.result.Promotion != null) {
            if (this.CheckMobileCondition(mobilePackageId, uc.result.Promotion.PackageIds)) {
                var prom = 0;
                var pack = uc.result.MobilePackages.getPackageById(mobilePackageId);
                if (uc.result.Promotion.PromotionType == entity.enums.PromotionType.DOLLAR_MOBILE_ONLY) {
                    prom = uc.result.Promotion.PromotionValue;
                } else if (uc.result.Promotion.PromotionType == entity.enums.PromotionType.PERCENT_OFF_MOBILE_ONLY) {
                    prom = pack.Cost * uc.result.Promotion.PromotionValue;
                }
            }
            var totalValue = pack.Cost - prom;
            if (totalValue < uc.result.Promotion.MinPurAmount) {
                value = uc.result.Promotion.MinPurAmount - pack.Cost;
            } else {
                value = 0 - prom;
            }
        }
        return framework.common.formatMoney(value);
    },
    this.CaculateMobilePromotion = function(order, promotion) {
        if (this.CheckPromotCode(order)) {
            if (promotion.PromotionType == entity.enums.PromotionType.DOLLAR_MOBILE_ONLY || promotion.PromotionType == entity.enums.PromotionType.DOLLAR_MOBILE_LIST_BOTH
            || promotion.PromotionType == entity.enums.PromotionType.PERCENT_OFF_MOBILE_ONLY || promotion.PromotionType == entity.enums.PromotionType.PERCENT_OFF_MOBILE_LIST_BOTH) {
                if (order.MobilePackageId > 0) {
                    var pack = uc.result.MobilePackages.getPackageById(order.MobilePackageId);
                    if (this.CheckMobileCondition(order.MobilePackageId, promotion.PackageIds)) {
                        order.MobilePackageCharge = pack.Cost - promotion.PromotionValue;
                        var mobileCharge = 0;
                        if (promotion.PromotionType == entity.enums.PromotionType.DOLLAR_MOBILE_ONLY || promotion.PromotionType == entity.enums.PromotionType.DOLLAR_MOBILE_LIST_BOTH) {
                            mobileCharge = pack.Cost - promotion.PromotionValue;
                        }
                        else if (promotion.PromotionType == entity.enums.PromotionType.PERCENT_OFF_MOBILE_ONLY || promotion.PromotionType == entity.enums.PromotionType.PERCENT_OFF_MOBILE_LIST_BOTH) {
                            mobileCharge = pack.Cost - pack.Cost * promotion.PromotionValue;
                        }
                        if (mobileCharge < promotion.MinPurAmount) {
                            mobileCharge = promotion.MinPurAmount;
                        }
                        order.MobilePackageCharge = mobileCharge;
                    } else {
                        order.MobilePackageCharge = pack.Cost;
                    }
                }
            }
        }
    },

    this.CaculateMobilePackageCharge = function(order, promotion) {
        if (this.CheckPromotCode(order) == false) {
            if (order.MobilePackageId > 0) {
                var pack = uc.result.MobilePackages.getPackageById(order.MobilePackageId);
                order.MobilePackageCharge = pack.Cost;
            }
        } else {
            this.CaculateMobilePromotion(order, promotion);
        }
    },
    //TODO: #5036 Promot Code End


    this.CaculatePromotion = function(order, plUser, promotion) {
        order.PromotionAmount = this.GetPromotionCharge(order, promotion);
        this.CaculateMobilePackageCharge(order, promotion);
        if (promotion && promotion.PromotionType == entity.enums.PromotionType.DEBIT_CARD && order.PromotionAmount > 0) {
            var total = order.OrderCharge + order.ShippingCharge + order.LabelCharge + order.ServiceCharge + order.GeographyCharge;


            if (promotion.IsNoRequired) {
                if (total > order.PromotionAmount) {
                    order.TotalEstmCost = total - order.PromotionAmount;
                }
                else {
                    order.PromotionAmount = total;
                    order.TotalEstmCost = 0;
                }
            }
            else {
                var cost = total - plUser.MinElementsCharge;
                if (cost > 0) {
                    if (cost > promotion.PromotionBalance) {
                        order.SubTotalCharge = total - promotion.PromotionBalance;
                        order.TotalEstmCost = total - promotion.PromotionBalance;
                    }
                    else {
                        order.SubTotalCharge = total - cost;
                        order.TotalEstmCost = total - cost;
                        order.PromotionAmount = cost;
                    }

                }
                else if (cost == 0) {
                    order.SubTotalCharge = total;
                    order.TotalEstmCost = total;
                    order.PromotionAmount = 0;
                }
            }

        }
        else {
            // get sub total charge
            var subTotalCharge = order.OrderCharge - order.PromotionAmount;
            if (promotion) {

                if (promotion.IsNoRequired) {

                }
                else {
                    //                       if (subTotalCharge < plUser.MinElementsCharge) {
                    //                               subTotalCharge = plUser.MinElementsCharge;
                    //                            }

                    if (order.OrderCharge <= plUser.MinElementsCharge) {
                        subTotalCharge = plUser.MinElementsCharge;
                        order.PromotionAmount = 0;
                    }
                    else if (order.OrderCharge > plUser.MinElementsCharge) {
                        var cost = order.OrderCharge - plUser.MinElementsCharge;
                        if (cost <= order.PromotionAmount) {
                            order.OrderCharge = plUser.MinElementsCharge;
                            order.PromotionAmount = cost;
                        }
                        else {
                            order.OrderCharge = subTotalCharge;
                        }
                    }
                }

            }
            else {
                if (subTotalCharge < plUser.MinElementsCharge) {
                    subTotalCharge = plUser.MinElementsCharge;
                }
            }

            order.SubTotalCharge = subTotalCharge;
            order.TotalEstmCost = order.SubTotalCharge + order.ShippingCharge + order.LabelCharge + order.ServiceCharge + order.GeographyCharge;
            order.MinElementsChargeApply = (order.SubTotalCharge == plUser.MinElementsCharge);
        }

        order.TotalPretaxCost = order.TotalEstmCost;
    };

    this.GetMultiplePriceByListUsageType = function(listUsageType, mprice) {
        for (var i = 0; i < mprice.length; i++) {
            if (mprice[i].MultipleId == listUsageType) {
                return mprice[i].Multiple;
            }
        }
    };

    this.GetSinglePrice = function(order, plUser, plGlobal) {
        var qty = order.TotalDesiredQty;
        var listUsage = order.ListUsage;
        var mprice = plUser == null ? plGlobal.ListMultiplePrice : plUser.ListMultiplePrice;
        var multiplePrice = this.GetMultiplePriceByListUsageType(listUsage, mprice);
        var myCalculatePriceMethod = page.placeorder.CalculatePriceMethod;
        // caculate demo elements pricing
        var singleprice = 0;
        for (var i = 0; i < order.ElementsForPricing.length; i++) {
            var el = order.ElementsForPricing[i];
            if (el.ValuesCount < 1) {
                el.ValuesCount = 1;
            }
            // get from user price list first
            var p = this.GetPriceByElement(el.ElementName, qty, plUser);
            if (p == null) {
                p = this.GetPriceByElement(el.ElementName, qty, plGlobal);
                el.Price = (p == null ? plGlobal.GlobalElementPrice : p.Price1);
                el.IsGlobal = true;
                el.NotificationRequired = p == null ? true : p.NotificationRequired;
                el.PriceListName = p == null ? "default" : plGlobal.PriceListName;

                var valuePrice = p == null ? 0 : p.Price2;
                valuePrice = (el.ValuesCount - 1) * valuePrice;
                el.Price = el.Price + valuePrice;
                if (listUsage > entity.enums.ListUsageType.OneTimes && el.IsMultiple) {
                    //  el.Price = el.Price * plGlobal.MultiplePrice;
                    if (myCalculatePriceMethod == entity.enums.CalculatePriceMethod.WholeOrder) {
                        el.Price = el.Price * multiplePrice;
                    }
                    else {
                        if (el.ElementName == "BASE") {
                            el.Price = el.Price * multiplePrice;
                        }
                    }
                    //
                }

            } else {
                el.Price = p.Price1;
                el.IsGlobal = false;
                el.PriceListName = plUser.PriceListName;
                var valuePrice = p == null ? 0 : p.Price2;
                valuePrice = (el.ValuesCount - 1) * valuePrice;
                el.Price = el.Price + valuePrice;
                //var multiplePrice = plUser == null ? plGlobal.MultiplePrice : plUser.MultiplePrice;
                //var mprice = plUser == null ? plGlobal.ListMultiplePrice : plUser.ListMultiplePrice;
                if (listUsage > entity.enums.ListUsageType.OneTimes && el.IsMultiple) {
                    // el.Price = el.Price * multiplePrice;
                    if (myCalculatePriceMethod == entity.enums.CalculatePriceMethod.WholeOrder) {
                        el.Price = el.Price * multiplePrice;
                    }
                    else {
                        if (el.ElementName == "BASE") {
                            el.Price = el.Price * multiplePrice;
                        }
                    }
                    //

                }
            }

            singleprice += el.Price;
        }

        if (order.ListType == 90) {  //Compass #6471 -  Re: Vendor COGS
            if (singleprice > 0.35) {
                singleprice = 0.35;
            }
        }
        return singleprice;

    };

    this.GetSingleGoodsPrice = function(order, metadataPriceList) {
        var singleprice = 0;
        var myCalculatePriceMethod = page.placeorder.CalculatePriceMethod;
        if (metadataPriceList != undefined && metadataPriceList != null) {
            var qty = order.TotalDesiredQty;
            var listUsage = order.ListUsage;
            // caculate demo elements pricing

            var maxBasePrice = 0;
            var maxMapMultiuseFactor = 0;
            var mprice = uc.result.UserPriceList == null ? uc.result.GlobalPriceList.ListMultiplePrice : uc.result.UserPriceList.ListMultiplePrice;
            maxMapMultiuseFactor = this.GetMultiplePriceByListUsageType(listUsage, mprice);
            for (var i = 0; i < order.ElementsForPricing.length; i++) {
                var el = order.ElementsForPricing[i];
                if (el.ValuesCount < 1) {
                    el.ValuesCount = 1;
                }
                // get from user price list first
                var p = this.GetGoodsPriceByElement(el.ElementName, metadataPriceList);

                //if (p == null && el.ElementName == "BASE") {
                if (p == null && this.PriceElementEquals(el.ElementName, "BASE")) {

                    //                for (var j = 0; j < metadataPriceList.MetadataPricingList.length; j++) {
                    //                    var priceObj = metadataPriceList.MetadataPricingList[j];
                    //                    if (priceObj.MapBasePrice != null && maxBasePrice < priceObj.MapBasePrice) {
                    maxBasePrice = metadataPriceList.MapBasePrice;
                    //                    }
                    //                    if (priceObj.MapMultiuseFactor != null && maxMapMultiuseFactor < priceObj.MapMultiuseFactor) {
                    //maxMapMultiuseFactor = metadataPriceList.MapMultiuseFactor;
                    //                    }

                    //                }

                } else {

                    if (p != null) {
                        el.Price = (p.MapColumnPrice == null ? 0 : p.MapColumnPrice);
                        el.IsGlobal = false;
                        var valuePrice = p == null ? 0 : (p.MapColumnPrice2 == null ? 0 : p.MapColumnPrice2);
                        valuePrice = (el.ValuesCount - 1) * valuePrice;
                        el.Price = el.Price + valuePrice;

                        singleprice += el.Price;
                    }

                }

            }

            //singleprice = maxBasePrice + singleprice;
            if (listUsage > entity.enums.ListUsageType.OneTimes && el.IsMultiple) {
                if (myCalculatePriceMethod == entity.enums.CalculatePriceMethod.WholeOrder) {
                    singleprice = (singleprice + maxBasePrice) * maxMapMultiuseFactor;
                }
                else {
                    singleprice = maxBasePrice * maxMapMultiuseFactor + singleprice;
                }
            }
            else {
                singleprice = maxBasePrice + singleprice;
            }

        }
        alert("GetSingleGoodsPrice");
        alert(singleprice);
        return singleprice;

    };


    this.GetPriceByElement = function(element, qty, pricelist) {
        for (var i = 0; i < pricelist.ElementsPrices.length; i++) {
            var priceObj = pricelist.ElementsPrices[i];
            //if (priceObj.PriceName == element && priceObj.Lbound <= qty && priceObj.Ubound >= qty) {
            if (this.PriceElementEquals(priceObj.PriceName, element) && priceObj.Lbound <= qty && priceObj.Ubound >= qty) {
                return priceObj;
            }
        }
        return null;
    };

    this.GetGoodsPriceByElement = function(element, metadataPricelist) {
        if (metadataPricelist != undefined && metadataPricelist != null && metadataPricelist.MetadataPricingList != undefined && metadataPricelist.MetadataPricingList != null) {
            for (var i = 0; i < metadataPricelist.MetadataPricingList.length; i++) {
                var priceObj = metadataPricelist.MetadataPricingList[i];
                //if (priceObj.ColumnName == element) {
                if (this.PriceElementEquals(priceObj.ColumnName, element)) {
                    return priceObj;
                }
            }
        }
        return null;
    };

    /// <summary>
    /// Get label charge by follow steps:
    /// 1 find price object by price name : base
    /// 2 calculate label charge
    /// 2.1 baseprice * qty < min price, return min price
    /// 2.2 else return baseprice * qty
    /// </summary>
    /// <param name="order">order</param>
    /// <param name="pl">qlabel price list</param>
    this.GetLabelBaseCharge = function(order, pricelist) {
        var qty = order.TotalDesiredQty;
        var labels = order.MailLabelsCount;
        if (labels == 0) {
            return 0;
        }

        var elPrice = 0;
        for (var i = 0; i < pricelist.LabelPrices.length; i++) {
            var priceObj = pricelist.LabelPrices[i];
            //if (priceObj.PriceName.toLowerCase() == "base" && priceObj.Lbound <= qty && priceObj.Ubound >= qty) {
            if (this.PriceElementEquals(priceObj.PriceName, "base") && priceObj.Lbound <= qty && priceObj.Ubound >= qty) {
                elPrice = priceObj.Price1;
                break;
            }
        }

        //get base label charge
        var baseCharge = elPrice * qty * labels;
        if (baseCharge < pricelist.MinLabelCharge) {
            baseCharge = pricelist.MinLabelCharge;
        }

        return baseCharge;
    };

    /// <summary>
    /// Get Shipping charge by follow steps:
    /// 1 find price object by price name : shipprice
    /// 2 calculate shipping charge
    /// 2.1 the first labels' price is price1
    /// 2.2 the follow labels' price is price2
    /// 2.3 total shipping charge = 1*price1 + (labels-1)*price2
    /// </summary>
    /// <param name="order">order</param>
    /// <param name="pl">qlabel price list</param>
    this.GetLabelShipCharge = function(order, pricelist) {
        var qty = order.TotalDesiredQty;
        var labels = order.MailLabelsCount;
        if (labels == 0) {
            return 0;
        }

        var price1 = 0;
        var price2 = 0;
        for (var i = 0; i < pricelist.LabelPrices.length; i++) {
            var priceObj = pricelist.LabelPrices[i];
            if (priceObj.PriceName.toLowerCase() == "shipprice" && priceObj.Lbound <= qty && priceObj.Ubound >= qty) {
                price1 = priceObj.Price1;
                price2 = priceObj.Price2;
                break;
            }
        }

        var firstLabelCharge = price1;
        var additionalLabelCharge = (labels - 1) * price2;
        return firstLabelCharge + additionalLabelCharge;
    };

    /// <summary>
    /// Get Promotion Amount by follow steps:
    /// 1 find promotion by promotion code
    /// 2 check whether qty/amount reach the min requirement
    /// 3 if reach the min requirement, get promo amount by different promotion type
    /// </summary>
    /// <param name="order">The order.</param>
    /// <param name="listPrice">per record price for calculating list price and promotion amount</param>
    /// <returns></returns>
    this.GetPromotionCharge = function(order, promotion) {
        var PCode = order.PromoCode;
        var qty = order.TotalDesiredQty;
        var singlePrice = order.CostPrice;

        order.PromotionPointType = 0;
        order.PromotionPointValue = 0;

        if (PCode == null || PCode.Length == 0) {
            return 0;
        }

        var totalAmt = order.OrderCharge; // singlePrice * qty;

        var promotionAmount = 0;
        if (promotion != null) {
            var isPromotionEffective = false;
            if (promotion.MinPurAmountType == entity.enums.PromotionMinPurAmtType.BY_TOTAL_SPEND)
                isPromotionEffective = (totalAmt >= promotion.MinPurAmount);
            else if (promotion.MinPurAmountType == entity.enums.PromotionMinPurAmtType.BY_TOTAL_RECORDS)
                isPromotionEffective = (qty >= promotion.MinPurQty);
            else
                isPromotionEffective = ((totalAmt >= promotion.MinPurAmount) && (qty >= promotion.MinPurQty));

            if (isPromotionEffective) {

                if (promotion.PromotionType == entity.enums.PromotionType.PERCENT_OFF_TOTAL_PRICE) {
                    promotionAmount = totalAmt * promotion.PromotionValue;
                }
                else if (promotion.PromotionType == entity.enums.PromotionType.FLAT_DOLLAR_TOTAL_PRICE) {
                    promotionAmount = promotion.PromotionValue;
                }
                else if (promotion.PromotionType == entity.enums.PromotionType.FREE_LEADS) {
                    promotionAmount = singlePrice * promotion.PromotionValue;
                }
                else if (promotion.PromotionType == entity.enums.PromotionType.XNUMBER_OF_POINT) {
                    order.PromotionPointType = entity.enums.PromotionType.XNUMBER_OF_POINT;
                    order.PromotionPointValue = promotion.PromotionValue;
                }
                else if (promotion.PromotionType == entity.enums.PromotionType.NUMBER_OF_POINT) {
                    order.PromotionPointType = entity.enums.PromotionType.NUMBER_OF_POINT;
                    order.PromotionPointValue = promotion.PromotionValue;
                }
                else if (promotion.PromotionType == entity.enums.PromotionType.DEBIT_CARD) {
                    promotionAmount = promotion.PromotionBalance;
                } else if (promotion.PromotionType == entity.enums.PromotionType.DOLLAR_MOBILE_ONLY || promotion.PromotionType == entity.enums.PromotionType.PERCENT_OFF_MOBILE_ONLY) {//TODO: #5036 Promot Code
                    if (this.CheckMobileCondition(order.MobilePackageId, promotion.PackageIds)) {
                        this.CaculateMobilePromotion(order, promotion);
                    }
                } else if (promotion.PromotionType == entity.enums.PromotionType.DOLLAR_MOBILE_LIST_BOTH || promotion.PromotionType == entity.enums.PromotionType.PERCENT_OFF_MOBILE_LIST_BOTH) {//TODO: #5036 Promot Code
                    if (this.CheckMobileCondition(order.MobilePackageId, promotion.PackageIds)) {
                        if (promotion.PromotionType == entity.enums.PromotionType.DOLLAR_MOBILE_LIST_BOTH) {
                            promotionAmount = promotion.PromotionValue;
                        }
                        else if (promotion.PromotionType == entity.enums.PromotionType.PERCENT_OFF_MOBILE_LIST_BOTH) {
                            promotionAmount = totalAmt * promotion.PromotionValue;
                        }
                        this.CaculateMobilePromotion(order, promotion);
                    }
                }

            }

        }

        if (promotionAmount > totalAmt && promotion.PromotionType != entity.enums.PromotionType.DEBIT_CARD) {
            promotionAmount = totalAmt;
        }

        return promotionAmount;
    };
    //TODO: #5036 Promot Code
    this.CheckMobileCondition = function(mobilePackageId, packageIds) {
        var isCheck = false;
        if (mobilePackageId > 0) {
            var ids = packageIds.split(",");
            for (var i = 0; i < ids.length; i++) {
                if (parseInt(mobilePackageId) == parseInt($.trim(ids[i]))) {
                    isCheck = true;
                    break;
                }
            }
        }
        return isCheck;
    };

    this.GetServiceCharge = function(order, priceList) {
        return priceList.ServiceCharge;

    };

    this.GetGeographyCharge = function(order, priceList) {
        var geographyCharge = 0;
        for (var i = 0; i < priceList.GeographyPrices.length; i++) {
            var price = priceList.GeographyPrices[i];
            if (price.PriceName == order.GeoType.toString()) {
                geographyCharge = price.Price1;
                break;
            }

        }
        return geographyCharge;
    };

    this.SetGeoDetailsDesiredByDetail = function(orderGeo, value) {
        if (orderGeo == null) return;
        var left = value;
        if (jQuery.isArray(orderGeo.OrderGeoDetails) && orderGeo.OrderGeoDetails.length > 0) {
            var geoDetails = orderGeo.OrderGeoDetails;
            for (var j = 0; j < geoDetails.length; j++) {
                if (left <= 0) {
                    geoDetails[j].DesiredQty = 0;
                } else {
                    if (geoDetails[j].AvailableQty >= left) {
                        geoDetails[j].DesiredQty = left;
                    } else if (geoDetails[j].AvailableQty > 0) {
                        geoDetails[j].DesiredQty = geoDetails[j].AvailableQty;
                    }
                    left = left - geoDetails[j].DesiredQty;
                }
            }
        }
    };

    this.SetGeoDetailsDesiredByOrder = function(order) {
        if (order == null) return;
        if (jQuery.isArray(order.OrderGeos) && order.OrderGeos.length > 0) {
            for (var i = 0; i < order.OrderGeos.length; i++) {
                this.SetGeoDetailsDesiredByDetail(order.OrderGeos[i], order.OrderGeos[i].DesiredQty);
            }
        }
    };

    this.CaculatePackage = function(order, digitalFileQty) {
        if (order == null || order.MobilePackages == undefined || order.MobilePackages == null) return;
        if (jQuery.isArray(order.MobilePackages) && order.MobilePackages.length > 0) {
            for (var i = 0; i < order.MobilePackages.length; i++) {
                if (order.MobilePackages[i].Details != null) {
                    for (var j = 0; j < order.MobilePackages[i].Details.length; j++) {
                        if (digitalFileQty >= order.MobilePackages[i].Details[j].MinGoal && digitalFileQty <= order.MobilePackages[i].Details[j].MaxGoal) {
                            order.MobilePackages[i].ViewCount = order.MobilePackages[i].Details[j].ViewCount;
                            order.MobilePackages[i].Cost = order.MobilePackages[i].Details[j].Price;
                            break;
                        }
                    }
                }
            }
        }
    };

    this.PriceElementEquals = function(priceName, elementName) {
        return String.Equals(priceName, elementName, true);
    };
}

OrderHelper = new helper.Order();