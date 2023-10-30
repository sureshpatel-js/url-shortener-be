const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CounterSchema = new Schema({
    count: {
        type: Number
    }
})


const Counter = mongoose.model("counter", CounterSchema);
module.exports = Counter;