const express = require('express');
const router = express.Router();
const {
  createCategoryHandler,
  getCategoriesHandler,
  addRecipeToCategoryHandler,
  getCategoryRecipesHandler,
  reorderCategoriesHandler,
  reorderRecipesInCategoryHandler,
  moveRecipeToCategoryHandler,
  deleteCategoryHandler
} = require('../controllers/categories');

router.post('/', createCategoryHandler);
router.get('/', getCategoriesHandler);
router.post('/:categoryId/recipes', addRecipeToCategoryHandler);
router.get('/recipes', getCategoryRecipesHandler);
router.post('/reorder', reorderCategoriesHandler);
router.post('/reorder-recipes', reorderRecipesInCategoryHandler);
router.post('/move-recipe', moveRecipeToCategoryHandler);
router.delete('/:categoryId', deleteCategoryHandler);

module.exports = router;
