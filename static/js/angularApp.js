var app = angular.module('app', []);

app.controller('testController', ['$scope', function($scope){
console.log("Existo!");

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
