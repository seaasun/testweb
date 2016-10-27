
// extend string
String.prototype.format = function() {
	var args = arguments;
	return this.replace(/\{(\d+)\}/g,
        function(m, i) {
        	return args[i];
        });
};

//V2 static
String.format = function() {
	if (arguments.length == 0)
		return null;

	var str = arguments[0];
	for (var i = 1; i < arguments.length; i++) {
		var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
		str = str.replace(re, arguments[i]);
	}
	return str;
};

String.IsNullOrEmpty = function(val) {
	if (val == null || val == window.undefined) {
		return true;
	} else {
	// ToDo add trim		
		return jQuery.trim(val.toString()).length == 0;
	}
};

String.Equals = function(first, second, ignoreCase) {
    if (first == null || second == null) {
        return false;
    }
    if (first.length != second.length) {
        return false;
    }
    if (ignoreCase == null) {
        ignoreCase = false;
    }
    var regFlag = ignoreCase ? "gi" : "g";
    var regExp = new RegExp(first, regFlag);
    return regExp.test(second);

};

var ni;
if (ni && (typeof ni != "object" || ni.NAME)) {
    throw new Error("Namespace 'NI' already exists");
} else {
    // Create our namespace
    ni = {
        RegisterNameSpace: function() {
            var a = arguments, o = null, i, j, d, rt;
            for (i = 0; i < a.length; ++i) {
                d = a[i].split(".");
                rt = d[0];
                eval('if (typeof ' + rt + ' == "undefined"){' + rt + ' = {};} o = ' + rt + ';');
                for (j = 1; j < d.length; ++j) {
                    o[d[j]] = o[d[j]] || {};
                    o = o[d[j]];
                }
            }
        }

    };
}

/**
* Copies all the properties of config to obj.
* @param {Object} obj The receiver of the properties
* @param {Object} config The source of the properties
* @param {Object} defaults A different object that will also be applied for default values
* @return {Object} returns obj
* @member Ext apply
*/
ni.apply = function(o, c, defaults) {
	// no "this" reference for friendly out of scope calls
	if (defaults) {
		ni.apply(o, defaults);
	}
	if (o && c && typeof c == 'object') {
		for (var p in c) {
			o[p] = c[p];
		}
	}
	return o;
};