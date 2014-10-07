var app = angular.module('app', ['ngAnimate']);

app.controller('MainController', ['$scope', 'Cocktails', function($scope, Cocktails) {


	$scope.fillQueue = function() {

		chrome.storage.local.get(function(data) {
			for (var cocktail in Cocktails) {
				if (Cocktails.hasOwnProperty(cocktail) && !data[cocktail]) {
					$scope.$apply(function() {
						$scope.unseenQueue.push(Cocktails[cocktail]);
						$scope.currentCard = $scope.unseenQueue[0];
					});
				}
			}
		});
	};

	$scope.myFunct = function(ev) {
        $scope.pressed = ev.which;
        if (ev.which == 38 || ev.which == 32 || ev.which == 40) {
        	$scope.flipCard();
        }
    };

    $scope.currentCard = function() {
    	if ($scope.toReviewQueue.length == 0) {
    		$scope.currentCard = $scope.unseenQueue[0]
    	} else {

    	}
    	$scope.unseenQueue[0];
    }

	$scope.rightSideUp = true;

	$scope.flipCard = function() {
		$scope.$apply($scope.rightSideUp = !$scope.rightSideUp)
	}

	$scope.rateCard = function(value) {
		if (value <= 3) {

		}
	}

	$scope.toReviewQueue = [];

	$scope.unseenQueue = [];

}]);

app.factory('Cocktails', function() {
	return {
		maiTai: {name: "Mai Tai",
				 key: "maiTai",
				 recipe: "Collins Glass, Ice, \
						  1oz Rum, \
						  1/2 oz Crème de Almond, \
						  1/2 oz Triple Sec, \
						  1/2 Fill with Pineapple Juice & OJ, \
						  Top w/ Myers Rum, \
						  Garnish: Cherry"},
		longIslandIceTea: {name: "Long Island Ice Tea",
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