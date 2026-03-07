const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.use(auth);

router.get("/", checkRole("admin", "manager"), ProductController.getAll);
router.get("/:id", checkRole("admin", "manager"), ProductController.getById);
router.post("/", checkRole("admin", "manager"), ProductController.create);
router.put("/:id", checkRole("admin", "manager"), ProductController.update);
router.delete("/:id", checkRole("admin"), ProductController.delete);

module.exports = router;