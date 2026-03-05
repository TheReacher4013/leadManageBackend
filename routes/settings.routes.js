// =============================================
// ROUTES - Settings (Admin Only)
// =============================================

const express = require("express");
const router = express.Router();

const SettingsController = require("../controllers/settings.controller");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.use(auth);
router.use(checkRole("admin")); // Sirf Admin

router.get("/", SettingsController.getAll);
router.get("/:key", SettingsController.getByKey);
router.post("/", SettingsController.setSetting);
router.post("/whatsapp", SettingsController.saveWhatsAppConfig);
router.post("/email", SettingsController.saveEmailConfig);
router.delete("/:key", SettingsController.deleteSetting);

module.exports = router;