const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
router.route("/setPassword").post(authController.setPassword);
router.route("/login").post(authController.logIn);
router.route("/generateOtp").post(authController.generateOtp);
module.exports = router;
