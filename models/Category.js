const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserRecipe',
  }],
  order: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
