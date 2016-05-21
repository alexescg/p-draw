var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ProductBacklog = mongoose.model('ProductBacklog');

var liberacionBacklogSchema = new Schema({
  proyecto:{type: Schema.ObjectId, ref: "Proyecto", required: true},
    finalizo:{type:Boolean, required:true},
    fechaFinalizacion:[{type: Date, required:true}]
});

var LiberacionBacklog = mongoose.model("LiberacionBacklog", liberacionBacklogSchema);
module.exports.LiberacionBacklog = LiberacionBacklog;
