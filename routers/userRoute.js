const express = require("express");
const userController = require("../controllers/userController");
const authController = require("./../controllers/authController");
const { CLIENT_ADMIN, ENLYTICAL_ADMIN, INTERNAL_ADMIN } = require("../constants/constants")
const router = express.Router();

router.
    route("/").
    get(authController.protectRoute, userController.getMyObj)
router
    .route("/clientAdminSignUp")
    .post(userController.clientAdminSignUp);

router
    .route("/plane")
    .post(authController.protectRoute, userController.buyPlane);
module.exports = router;