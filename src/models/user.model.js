const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password by default in queries
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [150, 'Age cannot exceed 150']
    },
    userType: {
      type: String,
      enum: ['resident', 'stakeholder'],
      default: 'resident',
      required: true
    },
    trustScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    phone: {
      type: String,
      trim: true
    },
    neighborhood: {
      type: String,
      enum: [
        'Nakwero',
        'Kira Town',
        'Bweyogerere',
        'Najjera',
        'Kisasi',
        'Kiwatule',
        'Namugongo',
        'Other'
      ]
    },
    acceptedTerms: {
      type: Boolean,
      default: false,
      required: true
    },
    termsAcceptedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving (only if modified)
userSchema.pre('save', async function() {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
userSchema.methods.getSignedJwtToken = function() {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
  const expiresIn = process.env.JWT_EXPIRE || '30d';
  
  if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET not set in environment variables. Using fallback secret.');
  }
  
  return jwt.sign({ id: this._id }, secret, {
    expiresIn: expiresIn
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
