const { createRecipe, updateUserRecipe } = require('../services/recipeService');
const Recipe = require('../models/Recipe');
const UserRecipe = require('../models/UserRecipe');

const addRecipe = async (req, res) => {
  const { url } = req.body;

  try {
    const recipe = await createRecipe(url);
    res.status(200).json(recipe);
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

const addUserRecipe = async (req, res) => {
  const { recipeId } = req.body;
  const user_id = req.user.userId;

  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const userRecipe = new UserRecipe({
      user_id,
      recipe_id: recipe._id,
      ...recipe.toObject(),
    });
    await userRecipe.save();
    res.status(200).json(userRecipe);
  } catch (error) {
    console.error('Error adding user recipe:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserRecipeById = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.userId;
  console.log('Finding recipe:', id, 'for user:', user_id);

  try {
    const userRecipe = await UserRecipe.findOne({ _id: id, user_id }).populate('recipe_id');
    if (!userRecipe) {
      return res.status(404).json({ message: 'User recipe not found' });
    }
    res.status(200).json(userRecipe);
  } catch (error) {
    console.error('Error fetching user recipe:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserRecipeById = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.userId;
  const updatedRecipeData = req.body;

  try {
    const updatedRecipe = await updateUserRecipe(id, user_id, updatedRecipeData);
    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error('Error updating user recipe:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ title: 1 });
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addRecipe,
  getRecipeById,
  addUserRecipe,
  getUserRecipeById,
  updateUserRecipeById,
  getAllRecipes
};
