app.controller('homeController', function($scope, $location, DataService, WeatherService) {
    let baseWeatherAPI = "http://api.openweathermap.org/data/2.5/forecast?";
    let weatherUnit = "&units=metric";
    let weatherId = "&appid=1c676d764ae3b8e80931a979305b45b0";
    WeatherService.forecastUrls = [];

    $scope.numCities = 1;
    $scope.inputCities = [];
    $scope.loading = true;

    if (WeatherService.citiesNum == 0) {
        let listCities = [];
        //Get possible cities from json file offered by OpenWeatherMap
        $.getJSON('assets/city.list.json', function(data) {
            $.each( data, function( key, val ) {
                listCities[val.name + "," + val.country] = null;
                listCities.length++;
            });
        }).done(function() {
            WeatherService.cities = listCities;
            WeatherService.citiesNum = listCities.length;

            inputAutocomplete(0);
            
            $scope.loading = false;
            $scope.$apply();
        });    
    } else {
        inputAutocomplete(0);
        $scope.loading = false;
    }

    inputAutocomplete = function (index) {
        $('input#autocomplete-'+index).autocomplete({
            data: WeatherService.cities,
            limit: 5,
            minLength: 2
        });
    }
    getWeather = function (city) {
        if ($scope.compare && $scope.city != null && $scope.cityCompare != null) {
            let city = [$scope.city, $scope.cityCompare];
            for (let i = 0; i < city.length; i++) {
                let url = baseWeatherAPI + "q=" + city[i] + weatherUnit + weatherId;
                WeatherService.forecastUrls.push(url);
            }
        } else if (!$scope.compare && $scope.city != null) {
            let url = baseWeatherAPI + "q=" + $scope.city + weatherUnit + weatherId;
            WeatherService.forecastUrls.push(url);
        }
    }

    $scope.addCity = function () {
        $scope.numCities++;
        setTimeout(function(){inputAutocomplete($scope.numCities - 1)}, 200); //Timeout to allow DOM to be updated by AngularJS
    }

    $scope.search = function () {
        for (let i = 0; i < $scope.inputCities.length; i++) {
            if ($scope.inputCities[i]) {
                let url = baseWeatherAPI + "q=" + $scope.inputCities[i] + weatherUnit + weatherId;
                WeatherService.forecastUrls.push(url);
            }
        }


        if(WeatherService.forecastUrls.length > 0) {
            $location.path("/graph/");
        }
    }
});