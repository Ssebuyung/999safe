const User = require('../models/user.model');
const Group = require('../models/group.model');

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 * @security No authentication required
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm, age } = req.body;

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with that email'
      });
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      age,
      acceptedTerms: true,
      termsAcceptedAt: new Date()
    };

    // Add optional fields if provided
    if (req.body.phone) userData.phone = req.body.phone;
    if (req.body.userType) userData.userType = req.body.userType;
    if (req.body.neighborhood) userData.neighborhood = req.body.neighborhood;

    try {
      user = await User.create(userData);
    } catch (createError) {
      // Handle duplicate email or validation errors
      if (createError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      if (createError.name === 'ValidationError') {
        const errors = Object.values(createError.errors).map(e => e.message);
        return res.status(400).json({
          success: false,
          message: errors.join(', ')
        });
      }
      throw createError;
    }

    // Generate JWT token
    let token;
    try {
      token = user.getSignedJwtToken();
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).json({
        success: false,
        message: 'Error generating authentication token'
      });
    }

    // Suggest group action based on neighborhood presence
    let groupSuggestion = null;
    try {
      if (user.neighborhood) {
        const existingGroup = await Group.findOne({ neighborhood: user.neighborhood });
        if (existingGroup) {
          groupSuggestion = {
            action: 'join',
            neighborhood: user.neighborhood,
            groupId: existingGroup._id,
            name: existingGroup.name
          };
        } else {
          groupSuggestion = {
            action: 'create',
            neighborhood: user.neighborhood,
            name: `${user.neighborhood} Safety Group`
          };
        }
      }
    } catch (e) {
      // Non-fatal: if group lookup fails, omit suggestion
      groupSuggestion = null;
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        userType: user.userType,
        trustScore: user.trustScore,
        phone: user.phone,
        neighborhood: user.neighborhood,
        createdAt: user.createdAt
      },
      groupSuggestion
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 * @security No authentication required
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password since it's normally excluded)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        userType: user.userType,
        trustScore: user.trustScore,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 * @security JWT Bearer token required
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        userType: user.userType,
        trustScore: user.trustScore,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};
