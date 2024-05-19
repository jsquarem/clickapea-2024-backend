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
} = require('../controllers/recipes');
const authenticateJWT = require('../middleware/authenticateJWT');
const router = express.Router();

router.get('/all', getAllRecipes);
router.post('/add', addRecipe);

router.get('/:id', getRecipeById);

router.post('/user/add', authenticateJWT, addUserRecipe);
router.get('/user/:id', authenticateJWT, getUserRecipeById);
router.put('/user/:id', authenticateJWT, updateUserRecipeById);

router.post('/user/:id/images', authenticateJWT, uploadAdditionalImage, handleUploadAdditionalImage);

module.exports = router;
