const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authenticateJWT');
const {
  createCategoryHandler,
  getCategoriesHandler,
  addRecipeToCategoryHandler,
  getCategoryRecipesHandler,
  reorderCategoriesHandler,
  reorderRecipesInCategoryHandler,
  moveRecipeToCategoryHandler,
  deleteCategoryHandler,
  removeRecipeFromCategoryHandler
} = require('../controllers/categories');

router.post('/', authenticateJWT, createCategoryHandler);
router.get('/', authenticateJWT, getCategoriesHandler);

router.delete('/:categoryId', authenticateJWT, deleteCategoryHandler);

router.post('/:categoryId/recipes', authenticateJWT, addRecipeToCategoryHandler);
router.delete('/:categoryId/recipes', authenticateJWT, removeRecipeFromCategoryHandler);

router.get('/recipes', authenticateJWT, getCategoryRecipesHandler);

router.post('/reorder', authenticateJWT, reorderCategoriesHandler);

router.post('/reorder-recipes', authenticateJWT, reorderRecipesInCategoryHandler);

router.post('/move-recipe', authenticateJWT, moveRecipeToCategoryHandler);

module.exports = router;
