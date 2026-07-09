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

import User from '../models/user.js';
import Employee from '../models/employee.js';
import bcrypt from 'bcrypt';

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name } = req.body;
    
    // Update User
    const user = await User.findByIdAndUpdate(userId, { name }, { new: true });
    
    // Update Employee if exists
    await Employee.findOneAndUpdate({ $or: [{ userId }, { email: user?.email }] }, { name });
    
    res.status(200).json({ success: true, user, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to change password', error: error.message });
  }
};

export const uploadPhoto = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true });
    
    res.status(200).json({ success: true, avatar: avatarUrl, user, message: 'Photo uploaded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload photo', error: error.message });
  }
};
