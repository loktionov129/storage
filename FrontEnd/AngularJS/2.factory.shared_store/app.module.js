angular.module('app', [])
    .controller('home', function($scope, store) {
        $scope.store = store;
    })
    .controller('another', function($scope, store) {
        $scope.store2 = store;
    })
    .factory('store', function() {
        return {
            value: 42
        };
    });