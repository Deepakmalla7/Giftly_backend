const UserSettings = require("../models/UserSettings");

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  pushNotifications: false,
  orderUpdates: true,
  marketingEmails: false,
  darkMode: false,
  twoFactor: false,
};

const allowedFields = Object.keys(DEFAULT_SETTINGS);

const getUserSettings = async (req, res) => {
  try {
    const userId = req.userId;

    let settings = await UserSettings.findOne({ userId });
    if (!settings) {
      settings = await UserSettings.create({ userId, ...DEFAULT_SETTINGS });
    }

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
};

const updateUserSettings = async (req, res) => {
  try {
    const userId = req.userId;
    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        if (typeof req.body[field] !== "boolean") {
          return res.status(400).json({
            success: false,
            message: `${field} must be a boolean`,
          });
        }
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid settings provided",
      });
    }

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update settings" });
  }
};

const resetUserSettings = async (req, res) => {
  try {
    const userId = req.userId;

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: DEFAULT_SETTINGS },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to reset settings" });
  }
};

module.exports = {
  getUserSettings,
  updateUserSettings,
  resetUserSettings,
};
