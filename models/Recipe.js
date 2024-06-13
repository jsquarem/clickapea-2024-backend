const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  author: { type: String },
  equipment: { type: Array },
  host: { type: String },
  total_time: { type: Number },
  yields: { type: String },
  title: { type: String, required: true },
  ingredients: { type: Array, required: true },
  instructions: { type: Array, required: true },
  nutrients: { type: Object, required: true },
  images: { type: [String] },
  original_image: { type: String },
  url: { type: String, required: true }
});

module.exports = mongoose.model('Recipe', recipeSchema);
