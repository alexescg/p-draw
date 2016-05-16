var Usuario = require('./models/usuarios');
var Proyecto = require('./models/proyectos');
var Rol = require('./models/roles');
var HistoriaUsuario = require('./models/historiaUsuarios');
//var mongoose = require('mongoose');

module.exports = function (app, passport, roles, mongoose, io) {

    app.get("/", isLoggedIn, function (req, res) {
        res.render("index");
    });

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


    app.get('/register', function (req, res) {
        res.render('register', {message: req.flash('signupMessage')});
    });

    app.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/register',
        failureFlash: true
    }));


    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile',
            {
                message: req.flash('signupMessage'),
                user: req.user
            });
    });


    app.post('/profile', isLoggedIn, function (req, res) {
        var usuario = new Usuario(req.user);
        usuario.username = req.body.username;
        usuario.nombre = req.body.nombre;
        usuario.apellidos = req.body.apellidos;
        usuario.fechaNacimiento = req.body.fechaNacimiento;
        usuario.rfc = req.body.rfc;
        usuario.curp = req.body.curp;
        usuario.domicilio = req.body.domicilio;
        usuario.rolActual = req.body.rolActual;

        usuario.save(function (err, user) {
                if (err) {
                    console.log(err);
                    res.render("profile", {
                        message: req.flash('Error al guardar datos.'),
                        user: req.user
                    });
                } else {
                    res.render("profile", {
                        message: req.flash('Exito!'),
                        user: user
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
        console.log("REQ-USER: "+req.user);
        var protectos = [];
        response.render("dashboard", {usuario: req.user});
    });

    app.get("/getProyectos/dashboard/:idUsuario/:rol", function(req, response){
      console.log(req.params.idUsuario);
      Proyecto.find({"participantes.usuario": mongoose.Types.ObjectId(req.params.idUsuario), "participantes.rol": req.params.rol})
          .exec(function (err, proyectos) {
              if (proyectos != "") {
                  Proyecto.populate(proyectos, {
                      path: 'participantes.usuario',
                      model: 'Usuario'
                  }, function (err, proyectos) {
                      response.json(proyectos);
                  });
              }
          })
    });

    app.get("/count/proyectos/usuario/:idUsuario",function(req,response){
      var json={};
      json.scrum = 0;
      json.owner = 0;
      json.developer = 0;
      Proyecto.count({"participantes.usuario": mongoose.Types.ObjectId(req.params.idUsuario), "participantes.rol": "scrum-master"},
              function(err, c){
                if(err) response.redirect("/");
                json.scrum = c;
              });
      Proyecto.count({"participantes.usuario": mongoose.Types.ObjectId(req.params.idUsuario), "participantes.rol": "product-owner"},
              function(err, c){
                if(err) response.redirect("/");
                json.owner = c;
              });
      Proyecto.count({"participantes.usuario": mongoose.Types.ObjectId(req.params.idUsuario), "participantes.rol": "developer"},
              function(err, c){
                if(err) response.redirect("/");
                json.developer = c;
                console.log("Json.developer: "+json.developer);
                response.json(json);
              });
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
                req.session.proyecto = req.query.proyectoElegido
                if (err) response.redirect("/home");
                else
                    var proyectManager;
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

    app.get("/detalleProyecto/findDevelopers/:idProyecto", function(req, response){
      console.log(req.params.idProyecto);
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
                console.log(desarrolladores);
                response.json(desarrolladores);
              }
          });
      });

    app.post("/crearProyecto", function (req, res) {
      console.log(req.user);
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
        console.log("IDPROYECTO: "+req.body.idProyecto);
        req.session = sass;
        var rol = new Rol({
            rol: "product-owner",
            usuario: mongoose.Types.ObjectId(req.body.usuarioOwner)
        });
        Proyecto.update({_id: req.body.idProyecto}, {$push: {participantes: {$each: [rol]}}}, {upsert: true}, function (err) {
            if (err) {
                console.log("Aaaaa")
            } else {
              console.log("AAAA")
            }
        });
    });

    app.post("/agregarDesarrollador", isLoggedIn, function (req, response) {

      console.log("IDPROYECTO: "+req.body.idProyecto);
      console.log(req.body.usuarioOwner);
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


    var getHistorias = HistoriaUsuario.find({}).then(function successCallback(success) {
          return success;
      }, function errorCallback(error) {
          throw error;
      });

    io.on('connect', function (socket) {
        // console.log(getMessages());
        socket.emit('sendHistorias', getHistorias);

        socket.on('newHistoria', function (data) {
            var historiaNueva = new HistoriaUsuario(data);
            historiaNueva.save(function (err, obj) {
                console.log(obj);
                if (obj) {
                    io.emit('sendHistoria', obj)
                }
            });
        });
    });


};
