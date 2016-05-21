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

app.controller('detalleProyectoCtrl', ['$scope', '$http', function($scope, $http){
    $scope.scrumMaster ={};
    $scope.productOwner={};
    $scope.idProyecto={};
    $scope.desarrolladores = [];

    $scope.init = function(scrumMaster, owner, idProyecto){
      $scope.scrumMaster =scrumMaster;
      $scope.productOwner=owner;
      $scope.idProyecto = idProyecto;
      $scope.getDesarrolladores();
    }

    $scope.historia = new Object();
    $scope.crearHistoria = function () {
        $scope.historia.proyecto = $scope.idProyecto;
        socket.emit('newHistoria', $scope.historia);
    };

    var socket = io.connect({'forceNew': true});
    $scope.historias = $scope.historias || [];

    socket.on('sendHistorias', function (data) {
        $scope.findHistoriasByProyecto();
        $scope.$apply();
    });

    socket.on('sendHistoria', function () {
        $scope.findHistoriasByProyecto();
        $scope.$apply();
    });

    $scope.findHistoriasByProyecto = function(){
      $http.get('/find/historias/proyecto/'+$scope.idProyecto).success(function(data) {
            $scope.historias = data;
        }).error(function(data){
          //TODO:Error
          });
    };
    $scope.getNombreCompleto = function(obj){
      if(obj.google){
        console.log("Entre al google")
        return obj.google.name;
      } else if (obj.twitter){
        return obj.twitter.displayName;
      } else if (obj.facebook){
        return obj.facebook.name;
      }
      return obj.nombre;
    };
    $scope.usuarios =[];

    $scope.getUsuarios = function(){
      $http.get('findUsuarios').success(function(data) {
            $scope.usuarios = data;
        }).error(function(data){
          //TODO:Error
          });
    };

    $scope.getDesarrolladores = function(){
      $http.get('/detalleProyecto/findDevelopers/'+$scope.idProyecto).success(function(data) {
            $scope.desarrolladores = data;
        }).error(function(data){
          //TODO:Error
          });
    };


    $scope.asignarOwner = function(id){
      console.log(id);
      $http({
        url:'/agregarOwner',
        method:'POST',
        data: {usuarioOwner:id,
        idProyecto:$scope.idProyecto}
      }).then(function(data){
        //TODO:GetOwner
      }, function(data){
        //TODO:Error
      });
    };

    $scope.asignarDesarrollador = function(id){
    $http({
      url:'/agregarDesarrollador',
      method:'POST',
      data: {usuarioOwner:id,
      idProyecto:$scope.idProyecto}
    }).then(function(data){
      $scope.getDesarrolladores();
    }, function(data){
      //TODO:Error
    });
  };
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
  }

  $scope.getProyectosScrum = function(){
    $http.get('/getProyectos/dashboard/'+$scope.idUsuario+"/"+"scrum-master").success(function(data) {
          if(data != "{}"){
            $scope.proyectos = data;
          } else {
            $scope.proyectos = [];
          }
      }).error(function(data){
              console.log("Algo paso");
        });
  }

  $scope.getProyectosOwner = function(){
    $http.get('/getProyectos/dashboard/'+$scope.idUsuario+"/"+"product-owner").success(function(data) {
          if(data != "{}"){
            $scope.proyectos = data;
          } else {
            $scope.proyectos = [];
          }
      }).error(function(data){
              console.log("Algo paso");
        });
  }

  $scope.getProyectosDeveloper = function(){
    $http.get('/getProyectos/dashboard/'+$scope.idUsuario+"/"+"developer").success(function(data) {
          if(data != "{}"){
            $scope.proyectos = data;
          } else {
            $scope.proyectos = [];
          }
      }).error(function(data){
              console.log("Algo paso");
        });
  }
}]);
