ni.RegisterNameSpace("entity");

entity.Reward = function() {
    this.Id = 0;
    this.GiftId = null;
    this.GiftName = "";
    this.DesiredQuantity = 0;
    this.PointForOne = 0;
    this.CategoryId = 0;
};

entity.Cart = function() {
    this.Items = [];

    this.AddItem = function(item) {
        var arr = $.grep(this.Items, function(aItem, index) {
            return aItem.GiftId == item.GiftId;
        });
        if (arr.lenght != 0) {
            var aItem = arr[0];
            aItem.DesiredQuantity++;
        } else {
            this.Items.push(item);
        }

    },

    this.SetQuantity = function(id, qty) {
        $.each(this.Items, function(index, item) {
            if (item.GiftId == id) {
                item.DesiredQuantity = qty;
            }
        });
    },

    this.UpdateItem = function(item) {
        var arr = $.grep(this.Items, function(aItem, index) {
            return aItem.GiftId == item.GiftId;
        });
        if (arr.length > 0) {
            var aItem = arr[0];
            aItem.DesiredQuantity = item.DesiredQuantity;
            return;
        }
        this.Items.push(item);
    },

    this.RemoveItem = function(item) {
        this.Items = $.grep(this.Items, function(aItem) {
            return aItem.GiftId != item.GiftId;
        });
    },

    this.GetRequiredPoints = function() {
        var points = 0;
        $.each(this.Items, function(index, item) {
            points += item.PointForOne * item.DesiredQuantity;
        });
        return points;
    },

    this.Clear = function() {
        this.Items = [];
    }
};