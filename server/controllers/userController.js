const User = require('../models/User');
const Document = require('../models/Document');
const VerificationLog = require('../models/VerificationLog');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const documentStats = await Document.aggregate([
      { $match: { uploadedBy: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: 0,
      verified: 0,
      pending: 0,
      rejected: 0,
      processing: 0
    };

    documentStats.forEach(stat => {
      stats[stat._id] = stat.count;
      stats.total += stat.count;
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      stats
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile'
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (name) user.name = name;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// Get user activity logs
const getUserActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const logs = await VerificationLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('documentId', 'originalName documentType');

    const total = await VerificationLog.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalLogs: total
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving activity logs'
    });
  }
};

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const total = await User.countDocuments();

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving users'
    });
  }
};

// Admin: Toggle user status
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user status'
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserActivityLogs,
  getAllUsers,
  toggleUserStatus
};
