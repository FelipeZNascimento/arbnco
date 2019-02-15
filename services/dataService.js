app.service('DataService', function($http, $q, WeatherService) {

    this.getFromApi = function (url) {
        var deferred = $q.defer();

        $http.get(url).then(function (response) {
            WeatherService.forecast = response.data;
            deferred.resolve(response.data);
        }, function (error) {
            deferred.reject(null);
        });
        return deferred.promise;
    },

    this.postToApi = function (url, jsonData) {
        var deferred = $q.defer();
        $http.post(url, jsonData).then(function (response) {
            deferred.resolve(response);
        }, function (error) {
            deferred.reject(null);
        });
        return deferred.promise;
    }
});
