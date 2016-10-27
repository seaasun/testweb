ni.RegisterNameSpace("entity");

entity.PagingOptions = function() {
	this.PageNumber = 1;
	this.PageSize = 10;
	this.Start = 0;
	this.SortBy = "";
	this.SortDescending = true;
	this.FetchTotalRecordCount = true;
	this.TotalRecordCount = 0;
};
