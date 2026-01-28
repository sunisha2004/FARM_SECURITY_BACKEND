import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  if (!name || !email || !password || !phoneNumber) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Check if user exists (email or phone)
  const userExists = await User.findOne({ 
      $or: [{ email }, { phoneNumber }] 
  });

  if (userExists) {
    res.status(400);
    if (userExists.email === email) {
        throw new Error('Email already exists');
    } else {
        throw new Error('Phone number already registered');
    }
  }

  // Create user
  // Force role to be 'farmer' always
  let imagePath = '';
  if(req.file) {
      imagePath = '/uploads/' + req.file.filename;
  }

  const user = await User.create({
    name,
    email,
    password,
    phoneNumber,
    role: 'farmer',
    image: imagePath    
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      image: user.image,
      message: 'User registered successfully',
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(401);
      throw new Error('Account is deactivated');
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      image: user.image,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid credentials');
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

export { registerUser, loginUser };
