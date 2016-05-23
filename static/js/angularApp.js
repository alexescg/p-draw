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
    $scope.liberaciones = [];

    $scope.init = function(scrumMaster, owner, idProyecto){
      $scope.scrumMaster =scrumMaster;
      $scope.productOwner=owner;
      $scope.idProyecto = idProyecto;
      $scope.getDesarrolladores();
      $scope.findReleaseByProyecto();
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

    $scope.findReleaseByProyecto = function(){
      $http.get('/find/release/proyecto/'+$scope.idProyecto).success(function(data) {
            $scope.liberaciones = data;
            console.log("--------")
            console.log(data);
        }).error(function(data){
          //TODO:Error
          });
    };

    $scope.getNombreCompleto = function(obj){
      if(obj.google){
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

app.controller('releaseBacklogCtrl',['$scope','$http', '$window', function($scope, $http, $window){
  $scope.verDetalles = false;
  $scope.historiasSprint = [];
  $scope.release = {}

  $scope.init = function(idProy, historias){
    $scope.idProyecto = idProy;
    $scope.historias = historias;
    console.log("Nombre Release");
    console.log($scope.release.nombreRelease);
    console.log($scope.release.descripcionRelease);

  };

  $scope.agregarHistoriaSprint = function(idHistoria){
    var i =0;
    for(i = 0; i<$scope.historias.length;i++){
      if($scope.historias[i]._id === idHistoria){
          $scope.historiasSprint.push($scope.historias[i]);
          break;
      }
    };
    $scope.historias.splice(i,1);
  };

  $scope.crearRelease = function(){
    $scope.release.proyecto = $scope.idProyecto
    $http({
      url:'/crearRelease',
      method:'POST',
      data: {historias:$scope.historiasSprint,
      release:$scope.release}
    }).then(function(data){
      $window.location.href = "/detalleProyecto";
    }, function(data){
      $window.location.href = "/addReleaseBacklog";
    });
  };

}]);

app.controller('showReleaseBacklogCtrl',['$scope','$http', '$window', function($scope, $http, $window){
  $scope.verDetalles = false;
  $scope.historiasSprint = [];
  $scope.sprint = {}
  $scope.historiaSeleccionada="";

  $scope.init = function(idProy, idRelease){
    $scope.idProyecto = idProy;
    $scope.idRelease = idRelease;
    $scope.findHistoriasByRelease();
    $scope.findSprintsByRelease();

  };

  $scope.agregarHistoriaSprint = function(idHistoria){
    var i =0;
    for(i = 0; i<$scope.historias.length;i++){
      if($scope.historias[i]._id === idHistoria){
          $scope.historiasSprint.push($scope.historias[i]);
          break;
      }
    };
    $scope.historias.splice(i,1);
  };

  $scope.findHistoriasByRelease = function(){
    $http.get("/find/historias/release/"+$scope.idRelease).success(function(data){
      $scope.historias = data;
    });
  }

  $scope.findSprintsByRelease = function(){
    $http.get("/find/sprints/release/"+$scope.idRelease).success(function(data){
      $scope.sprints = data;
    });
  }

  $scope.crearSprint = function(){
    $scope.sprint.liberacionBacklog = $scope.idRelease;
    $http({
      url:'/crearSprint',
      method:'POST',
      data: {historias:$scope.historiasSprint,
      sprint:$scope.sprint}
    }).then(function(data){
      $window.location.href = "/showReleaseBacklog";
    }, function(data){
      $window.location.href = "/showReleaseBacklog";
    });
  };


}]);

app.controller('showSprintBacklogCtrl',['$scope','$http', '$window', function($scope, $http, $window){
  $scope.verDetalles = false;
  $scope.historiasDesarrollador = [];
  $scope.historias = [];
  $scope.sprint = {};
  $scope.historiaSeleccionada="";

  $scope.init = function(idProy, idSprint){
    $scope.idProyecto = idProy;
    $scope.idSprint = idSprint;
    $scope.findHistoriasBySprint();
    $scope.findHistoriasBySprintDesarrollador();
  };

  $scope.agregarDesarrollador = function(idHistoria){
    $http.get("/findBy/historias/"+ idHistoria).success(function(data){
      $scope.historiaSeleccionada = data;
      console.log($scope.historiaSeleccionada);
    });
  };

  $scope.getNombreCompleto = function(obj){
    if(obj.google){
      return obj.google.name;
    } else if (obj.twitter){
      return obj.twitter.displayName;
    } else if (obj.facebook){
      return obj.facebook.name;
    }
    return obj.nombre;
  };

  $scope.findHistoriasBySprint = function(){
    $http.get("/find/historias/sprint/"+$scope.idSprint).success(function(data){
      $scope.historias = data;
    });
  };

  $scope.findHistoriasBySprintDesarrollador = function(){
    $http.get("/find/historias/desarrollador/sprint/"+$scope.idSprint).success(function(data){
      $scope.historiasDesarrollador = data;
    });
  };

  $scope.findDesarrolladoresByProyecto = function(){
    $http.get("/find/desarrolladores/by/proyecto/" + $scope.idProyecto).success(function(data){
      $scope.desarrolladores = data;
    });
  };

}]);


app.controller('sprintsCtrl',['$scope', function($scope){
  $scope.mensaje = "no se";
  $scope.titulo = "Titulo 3";
}]);

app.controller('profileCtrl', ['$scope', '$http', function($scope, $http){

    $scope.skills = $scope.skills || [];
    $scope.init= function(skillz){
        $scope.skills = skillz;
    }
    $scope.removeSkill = function(index){
        $scope.skills.splice(index, 1);
    }
    $scope.agregarHabilidad = function(){
        var skill = {
            habilidad: $scope.user.habilidad,
            nivel: $scope.user.nivel
        };
        $scope.skills.push(skill);
        $scope.user.habilidad = '';
        $scope.user.nivel = '';
    }

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
