const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const LinkClickDetailSchema = new Schema({
    created_at: {
        type: Date
    },
    link_id: {
        type: Schema.Types.ObjectId
    }
})


const LinkClickDetail = mongoose.model("linkclickdetail", LinkClickDetailSchema);
module.exports = LinkClickDetail;