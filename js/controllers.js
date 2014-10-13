var app = angular.module('app', ['ngAnimate']);

app.controller('MainController', ['$scope', 'Cocktails', function($scope, Cocktails) {

	$scope.currentCard;

	$scope.updateCurrentCard = function() {
		$scope.rightSideUp = true;
		if ($scope.queue.length > 0) {
			$scope.currentCard = $scope.queue[0];
		} else {
			$scope.currentCard = null;
			// $scope.getFreshCards()
		}
	}

	$scope.newCardsPerDay = 4;

	$scope.fillQueue = function() {
		chrome.storage.local.get(function(data) {
			if (function(data) { for(var i in data) { return true; } return false; }) { // returns true if data object is empty
				$scope.getFreshCards()
			} else {
				for (var cocktail in data) {
					if (data.hasOwnProperty(cocktail)
					  && data[cocktail].nextDate < new Date().getTime()) {
						$scope.$apply(function() {
							$scope.queue.push(data[cocktail]);
							$scope.updateCurrentCard()
						});
					}
				}
			}
		})
	}

	$scope.getFreshCards = function() {
		chrome.storage.local.get(function(data) {
			for (var cocktail in Cocktails) {
				if (Cocktails.hasOwnProperty(cocktail)
				  && !data[cocktail]
				  && $scope.queue.length < $scope.newCardsPerDay) {
					$scope.$apply(function() {
						$scope.queue.push(Cocktails[cocktail]);
						$scope.updateCurrentCard()
					});
				}
			}
		});
	}

	$scope.noMoreCards = function() {
		if ($scope.queue.length == 0 || $scope.currentCard == null) {
			return true
		} else {
			return false
		}
	}

	$scope.keyReader = function(ev) {
        $scope.pressed = ev.which;
        if (ev.which == 38 || ev.which == 32 || ev.which == 40) {
        	$scope.flipCard();
        }
    };

	$scope.rightSideUp = true;

	$scope.flipCard = function() {
		$scope.rightSideUp = !$scope.rightSideUp
	}

	$scope.rateCard = function(score) {
		if ($scope.currentCard) {
			if (!$scope.currentCard.nextDate) {
				$scope.currentCard.EF = 1.3;
				$scope.currentCard.reps = 0;
				$scope.currentCard.interval = 0;
				$scope.currentCard.nextDate = new Date();
				calculatePerformance(score);
			} else {
				calculatePerformance(score);
			}
		}
	}

	var calculatePerformance = function(score) {
		var nextDate = new Date();
		if (score < 3) {
			$scope.currentCard.reps = 0;
			$scope.currentCard.interval = 0;
		} else {
			$scope.currentCard.EF += (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02));
			if ($scope.currentCard.EF < 1.3) {
				$scope.currentCard.EF = 1.3;
			}

			$scope.currentCard.reps += 1;
	
			switch ($scope.currentCard.reps) {
				case 1:
					$scope.currentCard.interval = 1;
					break;
				case 2:
					$scope.currentCard.interval = 6;
					break;
				default:
					$scope.currentCard.interval = Math.round(($scope.currentCard.reps - 1) * $scope.currentCard.EF);
					break;
			}
		}

		if (score === 3) {
			$scope.currentCard.interval = 0;
		}

		nextDate.setDate(new Date().getDate() + $scope.currentCard.interval);
		nextDate.setHours(4, 0, 0, 0);
		$scope.currentCard.nextDate = nextDate.getTime();
		// console.log($scope.currentCard)

		saveCard()
	}

	// chrome.storage.local.get(function(data) {console.log(data)})
	var saveCard = function() {
		var toSave = {}
		toSave[$scope.currentCard.key] = $scope.currentCard
		chrome.storage.local.set(toSave)
		var now = new Date();
		if ($scope.currentCard.nextDate < now.getTime()) {
			$scope.queue.shift($scope.currentCard)
			$scope.queue.push($scope.currentCard)
		} else {
			$scope.queue.shift($scope.currentCard)
		}
		$scope.updateCurrentCard()
	}

	$scope.queue = [];

}]);

app.factory('Cocktails', function() {
	return {
		maiTai: {name: "Mai Tai",
				 key: "maiTai",
				 recipe: ["Collins Glass, Ice",
						  "1oz Rum",
						  "1/2 oz Crème de Almond",
						  "1/2 oz Triple Sec",
						  "1/2 Fill with Pineapple Juice & OJ",
						  "Top w/ Myers Rum",
						  "Garnish: Cherry"]},
		longIslandIceTea: {name: "Long Island Ice Tea",
						   key: "longIslandIceTea",
						   recipe: ["Collins Glass, Ice",
						   		    "1/2 oz Vodka, Gin, Tequila & Rum",
						   		    "1/2 oz Triple Sec",
						   		    "1 1/2 oz Sweet & Sour",
						   		    "Splash of Coke",
						   		    "Garnish: Lemon"]},
		zombie: {name: "Zombie",
				 key: "zombie",
				 recipe: "Collins Glass, Ice, \
				 		  1 oz Dark Rum & Light Rum, \
				 		  1/2 oz Crème de Almond, \
				 		  1/2 oz Triple Sec, \
				 		  1/2 Fill w/ OJ and Pineapple Juice, \
				 		  Top w/ 151 Rum, \
				 		  Garnish: Cherry"},
		oldFashion: {name: "Old Fashion",
					 key: "oldFashion",
					 recipe: "Old Fashion Glass, \
							  1 Tsp Sugar, 2 Dashes Bitters, Cherry, Orange Wedge, Dash of Water...muddle., \
							  Add Ice and 1 oz Bourbon, \
							  Garnish: Orange and Cherry"},
		bloodyMary: {name: "Bloody Mary",
					 key: "bloodyMary",
					  recipe: "1 oz Vodka, \
							   2 dashes pepper, \
							   2 dashes salt, \
							   2 dashes celery salt, \
							   4 drops Worcestershire, \
							   1 drop Tabasco, \
							   Fill with tomato juice, \
							   Garnish with celery stick or lime"}
	}
});




// app.controller('MainController', ['$scope', 'Cocktails', function($scope, Cocktails) {
	// $scope.recipe = Cocktails.maiTai.recipe

// 	$scope.hello = "Hello, world!"
// }]);