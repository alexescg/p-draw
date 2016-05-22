var Usuario = require('./models/usuarios');
var Proyecto = require('./models/proyectos');
var ProductBacklog = require('./models/productsBacklog');
var LiberacionBacklog = require('./models/liberacionesBacklog');
var Rol = require('./models/roles');
var HistoriaUsuario = require('./models/historiaUsuarios');
//var mongoose = require('mongoose');

module.exports = function (app, passport, roles, mongoose, io) {

    app.get('/login', function (req, res) {
        res.render('landing');
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home',
        failureRedirect: '/landing',
        failureFlash: true
    }));

    app.get('/auth/facebook', passport.authenticate('facebook'));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/home',
            failureRedirect: '/landing'
        }));

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/home',
            failureRedirect: '/landing'
        }));

    app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/home',
            failureRedirect: '/landing'
        }));


    app.get('/addReleaseBacklog',isLoggedIn, function (req, res) {
      req.session = sass;
      Proyecto.findOne({"_id": mongoose.Types.ObjectId(req.session.proyecto)})
      .exec(function (err, proyecto){
        HistoriaUsuario.find({"proyecto": mongoose.Types.ObjectId(req.session.proyecto), "liberacionBacklog": {
          "$exists": false
        }}).select("-__v").exec(function(err, obj){
            var jsonHistorias = JSON.stringify(obj);
            res.render('releaseBackLog', {usuario: req.user, proyecto: proyecto, historias: jsonHistorias});
        });
      });

    });

    app.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/landing',
        failureFlash: true
    }));


    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile',
            {
                message: req.flash('signupMessage'),
                user: req.user,
                habilidades : req.user.habilidades || []
            });
    });


    app.post('/profile', isLoggedIn, function (req, res) {
        var usuario = req.user;
        usuario.nombre = req.body.nombre;
        usuario.apellidos = req.body.apellidos;
        usuario.fechaNacimiento = req.body.fechaNacimiento;
        usuario.rfc = req.body.rfc;
        usuario.curp = req.body.curp;
        usuario.domicilio = req.body.domicilio;
        usuario.habilidades = JSON.parse(req.body.habilidades);

        new Usuario(usuario).save(function (err, user) {
                if (err) {
                    res.render("profile", {
                        message: req.flash('Error al guardar datos.'),
                        user: req.user,
                        habilidades : req.user.habilidades || []

                    });
                } else {
                    res.render("profile", {
                        message: req.flash('Exito!'),
                        user: user,
                        habilidades : req.user.habilidades || []

                    });
                }
            }
        );
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/landing');
    });

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/landing');
    }

    app.get("/main", isLoggedIn, function (req, response) {
        response.render("templates/main");
    });
    /*--------------------------------Routes para el dashboard -----------------------------------*/
    app.get("/home", isLoggedIn, function (req, response) {
        var proyectos = {};

        Proyecto.aggregate([
          {$unwind:"$participantes"},
          {$match:{"participantes.usuario": mongoose.Types.ObjectId(req.user._id), "participantes.rol": "scrum-master"}},
          {$group:{_id:null, count:{$sum:1}}}
        ], function(err,result){
            if(result.length !=0){
              proyectos.scrum = result[0].count;
            } else {
              proyectos.scrum = 0;
            }
            Proyecto.aggregate([
              {$unwind:"$participantes"},
              {$match:{"participantes.usuario": mongoose.Types.ObjectId(req.user._id), "participantes.rol": "product-owner"}},
              {$group:{_id:null, count:{$sum:1}}}
            ], function(err,result){
                if(result.length !=0){
                  proyectos.owner = result[0].count;
                } else {
                  proyectos.owner = 0;
                }
                Proyecto.aggregate([
                  {$unwind:"$participantes"},
                  {$match:{"participantes.usuario": mongoose.Types.ObjectId(req.user._id), "participantes.rol": "developer"}},
                  {$group:{_id:null, count:{$sum:1}}}
                ], function(err,result){
                    if(result.length !=0){
                      proyectos.developer = result[0].count;
                    } else {
                      proyectos.developer = 0;
                    }
                    response.render("dashboard", {usuario: req.user, proyectos:proyectos});
                });
            });
        });
    });

    app.get("/getProyectos/dashboard/:idUsuario/:rol", function(req, response){
      Proyecto.find().elemMatch("participantes",{ "usuario": mongoose.Types.ObjectId(req.params.idUsuario), "rol": req.params.rol })
          .exec(function (err, proyectos) {
              if (proyectos.length !=0) {
                  Proyecto.populate(proyectos, {
                      path: 'participantes.usuario',
                      model: 'Usuario'
                  }, function (err, proyectos) {
                      response.json(proyectos);
                  });
              } else {
                response.json("{}");
              }
          })
    });

    /*======================= Fin de rutas del dashboard============================================*/

    /*------------------------ Rutas para Proyectos -------------------------------*/
    app.get("/detalleproyecto", isLoggedIn, function (req, response) {
        if (req.query.proyectoElegido === undefined) {
            req.query.proyectoElegido = req.session.proyecto;
        }
        Proyecto.findById({"_id": req.query.proyectoElegido}).populate({
            path: 'participantes.usuario',
            model: 'Usuario'
        })
            .exec(function (err, obj) {
                req.session.proyecto = req.query.proyectoElegido;
                sass = req.session;
                if (err) response.redirect("/home");
                else
                    var productOwner;
                var scrumMaster;
                var desarrolladores = [];
                obj.participantes.forEach(function (participante) {
                    switch (participante.rol) {
                        case "product-owner":
                            productOwner = participante.usuario;
                            break;
                        case "scrum-master":
                            scrumMaster = participante.usuario;
                            break;
                        case "developer":
                            desarrolladores.push(participante.usuario);
                            break;
                        default:

                    }
                });
                response.render("detalleProyecto",
                    {
                        usuario: req.user,
                        proyecto: obj,
                        scrumMaster: scrumMaster,
                        owner: productOwner,
                    });
            });
    });

    app.get("/detalleProyecto/findDevelopers/:idProyecto", function (req, response) {
        Proyecto.findById({"_id": req.params.idProyecto}).populate({
            path: 'participantes.usuario',
            model: 'Usuario'
        })
            .exec(function (err, obj) {
                req.session.proyecto = req.query.proyectoElegido
                if (err) response.redirect("/home");
                else {
                    var desarrolladores = [];
                    obj.participantes.forEach(function (participante) {
                        if (participante.rol === "developer") {
                            desarrolladores.push(participante.usuario);
                    }
                });
                response.json(desarrolladores);
              }
          });
      });

    app.post("/crearProyecto", function (req, res) {
        var rol = new Rol({
            rol: "scrum-master",
            usuario: req.user._id
        });
        var proyecto = new Proyecto({
            nombreProyecto: req.body.nombreProyecto,
            fechaSolicitud: Date(),
            fechaArranque: req.body.fechaArranque,
            descripcionProy: req.body.descripcionProy,
        });
        proyecto.participantes.push(rol);
        //err tiene los errores que pueden pasar y obj el objeto a guardar.
        proyecto.save(function (err, obj) {
            if (err) res.redirect("/crear/proyecto", {obj: obj});
            else {
                message: req.flash('ProyectoGuardado')
                res.redirect("/home");
            }
        });

    });

    var sass;
    app.get("/findUsuarios", function (req, response) {
        sass = req.session;
        Usuario.find({}).exec(function (err, usuarios) {
            if (err) response.redirect("/")
            else
                response.json(usuarios);
        });
    });

    app.post("/agregarScrum", isLoggedIn, function (req, response) {
        req.session = sass;
        var rol = new Rol({
            rol: "scrum-master",
            usuario: req.body.usuarioAsignado
        });
        Proyecto.update({_id: req.session.proyecto}, {$push: {participantes: {$each: [rol]}}}, {upsert: true}, function (err) {
            if (err) {
                response.redirect("/agregarScrum");
            } else {
                response.redirect("/detalleProyecto");
            }
        });

    });

    app.post("/agregarOwner", isLoggedIn, function (req, response) {
        req.session = sass;
        var rol = new Rol({
            rol: "product-owner",
            usuario: mongoose.Types.ObjectId(req.body.usuarioOwner)
        });
        Proyecto.update({_id: req.body.idProyecto}, {$push: {participantes: {$each: [rol]}}}, {upsert: true}, function (err) {
            if (err) {
                throw err;
            } else {
                console.log("AAAA")
            }
        });
    });

    app.post("/agregarDesarrollador", isLoggedIn, function (req, response) {
        var rol = new Rol({
            rol: "developer",
            usuario: mongoose.Types.ObjectId(req.body.usuarioOwner)
        });
        Proyecto.update({"_id": req.body.idProyecto}, {$push: {participantes: {$each: [rol]}}}, {upsert: true}, function (err) {
            if (err) {
                err();
            }
        });
    });

    app.get("/find/historias/proyecto/:idProyecto", function(req, response){
      HistoriaUsuario.find({"proyecto": mongoose.Types.ObjectId(req.params.idProyecto)})
          .exec(function (err, obj) {
                response.json(obj);
          });
      });

      app.get("/find/release/proyecto/:idProyecto", function(req, response){
        LiberacionBacklog.find({"proyecto": mongoose.Types.ObjectId(req.params.idProyecto)})
            .exec(function (err, obj) {
                  response.json(obj);
            });
        });
