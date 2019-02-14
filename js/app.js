var app = angular.module('arbncoApp', ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
    
    $routeProvider
    .when('/', {
        templateUrl: 'views/home.html',
        controller: 'mainController'
    })
    .when('/graph/:forecastId', {
        templateUrl: 'views/graph.html',
        controller: 'graphController'
    })
    .when('/graph/', {
        templateUrl: 'views/graph.html',
        controller: 'graphController'
    })
    .otherwise({ redirectTo: '/' });
});

app.controller('mainController', function($scope, $location, DataService) {
    let cities = [];

    $.getJSON('assets/city.list.json', function(data) {
        $scope.loading = true;
        $.each( data, function( key, val ) {
            cities[val.name + "," + val.country] = null;
        });
    }).done(function() {
        $scope.loading = false;
        $('input.autocomplete').autocomplete({
            data: cities,
            limit: 5,
            minLength: 2,
            onAutocomplete: getWeather
        });
    });    

    getWeather = function (city) {
        let url = "http://api.openweathermap.org/data/2.5/forecast?q="+city+"&appid=1c676d764ae3b8e80931a979305b45b0";
        DataService.getFromApi(url).then(function(data) {
            if (data)
                $location.path( "/graph/" );
        });
    }

    plotGraph = function (response) {
        console.log("Foi");
    }
});

app.controller('graphController', function($scope, $routeParams, WeatherService) {
    $scope.forecastId = $routeParams.forecastId;
    $scope.forecast = WeatherService.forecast;

    if ($scope.forecastId == null && $scope.forecast == null) {
        //error
    } else if ($scope.forecast != null) {
        plotGraph($scope.forecast);
    } else {
        //call API with ID
    }
});