const express = require('express');
const {
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
  deleteUserRecipeById,
} = require('../controllers/recipes');
const authenticateJWT = require('../middleware/authenticateJWT');
const authenticateOptionalJWT = require('../middleware/authenticateOptionalJWT');
const router = express.Router();


router.get('/all', getAllRecipes);
router.get('/:id', getRecipeById);



router.post('/add', authenticateOptionalJWT, addRecipe);
router.post('/new', authenticateJWT, createNewRecipe, handleCreateNewRecipe);

router.post('/user/add', authenticateJWT, addUserRecipe);

router.get('/user/:id', authenticateJWT, getUserRecipeById);
router.put('/user/:id', authenticateJWT, updateUserRecipeById);
router.delete('/user/:id', authenticateJWT, deleteUserRecipeById);

router.post('/user/:id/images', authenticateJWT, uploadRecipeImages, handleUploadRecipeImages);
// router.post('/:id/uploadMainImage', authenticateJWT, uploadMainImage, handleUploadMainImage);

router.post('/scan-recipe', authenticateJWT, uploadScanRecipeImage, handleScanRecipe);

module.exports = router;
