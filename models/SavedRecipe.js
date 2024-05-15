const mongoose = require('mongoose');

const savedRecipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  dateSaved: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedRecipe', savedRecipeSchema);
