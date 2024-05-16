const { fetchAndProcessRecipe, updateRecipe } = require('../services/recipeService');
const Recipe = require('../models/Recipe');

const addRecipe = async (req, res) => {
  const { url } = req.body;

  try {
    const recipeData = await fetchAndProcessRecipe(url);
    res.status(200).json(recipeData);
  } catch (error) {
    console.error('Error adding recipe:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRecipeById = async (req, res) => {
  const { id } = req.params;

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(200).json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateRecipeById = async (req, res) => {
  const { id } = req.params;
  const updatedRecipeData = req.body;

  try {
    const updatedRecipe = await updateRecipe(id, updatedRecipeData);
    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addRecipe,
  getRecipeById,
  updateRecipeById
};
