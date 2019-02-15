var app = angular.module('arbncoApp', ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
    
    $routeProvider
    .when('/', {
        templateUrl: 'views/home.html',
        controller: 'homeController'
    })
    .when('/forecasts/', {
        templateUrl: 'views/forecasts.html',
        controller: 'forecastsController'
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