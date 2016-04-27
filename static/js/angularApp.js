var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/Sprints', {
        templateUrl: 'partials/sprints',
        controller: 'sprintsCtrl'
    }).
      when('/ProductBacklog', {
        templateUrl: 'partials/productBacklog',
        controller: 'productBacklogCtrl'
      }).
      when('/ReleaseBacklog', {
        templateUrl: 'partials/releaseBacklog',
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

app.controller('productBacklogCtrl',['$scope', function($scope){
  $scope.mensaje = "aszdxfhgndfxcbsxzcvx";
  $scope.titulo = "Titulo 1";
}]);

app.controller('releaseBacklogCtrl',['$scope', function($scope){
  $scope.mensaje = "hola";
  $scope.titulo = "Titulo 2";
}]);

app.controller('sprintsCtrl',['$scope', function($scope){
  $scope.mensaje = "no se";
  $scope.titulo = "Titulo 3";
}]);
