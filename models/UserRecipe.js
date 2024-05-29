const mongoose = require('mongoose');

const userRecipeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipe_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
  title: { type: String, required: true },
  author: { type: String },
  equipment: { type: Array },
  host: { type: String },
  total_time: { type: Number },
  yields: { type: String },
  ingredients: { type: Array, required: true },
  instructions: { type: Array, required: true },
  nutrients: { type: Object, required: true },
  image: { type: String },
  original_image: { type: String },
  additional_images: { type: Array },
  url: { type: String },
  is_edited: { type: Boolean, default: false },
});

module.exports = mongoose.model('UserRecipe', userRecipeSchema);
