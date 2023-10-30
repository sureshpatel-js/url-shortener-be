const mongoose = require("mongoose");
const mongodbConnection = async () => {
  mongoose
    .connect(
      // "mongodb://127.0.0.1:27017/strlink",
      "mongodb+srv://enlytical:75TzxLZKl4Z2YLyl@cluster0.eb9msdq.mongodb.net/strlink?retryWrites=true&w=majority"
      //"mongodb://nrsnosqldb:KkZPCAKQoU2Whhn77exjgN6rmHRB3vRTiUofILTZXsROPpoThGwPrEinF8bBSXKJfeEEJDfIlAPUACDbQwK4aA==@nrsnosqldb.mongo.cosmos.azure.com:10255/enlytical-ai-dev?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@nrsnosqldb@"
    ).then(() => {
      console.log("connected to DB.");
    })
    .catch((error) => {
      console.log(`connection with DB error====>${error}`);
    });
}

module.exports = mongodbConnection;
