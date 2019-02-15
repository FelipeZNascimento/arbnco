app.controller('forecastsController', function($scope, DataService, WeatherService) {
    let baseMongoAPI = "https://arbnco-mongodb.herokuapp.com/api/forecasts/";
    // let baseMongoAPI = "http://localhost:8080/api/forecasts/";
    let baseShareableLink = "http://omegafox.me/arbnco/#!/graph/";

    let url = baseMongoAPI;
    DataService.getFromApi(url).then(function(data) {
        $scope.allForecasts = data;
    });

    $scope.formatDate = function (date) {
        date = new Date(date);
        let stringDate = date.getHours() + "h" + date.getMinutes() + " | " + date.getDate() + "/" + (date.getMonth() + 1);
        return stringDate;
    }

    $scope.formatLink = function (id) {
        return baseShareableLink + id;
    }

});