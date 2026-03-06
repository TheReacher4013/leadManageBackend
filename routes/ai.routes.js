const express = require("express");
const router = express.Router();

const AIController = require("../controllers/ai.controller");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.use(auth);

// All roles use kar sakte hain AI
router.post("/recommend/:leadId", checkRole("admin", "manager", "member"), AIController.getRecommendation);
router.post("/whatsapp-message/:leadId", checkRole("admin", "manager", "member"), AIController.suggestWhatsApp);
router.post("/email/:leadId", checkRole("admin", "manager", "member"), AIController.suggestEmail);
router.get("/predict/:leadId", checkRole("admin", "manager", "member"), AIController.predictConversion);
router.get("/history/:leadId", checkRole("admin", "manager", "member"), AIController.getHistory);

module.exports = router;