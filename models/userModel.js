const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    user_type: {
        type: String
    },
    user_domain: {
        type: String
    },
    email: {
        type: String,
    },
    contact_num: {
        type: String,
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    },
    created_by: {
        type: Schema.Types.ObjectId
    },
    hashed_password: {
        type: String,
    },
    password_updated_at: {
        type: Number,
    },
    hashed_otp: {
        type: String,
    },
    otp_created_at: {
        type: Number,
    },
    last_login_at: {
        type: Date
    },
    active_status: {
        type: Boolean
    },
    email_verified: {
        type: Boolean
    },
    link_available: {
        type: Number,
        default: 10
    },
    link_available_expire_date: {
        type: Date
    },
    analytics_link_available_count: {
        type: Number,
        default: 0
    },
    unique_extension_count: {
        type: Number,
        default: 0
    }
})


const User = mongoose.model("user", UserSchema);
module.exports = User;