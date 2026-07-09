import bcrypt from 'bcrypt';
import User from '../models/user.js';
import UserSetting from '../models/UserSetting.js';

export const getSettings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('name email department designation phone');

    let settings = await UserSetting.findOne({ userId });
    if (!settings) {
      settings = await UserSetting.create({ userId });
    }

    res.status(200).json({
      success: true,
      settings,
      profile: {
        name: user?.name,
        email: user?.email,
        department: user?.department,
        designation: user?.designation,
        phone: user?.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings', error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { theme, accentColor, notifications, profile, currentPassword, newPassword } = req.body;

    const settings = await UserSetting.findOneAndUpdate(
      { userId },
      { $set: { theme, accentColor, notifications } },
      { new: true, upsert: true, runValidators: true }
    );

    const profileUpdates = {};
    if (profile) {
      if (profile.name) profileUpdates.name = profile.name;
      if (profile.department) profileUpdates.department = profile.department;
      if (profile.designation) profileUpdates.designation = profile.designation;
      if (profile.phone) profileUpdates.phone = profile.phone;
    }

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current and new password are required to change your password.' });
      }

      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }

      profileUpdates.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, profileUpdates, { new: true, runValidators: true }).select('-password');

    res.status(200).json({
      success: true,
      settings,
      profile: {
        name: updatedUser?.name,
        email: updatedUser?.email,
        department: updatedUser?.department,
        designation: updatedUser?.designation,
        phone: updatedUser?.phone,
      },
      message: 'Settings updated successfully',
    });
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
