const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: 1,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6
  }
}, { timestamps: true })

const User = mongoose.model('user',  userSchema);

module.exports = User;