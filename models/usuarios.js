var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');

var rfcMatch = /^[a-zA-Z]{3,4}(\d{6})((\D|\d){3})?$/
var curpMatch = /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/


var usuarioSchema = mongoose.Schema({
    username: {type: String},
    nombre: {type: String},
    apellidos: {type: String},
    fechaNacimiento: {type: Date},
    curp: {type: String, match: curpMatch},
    rfc: {type: String, match: rfcMatch},
    domicilio: {type: String},
    rolActual: {type: String},
    local: {
        email: {type: String},
        password: {
            type: String
            // , validate: {
            //     validator: function (p) {
            //         return this.confirmarPassword === p;
            //     }, message: "Las contraseñas no son iguales"
            // }
        }
    },
    facebook: {
        id: String,
        token: String,
        name: String
    },
    twitter: {
        id: String,
        token: String,
        username: String,
        displayName: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    }
});

usuarioSchema.virtual("confirmarPassword").get(function () {
    return this.otroPassword;
}).set(function (password) {
    this.otroPassword = password;
});

usuarioSchema.virtual("nombreCompleto").get(function () {
    if(this.google){
      return this.google.name;
    } else if (this.twitter){
      return this.twitter.displayName;
    } else if (this.facebook){
      return this.facebook.name;
    }
    return this.nombre + " " + this.apellidos;
});

usuarioSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

usuarioSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model("Usuario", usuarioSchema);
