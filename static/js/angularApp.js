var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/Sprints', {
        templateUrl: 'add_order.html',
        controller: 'sprintsCtrl'
    }).
      when('/ProductBacklog', {
        templateUrl: 'show_orders.html',
        controller: 'productBacklogCtrl'
      }).
      when('/ReleaseBacklog', {
        templateUrl: 'show_orders.html',
        controller: 'releaseBacklogCtrl'
      }).
      otherwise({
        redirectTo: '/ProductBacklog'
      });
}]);


app.controller('testController', ['$scope', function($scope){
console.log("Existo!");
}]);

app.controller('detalleProyectoCtrl', ['$scope', function($scope){
    $scope.proyecto = {
      nombre: "Proyecto 1",
      descripcion: "Aqui va la descripcion del proyecto"
    };
    $scope.rolScrum =
      {
        nombreRol: "Scrum Master",
        nombreEmpleado: "Luis Ramirez"
      };
    $scope.rolProduct =
      {
        nombreRol: "Product Owner",
        nombreEmpleado: "Pancho Pantera"
      };
    $scope.desarrolladores = [
      {
        nombre: "Erik Zubia"
      },
      {
        nombre: "Alejandro Escobedo"
      },
      {
        nombre: "Daniela Santillanes"
      }
    ];
}]);
