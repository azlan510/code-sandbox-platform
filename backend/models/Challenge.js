const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  language: {
    type: String,
    default: 'javascript'
  },
  defaultCode: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Challenge', challengeSchema);