app.controller('forecastsController', function($scope, DataService) {
    let baseMongoAPI = "https://arbnco-mongodb.herokuapp.com/api/forecasts/";
    // let baseMongoAPI = "http://localhost:8080/api/forecasts/";
    let baseShareableLink = "#!/graph/";
    let url = baseMongoAPI;

    $scope.pageSize = 10;
    $scope.currentPage = 0;
    $scope.pagination = [];
    $scope.loading = true;

    DataService.getFromApi(url).then(function(data) {
        $scope.allForecasts = data;
        $scope.loading = false;
        createPagination();
    });

    $scope.changePage = function(page){
        $scope.currentPage = page;
    }

    $scope.formatDate = function (date) {
        date = new Date(date);
        let stringDate = date.getHours() + "h" + date.getMinutes() + " | " + date.getDate() + "/" + (date.getMonth() + 1);
        return stringDate;
    }

    $scope.formatLink = function (id) {
        return baseShareableLink + id;
    }

    function createPagination() {
        let numPages = Math.ceil($scope.allForecasts.length / 10);
        for (let i = 0; i < numPages; i++)
            $scope.pagination.push(i);
    }
});

app.filter('startFrom', function() {
    return function(input, start) {
        if (!input)
            return;

        start = +start;
        return input.slice(start);
    }
});