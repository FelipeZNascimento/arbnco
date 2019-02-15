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
        let url = "http://api.openweathermap.org/data/2.5/forecast?q="+city+"&units=metric&appid=1c676d764ae3b8e80931a979305b45b0";
        DataService.getFromApi(url).then(function(data) {
            if (data)
                $location.path( "/graph/" );
        });
    }
});

app.controller('graphController', function($scope, $routeParams, DataService, WeatherService) {
    $scope.forecastId = $routeParams.forecastId;
    $scope.forecast = WeatherService.forecast;

    if ($scope.forecastId == null && $scope.forecast == null) { 
        let url = "http://api.openweathermap.org/data/2.5/forecast?id=6322752&units=metric&appid=1c676d764ae3b8e80931a979305b45b0";
        DataService.getFromApi(url).then(function(data) {
            if (data)
                plotGraph(data);
        });

    } else if ($scope.forecast != null) {
        plotGraph($scope.forecast);
    } else {
        //call MongoDB with ID
    }

    $scope.shareForecast = function () {
        //Save to MongoDB
    }

    function plotGraph (forecast) {
        let title = forecast.city.name + ", " + forecast.city.country;
        let categories = [];
        let temperatures = [];
        let humidity = [];
        for (let i = 0; i < forecast.list.length; i++) {
            let date = new Date(forecast.list[i].dt * 1000);
            date = date.getHours() + "h - " + date.getDate() + "/" + date.getMonth();
            categories.push(date);
            temperatures.push(forecast.list[i].main.temp);
            humidity.push(forecast.list[i].main.humidity);
        }

        Highcharts.chart('graphContainer', {
            chart: {zoomType: 'xy'},
            title: {text: title},
            subtitle: {text: 'Source: openweathermap.org'},       
            xAxis: {
                categories: categories,
                crosshair: true
            },
            yAxis: [{
                labels: {
                    format: '{value}°C',
                    style: {color: Highcharts.getOptions().colors[2]}
                },
                title: {
                    text: "Temperatures",
                    style: {color: Highcharts.getOptions().colors[2]}
                }
            }, 
            { // Secondary yAxis
                title: {
                    text: 'Humidity',
                    style: {color: Highcharts.getOptions().colors[0]}
                },
                labels: {
                    format: '{value} %',
                    style: {color: Highcharts.getOptions().colors[0]}
                },
                opposite: true        
            }],
            tooltip: {
                shared: true
            },        
            series: [{
                type: 'spline',
                name: 'Temperatures',
                yAxis: 0,
                data: temperatures,
                tooltip: {valueSuffix: ' °C'},
                color: Highcharts.getOptions().colors[2]
            },
            {
                type: 'spline',
                name: 'Humidity',
                yAxis: 1,
                data: humidity,
                tooltip: {valueSuffix: ' %'},
                color: Highcharts.getOptions().colors[0]
            }]
        });
    }
});