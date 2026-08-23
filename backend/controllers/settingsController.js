const StoreSettings = require('../models/StoreSettings');

// Fetch settings (Public)
const getSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings();
      await settings.save();
    }
    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update settings (Admin only)
const updateSettings = async (req, res) => {
  try {
    const { 
      isSaleActive, 
      announcementText, 
      promoCode, 
      discountPercentage, 
      heroTitle, 
      heroSubtitle,
      disabledCategories
    } = req.body;

    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings();
    }

    settings.isSaleActive = isSaleActive !== undefined ? isSaleActive : settings.isSaleActive;
    settings.announcementText = announcementText !== undefined ? announcementText : settings.announcementText;
    settings.promoCode = promoCode !== undefined ? promoCode : settings.promoCode;
    settings.discountPercentage = discountPercentage !== undefined ? Number(discountPercentage) : settings.discountPercentage;
    settings.heroTitle = heroTitle !== undefined ? heroTitle : settings.heroTitle;
    settings.heroSubtitle = heroSubtitle !== undefined ? heroSubtitle : settings.heroSubtitle;
    if (disabledCategories !== undefined) {
      settings.disabledCategories = disabledCategories;
    }

    const updatedSettings = await settings.save();
    return res.json(updatedSettings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
