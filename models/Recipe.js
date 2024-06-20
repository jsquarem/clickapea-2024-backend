const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
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
  ingredient_groups: { type: [{}] },
  original_image: { type: String },
  url: { type: String, required: true }
});

module.exports = mongoose.model('Recipe', recipeSchema);
