const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/auth.controller");
const auth = require("../middleware/auth");
router.post("/login", AuthController.login);
router.get("/me", auth, AuthController.me);

module.exports = router;
