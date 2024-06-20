const { createRecipe, updateUserRecipe, uploadImageToS3, createUserRecipeFromJson, createScannedRecipeFromJson } = require('../services/recipeService');
const Recipe = require('../models/Recipe');
const UserRecipe = require('../models/UserRecipe');
const Category = require('../models/Category'); // Import Category model
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const createNewRecipe = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'additional_images', maxCount: 10 },
]);

const handleCreateNewRecipe = async (req, res) => {
  const recipeData = req.body;
  const imageFiles = req.files['images'] ? req.files['images'] : [];

  console.log('recipeData:', recipeData);
  console.log('imageFiles:', imageFiles);

  // return res.status(201).json(recipeData);
  try {
    const userRecipe = await createUserRecipeFromJson(recipeData, req.user.userId, imageFiles);
    res.status(201).json(userRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const addRecipe = async (req, res) => {
  const { url } = req.body;
  const user_id = req.user?.userId; // Optional chaining to check if user is authenticated

  try {
    const recipe = await createRecipe(url);

    if (user_id) {
      // Add recipe to the user's "All Recipes" category
      const allRecipesCategory = await Category.findOne({ user: user_id, name: 'All Recipes' });
      if (allRecipesCategory) {
        allRecipesCategory.recipes.push(recipe._id);
        await allRecipesCategory.save();
      } else {
        console.error('All Recipes category not found for user:', user_id);
      }
    }

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
      original_recipe_id: recipe._id,
      ...recipe.toObject(),
    });
    await userRecipe.save();

    const allRecipesCategory = await Category.findOne({ user: user_id, name: 'All Recipes' });
    if (allRecipesCategory) {
      allRecipesCategory.recipes.push(userRecipe._id);
      await allRecipesCategory.save();
    }

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
    const userRecipe = await UserRecipe.findOne({ _id: id, user_id }).populate('original_recipe_id');
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

const uploadRecipeImages = upload.array('images', 10);

const handleUploadRecipeImages = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.userId;
  const files = req.files;

  if (!files || !files.length) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    let userRecipe = await UserRecipe.findOne({ _id: id, user_id });
    if (!userRecipe) {
      const recipe = await Recipe.findById(id);
      console.log(recipe);
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      userRecipe = new UserRecipe({
        user_id: user_id,
        original_recipe_id: recipe._id,
        title: recipe.title,
        author: recipe.author,
        equipment: recipe.equipment,
        host: recipe.host,
        total_time: recipe.total_time,
        yields: recipe.yields,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        nutrients: recipe.nutrients,
        images: recipe.images,
        url: recipe.url,
        is_edited: false,
      });

      await userRecipe.save();

      const allRecipesCategory = await Category.findOne({ user: user_id, name: 'All Recipes' });
      if (allRecipesCategory) {
        allRecipesCategory.recipes.push(userRecipe._id);
        await allRecipesCategory.save();
      }
    }

    const uploadedImageUrls = await Promise.all(
      files.map(async (file) => {
        try {
          const imageUrl = await uploadImageToS3(file.buffer);
          return imageUrl;
        } catch (error) {
          console.error('Error uploading image:', error.message);
          throw new Error('Failed to upload image to S3');
        }
      })
    );

    userRecipe.images = userRecipe.images && userRecipe.images.length > 0
      ? userRecipe.images.concat(uploadedImageUrls)
      : uploadedImageUrls;

    await userRecipe.save();
    res.status(200).json(userRecipe);
  } catch (error) {
    console.error('Error uploading additional images:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// const uploadMainImage = upload.array('images', 10);

// const handleUploadMainImage = async (req, res) => {
//   const { id } = req.params;
//   const user_id = req.user.userId;
//   const file = req.file;

//   if (!file) {
//     return res.status(400).json({ message: 'No file uploaded' });
//   }

//   try {
//     let userRecipe = await UserRecipe.findOne({ _id: id, user_id });
//     if (!userRecipe) {
//       const recipe = await Recipe.findById(id);
//       if (!recipe) {
//         return res.status(404).json({ message: 'Recipe not found' });
//       }

//       userRecipe = new UserRecipe({
//         user_id: user_id,
//         recipe_id: recipe._id,
//         title: recipe.title,
//         author: recipe.author,
//         equipment: recipe.equipment,
//         host: recipe.host,
//         total_time: recipe.total_time,
//         yields: recipe.yields,
//         ingredients: recipe.ingredients,
//         instructions: recipe.instructions,
//         nutrients: recipe.nutrients,
//         images: recipe.images,
//         url: recipe.url,
//         is_edited: false,
//       });

//       await userRecipe.save();

//       const allRecipesCategory = await Category.findOne({ user: user_id, name: 'All Recipes' });
//       if (allRecipesCategory) {
//         allRecipesCategory.recipes.push(userRecipe._id);
//         await allRecipesCategory.save();
//       }
//     }

//     const imageUrl = await uploadImageToS3(file.buffer);
//     userRecipe.image = imageUrl;
//     await userRecipe.save();

//     res.status(200).json(userRecipe);
//   } catch (error) {
//     console.error('Error uploading main image:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ title: 1 });
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadScanRecipeImage = upload.single('imageFile'); // Add multer middleware

const handleScanRecipe = async (req, res) => {
  try {
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Logging the image file for debugging purposes
    console.log('Image File:', imageFile);

    // Creating form data to send to RECIPE_OCR_API
    const formData = new FormData();
    formData.append('imageFile', imageFile.buffer, imageFile.originalname);

    // Sending the POST request to RECIPE_OCR_API
    const response = await axios.post(`${process.env.RECIPE_OCR_API}/scan`, formData, {
      headers: formData.getHeaders(),
    });

    const recipeData = response.data;

    const scannedRecipe = await createScannedRecipeFromJson(recipeData);

    // Responding with the result from the API
    res.status(200).json(scannedRecipe);
  } catch (error) {
    console.error('Error handling scan recipe:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUserRecipeById = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.userId;

  try {
    const userRecipe = await UserRecipe.findOneAndDelete({ _id: id, user_id });
    if (!userRecipe) {
      return res.status(404).json({ message: 'User recipe not found' });
    }
    res.status(200).json({ message: 'User recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting user recipe:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  addRecipe,
  getRecipeById,
  addUserRecipe,
  getUserRecipeById,
  updateUserRecipeById,
  uploadRecipeImages,
  handleUploadRecipeImages,
  getAllRecipes,
  createNewRecipe,
  handleCreateNewRecipe,
  uploadScanRecipeImage,
  handleScanRecipe,
  deleteUserRecipeById
};
