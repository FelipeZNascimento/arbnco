app.controller('graphController', function($scope, $routeParams, $sce, $location, DataService, WeatherService) {
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
        $location.path( "/" );
    } else if (forecastId != null) { //forecastId through shareable link
        let url = baseMongoAPI + forecastId;
        DataService.getFromApi(url).then(function(data) {
            forecast = data.weatherInfo;
            if (forecast) {
                plotGraph(forecast);
                $scope.shareLink = baseShareableLink + forecastId;
            }
        });
    } else { //forecast received through weatherService - user comes from home page
        plotGraph(forecast);
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
        let iframeURL = "https://maps.google.com/maps?q=" + weather.city.coord.lat + "," + weather.city.coord.lon + "&hl=es&z=12&amp&output=embed";
        $scope.coordinates = $sce.trustAsResourceUrl(iframeURL);
        let title = weather.city.name + ", " + weather.city.country;
        let categories = [];
        let temperatures = [];
        let humidity = [];
        let rain = [];
        let snow = [];
        for (let i = 0; i < weather.list.length; i++) {
            let date = new Date(weather.list[i].dt * 1000);
            date = date.getHours() + "h - " + date.getDate() + "/" + (date.getMonth() + 1);
            categories.push(date);
            temperatures.push(weather.list[i].main.temp);
            humidity.push(weather.list[i].main.humidity);

            //If API returns "undefined" or no return at all I've chosen to set it to 0
            if (weather.list[i].rain) {
                let rainForecast = weather.list[i].rain["3h"];
                if (rainForecast)
                    rain.push(rainForecast);
                else rain.push('0');                
            } else 
                rain.push('0');
                
            //If API returns "undefined" or no return at all I've chosen to set it to 0
            if (weather.list[i].snow) {
                let snowForecast = weather.list[i].snow["3h"];
                if (snowForecast)
                snow.push(snowForecast);
                else snow.push('0');                
            } else 
                snow.push('0');

                
        }

        Highcharts.chart('tempGraph', {
            chart: {zoomType: 'xy'},
            title: {text: title + " - Temperature & Humidity"},
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

        Highcharts.chart('rainGraph', {
            chart: {zoomType: 'xy'},
            title: {text: title + " - Rain & Snow"},
            subtitle: {text: 'Source: openweathermap.org'},       
            xAxis: {
                categories: categories,
                crosshair: true
            },
            yAxis: [{
                labels: {
                    format: '{value} mm',
                    style: {color: Highcharts.getOptions().colors[1]}
                },
                title: {
                    text: "Rain",
                    style: {color: Highcharts.getOptions().colors[1]}
                }
            }, 
            { // Secondary yAxis
                title: {
                    text: 'Snow',
                    style: {color: Highcharts.getOptions().colors[3]}
                },
                labels: {
                    format: '{value} mm',
                    style: {color: Highcharts.getOptions().colors[3]}
                },
                opposite: true        
            }],
            tooltip: {
                shared: true
            },        
            series: [{
                type: 'spline',
                name: 'Rain',
                yAxis: 0,
                data: rain,
                tooltip: {valueSuffix: ' mm'},
                color: Highcharts.getOptions().colors[1]
            },
            {
                type: 'spline',
                name: 'Snow',
                yAxis: 1,
                data: snow,
                tooltip: {valueSuffix: ' mm'},
                color: Highcharts.getOptions().colors[3]
            }]
        });
    }
});