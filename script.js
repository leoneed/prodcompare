var compare = document.forms.compare,
	comparisonBlock = document.getElementById('comparison'),
	stopLoading = false;

/**
 *	Check url and load comparison if necessary
 */
function checkpageState() {
	var urls = document.location.search;

	 if (urls) {
	 	urls = urls.split('&');

	 	if (urls.length === 2) {
	 		urls[0] = urls[0].split('=')[1];
	 		urls[1] = urls[1].split('=')[1];

	 		if (urls[0] && urls[1]) {
	 			urls[0] = decodeURIComponent(urls[0]);
	 			urls[1] = decodeURIComponent(urls[1]);
	 			
	 			if (isUrl(urls[0]) && isUrl(urls[1])) {
	 				compare[0].value = urls[0];
	 				compare[1].value = urls[1];

	 				compareProducts(urls[0], urls[1]);
	 			}
	 		}
	 	}
	 }
}

checkpageState();

// ---- Bind Next Prev browser buuttons
window.addEventListener('popstate', function(e) {
	comparisonBlock.className = '';
	comparisonBlock.innerHTML = '';
	compare[0].value = '';
	compare[1].value = '';
	stopLoading = true;
	checkpageState();
});

// ----- Bind actions to form buttons -----
document.getElementById('clear-button').addEventListener('click', function() {
	compare[0].value = '';
	compare[1].value = '';

	compare[0].className = compare[1].className = '';
	comparisonBlock.className = '';
	comparisonBlock.innerHTML = '';
	stopLoading = true;

	changeUrl(document.location.pathname);
});

compare.addEventListener('submit', function(e) {
	var noErrors = true;

	e.preventDefault();

	this[0].className = this[1].className = '';

	if (!isUrl(this[0].value)) {
		noErrors = false;
		this[0].className = 'error';
	}

	if (!isUrl(this[1].value)) {
		noErrors = false;
		this[1].className = 'error';
	}

	if (noErrors) {
		changeUrl(document.location.pathname, { 
				url1: this[0].value,
				url2: this[1].value
			}, function() {
				compareProducts(this[0].value, this[1].value);
		}.bind(this));
	}
});

/**
 *	Make requests and build table to compare products
 *
 *	@param {String} url1
 *	@param {String} url2
 */
function compareProducts(url1, url2) {
	var pages = {url1: null, url2: null},
		xpath = '//h1[@id="prod_title"]/text() | //span[@id="special_price_box"]/text() | //div[@id="productSpecifications"]//table//tr//p/text()';
	
	stopLoading = false;

	comparisonBlock.className = 'loading';
	comparisonBlock.innerHTML = '';

	getPageContent(url1, xpath, function(data) {
		pages.url1 = data;
		continueCompare();
	});

	getPageContent(url2, xpath, function(data) {
		pages.url2 = data;
		continueCompare();
	});

	/**
	 *	Check is all data loaded. Start comparation if so.
	 */
	function continueCompare() {
		if (pages.url1 && pages.url2 && !stopLoading) {
			if (pages.url1.results && pages.url1.results.length && pages.url2.results && pages.url2.results.length) {
				buildCompareTable(arraysToObj(pages.url1.results, pages.url2.results));
			}
			else {
				comparisonBlock.className = 'error';
				comparisonBlock.innerHTML = 'Error occurred!';
			}
		}
	}
}

/**
 *	Merge and compare products
 *
 *	@param {Object} prodArr1
 *	@param {Object} prodArr2
 *	@return {Object} product compared products in one object
 */
function arraysToObj(prodArr1, prodArr2) {
	var key,
		product = {keys: [], values: {}};

	prodArr1 = arrayToObj(prodArr1);
	prodArr2 = arrayToObj(prodArr2);

	for(var i = 0, len = prodArr1.keys.length; i < len; ++i) {
		key = prodArr1.keys[i];
		product.keys.push(key);
		product.values[key] = [prodArr1.values[key], (prodArr2.values[key] || '&mdash;')];
	}

	for(var i = 0, len = prodArr2.keys.length; i < len; ++i) {
		key = prodArr2.keys[i];
		if (!prodArr1.values[key]) {
			product.keys.push(key);
			product.values[key] = ['&mdash;', prodArr2.values[key]];
		}
	}

	return product;
}

/**
 *	Create product as object where keys is params and value is desc of this param
 *
 *	@param {Object} prodArr
 *	@return {Object} product Rebuilded object for easy use
 */
function arrayToObj(prodArr) {
	var id,
		product = {keys: ['Name', 'Price'], values: { 'Name': prodArr[0], 'Price': prodArr[1] }};

	for (var i = 1, len = prodArr.length >> 1; i < len; ++i ) {
		id = i << 1;
		product.keys.push(prodArr[id]);
		product.values[prodArr[id]] = prodArr[id + 1];
	}

	return product;
}

/**
 *	Build compare table
 *
 *	@param {Object} products Prepared compared object with table keys and values
 */
function buildCompareTable(products) {
	var key, values,
		CT = new Table;

	for (var i = 0, len = products.keys.length; i < len; ++i) {
		key = products.keys[i],
		values = products.values[key];

		CT.tr().td(key).td(values[0]).td(values[1]);
	}
	
	comparisonBlock.className = 'content';
	comparisonBlock.innerHTML = '';
	CT.addTo(comparisonBlock);
}



