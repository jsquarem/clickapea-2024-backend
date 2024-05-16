const axios = require('axios');
const { processIngredients, processIngredientsForUpdate } = require('./ingredientService');
const Recipe = require('../models/Recipe');

// Set mongoose options to avoid deprecation warnings
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

const updateRecipe = async (id, updatedRecipeData) => {
  try {
    const processedIngredients = processIngredientsForUpdate(updatedRecipeData.ingredients);
    updatedRecipeData.ingredients = processedIngredients;

    const updatedRecipe = await Recipe.findByIdAndUpdate(id, updatedRecipeData, { new: true });

    if (!updatedRecipe) {
      throw new Error('Recipe not found');
    }

    return updatedRecipe;
  } catch (error) {
    console.error('Error updating recipe:', error.message);
    throw new Error('Failed to update recipe');
  }
};

module.exports = {
  fetchAndProcessRecipe,
  updateRecipe
};
