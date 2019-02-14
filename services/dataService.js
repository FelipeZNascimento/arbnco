app.service('DataService', function($http, $q, WeatherService) {

    this.getFromApi = function (url) {
        var deferred = $q.defer();

        $http.get(url).then(function returnData(response) {
            WeatherService.forecast = response.data;
            deferred.resolve(response.data);
        }, function errorCalback(response) {
            deferred.reject(null);
        });
        return deferred.promise;
    }
});
