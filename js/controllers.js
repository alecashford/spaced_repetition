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

	$scope.newCardsPerDay = 10;

	$scope.fillQueue = function() {
		chrome.storage.local.get(function(data) {
			if (Object.keys(data).length === 0) { // returns true if data object is empty
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
				  && $scope.queue.length < $scope.newCardsPerDay) { // Not sure what I was thinking here...
					$scope.$apply(function() {
						$scope.queue.push(Cocktails[cocktail]);
						$scope.updateCurrentCard();
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
		$scope.rightSideUp = false;// !$scope.rightSideUp
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
	return {'lynchburgLemonade': {'recipe': ['1 oz Jack Daniels', '1 oz Sour Mix', '1/2 oz Triple Sec', 'Collins Glass filled with ice', 'Fill with Lemon-lime soda', 'Lemon wedge and Cherry Garnish'], 'name': 'Lynchburg Lemonade', 'key': 'lynchburgLemonade'}, 'angelTip': {'recipe': ['3/4 oz. Brown Creme de Cacao', 'Cherry garnish', 'Float 1/4 Cream on top', 'Liqueur glass or Brandy snifter'], 'name': 'Angel Tip', 'key': 'angelTip'}, 'dryManhattanUp': {'recipe': ['1/4 oz Dry Vermouth', '2 oz Bourbon', 'Cocktail Glass', 'Olive Garnish', 'Shaker tin with ice'], 'name': 'Dry Manhattan Up', 'key': 'dryManhattanUp'}, 'sangria': {'recipe': ['3/4 oz Grenadine', '3/4 oz Lime Juice', '3/4 oz Peach Schnapps', '4 oz Red Wine', 'Half Fill Orange Juice', 'Half Fill Sour Mix', 'Lime, Lemon and Orange Wedge Garnish', 'Wine Glass'], 'name': 'Sangria', 'key': 'sangria'}, 'tootsieRoll': {'recipe': ['1 oz Kahlua', '1 oz Orange Juice', 'Rocks Glass filled with ice'], 'name': 'Tootsie Roll', 'key': 'tootsieRoll'}, 'liquidCocaine': {'recipe': ['1/2 oz 151 Rum', '1/2 oz Jagermeister', '1/2 oz Rumpleminze', 'Shaker tin filled with ice', 'Shot Glass'], 'name': 'Liquid Cocaine', 'key': 'liquidCocaine'}, 'fuzzyNavel': {'recipe': ['1 oz Peach Schnapps', 'Collins Glass filled with ice', 'Fill with Orange Juice'], 'name': 'Fuzzy Navel', 'key': 'fuzzyNavel'}, 'peachTea': {'recipe': ['1 oz Sour Mix', '1/2 oz Peach Schnapps', '1/2 oz Rum', '1/2 oz Triple Sec', '1/2 oz Vodka', '1/2 oz. Gin', 'Collins glass, filled with ice', 'Lemon wedge garnish', 'Top with Coke'], 'name': 'Peach Tea', 'key': 'peachTea'}, 'butterBaby': {'recipe': ['1/2 oz Baileys', '1/2 oz Butterscotch Schnapps', 'Shaker tin with ice', 'Shot Glass'], 'name': 'Butter Baby', 'key': 'butterBaby'}, 'italianCoffee': {'recipe': ['1 oz Amaretto', 'Coffee Mug', 'Fill with Coffee', 'Whip Cream Garnish'], 'name': 'Italian Coffee', 'key': 'italianCoffee'}, 'whiteWineSpritzer': {'recipe': ['Half Fill Club Soda', 'Half Fill White Wine', 'Lemon Twist Garnish', 'Wine Glass'], 'name': 'White Wine Spritzer', 'key': 'whiteWineSpritzer'}, 'french125': {'recipe': ['1 oz Brandy', '2 oz Sour Mix', 'Fill with Champagne', 'Lemon Twist Garnish', 'Shaker tin filled with ice', 'Specialty Glass'], 'name': 'French 125', 'key': 'french125'}, 'dreamsicle': {'recipe': ['1 oz Amaretto', '1 oz Orange Juice', 'Fill with cream', 'Highball Glass filled with ice'], 'name': 'Dreamsicle', 'key': 'dreamsicle'}, 'greenDragon': {'recipe': ['1-1/2 oz. Vodka', '1/2 oz. Green Creme de Menthe', 'Rocks glass, filled with ice'], 'name': 'Green Dragon', 'key': 'greenDragon'}, 'harveyWallbanger': {'recipe': ['1 oz Vodka', '1/2 oz Float Galliano', 'Collins Glass filled with ice', 'Fill with Orange Juice'], 'name': 'Harvey Wallbanger', 'key': 'harveyWallbanger'}, 'mindEraser': {'recipe': ['1/2 oz Kahlua', '1/2 oz Vodka', 'Fill with Club Soda', 'Rocks Glass filled with ice'], 'name': 'Mind Eraser', 'key': 'mindEraser'}, 'daiquiri,FrozenBanana': {'recipe': ['1 oz. Light Rum', '1-1/2 oz. Sweet and sour', '1/2 Medium ripe banana', 'Blend, but do not strain', 'Large stemmed glass, chilled', 'Mixing cup, 1/2 filled with finely crushed ice'], 'name': 'Daiquiri, Frozen Banana', 'key': 'daiquiri,FrozenBanana'}, 'margarita': {'recipe': ['1 oz Tequila', '1/2 oz Triple Sec', '1/8 oz Lime Juice', '2 oz Sour Mix', 'Lime Wedge Garnish', 'Margarita Glass', 'Salt Rim'], 'name': 'Margarita', 'key': 'margarita'}, 'toastedAlmond': {'recipe': ['1/2 oz Amaretto', '1/2 oz Kahlua', 'Fill with Cream', 'Highball Glass filled with ice'], 'name': 'Toasted Almond', 'key': 'toastedAlmond'}, 'manhattanIceTea': {'recipe': ['1 oz. Sweet and sour', '1/2 oz. Bourbon', '1/2 oz. Gold Tequila', '1/2 oz. Scotch', '1/2 oz. Triple Sec', 'Collins glass, filled with ice', 'Fill with Coke', 'Lemon wedge garnish'], 'name': 'Manhattan Ice Tea', 'key': 'manhattanIceTea'}, 'presbyterian': {'recipe': ['1 oz Bourbon', 'Half Fill Club Soda', 'Half Fill Ginger Ale', 'Highball Glass filled with ice'], 'name': 'Presbyterian', 'key': 'presbyterian'}, 'keokeCoffee': {'recipe': ['1/2 oz Brandy', '1/2 oz Dark Creme de Cacao', '1/2 oz Kahlua', 'Coffee Mug', 'Fill with Coffee', 'Whip Cream Garnish'], 'name': 'Keoke Coffee', 'key': 'keokeCoffee'}, 'vodkaMartiniUp': {'recipe': ['1/8 oz Dry Vermouth', '2 oz Vodka', 'Cocktail Glass', 'Olive Garnish', 'Shaker Tin filled with ice'], 'name': 'Vodka Martini Up', 'key': 'vodkaMartiniUp'}, 'whiteRussian': {'recipe': ['1 1/2 oz Vodka', '1/2 oz Kahlua', 'Fill with Cream', 'Highball Glass filled with ice'], 'name': 'White Russian', 'key': 'whiteRussian'}, 'ramosFizz': {'recipe': ['1 Egg white', '1 oz. Gin', '1-12 oz. Sweet and sour', '1/2 oz. Cream', '2 dashes Orange Flower Water or Orange juice', 'Blend and strain', 'Collins glass, chilled only', 'Fill with Soda', 'Mixing cup, 1/4 filled with ice'], 'name': 'Ramos Fizz', 'key': 'ramosFizz'}, 'screwdriver': {'recipe': ['1 oz Vodka', 'Collins Glass filled with ice', 'Fill with Orange Juice'], 'name': 'Screwdriver', 'key': 'screwdriver'}, 'irishCoffee': {'recipe': ['1 oz Irish Whiskey', '1 Sugar Cube', 'Coffee Mug', 'Fill with Coffee', 'Whip Cream and Green Creme de Menthe Garnish'], 'name': 'Irish Coffee', 'key': 'irishCoffee'}, 'snowShoe': {'recipe': ['1-1/2 oz Wild Turkey (bourbon)', '1/2 oz peppermint schnapps', 'Rocks glass, filled with ice'], 'name': 'Snow Shoe', 'key': 'snowShoe'}, 'snuggler': {'recipe': ['1 oz Peppermint Schnapps', 'Coffee Mug', 'Fill with hot chocolate', 'Whip Cream Garnish'], 'name': 'Snuggler', 'key': 'snuggler'}, 'cementMixer': {'recipe': ["1 oz Bailey's", '1/4 oz Roses Lime Juice', 'Shot Glass'], 'name': 'Cement Mixer', 'key': 'cementMixer'}, 'marlonBrando': {'recipe': ['1-1/2 oz. Scotch', '1/2 oz. Amaretto', 'Rocks glass, filled with ice', 'Top with 1/2 oz. Cream'], 'name': 'Marlon Brando', 'key': 'marlonBrando'}, 'rustyNail': {'recipe': ['1 1/2 oz Scotch', '1/2 oz Drambuie', 'Rocks Glass filled with ice'], 'name': 'Rusty Nail', 'key': 'rustyNail'}, 'alexander': {'recipe': ['1/2 oz. Gin', '1/2 oz. White Creme de Cacao', '2 oz. cream', 'Mixing cup, 1/4 filled with ice', 'Nutmeg garnish', 'Shake and strain', 'Stemmed cocktail glass, chilled'], 'name': 'Alexander', 'key': 'alexander'}, 'mudslide': {'recipe': ['1/2 oz Coffee Liqueur', '1/2 oz Irish Cream', '1/2 oz Vodka', 'Rocks Glass filled with ice'], 'name': 'Mudslide', 'key': 'mudslide'}, 'champagneCocktail': {'recipe': ['1 Sugar Cube', '1/16 oz Bitters', 'Champagne Glass', 'Fill with Champagne', 'Lemon Twist Garnish', 'Muddle'], 'name': 'Champagne Cocktail', 'key': 'champagneCocktail'}, 'cubaLibre': {'recipe': ['1 oz Lt. Rum', 'Fill with Cola', 'Highball Glass filled with ice', 'Lime Garnish'], 'name': 'Cuba Libre', 'key': 'cubaLibre'}, 'alabamaSlammer': {'recipe': ['1/2 oz Amaretto', '1/2 oz Sloe Gin', '1/2 oz Southern Comfort', 'Collins Glass, filled with ice'], 'name': 'Alabama Slammer', 'key': 'alabamaSlammer'}, 'banshee': {'recipe': ['1/2 oz Banana Liqueur', '1/2 oz White Creme de Cacao', '2 oz Cream', 'Cocktail Glass', 'Shaker tin filled with ice'], 'name': 'Banshee', 'key': 'banshee'}, 'whiteWineCooler': {'recipe': ['Half Fill Lemon-Lime Soda', 'Half Fill White Wine', 'Lemon Twist Garnish', 'Wine Glass'], 'name': 'White Wine Cooler', 'key': 'whiteWineCooler'}, 'dirtyMother': {'recipe': ['1 1/2 oz Brandy', '1/2 oz Kahlua', 'Rocks Glass filled with ice'], 'name': 'Dirty Mother', 'key': 'dirtyMother'}, 'chiChi': {'recipe': ['1 oz Cream of Coconut Syrup', '1 oz Vodka', '2 oz Pineapple Juice', 'Blend', 'Cherry Garnish', 'Specialty Glass'], 'name': 'Chi Chi', 'key': 'chiChi'}, 'kirRoyale': {'recipe': ['1/2 oz Creme de Cassis', 'Champagne Glass', 'Fill with Champagne', 'Lemon Twist Garnish'], 'name': 'Kir Royale', 'key': 'kirRoyale'}, 'stinger': {'recipe': ['1 1/2 oz Brandy', '1/2 oz White Creme de Menthe', 'Rocks Glass filled with ice'], 'name': 'Stinger', 'key': 'stinger'}, 'goldenCadillac': {'recipe': ['1/2 oz Galliano', '1/2 oz White Creme de Cacao', '2 oz Cream', 'Cocktail Glass', 'Shaker tin filled with ice'], 'name': 'Golden Cadillac', 'key': 'goldenCadillac'}, 'champagneFramboise': {'recipe': ['1/2 oz Chambord', 'Champagne Glass', 'Fill with Champagne'], 'name': 'Champagne Framboise', 'key': 'champagneFramboise'}, 'ginMartini': {'recipe': ['2 oz Gin', '6 Drops Dry Vermouth', 'Cocktail Glass', 'Olive Garnish', 'Shaker tin filled with ice'], 'name': 'Gin Martini', 'key': 'ginMartini'}, 'oldFashioned': {'recipe': ['1 Cherry', '1 Orange Wedge', '1 oz Bourbon', '1/16 oz Bitters', '1/2 oz Sugar', 'Fill with Club Soda', 'Flag Garnish', 'Highball Glass filled ice', 'Muddle'], 'name': 'Old Fashioned', 'key': 'oldFashioned'}, 'peppermintPatty': {'recipe': ['1/2 oz. Brown Creme de Cacao', '1/2 oz. Peppermint Schnapps', '2 oz. Cream', 'Mixing cup, 1/4 filled with ice', 'Shake and strain', 'Stemmed cocktail glass, chilled'], 'name': 'Peppermint Patty', 'key': 'peppermintPatty'}, 'screamingFuzzyNavel': {'recipe': ['1 oz Peach Schnapps', '1/2 oz Vodka', 'Collins Glass filled with ice', 'Fill with Orange Juice'], 'name': 'Screaming Fuzzy Navel', 'key': 'screamingFuzzyNavel'}, 'grasshopper': {'recipe': ['1/2 oz Green Creme de Menthe', '1/2 oz White Creme de Cacao', '2 oz Cream', 'Cocktail Glass', 'Shaker tin filled with ice'], 'name': 'Grasshopper', 'key': 'grasshopper'}, 'vodkaGimlet': {'recipe': ['1 1/2 oz Vodka', '1/2 oz Lime Juice', 'Lime Wedge Garnish', 'Rocks Glass filled with ice'], 'name': 'Vodka Gimlet', 'key': 'vodkaGimlet'}, 'frenchConnection': {'recipe': ['3/4 oz Cognac', '3/4 oz Grand Marnier', 'Snifter Glass'], 'name': 'French Connection', 'key': 'frenchConnection'}, 'toxicWaste': {'recipe': ['1/2 oz. Cherry Brandy', '1/2 oz. Grapefruit juice', '1/2 oz. Orange juice', '1/2 oz. Rum', '1/2 oz. Tequila', 'Bucket glass, filled with ice', 'Mixing cup, 1/4 filled with ice', 'Shake and strain', 'Splash Coke', 'Top with 1/2 oz. 151 Rum'], 'name': 'Toxic Waste', 'key': 'toxicWaste'}, 'surferOnAcid': {'recipe': ['3/4 oz Jagermeister', '3/4 oz Malibu Rum', 'Fill with Pineapple Juice', 'Highball Glass filled with ice'], 'name': 'Surfer On Acid', 'key': 'surferOnAcid'}, 'jackRoseCocktail': {'recipe': ['1 oz. Applejack', '1-1/2 oz. Sweet and sour', '1/2 oz. Grenadine', 'Mixing cup, 1/4 filled with ice', 'Shake and strain', 'Stemmed cocktail glass, chilled'], 'name': 'Jack Rose Cocktail', 'key': 'jackRoseCocktail'}, 'bayBreeze': {'recipe': ['1 oz Vodka', 'Cherry Garnish', 'Collins Glass filled with ice', 'Half Fill Cranberry Juice', 'Half Fill Pineapple Juice'], 'name': 'Bay Breeze', 'key': 'bayBreeze'}, 'sicilianKiss': {'recipe': ['1-1/2 oz. Southern Comfort', '1/2 oz. Amaretto', 'Rocks glass, filled with ice', 'Stir'], 'name': 'Sicilian Kiss', 'key': 'sicilianKiss'}, 'midoriSour': {'recipe': ['1 oz Midori', 'Fill with Sour Mix', 'Highball Glass filled with ice'], 'name': 'Midori Sour', 'key': 'midoriSour'}, 'bloodyBull': {'recipe': ['1 oz. vodka', '1/2 fill Bloody Mary mix', '1/2 fill with beef bouillon', 'Collins Glass, filled with ice'], 'name': 'Bloody Bull', 'key': 'bloodyBull'}, 'madras': {'recipe': ['1 oz Vodka', 'Cherry Garnish', 'Collins Glass filled with ice', 'Half fill with Cranberry Juice', 'Half fill with Orange Juice'], 'name': 'Madras', 'key': 'madras'}, 'sombrero': {'recipe': ['1 oz Kahlua', 'Fill with cream', 'Highball glass, filled with ice'], 'name': 'Sombrero', 'key': 'sombrero'}, 'hurricane': {'recipe': ['1 oz Dark Rum', '1 oz Lt. Rum', 'Collins Glass filled with ice', 'Float 1/2 oz Grenadine', 'Half Fill Orange Juice', 'Half Fill Sour Mix'], 'name': 'Hurricane', 'key': 'hurricane'}, 'daiquiri,FrozenStrawberry': {'recipe': ['1 oz. Light Rum', '1-1/2 oz. Sweet and sour', '1/2 cup Frozen strawberries, thawed', 'Blend, but do not strain', 'Large stemmed glass, chilled', 'Mixing cup, 1/2 filled with finely crushed ice'], 'name': 'Daiquiri, Frozen Strawberry', 'key': 'daiquiri,FrozenStrawberry'}, 'sloeComfortableScrew': {'recipe': ['1 oz Sloe Gin', '1/2 oz Southern Comfort', 'Cherry Garnish', 'Collins Glass filled with ice', 'Fill with Orange Juice'], 'name': 'Sloe Comfortable Screw', 'key': 'sloeComfortableScrew'}, 'deadNazi': {'recipe': ['3/4 oz Jagermeister', '3/4 oz Rumpleminze', 'Shot Glass'], 'name': 'Dead Nazi', 'key': 'deadNazi'}, 'yellowBird': {'recipe': ['1 oz. Light Rum', '1-1/2 oz. Orange juice', '1-1/2 oz. Pineapple juice', '1/2 oz. Banana liqueur', '1/2 oz. Galliano', 'Collins glass, filled with ice', 'Mixing cup, 1/4 filled with ice', 'Shake and strain'], 'name': 'Yellow Bird', 'key': 'yellowBird'}, 'slowScrew': {'recipe': ['1 oz Sloe Gin', 'Cherry Garnish', 'Collins Glass filled with ice', 'Fill with Orange Juice'], 'name': 'Slow Screw', 'key': 'slowScrew'}, 'tequilaSunrise': {'recipe': ['1 oz Tequila', 'Cherry Garnish', 'Collins Glass filled with ice', 'Fill with Orange Juice', 'Float 1/2 oz Grenadine'], 'name': 'Tequila Sunrise', 'key': 'tequilaSunrise'}, 'pinkLady': {'recipe': ['1 1/2 oz Cream', '1 oz Gin', '1/2 oz Grenadine', 'Cocktail Glass', 'Shaker tin filled with ice'], 'name': 'Pink Lady', 'key': 'pinkLady'}, 'pinkSquirrel': {'recipe': ['1/2 oz Creme de Almond', '1/2 oz White Creme de Cacao', '2 oz Cream', 'Cocktail Glass', 'Shaker tin filled with ice'], 'name': 'Pink Squirrel', 'key': 'pinkSquirrel'}, 'jamaicanCoffee': {'recipe': ['1/2 oz Myers Dark Rum', '1/2 oz Tia Maria', 'Coffee Mug', 'Fill with Coffee', 'Whip Cream Garnish'], 'name': 'Jamaican Coffee', 'key': 'jamaicanCoffee'}, 'pinaColada': {'recipe': ['1 oz Cream of Coconut Syrup', '1 oz Lt. Rum', '2 oz Pinapple Juice', 'Blend', 'Cherry Garnish', 'Specialty Glass'], 'name': 'Pina Colada', 'key': 'pinaColada'}, 'zombie': {'recipe': ['1 oz Lt. Rum', '1/2 oz Creme de Almond', '1/2 oz Triple Sec', 'Collins Glass filled with ice', 'Flag Garnish', 'Float 1/2 oz 151 Rum', 'Half Fill Orange Juice', 'Half Fill Sour Mix'], 'name': 'Zombie', 'key': 'zombie'}, 'vodkaCollins': {'recipe': ['1 oz Vodka', '2 oz Sour Mix', 'Cherry Garnish', 'Collins Glass filled with ice', 'Fill with Club Soda'], 'name': 'Vodka Collins', 'key': 'vodkaCollins'}, 'whiteElephant/WhiteLady': {'recipe': ['1/2 oz. Triple Sec', '1/2 oz. Vodka', '2 oz. Cream', 'Mixing cup, 1/4 filled with ice', 'Shake and strain', 'Stemmed cocktail glass, chilled'], 'name': 'White Elephant / White Lady', 'key': 'whiteElephant/WhiteLady'}, 'capeCod': {'recipe': ['1 oz Vodka', 'Collins Glass filled with ice', 'Fill with Cranberry Juice', 'Lime wedge garnish'], 'name': 'Cape Cod', 'key': 'capeCod'}, 'whiteSpider': {'recipe': ['1-1/2 oz. Vodka', '1/2 oz. White Creme de Menthe', 'Rocks glass, filled with ice'], 'name': 'White Spider', 'key': 'whiteSpider'}, 'sloeGinFizz': {'recipe': ['1 oz Sloe Gin', '2 oz Sour Mix', 'Cherry Garnish', 'Collins Glass filled with ice', 'Fill with Club Soda'], 'name': 'Sloe Gin Fizz', 'key': 'sloeGinFizz'}, 'electricLemonade': {'recipe': ['1/2 oz Blue Curacao', '1/2 oz Gin', '1/2 oz Rum', '1/2 oz Vodka', '2 oz Sour Mix', 'Collins Glass filled with ice', 'Fill with lemon-lime soda', 'Lemon Wedge garnish'], 'name': 'Electric Lemonade', 'key': 'electricLemonade'}, 'hotToddy': {'recipe': ['1 oz Bourbon or Brandy', '1/2 oz Honey', 'Coffee Mug', 'Fill with Hot Water', 'Lemon Squeeze Garnish'], 'name': 'Hot Toddy', 'key': 'hotToddy'}, 'gimlet': {'recipe': ['1 1/2 oz Gin', '1/2 oz Lime Juice', 'Lime Wedge Garnish', 'Rocks Glass filled with ice'], 'name': 'Gimlet', 'key': 'gimlet'}, 'melonBall': {'recipe': ['1 oz Vodka', '1/2 oz Midori', 'Collins Glass filled with ice', 'Fill with Orange Juice'], 'name': 'Melon Ball', 'key': 'melonBall'}, 'brassMonkey': {'recipe': ['1/2 oz. Rum', '1/2 oz. Vodka', 'Fill with Orange juice', 'Highball glass, filled with ice'], 'name': 'Brass Monkey', 'key': 'brassMonkey'}, 'betweenTheSheets': {'recipe': ['1-1/2 oz. Sweet and sour', '1/2 oz. Brandy', '1/2 oz. Rum', '1/2 oz. Triple Sec', 'Mixing cup, 1/4 filled with ice', 'Shake and strain', 'Stemmed cocktail glass, chilled'], 'name': 'Between The Sheets', 'key': 'betweenTheSheets'}, 'longBeachTea': {'recipe': ['1/2 oz Gin', '1/2 oz Rum', '1/2 oz Triple Sec', '1/2 oz Vodka', '2 oz Sour Mix', 'Collins Glass filled with ice', 'Fill with Cranberry Juice', 'Lemon Wedge Garnish'], 'name': 'Long Beach Tea', 'key': 'longBeachTea'}, 'ginRickey': {'recipe': ['1 oz Gin', 'Fill with Soda Water', 'Highball Glass filled with ice', 'Lime Wedge Garnish'], 'name': 'Gin Rickey', 'key': 'ginRickey'}, 'snakeBite': {'recipe': ['1 oz Yukon Jack', '1/4 oz Lime Juice', 'Shaker tin filled with ice', 'Shot Glass'], 'name': 'Snake Bite', 'key': 'snakeBite'}, 'whiskeySour': {'recipe': ['1 oz Bourbon', 'Cherry Garnish', 'Fill with Sour Mix', 'Highball Glass filled with ice'], 'name': 'Whiskey Sour', 'key': 'whiskeySour'}, 'blackJamaican': {'recipe': ['1 1/2 oz Myers Dark Rum', '1/2 oz Tia Maria', 'Rocks Glass filled with ice'], 'name': 'Black Jamaican', 'key': 'blackJamaican'}, 'almondJoy': {'recipe': ['1/2 oz. Amaretto', '1/2 oz. White Creme de Cacao', '2 oz. cream', 'Mixing cup, 1/4 filled with ice', 'Shake and strain', 'Stemmed cocktail glass, chilled'], 'name': 'Almond Joy', 'key': 'almondJoy'}, 'godmother': {'recipe': ['1 1/2 oz Vodka', '1/2 oz Amaretto', 'Rocks Glass filled with ice'], 'name': 'Godmother', 'key': 'godmother'}, 'skipAndGoNaked': {'recipe': ['1 oz. Gin', '2 oz. sweet and sour', 'Collins glass, filled with ice', 'Fill with Beer', 'Stir lightly', 'Stir well'], 'name': 'Skip And Go Naked', 'key': 'skipAndGoNaked'}, 'ginAndTonic': {'recipe': ['1 oz Gin', 'Fill with Tonic', 'Highball Glass filled with ice', 'Lime wedge garnish'], 'name': 'Gin And Tonic', 'key': 'ginAndTonic'}, 'screamingOrgasm': {'recipe': ['1/4 oz Amaretto', '1/4 oz Baileys', '1/4 oz Kahlua', '1/4 oz Vodka', 'Shot Glass'], 'name': 'Screaming Orgasm', 'key': 'screamingOrgasm'}, 'redSnapper': {'recipe': ['1-1/4 oz. Gin', 'Bucket glass, filled with ice', 'Fill with Bloody Mary mix'], 'name': 'Red Snapper', 'key': 'redSnapper'}, 'bloodyMary': {'recipe': ['1 oz Vodka', 'Collins Glass filled with ice', 'Fill with bloody mary mix', 'Lime wedge and Celery Stalk Garnish'], 'name': 'Bloody Mary', 'key': 'bloodyMary'}, 'robRoyRocks': {'recipe': ['1/4 oz Sweet Vermouth', '2 oz Scotch', 'Cherry Garnish', 'Rocks Glass filled with ice'], 'name': 'Rob Roy Rocks', 'key': 'robRoyRocks'}, 'hotButteredRum': {'recipe': ['1 Bar spoon hot buttered rum mix', '1 oz Rum', 'Coffee Mug', 'Fill with Hot Water'], 'name': 'Hot Buttered Rum', 'key': 'hotButteredRum'}, 'french75': {'recipe': ['1 oz Gin', '2 oz Sour Mix', 'Fill with Champagne', 'Lemon Twist Garnish', 'Shaker tin filled with ice', 'Specialty Glass'], 'name': 'French 75', 'key': 'french75'}, 'highball': {'recipe': ['1 oz Bourbon', 'Fill with Ginger Ale', 'Highball Glass filled with ice'], 'name': 'Highball', 'key': 'highball'}, 'blueHawaiian': {'recipe': ['1 oz Lt. Rum', '1/2 oz Blue Curacao', '2 oz Pineapple Juice', '2 oz Sour Mix', 'Collins Glass filled with ice', 'Flag garnish', 'Shaker tin with ice'], 'name': 'Blue Hawaiian', 'key': 'blueHawaiian'}, 'kamikaze': {'recipe': ['1 oz Vodka', '1/2 oz Triple Sec', '1/4 oz Lime Juice', 'Shaker tin filled with ice', 'Shot Glass'], 'name': 'Kamikaze', 'key': 'kamikaze'}, 'b&Amp;B': {'recipe': ['3/4 oz Benedictine', '3/4 oz Brandy', 'Snifter'], 'name': 'B&Amp;B', 'key': 'b&Amp;B'}, 'johnCollins': {'recipe': ['1 oz Bourbon', '2 oz Sour Mix', 'Cherry Garnish', 'Collins Glass filled with ice', 'Fill with Club Soda'], 'name': 'John Collins', 'key': 'johnCollins'}, 'lemonade': {'recipe': ['1/2 oz Gin', '1/2 oz Rum', '1/2 oz Triple Sec', '1/2 oz Vodka', '2 oz Sour Mix', 'Collins Glass filled with ice', 'Fill with Lemon-lime soda', 'Lemon Wedge Garnish'], 'name': 'Lemonade', 'key': 'lemonade'}, 'cosmopolitan': {'recipe': ['1 oz vodka', '1/2 oz cranberry juice', '1/2 oz orange liqueur', 'Orange/or lemon twist garnish', 'Stemmed glass, chilled'], 'name': 'Cosmopolitan', 'key': 'cosmopolitan'}, 'navyGrog': {'recipe': ['1 oz. Light rum', '1 oz. Myersu2019s Rum', 'Collins or Specialy glass, filled with ice', 'Fill with equal parts Orange juice, Pineapple juice and Grapefruit juice', 'Flag garnish', 'Top with 1/2 oz. 151 Rum'], 'name': 'Navy Grog', 'key': 'navyGrog'}, 'sexOnTheBeach': {'recipe': ['1 oz Vodka', '1/2 oz Peach Schnapps', 'Collins Glass filled with ice', 'Half Fill Cranberry Juice', 'Half Fill Orange Juice'], 'name': 'Sex On The Beach', 'key': 'sexOnTheBeach'}, 'purpleHooter': {'recipe': ['1 oz Vodka', '1/2 oz Chambord', 'Shaker Tin filled with ice', 'Shot Glass', 'Splash of Sour Mix'], 'name': 'Purple Hooter', 'key': 'purpleHooter'}, 'joeCollins': {'recipe': ['1 oz Scotch', '2 oz Sour Mix', 'Cherry Garnish', 'Collins Glass filled with ice', 'Fill with Club Soda'], 'name': 'Joe Collins', 'key': 'joeCollins'}, 'gibsonRocks': {'recipe': ['1/8 oz Dry Vermouth', '2 oz Gin', 'Cocktail Onion Garnish', 'Rocks glass filled with ice'], 'name': 'Gibson Rocks', 'key': 'gibsonRocks'}, 'redBeer': {'recipe': ['1/2 Tomato Juice or Bloody Mary mix.', '3/4 Beer', 'Beer Glass'], 'name': 'Red Beer', 'key': 'redBeer'}, 'lemonDrop': {'recipe': ['1 Lemon Wedge', '1 oz Vodka', '1/2 oz Tripel Sec', 'Shaker tin filled with ice', 'Shot Glass'], 'name': 'Lemon Drop', 'key': 'lemonDrop'}, 'bacardiCocktail': {'recipe': ['1 oz Bacardi Lt Rum', '1/4 oz Grenadine', '2 oz Sweet and Sour', 'Cherry Garnish', 'Cocktail Glass', 'Shaker Tin filled with ice'], 'name': 'Bacardi Cocktail', 'key': 'bacardiCocktail'}, 'french95': {'recipe': ['1 oz Bourbon', '2 oz Sour Mix', 'Fill with Champagne', 'Lemon Twist Garnish', 'Shaker tin filled with ice', 'Specialty Glass'], 'name': 'French 95', 'key': 'french95'}, 'depthCharge': {'recipe': ["1 Shot of Guest's choice Liquor", '1/2 Glass of Beer', 'Drop shot into glass of beer'], 'name': 'Depth Charge', 'key': 'depthCharge'}, 'tomCollins': {'recipe': ['1 oz Gin', '2 oz Sour Mix', 'Cherry Garnish', 'Collins Glass filled with ice', 'Fill with Club Soda'], 'name': 'Tom Collins', 'key': 'tomCollins'}, 'maiTai': {'recipe': ['1 oz Lt. Rum', '1/2 oz Creme de Almond', '1/2 oz Float of Myers Dark Rum', '1/2 oz Triple Sec', 'Collins Glass filled with ice', 'Fill with Sour Mix', 'Flag Garnish'], 'name': 'Mai Tai', 'key': 'maiTai'}, 'blackRussian': {'recipe': ['1 1/2 oz Vodka', '1/2 oz Kahlua', 'Rocks Glass filled with ice'], 'name': 'Black Russian', 'key': 'blackRussian'}, 'internationalStinger': {'recipe': ['1-1/2 oz. Metaxa', '1/2 oz. Galliano', 'Rocks glass, filled with ice'], 'name': 'International Stinger', 'key': 'internationalStinger'}, 'saltyDog': {'recipe': ['1 oz Vodka', 'Collins Glass filled with ice', 'Fill with Grapefruit Juice', 'Salt Rim'], 'name': 'Salty Dog', 'key': 'saltyDog'}, 'blowJob': {'recipe': ['1/3 oz Amaretto', '1/3 oz Baileys', '1/3 oz Frangelico', 'Shot Glass', 'Whip Cream Garnish'], 'name': 'Blow Job', 'key': 'blowJob'}, 'italianStallion/ItalianStinger': {'recipe': ['1-1/2 oz. Brandy', '1/2 oz. Galliano', 'Rocks glass, filled with ice'], 'name': 'Italian Stallion / Italian Stinger', 'key': 'italianStallion/ItalianStinger'}, 'sexyAlligator': {'recipe': ['1/2 oz Chambord', '1/2 oz Jagermeister', '1/2 oz Midori', 'Shot Glass'], 'name': 'Sexy Alligator', 'key': 'sexyAlligator'}, 'slipperyNipple': {'recipe': ['1/4 oz Baileys', '3/4 oz Sambuca', 'Shaker Tin filled with ice', 'Shot Glass'], 'name': 'Slippery Nipple', 'key': 'slipperyNipple'}, 'bullShot': {'recipe': ['1 oz. Vodka', 'Fill with Beef bouillon or Bull Shot pre-mix', 'Highball glass, filled with ice', 'Lime garnish (optional)', 'Stir well'], 'name': 'Bull Shot', 'key': 'bullShot'}, 'vodkaCranberry': {'recipe': ['1 oz Vodka', 'Fill with Cranberry Juice', 'Highball Glass filled with ice'], 'name': 'Vodka Cranberry', 'key': 'vodkaCranberry'}, 'longIslandIcedTea': {'recipe': ['1/2 oz Gin', '1/2 oz Rum', '1/2 oz Triple Sec', '1/2 oz Vodka', '2 oz Sour Mix', 'Collins Glass filled with ice', 'Fill with Cola', 'Lemon Wedge Garnish'], 'name': 'Long Island Iced Tea', 'key': 'longIslandIcedTea'}, 'mexicanCoffee': {'recipe': ['1 oz Kahlua', 'Coffee Mug', 'Fill with Coffee', 'Whip Cream Garnish'], 'name': 'Mexican Coffee', 'key': 'mexicanCoffee'}, 'bocciBall': {'recipe': ['1 oz Amaretto', '2 oz orange juice', 'Collins Glass filled with ice', 'Fill with club soda'], 'name': 'Bocci Ball', 'key': 'bocciBall'}, 'scoobySnack': {'recipe': ['1 oz Pineapple Juice', '1/2 oz Cream', '3/4 oz Malibu Rum', '3/4 oz Melon Liqueur', 'Rocks Glass', 'Shaker tin filled with ice'], 'name': 'Scooby Snack', 'key': 'scoobySnack'}, 'greyhound': {'recipe': ['1 oz Vodka', 'Collins Glass filled with ice', 'Fill with Grapefruit Juice'], 'name': 'Greyhound', 'key': 'greyhound'}, 'rumAndCoke': {'recipe': ['1 oz Lt. Rum', 'Fill with Cola', 'Highball Glass filled with ice'], 'name': 'Rum And Coke', 'key': 'rumAndCoke'}, 'campariAndSoda': {'recipe': ['1 oz. Campari', 'Fill with Soda', 'Highball glass, filled with ice', 'Lemon twist garnish', 'Stir'], 'name': 'Campari And Soda', 'key': 'campariAndSoda'}, 'bloodyCeasar': {'recipe': ['1 oz vodka', 'Collins Glass, filled with ice', 'Fill with Clamato juice (Clam/Tomato juice)'], 'name': 'Bloody Ceasar', 'key': 'bloodyCeasar'}, 'oatmealCookie': {'recipe': ["1/4 oz Bailey's", '1/4 oz Butterscotch Schnapps', '1/4 oz Goldschlager', '1/4 oz Jagermeister', 'Shaker Tin filled with ice', 'Shot Glass'], 'name': 'Oatmeal Cookie', 'key': 'oatmealCookie'}, 'scotchAndSoda': {'recipe': ['1 oz Scotch', 'Fill with Club Soda', 'Highball Glass filled with ice'], 'name': 'Scotch And Soda', 'key': 'scotchAndSoda'}, 'goldenDream': {'recipe': ['1 oz Cream', '1/2 oz Galliano', '1/2 oz Orange Juice', '1/2 oz Triple Sec', 'Cocktail Glass', 'Shaker tin filled with ice'], 'name': 'Golden Dream', 'key': 'goldenDream'}, 'frenchCoffee': {'recipe': ['1/2 oz Cognac', '1/2 oz Grand Marnier', 'Coffee Mug', 'Fill with Coffee', 'Whip Cream garnish'], 'name': 'French Coffee', 'key': 'frenchCoffee'}, 'silkPanties': {'recipe': ['1/2 oz Peach Schnapps', '1/2 oz Vodka', 'Shaker tin filled with ice', 'Shot Glass'], 'name': 'Silk Panties', 'key': 'silkPanties'}, 'dryRobRoy': {'recipe': ['1/4 oz Dry Vermouth', '2 oz Scotch', 'Cocktail Glass', 'Olive garnish', 'Shaker tin with ice'], 'name': 'Dry Rob Roy', 'key': 'dryRobRoy'}, 'miamiViceTea': {'recipe': ['1 oz. Orange juice', '1/2 Gin', '1/2 oz. Peach Schnapps', '1/2 oz. Vodka', 'Collins glass, filled with ice', 'Fill with 7-up'], 'name': 'Miami Vice Tea', 'key': 'miamiViceTea'}, 'brandyAlexander': {'recipe': ['1/2 oz Brandy', '1/2 oz Dark Creme de Cacao', '2 oz Cream', 'Cocktail Glass', 'Nutmeg Garnish', 'Shaker tin with ice'], 'name': 'Brandy Alexander', 'key': 'brandyAlexander'}, 'plantersPunch': {'recipe': ['1 oz Myers Dark Rum', '1/8 oz Bitters', 'Collins Glass filled with ice', 'Flag Garnish', 'Float 1/2 oz Grenadine', 'Half Fill Orange Juice', 'Half Fill Sour Mix'], 'name': 'Planters Punch', 'key': 'plantersPunch'}, 'whiskeyAndWater': {'recipe': ['1 oz Bourbon', 'Fill with Water', 'Highball Glass filled with ice'], 'name': 'Whiskey And Water', 'key': 'whiskeyAndWater'}, 'spanishCoffee': {'recipe': ['1/2 oz 151 Rum', '1/2 oz Coffee Liqueur', '1/2 oz Triple Sec', 'Coffee Mug', 'Fill with Coffee', 'Whip Cream Garnish'], 'name': 'Spanish Coffee', 'key': 'spanishCoffee'}, 'joanCollins': {'recipe': ['1 oz Brandy', '2 oz Sour Mix', 'Cherry Garnish', 'Collins Glass filled with ice', 'Fill with Club Soda'], 'name': 'Joan Collins', 'key': 'joanCollins'}, 'sideCar': {'recipe': ['1-1/4 oz. Brandy', '1/2 oz. Triple Sec', '2 oz. Sweet and sour', 'Margarita glass, sugar rim, filled with ice', 'Mixing cup, 1/4 filled with ice', 'Shake and strain'], 'name': 'Side Car', 'key': 'sideCar'}, 'southernComfortManhattanRocks': {'recipe': ['1/4 oz Dry Vermouth', '2 oz Southern Comfort', 'Cherry Garnish', 'Rocks Glass filled with ice'], 'name': 'Southern Comfort Manhattan Rocks', 'key': 'southernComfortManhattanRocks'}, 'godfather': {'recipe': ['1 1/2 oz Scotch', '1/2 oz Amaretto', 'Rocks Glass filled with ice'], 'name': 'Godfather', 'key': 'godfather'}, 'kir': {'recipe': ['1/2 oz Creme de Cassis', 'Fill with White Wine', 'Lemon twist Garnish', 'Wine Glass'], 'name': 'Kir', 'key': 'kir'}, 'b-52': {'recipe': ["1/2 oz Bailey's", '1/2 oz Grand Marnier', '1/2 oz Kahlua', 'Shot Glass'], 'name': 'B-52', 'key': 'b-52'}, 'braveBull': {'recipe': ['1 1/2 oz Tequila', '1/2 oz Kahlua', 'Rocks Glass filled with ice'], 'name': 'Brave Bull', 'key': 'braveBull'}, 'jagerBomb': {'recipe': ['1 shot Jagermeister', '1/2 Glass of Red Bull', 'Drop shot into glass of Red Bull'], 'name': 'Jager Bomb', 'key': 'jagerBomb'}, 'mimosa': {'recipe': ['Fill with equal parts chilled Orange juice and Champagne', 'Large Wine or Champagne glass, chilled'], 'name': 'Mimosa', 'key': 'mimosa'}, 'rootbeerFloat': {'recipe': ['1 1/2 oz Cream', '1 1/2 oz Vodka', '1 oz Cola', '1/2 oz Kahlua', 'Cherry and Whip Cream Garnish', 'Collins Glass filled with ice', 'Top with 1/2 oz Galliano'], 'name': 'Rootbeer Float', 'key': 'rootbeerFloat'}, 'daiquiri': {'recipe': ['1 oz Light Rum', '2 oz Sweet and Sour', 'Cocktail Glass', 'Lime Garnish', 'Shaker tin filled with ice'], 'name': 'Daiquiri', 'key': 'daiquiri'}, 'rhettButler': {'recipe': ['1-1/4 oz. Southern Comfort', '1/2 oz. lime juice', '1/2 oz. sweet and sour', 'Rocks glass, filled with ice'], 'name': 'Rhett Butler', 'key': 'rhettButler'}, 'fogcutter': {'recipe': ['1 oz Rum', '1/2 oz Brandy', '1/2 oz Gin', 'Collins Glass filled with ice', 'Flag Garnish', 'Half fill orange juice', 'Half fill sour mix'], 'name': 'Fogcutter', 'key': 'fogcutter'}, 'bahamaMama': {'recipe': ['1/2 oz 151 Rum', '1/2 oz Coconut Rum', '1/2 oz Coffee Liqueur', '1/2 oz Dark Rum', 'Cherry Garnish', 'Half Fill Orange Juice', 'Half Fill Pineapple Juice', 'Specialty Glass filled with ice'], 'name': 'Bahama Mama', 'key': 'bahamaMama'}, 'electricIcedTea': {'recipe': ['1/2 oz Gin', '1/2 oz Rum', '1/2 oz Tequila', '1/2 oz Triple Sec', '1/2 oz Vodka', '2 oz Sour Mix', 'Collins Glass filled with ice', 'Fill with Cola', 'Lemon Wedge Garnish'], 'name': 'Electric Iced Tea', 'key': 'electricIcedTea'}, 'singaporeSling': {'recipe': ['1 oz Gin', '1/2 oz Grenadine', '2 oz Sour Mix', 'Collins Glass filled with ice', 'Fill with Club Soda', 'Flag Garnish', 'Float 1/2 oz Cherry Brandy'], 'name': 'Singapore Sling', 'key': 'singaporeSling'}, 'manhattan': {'recipe': ['1/4 oz Sweet Vermouth', '2 oz Bourbon', 'Cherry Garnish', 'Cocktail Glass', 'Shaker Tin filled with ice'], 'name': 'Manhattan', 'key': 'manhattan'}, 'coloradoBulldog': {'recipe': ['1 1/2 oz Cream', '1 1/2 oz Vodka', '1/2 oz Kahlua', 'Highball Glass filled with ice', 'Splash Cola'], 'name': 'Colorado Bulldog', 'key': 'coloradoBulldog'}, 'smith&Amp;Kerns': {'recipe': ['1 oz Kahlua', '2 oz Cream', 'Fill with Club Soda', 'Highball Glass filled with ice'], 'name': 'Smith &Amp; Kerns', 'key': 'smith&Amp;Kerns'}, 'seaBreeze': {'recipe': ['1 oz Vodka', 'Collins Glass filled with ice', 'Half Fill Cranberry Juice', 'Half Fill Grapefruit Juice'], 'name': 'Sea Breeze', 'key': 'seaBreeze'}, 'whiteWing': {'recipe': ['1-1/2 oz Gin', '1/2 oz. White Creme de Menthe', 'Rocks glass, filled with ice'], 'name': 'White Wing', 'key': 'whiteWing'}, 'freddyFudpucker(CactusCooler)': {'recipe': ['1 oz Tequila', 'Collins Glass, filled with ice', 'Fill with orange juice', 'Top with 1/2 oz Galliano'], 'name': 'Freddy Fudpucker (Cactus Cooler)', 'key': 'freddyFudpucker(CactusCooler)'}, 'perfectRobRoy': {'recipe': ['1/8 oz Dry Vermouth', '1/8 oz Sweet Vermouth', '2 oz Scotch', 'Lemon Twist Garnish', 'Rocks Glass filled with ice'], 'name': 'Perfect Rob Roy', 'key': 'perfectRobRoy'}, 'margarita,FrozenStrawberry': {'recipe': ['1 oz. Tequila', '1-1/2 oz. Sweet and sour', '1/2 cup Frozen thawed strawberries', 'Blend, but do not strain', 'Margarita', 'Mixing cup, 1/4 filled with finely crushed ice'], 'name': 'Margarita, Frozen Strawberry', 'key': 'margarita,FrozenStrawberry'}, 'martini': {'recipe': ['1/8 oz Dry Vermouth', '2 oz Gin', 'Cocktail Glass', 'Olive Garnish', 'Shaker tin filled with ice'], 'name': 'Martini', 'key': 'martini'}}
});




// app.controller('MainController', ['$scope', 'Cocktails', function($scope, Cocktails) {
	// $scope.recipe = Cocktails.maiTai.recipe

// 	$scope.hello = "Hello, world!"
// }]);