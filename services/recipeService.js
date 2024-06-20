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
    console.log('Fetched recipe data:', JSON.stringify(recipeData));

    const processedIngredients = processIngredients(recipeData.ingredients);

    return {
      title: recipeData.title,
      description: recipeData.description,
      total_time: recipeData.total_time,
      prep_time: recipeData.prep_time,
      cook_time: recipeData.cook_time,
      yields: recipeData.yields,
      images: recipeData.images,
      nutrients: recipeData.nutrients,
      ingredients: processedIngredients,
      instructions: recipeData.instructions,
      ratings: recipeData.ratings,
      equipment: recipeData.equipment,
      author: recipeData.author,
      host: recipeData.host,
      reviews: recipeData.reviews,
      meal_type: recipeData.meal_type,
      ratings_count: recipeData.ratings_count,
      keywords: recipeData.keywords,
      dietary_restrictions: recipeData.dietary_restrictions,
      cooking_method: recipeData.cooking_method,
      canonical_url: recipeData.canonical_url,
      language: recipeData.language,
      ingredient_groups: recipeData.ingredient_groups,
      original_image: recipeData.original_image,
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

     const awsImages = await Promise.all(recipeData.images.map(async (image) => {
      const imageBuffer = await downloadImage(image);
      const awsImageUrl = await uploadImageToS3(imageBuffer);
      return awsImageUrl;
    }));

    const recipe = new Recipe({
      ...recipeData,
      images: awsImages,
      original_image: awsImages[0],
    });

    await recipe.save();
    return recipe;
  } catch (error) {
    console.error('Error creating recipe:', error.message);
    throw error;
  }
};

const createScannedRecipeFromJson = async (recipeData) => {
  console.log('recipeData: ', recipeData)
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
    recipeData.description = recipeData.description || '';
    recipeData.total_time = recipeData.total_time || 0;
    recipeData.prep_time = recipeData.prep_time || 0;
    recipeData.cook_time = recipeData.cook_time || 0;
    recipeData.yields = recipeData.yields || '';
    recipeData.images = recipeData.images || [];
    recipeData.nutrients = recipeData.nutrients || {};
    recipeData.ingredients = recipeData.ingredients || [];
    recipeData.instructions = recipeData.instructions || [];
    recipeData.ratings = recipeData.ratings || 0;
    recipeData.equipment = recipeData.equipment || [];
    recipeData.author = recipeData.author || '';
    recipeData.host = recipeData.host || '';
    recipeData.reviews = recipeData.reviews || [];
    recipeData.meal_type = recipeData.meal_type || [];
    recipeData.ratings_count = recipeData.ratings_count || 0;
    recipeData.keywords = recipeData.keywords || [];
    recipeData.dietary_restrictions = recipeData.dietary_restrictions || [];
    recipeData.cooking_method = recipeData.cooking_method || '';
    recipeData.canonical_url = recipeData.canonical_url || '';
    recipeData.language = recipeData.language || '';
    recipeData.ingredient_groups = recipeData.ingredient_groups || [];
    recipeData.original_image = recipeData.original_image || '';
    recipeData.url = recipeData.url || '';

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
    console.error('Error creating scanned user recipe from JSON:', error.message);
    throw new Error('Failed to create user recipe from JSON');
  }
};


const createUserRecipeFromJson = async (recipeData, userId, images) => {
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
    let awsImages = [];
    if (images.length > 0) {
        awsImages = await Promise.all(images.map(async (image) => {
        const awsImageUrl = await uploadImageToS3(image.buffer);
        return awsImageUrl;
        }));
    }
    console.log('awsImages: ', awsImages)

        const userRecipe = new UserRecipe({
      user_id: userId,
      title: processedRecipeData.title,
      description: processedRecipeData.description,
      total_time: processedRecipeData.total_time,
      prep_time: processedRecipeData.prep_time,
      cook_time: processedRecipeData.cook_time,
      yields: processedRecipeData.yields,
      images: awsImages,
      nutrients: processedRecipeData.nutrients,
      ingredients: processedIngredients,
      instructions: processedRecipeData.instructions,
      ratings: processedRecipeData.ratings,
      equipment: processedRecipeData.equipment,
      author: processedRecipeData.author,
      host: processedRecipeData.host,
      reviews: processedRecipeData.reviews,
      meal_type: processedRecipeData.meal_type,
      ratings_count: processedRecipeData.ratings_count,
      keywords: processedRecipeData.keywords,
      dietary_restrictions: processedRecipeData.dietary_restrictions,
      cooking_method: processedRecipeData.cooking_method,
      canonical_url: processedRecipeData.canonical_url,
      language: processedRecipeData.language,
      ingredient_groups: processedRecipeData.ingredient_groups,
      original_image: processedRecipeData.original_image,
      url: processedRecipeData.url
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
