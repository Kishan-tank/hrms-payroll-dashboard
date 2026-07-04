import UserSetting from '../models/UserSetting.js';

export const getSettings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let settings = await UserSetting.findOne({ userId });
    
    if (!settings) {
      // Create default settings if none exist
      settings = await UserSetting.create({ userId });
    }
    
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings', error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { theme, accentColor, notifications } = req.body;
    
    const settings = await UserSetting.findOneAndUpdate(
      { userId },
      { $set: { theme, accentColor, notifications } },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json({ success: true, settings, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings', error: error.message });
  }
};
