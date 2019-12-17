angular.module('app', [])
    .controller('home', function($scope) {
        $scope.task = '';
        $scope.tasks = [];
        $scope.save = function(task) {
            $scope.tasks.push({date: new Date(), name: task});
            $scope.task = '';
        };
        $scope.remove = function(task) {
            var index = $scope.tasks.indexOf(task);
            if (index !== -1) {
                $scope.tasks.splice(index, 1);
            }
        };
    });