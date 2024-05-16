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
  deleteCategoryHandler,
  removeRecipeFromCategoryHandler
} = require('../controllers/categories');

router.post('/', createCategoryHandler);
router.get('/', getCategoriesHandler);

router.delete('/:categoryId', deleteCategoryHandler);

router.post('/:categoryId/recipes', addRecipeToCategoryHandler);
router.delete('/:categoryId/recipes', removeRecipeFromCategoryHandler);

router.get('/recipes', getCategoryRecipesHandler);

router.post('/reorder', reorderCategoriesHandler);

router.post('/reorder-recipes', reorderRecipesInCategoryHandler);

router.post('/move-recipe', moveRecipeToCategoryHandler);


module.exports = router;
