const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const settingsController = require("../controllers/settings.controller");

const router = express.Router();

// Protect all settings routes
router.use(authMiddleware);

router.get("/", settingsController.getUserSettings);
router.put("/", settingsController.updateUserSettings);
router.post("/reset", settingsController.resetUserSettings);

module.exports = router;
