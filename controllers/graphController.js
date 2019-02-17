app.controller('graphController', function($scope, $routeParams, $q, $sce, $location, DataService, WeatherService) {
    let forecastId = $routeParams.forecastId;
    let forecastUrls = WeatherService.forecastUrls;
    let baseMongoAPI = "https://arbnco-mongodb.herokuapp.com/api/forecasts/";
    // let baseMongoAPI = "http://localhost:8080/api/forecasts/";
    let baseShareableLink = "http://omegafox.me/arbnco/#!/graph/";
    $scope.forecasts = [];
    $scope.loading = true;
    $(document).ready(function(){
        $('.tooltipped').tooltip();
    });


    if (forecastId == null && forecastUrls.length == 0) { // Error case, user shouldn't be on the page
        $location.path( "/" );
    } else if (forecastId != null) { //forecastId through shareable link
        let url = baseMongoAPI + forecastId;

        DataService.getFromApi(url).then(function(data) {
            $scope.loading = false;
            if (!data.weatherInfo) {
                M.toast({html: 'ID not found.'})
                $location.path("/");
            } else {
                $scope.forecasts.push(data.weatherInfo);
                if ($scope.forecasts.length > 0) {
                    $scope.forecasts[0].link = baseShareableLink + forecastId;
                    setIframe($scope.forecasts);
                    setTimeout(function(){setGraph()}, 200); //Timeout to allow DOM to be updated by AngularJS
                    console.log($scope.forecasts[0].coordinates);
                }
            }
        }, function () {
            $scope.loading = false;
            M.toast({html: 'Something went wrong. Please try again.'})
            $location.path("/");
        });
    } else { //forecast received through weatherService - user comes from home page
        let promises = [];

        for (let i = 0; i < forecastUrls.length; i++) {
            promises.push(
                DataService.getFromApi(forecastUrls[i]),
            );
        }

        $q.all(promises).then(function(response){
            let promises = [];
            for (let i = 0; i < response.length; i++) {
                if (response) {
                    $scope.forecasts.push(response[i]);
                    
                    promises.push(
                        DataService.postToApi(baseMongoAPI, response[i])
                    );
                }
            }
            
            $q.all(promises).then(function(response){
                for (let i = 0; i < response.length; i++) {
                    $scope.forecasts[i].link = baseShareableLink + response[i].data.id;
                }

                $scope.loading = false;
                setIframe($scope.forecasts);
                setGraph();
            }.bind(this));
        }, function (error) {
            // Conditions for error:
                // Something went wrong with the API and/or the request;
                // One or more cities weren't found;

            $scope.loading = false;
            M.toast({html: 'Please select a city from the list and try again.'})
            $location.path("/");
            $scope.$apply();
        }.bind(this));
    }
    
    $scope.copyLink = function (index) { //Simple function to copy shareable link from clicking copy/paste button
        document.getElementById("shareableLink"+index).select();
        document.execCommand("copy");
        M.toast({html: 'Link copied!'})
    }

    function setIframe() {
        for (let i = 0; i < $scope.forecasts.length; i++) {
            // Google API needs a lot of steps to configure so I found this solution that only embeds map as iframe
            let iframeURL = "https://maps.google.com/maps?q=" + $scope.forecasts[i].city.coord.lat + "," + $scope.forecasts[i].city.coord.lon + "&hl=en&z=12&amp&output=embed";
            $scope.forecasts[i].coordinates = $sce.trustAsResourceUrl(iframeURL);
        }
    }

    function setGraph () {
        for (let i = 0; i < $scope.forecasts.length; i++) {
            let categories = [];
            let temperatures = [];
            let humidity = [];
            let rain = [];
            let snow = [];

            for (let j = 0; j < $scope.forecasts[i].list.length; j++) {
                let date = new Date($scope.forecasts[i].list[j].dt * 1000);
                date = date.getHours() + "h - " + date.getDate() + "/" + (date.getMonth() + 1);
                categories.push(date);
                temperatures.push($scope.forecasts[i].list[j].main.temp);
                humidity.push($scope.forecasts[i].list[j].main.humidity);

                let rainForecast = setPrecipitation($scope.forecasts[i].list[j].rain);
                let snowForecast = setPrecipitation($scope.forecasts[i].list[j].snow);

                rain.push(rainForecast);
                snow.push(snowForecast);                    
            }

            let tempGraphInfo = {
                title: $scope.forecasts[i].city.name + ", " + $scope.forecasts[i].city.country,
                div: 'tempGraph-'+i,
                units: ['°C', ' %'],
                categories: categories,
                measurements: ['Temperature', 'Humidity'],
                colors: [Highcharts.getOptions().colors[2], Highcharts.getOptions().colors[0]],
                data: [temperatures, humidity]
            }

            let precipitationGraphInfo = {
                title: $scope.forecasts[i].city.name + ", " + $scope.forecasts[i].city.country,
                div: 'rainGraph-'+i,
                units: ['mm', 'mm'],
                categories: categories,
                measurements: ['Rain', 'Snow'],
                colors: [Highcharts.getOptions().colors[1], Highcharts.getOptions().colors[3]],
                data: [rain, snow]
            }

            plotGraph(tempGraphInfo);
            plotGraph(precipitationGraphInfo);
        }
    }

    function setPrecipitation (precipitation) {
        //If API returns "undefined" or no return at all I've chosen to set it to 0
        if (precipitation) {
            let precForecast = precipitation["3h"];
            if (precForecast)
                return precForecast;
        }
        
        return '0';
    }

    function plotGraph (graphInfo) {
        Highcharts.chart(graphInfo.div, {
            chart: {zoomType: 'xy'},
            title: {text: graphInfo.title},
            subtitle: {text: 'Source: openweathermap.org'},       
            xAxis: {
                categories: graphInfo.categories,
                crosshair: true
            },
            yAxis: [{ // Primary yAxis
                title: {
                    text: graphInfo.measurements[0],
                    style: {color: graphInfo.colors[0]}
                },
                labels: {
                    format: '{value}' + graphInfo.units[0],
                    style: {color: graphInfo.colors[0]}
                }
            }, 
            { // Secondary yAxis
                title: {
                    text: graphInfo.measurements[1],
                    style: {color: graphInfo.colors[1]}
                },
                labels: {
                    format: '{value}' + graphInfo.units[1],
                    style: {color: graphInfo.colors[1]}
                },
                opposite: true        
            }],
            tooltip: {
                shared: true
            },        
            series: [{
                type: 'spline',
                name: graphInfo.measurements[0],
                yAxis: 0,
                data: graphInfo.data[0],
                tooltip: {valueSuffix: graphInfo.units[0]},
                color: graphInfo.colors[0]
            },
            {
                type: 'spline',
                name: graphInfo.measurements[1],
                yAxis: 1,
                data: graphInfo.data[1],
                tooltip: {valueSuffix: graphInfo.units[1]},
                color: graphInfo.colors[1]
            }]
        });
    }
});