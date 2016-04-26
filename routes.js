var Usuario = require('./models/usuarios');
var Proyecto = require('./models/proyectos');
var Rol = require('./models/roles')
//var mongoose = require('mongoose');

module.exports = function (app, passport, roles, mongoose) {

    app.get("/", isLoggedIn, function (req, res) {
        res.render("index");
    });

    app.get('/login', function (req, res) {
        res.render('landing');
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/landing',
        failureFlash: true
    }));

    app.get('/auth/facebook', passport.authenticate('facebook'));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/landing'
        }));

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/',
            failureRedirect: '/landing'
        }));

    app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/',
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
    app.get("/home", function (req, response) {
        var protectos = [];
        response.render("dashboard", {usuario:"57048f0cee0cea7161f4a469"});
    });

    app.get("/getProyectos/dashboard/:idUsuario/:rol", function(req, response){
      Proyecto.find({"participantes.usuario": mongoose.Types.ObjectId(req.params.idUsuario), "participantes.rol": req.params.rol})
          .exec(function (err, proyectos) {
              if (proyectos != "") {
                  Proyecto.populate(proyectos, {
                      path: 'participantes.usuario',
                      model: 'Usuario'
                  }, function (err, proyectos) {
                      response.json(proyectos);
                  });
              } else {
                  response.render("proyectos/proyectosBlank", {usuario:"57048f0cee0cea7161f4a469"});
              }
          })
    });

    app.get("/count/proyectos/usuario/:idUsuario",function(req,response){
      console.log(req.params.idUsuario);
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
                        case "product-manager":
                            proyectManager = participante.usuario;
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
                console.log(desarrolladores);
                response.render("./proyectos/detalleproyecto",
                    {
                        usuario: req.user,
                        proyecto: obj,
                        manager: proyectManager,
                        scrumMaster: scrumMaster,
                        owner: productOwner,
                        desarrolladores: desarrolladores
                    });
            });
    });

    app.get("/crearProyecto", function(req, response){
      response.render("./proyectos/blankProyecto");
    });

    app.post("/crearProyecto", function (req, res) {
        var rol = new Rol({
            rol: "scrum-master",
            usuario: mongoose.Types.ObjectId("57048f0cee0cea7161f4a469")//req.user._id
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
    app.get("/agregarScrum", isLoggedIn, function (req, response) {
        sass = req.session;
        Usuario.find({}).exec(function (err, usuarios) {
            if (err) response.redirect("/")
            else
                response.render("./usuarios/agregarScrum", {usuarios: usuarios});
        });
    });

    app.get("/agregarManager", isLoggedIn, function (req, response) {
        sass = req.session;
        Usuario.find({}).exec(function (err, usuarios) {
            if (err) response.redirect("/")
            else
                response.render("./usuarios/agregarManager", {usuarios: usuarios});
        });
    });

    app.get("/agregarDesarrollador", isLoggedIn, function (req, response) {
        sass = req.session;
        Usuario.find({}).exec(function (err, usuarios) {
            if (err) response.redirect("/")
            else
                response.render("./usuarios/agregarDesarrolladores", {usuarios: usuarios});
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

    app.post("/agregarManager", isLoggedIn, function (req, response) {
        req.session = sass;
        var rol = new Rol({
            rol: "product-manager",
            usuario: req.body.usuarioAsignado
        });
        Proyecto.update({_id: req.session.proyecto}, {$push: {participantes: {$each: [rol]}}}, {upsert: true}, function (err) {
            if (err) {
                response.redirect("/agregarManager");
            } else {
                response.redirect("/detalleProyecto");
            }
        });
    });

    app.post("/agregarDesarrollador", isLoggedIn, function (req, response) {
        req.session = sass;
        var rol = new Rol({
            rol: "developer",
            usuario: req.body.usuarioAsignado
        });
        Proyecto.update({_id: req.session.proyecto}, {$push: {participantes: {$each: [rol]}}}, {upsert: true}, function (err) {
            if (err) {
                response.redirect("/agregarDesarrollador");
            } else {
                response.redirect("/detalleProyecto");
            }
        });
    });

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

}
;
