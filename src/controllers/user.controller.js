import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    // user.email = req.body.email || user.email; // Prevent email update for now
    
    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Deactivate user
// @route   PATCH /api/users/deactivate/:id
// @access  Private/Admin
const deactivateUser = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  res.status(200).json({ message: `User ${updatedUser.name} deactivated`, isActive: updatedUser.isActive });
});

export { getMe, updateMe, deactivateUser };
