const express = require('express');
const router = express.Router();
const {
  createCategoryHandler,
  getCategoriesHandler,
  addRecipeToCategoryHandler,
  getCategoryRecipesHandler,
} = require('../controllers/categories');

router.post('/', createCategoryHandler);
router.get('/', getCategoriesHandler);
router.post('/:categoryId/recipes/', addRecipeToCategoryHandler);
router.get('/recipes', getCategoryRecipesHandler);

module.exports = router;
