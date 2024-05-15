const express = require('express');
const router = express.Router();
const { createCategory, getCategories, addRecipeToCategory } = require('../controllers/categories');

router.post('/', createCategory);
router.get('/', getCategories);
router.post('/:categoryId/recipes/', addRecipeToCategory);

module.exports = router;
