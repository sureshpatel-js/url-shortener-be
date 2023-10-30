const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const LinkSchema = new Schema({
    created_by: {
        type: Schema.Types.ObjectId
    },
    created_at: {
        type: Date
    },
    input_url: {
        type: String
    },
    output_url: {
        type: String
    },
    status: {
        type: Boolean
    }
})
const Link = mongoose.model("link", LinkSchema);
module.exports = Link;