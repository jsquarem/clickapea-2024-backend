const express = require('express');
const { addRecipe, getRecipeById } = require('../controllers/recipes');
const router = express.Router();

// Example route for fetching recipes
router.get('/', (req, res) => {
  res.send('List of recipes');
});

// Route for fetching a specific recipe by ID
router.get('/:id', getRecipeById);

// Route for adding a new recipe
router.post('/add', addRecipe);

module.exports = router;
