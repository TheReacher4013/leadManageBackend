const express = require("express");
const router = express.Router();

const UserController = require("../controllers/user.controller");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.get("/", auth, checkRole("admin", "manager"), UserController.getAllUsers);
router.get("/:id", auth, checkRole("admin", "manager"), UserController.getUserById);
router.post("/", auth, checkRole("admin"), UserController.createUser);
router.put("/:id", auth, checkRole("admin"), UserController.updateUser);
router.delete("/:id", auth, checkRole("admin"), UserController.deleteUser);
router.put("/:id/password", auth, checkRole("admin"), UserController.changePassword);

module.exports = router;