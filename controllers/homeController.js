app.controller('homeController', function($scope, $location, DataService) {
    let baseWeatherAPI = "http://api.openweathermap.org/data/2.5/forecast?";

    $scope.loading = true;
    let cities = [];
    if (cities.length == 0) {
        $.getJSON('assets/city.list.json', function(data) {
            $.each( data, function( key, val ) {
                cities[val.name + "," + val.country] = null;
            });
        }).done(function() {
            $('input.autocomplete').autocomplete({
                data: cities,
                limit: 5,
                minLength: 2,
                onAutocomplete: getWeather
            });
            $scope.loading = false;
            $scope.$apply();
        });    
    } else {
        $scope.loading = false;
    }

    getWeather = function (city) {
        let url = baseWeatherAPI + "q="+city+"&units=metric&appid=1c676d764ae3b8e80931a979305b45b0";
        DataService.getFromApi(url).then(function(data) {
            if (data)
                $location.path( "/graph/" );
        });
    }
});