/*---------------------------- Users -----------------------------------------*/
    app.post("/crearUsuario", isLoggedIn, function (req, res) {
        var usuario = new Usuario({
            userName: req.body.userName,
            email: req.body.email,
            password: req.body.pass,
            confirmarPassword: req.body.passConfirm,
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            fechaNacimiento: req.body.fechaDeNacimiento,
            curp: req.body.CURP,
            rfc: req.body.RFC,
            domicilio: req.body.domicilio
        });
        //err tiene los errores que pueden pasar y obj el objeto a guardar.
        usuario.save(function (err, obj) {
            if (err) res.redirect("/crear", {obj: obj});
        });
        res.redirect("/");
    });

    app.get("/empleados", isLoggedIn, function (req, res) {
        res.render("empleados");
    });

    app.get("/crear", isLoggedIn, function (req, res) {
        res.render("usuarioBlank");
    });

    app.get("/cards", isLoggedIn, function (req, res) {
        res.render("cosa");
    });

    app.get("/dashboard", isLoggedIn, function (req, res) {
        res.render("index");
    });

    app.get("/detallesprint", isLoggedIn, function (req, res) {
        res.render("detalleSprint");
    });
    /*---------------------------- Historias -----------------------------------------*/
    app.post("/crearSprint", function (req, res) {
        var release = new LiberacionBacklog({
          proyecto: mongoose.Types.ObjectId(req.body.idProyecto),
          finalizo:false,
          fechaFinalizacion: Date()
        });
        release.save(function(err, obj){
            req.body.historias.forEach(function(historia){
              HistoriaUsuario.update({"_id": mongoose.Types.ObjectId(historia._id)},
                {$set: {"liberacionBacklog": mongoose.Types.ObjectId(obj._id)}},
                function (err) {
                if (err) {
                  err();
                }

            });
          });
          res.redirect("/detalleproyecto");
        });

    });

    var getHistorias = HistoriaUsuario.find({}).then(function successCallback(success) {
        return success;
    }, function errorCallback(error) {
        throw error;
    });

    io.on('connect', function (socket) {
        socket.emit('sendHistorias');
        socket.emit('sendLiberaciones')

        socket.on('newHistoria', function (data) {
            var historiaNueva = new HistoriaUsuario(data);
            historiaNueva.save(function (err, obj) {
                if (obj) {
                    io.emit('sendHistoria')
                }
            });
        });

        socket.on('newRelease', function (historias, idProyecto) {
          var release = new LiberacionBacklog({
            proyecto: mongoose.Types.ObjectId(idProyecto),
            finalizo:false,
            fechaFinalizacion: Date()
          });
          console.log("entre a este pedo");
          release.save(function(err, obj){
              historias.forEach(function(historia){
                HistoriaUsuario.update({"_id": mongoose.Types.ObjectId(historia._id)},
                  {$set: {"liberacionBacklog": mongoose.Types.ObjectId(obj._id)}},
                  function (err) {
                  if (err) {
                    err();
                  }
                  console.log("no entre tanto a este pedo :3");
              });
            });
            io.emit('sendLiberaciones');
          });
        });
    });
};
