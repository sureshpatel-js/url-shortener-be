const express = require('express');
const app = express();
const cors = require("cors");
require('dotenv').config();
const port = process.env.PORT || 8080;
//
const linkController = require("./controllers/linkController");
//Router Imports
const userRoute = require("./routers/userRoute");
const authRoute = require("./routers/authRoute");
const linkRoute = require("./routers/linkRoute");
//db connection
const mongodbConnection = require("./db/mongodb");
mongodbConnection();
app.use(cors());

app.use(express.json());
app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/link", linkRoute);
app.get("/:id", linkController.redirect);



app.get("/Hello", (req, res) => {
    res.cookie("testAuthToken", "iamduplicatetoken", { maxAge: 260000000 });
    res.status(200).json({
        status: "success",
        data: {
            message: "Hello from server, how are you? Have a good day. Deployed on 15-02-2023"
        }
    })
})
app.use((err, req, res, next) => {
    const { status, message } = err;
    res.status(status).json({
        status: "fail",
        data: {
            message
        }

    });
});

app.listen(port, () => {
    console.log(`enlytical app is running on port: ${port}`)
})