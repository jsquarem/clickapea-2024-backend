const express = require('express');
const {
  addRecipe,
  getRecipeById,
  addUserRecipe,
  getUserRecipeById,
  updateUserRecipeById,
  uploadAdditionalImage,
  handleUploadAdditionalImage,
  getAllRecipes,
  createNewRecipe,
  handleCreateNewRecipe,
  uploadMainImage,
  handleUploadMainImage,
  uploadScanRecipeImage,
  handleScanRecipe,
  deleteUserRecipeById,
} = require('../controllers/recipes');
const authenticateJWT = require('../middleware/authenticateJWT');
const authenticateOptionalJWT = require('../middleware/authenticateOptionalJWT');
const router = express.Router();


router.get('/all', getAllRecipes);
router.post('/add', authenticateOptionalJWT, addRecipe);
router.post('/new', authenticateJWT, createNewRecipe, handleCreateNewRecipe);

router.get('/:id', getRecipeById);


router.post('/user/add', authenticateJWT, addUserRecipe);

router.get('/user/:id', authenticateJWT, getUserRecipeById);
router.put('/user/:id', authenticateJWT, updateUserRecipeById);
router.delete('/user/:id', authenticateJWT, deleteUserRecipeById);

router.post('/user/:id/images', authenticateJWT, uploadAdditionalImage, handleUploadAdditionalImage);
router.post('/:id/uploadMainImage', authenticateJWT, uploadMainImage, handleUploadMainImage);

router.post('/scan-recipe', authenticateJWT, uploadScanRecipeImage, handleScanRecipe);

module.exports = router;
