const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const axios = require('axios');
const { processIngredients, processIngredientsForUpdate } = require('./ingredientService');
const Recipe = require('../models/Recipe');
const UserRecipe = require('../models/UserRecipe');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
require('dotenv').config();

const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadImageToS3 = async (imageBuffer) => {
  const resizedImageBuffer = await sharp(imageBuffer).resize(800, 800, { fit: 'inside' }).toBuffer();
  const key = `upload/images/${uuidv4()}.jpg`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: resizedImageBuffer,
    ContentType: 'image/jpeg',
  });

  await s3Client.send(command);
  return `${process.env.AWS_ROOT_URL}/${key}`;
};

const fetchAndProcessRecipe = async (url) => {
  try {
    const apiResponse = await axios.get(`${process.env.SCRAPER_API_URL}`, {
      params: { url },
    });

    const recipeData = apiResponse.data;
    console.log('Fetched recipe data:', recipeData);

    const processedIngredients = processIngredients(recipeData.ingredients);

    return {
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
      url: url,
    };
  } catch (error) {
    console.error('Error fetching and processing recipe:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch and process recipe');
  }
};

const createRecipe = async (url) => {
  try {
    const recipeData = await fetchAndProcessRecipe(url);
    console.log('Processed recipe data:', recipeData);

    if (!recipeData.title || !recipeData.nutrients || !recipeData.url) {
      throw new Error('Missing required recipe fields');
    }

    const awsImageUrl = await uploadImageToS3(recipeData.image);

    const recipe = new Recipe({
      ...recipeData,
      image: awsImageUrl,
      original_image: recipeData.image,
    });

    await recipe.save();
    return recipe;
  } catch (error) {
    console.error('Error creating recipe:', error.message);
    throw error;
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
  uploadImageToS3,
  createRecipe,
  updateUserRecipe,
};
