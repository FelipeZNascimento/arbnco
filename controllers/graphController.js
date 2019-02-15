app.controller('graphController', function($scope, $routeParams, DataService, WeatherService) {
    let forecastId = $routeParams.forecastId;
    let forecast = WeatherService.forecast;
    let baseWeatherAPI = "http://api.openweathermap.org/data/2.5/forecast?";
    let baseMongoAPI = "https://arbnco-mongodb.herokuapp.com/api/forecasts/";
    // let baseMongoAPI = "http://localhost:8080/api/forecasts/";
    let baseShareableLink = "http://omegafox.me/arbnco/#!/graph/";

    $scope.shareLink = null;

    $(document).ready(function(){
        $('.tooltipped').tooltip();
    });    

    if (forecastId == null && forecast == null) { 
        // Error case, shouldn't be on the page
        let url = baseWeatherAPI + "id=6322752&units=metric&appid=1c676d764ae3b8e80931a979305b45b0";
        DataService.getFromApi(url).then(function(data) {
            forecast = data;
            if (forecast)
                plotGraph(forecast);
        });

    } else if (forecast != null) {
        plotGraph(forecast);
    } else {
        let url = baseMongoAPI + forecastId;
        DataService.getFromApi(url).then(function(data) {
            forecast = data.weatherInfo;
            if (forecast) {
                plotGraph(forecast);
                $scope.shareLink = baseShareableLink + forecastId;
            }
        });
    }

    $scope.shareForecast = function () {
        let url = baseMongoAPI;

        DataService.postToApi(url, forecast).then(function(response) {
            $scope.shareLink = baseShareableLink + response.data.id;
        });
    }

    $scope.copyLink = function () {
        var copyText = document.getElementById("shareableLink");
        copyText.select();
        document.execCommand("copy");
        M.toast({html: 'Link copied!'})
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