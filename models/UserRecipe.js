const mongoose = require('mongoose');

const userRecipeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  original_recipe_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
  title: { type: String, required: true },
  description: { type: String },
  total_time: { type: Number },
  prep_time: { type: Number },
  cook_time: { type: Number },
  yields: { type: String },
  images: { type: [String] },
  nutrients: { type: Object, required: true },
  ingredients: { type: Array, required: true },
  instructions: { type: Array, required: true },
  ratings: { type: Number },
  equipment: { type: Array },
  author: { type: String },
  host: { type: String },
  reviews: { type: [{}] },
  meal_type: { type: [String] },
  ratings_count: { type: Number },
  keywords: { type: [String] },
  dietary_restrictions: { type: [String] },
  cooking_method: { type: String },
  canonical_url: { type: String },
  language: { type: String },
  ingredient_groups: { type: [Object] },
  original_image: { type: String },
  url: { type: String },
  is_edited: { type: Boolean, default: false },
});

module.exports = mongoose.model('UserRecipe', userRecipeSchema);


module.exports = mongoose.model('UserRecipe', userRecipeSchema);
