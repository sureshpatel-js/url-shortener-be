const express = require("express");
const linkController = require("../controllers/linkController");
const authController = require("./../controllers/authController");
const { CLIENT_ADMIN, INTERNAL_ADMIN } = require("../constants/constants")
const router = express.Router();

router
    .route("/")
    .post(authController.protectRoute, authController.restrictTo(CLIENT_ADMIN, INTERNAL_ADMIN), linkController.createShortUrl);
router
    .route("/getLinks")
    .get(authController.protectRoute, authController.restrictTo(CLIENT_ADMIN, INTERNAL_ADMIN), linkController.getLinks);
module.exports = router;