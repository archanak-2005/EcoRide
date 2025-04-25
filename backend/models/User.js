const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 2
  },
  lastname: {
    type: String,
    required: true,
    minLength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,  // Ensure the email is unique
    match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/
  },
  password: {
    type: String,
    required: true,
    minLength: 3
  },
  role: {
    type: String,
    default: 'user'
  },
  active_trip: {
    type: Boolean,
    default: false
  }
});

// Encrypt password before saving the user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Compare input password with stored password
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
