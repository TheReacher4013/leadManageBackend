const express = require("express");
const router = express.Router();
const CallLogController = require("../controllers/calllog.controller");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.use(auth);

router.get("/stats", checkRole("admin", "manager"), CallLogController.getStats);
router.get("/", checkRole("admin", "manager"), CallLogController.getAll);
router.get("/:id", checkRole("admin", "manager"), CallLogController.getById);
router.post("/", checkRole("admin", "manager", "member"), CallLogController.create);
router.delete("/:id", checkRole("admin"), CallLogController.delete);

module.exports = router;