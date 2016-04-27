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

app.controller("dashBoardController", ['$scope', '$http', function($scope, $http){

  $scope.idUsuario = "";
  $scope.proyectos = [];
  $scope.totalScrum = 0;
  $scope.totalOwner = 0;
  $scope.totalDeveloper = 0;
  $scope.init = function(usuario){
    $scope.idUsuario = usuario;
    $scope.getCountProyectos();
  }

  $scope.getProyectosScrum = function(){
    $http.get('/getProyectos/dashboard/'+$scope.idUsuario+"/"+"scrum-master").success(function(data) {
          $scope.proyectos = data;
      }).error(function(data){
              console.log("Algo paso");
        });
  }

  $scope.getProyectosOwner = function(){
    $http.get('/getProyectos/dashboard/'+$scope.idUsuario+"/"+"product-owner").success(function(data) {
          $scope.proyectos = data;
      }).error(function(data){
              console.log("Algo paso");
        });
  }

  $scope.getProyectosDeveloper = function(){
    $http.get('/getProyectos/dashboard/'+$scope.idUsuario+"/"+"developer").success(function(data) {
          $scope.proyectos = data;
      }).error(function(data){
              console.log("Algo paso");
        });
  }
  $scope.getCountProyectos = function(){
    $http.get('/count/proyectos/usuario/'+$scope.idUsuario).success(function(data) {
          $scope.counts = data;
          console.log(data);
      }).error(function(data){
              console.log("Algo paso");
        });
  }
}]);
