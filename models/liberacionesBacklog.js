var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/byb_system');
var Schema = mongoose.Schema;
var ProductBacklog = mongoose.model('ProductBacklog');

var liberacionBacklogSchema = new Schema({
    productBacklog:{type: Schema.ObjectId, ref: "ProductBacklog"},
    finalizo:{type:Boolean, required:true},
    fechaFinalizacion:[{type: Date, required:true}]
});

var LiberacionBacklog = mongoose.model("LiberacionBacklog", liberacionBacklogSchema);
module.exports.LiberacionBacklog = LiberacionBacklog;