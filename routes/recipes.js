const express = require('express');
const { addRecipe, getRecipeById, updateRecipeById } = require('../controllers/recipes');
const authenticateJWT = require('../middleware/authenticateJWT');
const router = express.Router();

router.get('/:id', authenticateJWT, getRecipeById);
router.put('/:id', authenticateJWT, updateRecipeById);

router.post('/add', authenticateJWT, addRecipe);


module.exports = router;
