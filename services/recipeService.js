const axios = require('axios');
const { processIngredients, processIngredientsForUpdate } = require('./ingredientService');
const Recipe = require('../models/Recipe');
const UserRecipe = require('../models/UserRecipe');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const fetchAndProcessRecipe = async (url) => {
  try {
    const apiResponse = await axios.get(`${process.env.SCRAPER_API_URL}`, {
      params: { url },
    });

    const recipeData = apiResponse.data;
    const processedIngredients = processIngredients(recipeData.ingredients);

    const recipe = new Recipe({
      title: recipeData.title,
      author: recipeData.author,
      equipment: recipeData.equipment,
      host: recipeData.host,
      yield: recipeData.yield,
      ingredients: processedIngredients,
      instructions: recipeData.instructions,
      nutrients: recipeData.nutrients,
      image: recipeData.image,
      total_time: recipeData.total_time,
      url: url
    });

    await recipe.save();

    return recipe;
  } catch (error) {
    console.error('Error fetching and processing recipe:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch and process recipe');
  }
};

const updateUserRecipe = async (id, user_id, updatedRecipeData) => {
  try {
    const processedIngredients = processIngredientsForUpdate(updatedRecipeData.ingredients);
    updatedRecipeData.ingredients = processedIngredients;

    const updatedRecipe = await UserRecipe.findOneAndUpdate(
      { _id: id, user_id },
      { ...updatedRecipeData, is_edited: true },
      { new: true }
    );

    if (!updatedRecipe) {
      throw new Error('User recipe not found');
    }

    return updatedRecipe;
  } catch (error) {
    console.error('Error updating user recipe:', error.message);
    throw new Error('Failed to update user recipe');
  }
};

module.exports = {
  fetchAndProcessRecipe,
  updateUserRecipe,
};
