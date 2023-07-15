const mongoose = require('mongoose');

const mediaSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  fileData: {
    type: Buffer,
    required: true
  }
}, {timestamps: true });

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;