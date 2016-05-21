var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var LiberacionBacklog = mongoose.model('LiberacionBacklog');

var sprintSchema = new Schema({
    backlogLiberacion:{type: Schema.ObjectId, ref: "LiberacionBacklog"},
    finalizo:{type:Boolean, required:true},
    fechaFinal:{type: Date, required:true}
});

var Sprint = mongoose.model("Sprint", sprintSchema);
module.exports.Sprint = Sprint;
