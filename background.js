setInterval(function() {

	var queue = [];

	chrome.storage.local.get(function(data) {
		if (Object.keys(data).length === 0) {
			console.log('heeee')
			// chrome.browserAction.setBadgeText({text: "boo"});
		} else if (Object.keys(data).length > 0) { // returns true if data object is empty
			for (var cocktail in data) {
				if (data.hasOwnProperty(cocktail)
				    && data[cocktail].nextDate < new Date().getTime()) {
						queue.push(data[cocktail]);
				}
			}
			if (queue.length > 0) {
				chrome.browserAction.setBadgeText({text: queue.length.toString()});
			} else {
				chrome.browserAction.setBadgeText({text: null});
			}
		}
	})


}, 60 * 1000);

// var now = new Date();
// var millisTill00 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 1, 0, 0) - now;
// if (millisTill00 < 0) {
//      millisTill00 += 86400000;
// }
// setTimeout(function(){

// }, millisTill00);






