/**
 *	Check is specified string is valid url
 *
 *	@param {String} url
 *	@return {Boolean}
 */
var isUrl = (function() {
	var checkUrl = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

	return function(url) {
		return checkUrl.test(url);
	}
})();

/**
 *	Change URL or, if possible, use History API and call callback function
 *
 *	@param {String} url
 *	@param {Object} params GET url params
 *	@param {Function} callback function will be called only if History API is supported by browser, or reload page
 */
function changeUrl(url, params, callback) {
	var and = '';

	if (params) {
		url += '?';
		Object.keys(params).forEach(function(key) {
			url += and + key + '=' + encodeURIComponent(params[key]);
			and = '&';
		});
	}

	if (history && history.pushState) {
		history.pushState(null, null, url);
		callback && callback();
	}
	else {
		document.location = url;
	}
}

/**
 *	Bind for old browsers
 */
if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if (typeof this !== 'function') {
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}

		var aArgs = Array.prototype.slice.call(arguments, 1), 
			fToBind = this, 
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
}


/**
 *	Magic and http://developer.yahoo.com/yql/guide/yql-code-examples.html#using_xpath_yql
 *
 *	@param {String} url
 *	@param {String} xpath
 *	@param {Function} callback
 */
var getPageContent = function thisFunc(url, xpath, callback) {
	var id, script;

	if (!thisFunc.callbacks) {
		thisFunc.callbacks = [];
	}

	id = thisFunc.callbacks.length;
	thisFunc.callbacks[id] = callback;

	script = document.createElement('script');
	script.src = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22' +
	                encodeURIComponent(url) + '%22' + (xpath? '%20and%20xpath%3D%27' + encodeURIComponent(xpath) + '%27' : '') + '&format=json\'&callback=getPageContent.callbacks[' + id + ']';
	script.type = 'text/javascript';
	document.body.appendChild(script);
}

/**
 *	Table Builder
 *
 *	@constructor
 */
function Table() {
	var table = document.createElement('table'),
		tableContent = '',
		trOpened = false,
		that = this;

	/**
	 *	Add new TR tag
	 *
	 *	@this {Table}
	 */
	this.tr = function() {
		if (trOpened) {
			tableContent += '</tr>';
		}

		tableContent += '<tr>';

		return that;
	}

	/**
	 *	Add new TD tag
	 *
	 *	@param {String} tdContent content of table cell
	 *	@this {Table}
	 *	@return {Table}
	 */
	this.td = function(tdContent) {
		tableContent += '<td>' + tdContent + '</td>';

		return that;
	}

	/**
	 *	Append current table to elem
	 *
	 *	@param {String} elem HTML Node
	 *	@this {Table}
	 *	@return {Table}
	 */
	this.addTo = function(elem) {
		if (trOpened) {
			trOpened = false;
			tableContent != '</tr>';
		}

		table.innerHTML = tableContent;
		elem.appendChild(table);

		return that;
	}
}
