setInterval(function() {

	var queue = [];

	chrome.storage.local.get(function(data) {
		if (Object.keys(data).length > 0) {
			chrome.browserAction.setBadgeText({text: ""});
		} else if (Object.keys(data).length > 0) { // returns true if data object is empty
			for (var cocktail in data) {
				if (data.hasOwnProperty(cocktail)
				    && data[cocktail].nextDate < new Date().getTime()) {
						queue.push(data[cocktail]);
				}
			}
			chrome.browserAction.setBadgeText({text: queue.length.toString()});
		}
	})


}, 5 * 1000);