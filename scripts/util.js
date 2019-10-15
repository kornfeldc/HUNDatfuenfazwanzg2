function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

storage = {
	//only store UNIMPORTANT data in here, like last opened module or something
	getKey: function (key) {
		return key;
	},
	clear: function (key) {
		if (window.localStorage) {
			if (key === undefined) {
				//clear all
				for (var i = window.localStorage.length - 1; i >= 0; i--) {
					var actKey = window.localStorage.key(id);
					if (lgc.startsWith(actKey, this.userkey + "_"))
						window.localStorage.removeItem(actKey);
				}
			}
			else
				window.localStorage.removeItem(this.getKey(key));
		}
	},
	set: function (key, value) {
		if (window.localStorage) {
			if (typeof value === "object") {
				window.localStorage.setItem(this.getKey(key) + "_ISOBJECT", "-1");
				window.localStorage.setItem(this.getKey(key), JSON.stringify(value));
			}
			else
				window.localStorage.setItem(this.getKey(key), value);
		}
		else
			lgc.log("window.localStorage NOT AVAILABLE");
	},
	get: function (key, defaultValue) {
		try {
			if (window.localStorage) {
				var isObject = window.localStorage.getItem(this.getKey(key) + "_ISOBJECT");
				var val = window.localStorage.getItem(this.getKey(key));
				if (val === undefined || val == null || val == "null") {
					return defaultValue;
				}

				if (isObject)
					return JSON.parse(val);
				return val;
			}
			else
				return defaultValue;
		}
		catch(e) {
			return defaultValue;
		}
	}
};

wait = (ms = 200) => {
	return new Promise(resolve => {
		setTimeout(resolve,ms);
	});
};

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

util = {
	dateFormat: "YYYY-MM-DD",
	
	search: (str, expression) => {
		if(!expression || expression === "") return true;
		expression = expression.toLowerCase();

		if(!str) return false;
		str = str.toLowerCase();

		return str.indexOf(expression) >= 0;
	},

	log: (a,b) => {
		console && console.log(a,b);
	}
}