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
    let forecastId = $routeParams.forecastId;
    let forecast = WeatherService.forecast;
    let baseAPI = "https://arbnco-mongodb.herokuapp.com/api/forecasts/";

    if (forecastId == null && forecast == null) { 
        // Error case, shouldn't be on the page
        let url = "http://api.openweathermap.org/data/2.5/forecast?id=6322752&units=metric&appid=1c676d764ae3b8e80931a979305b45b0";
        DataService.getFromApi(url).then(function(data) {
            forecast = data;
            if (forecast)
                plotGraph(forecast);
        });

    } else if (forecast != null) {
        plotGraph(forecast);
    } else {
        let url = baseAPI + forecastId;
        // let url = "http://localhost:8080/api/forecasts/" + forecastId;
        DataService.getFromApi(url).then(function(data) {
            forecast = data.weatherInfo;
            if (forecast) {
                plotGraph(forecast);
                $scope.shareLink = "omegafox.me/abnco/graph/" + forecastId;
            }
        });
    }

    $scope.shareForecast = function () {
        let url = baseAPI;
        // let url = "http://localhost:8080/api/forecasts/";

        DataService.postToApi(url, forecast).then(function(response) {
            $scope.shareLink = "omegafox.me/abnco/graph/" + response.data.id;
        });
    }

    function plotGraph (weather) {
        let title = weather.city.name + ", " + weather.city.country;
        let categories = [];
        let temperatures = [];
        let humidity = [];
        for (let i = 0; i < weather.list.length; i++) {
            let date = new Date(weather.list[i].dt * 1000);
            date = date.getHours() + "h - " + date.getDate() + "/" + (date.getMonth() + 1);
            categories.push(date);
            temperatures.push(weather.list[i].main.temp);
            humidity.push(weather.list[i].main.humidity);
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