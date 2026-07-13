const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { ROLES } = require('../config/roles');

/**
 * User Schema
 * Central identity/auth document shared by every role (super_admin -> client).
 * Role-specific data (salary, department, company info, etc.) lives in the
 * Employee / Client collections which reference this document via `user`.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never returned by default
    },
    avatar: {
      type: String, // relative path served from /uploads
      default: '',
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.EMPLOYEE,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    otp: String,
    otpExpires: Date,

    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,

    // Incrementing this invalidates all existing refresh tokens (logout-all / forced reset)
    tokenVersion: {
      type: Number,
      default: 0,
    },

    lastLogin: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, isActive: 1 });

// Hash password before save
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance method: compare candidate password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method: check if password was changed after a given JWT timestamp
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  return jwtTimestamp < changedTimestamp;
};

// Instance method: generate password reset token (returns raw token, stores hashed)
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  return resetToken;
};

// Instance method: generate a 6-digit OTP (returns raw OTP, stores hashed)
userSchema.methods.createOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = crypto.createHash('sha256').update(otp).digest('hex');
  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

module.exports = mongoose.model('User', userSchema);
