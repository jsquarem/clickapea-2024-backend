const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const axios = require('axios');
const { processIngredients, processIngredientsForUpdate } = require('./ingredientService');
const Recipe = require('../models/Recipe');
const Category = require('../models/Category');
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

const downloadImage = async (url) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
};

const uploadImageToS3 = async (imageBuffer) => {
  try {
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
  } catch (error) {
    console.error('Error uploading image to S3:', error.message);
    throw new Error('Failed to upload image to S3');
  }
};

const fetchAndProcessRecipe = async (url) => {
  try {
    const apiResponse = await axios.get(`${process.env.SCRAPER_API_URL}/scrape`, {
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
      yield: recipeData.yields,
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

    const imageBuffer = await downloadImage(recipeData.image);
    const awsImageUrl = await uploadImageToS3(imageBuffer);

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

const createScannedRecipeFromJson = async (recipeData) => {
  try {
    // Preprocess the ingredients list
    if (Array.isArray(recipeData.ingredients) && recipeData.ingredients.length > 0) {
      recipeData.ingredients = recipeData.ingredients.map(ingredient => {
        if (typeof ingredient === 'string') {
          return { text: ingredient };
        } else {
          return ingredient;
        }
      });
    }

    // Ensure optional fields have default values
    recipeData.title = recipeData.title || '';
    recipeData.total_time = recipeData.total_time || '';
    recipeData.yields = recipeData.yields || '';
    recipeData.image = recipeData.image || '';
    recipeData.host = recipeData.host || '';
    recipeData.author = recipeData.author || '';
    recipeData.nutrients = recipeData.nutrients || {};

    const apiResponse = await axios.post(`${process.env.SCRAPER_API_URL}/process`, recipeData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const processedRecipeData = apiResponse.data;
    const processedIngredients = processIngredients(processedRecipeData.ingredients);

    const scannedRecipe = {
      ...processedRecipeData,
      ingredients: processedIngredients
    };

    return scannedRecipe;
  } catch (error) {
    console.error('Error creating user recipe from JSON:', error.message);
    throw new Error('Failed to create user recipe from JSON');
  }
};


const createUserRecipeFromJson = async (recipeData, userId, mainImageFile, additionalImages) => {
  try {

    const payload = {
      ...recipeData,
      ingredients: JSON.parse(recipeData.ingredients),
      equipment: JSON.parse(recipeData.equipment),
      instructions: JSON.parse(recipeData.instructions),
    };
    const apiResponse = await axios.post(`${process.env.SCRAPER_API_URL}/process`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const processedRecipeData = apiResponse.data;
    console.log('apiResponse.data: ', apiResponse.data)

    const processedIngredients = processIngredients(processedRecipeData.ingredients);

    // Upload main image file
    let awsImageUrl = '';
    if (mainImageFile) {
      const imageBuffer = await sharp(mainImageFile.buffer).resize(800, 800, { fit: 'inside' }).toBuffer();
      awsImageUrl = await uploadImageToS3(imageBuffer);
    }
    console.log('awsImageUrl: ', awsImageUrl)

    // Upload additional image files
    let awsAdditionalImageUrls = [];
    awsAdditionalImageUrls = await Promise.all(
      additionalImages.map(async (image) => {
        const imageBuffer = await sharp(image.buffer).resize(800, 800, { fit: 'inside' }).toBuffer();
        return await uploadImageToS3(imageBuffer);
      })
    );
    console.log('awsAdditionalImageUrls: ', awsAdditionalImageUrls)

    const userRecipe = new UserRecipe({
      user_id: userId,
      title: processedRecipeData.title,
      author: processedRecipeData.author,
      equipment: processedRecipeData.equipment,
      host: processedRecipeData.host,
      yield: processedRecipeData.yields,
      ingredients: processedIngredients,
      instructions: processedRecipeData.instructions,
      nutrients: processedRecipeData.nutrients,
      image: awsImageUrl,
      additional_images: awsAdditionalImageUrls,
      total_time: processedRecipeData.total_time,
      url: processedRecipeData.url,
    });

    await userRecipe.save();

    const allRecipesCategory = await Category.findOne({ user: userId, name: 'All Recipes' });
    if (allRecipesCategory) {
      allRecipesCategory.recipes.push(userRecipe._id);
      await allRecipesCategory.save();
    }

    return userRecipe;
  } catch (error) {
    console.error('Error creating user recipe from JSON:', error.message);
    throw new Error('Failed to create user recipe from JSON');
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
  createUserRecipeFromJson,
  createScannedRecipeFromJson
};
