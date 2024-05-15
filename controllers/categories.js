const {
  createCategory,
  getCategories,
  addRecipeToCategory,
  getCategoryRecipes,
} = require('../services/categoryService');

const createCategoryHandler = async (req, res) => {
  const { name, user } = req.body;

  try {
    const newCategory = await createCategory(name, user);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCategoriesHandler = async (req, res) => {
  const { userId } = req.query;

  try {
    const categories = await getCategories(userId);
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const addRecipeToCategoryHandler = async (req, res) => {
  const { categoryId } = req.params;
  const { recipeId } = req.body;

  try {
    const category = await addRecipeToCategory(categoryId, recipeId);
    res.status(200).json(category);
  } catch (error) {
    console.error('Error adding recipe to category:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCategoryRecipesHandler = async (req, res) => {
  const { userId } = req.query;

  try {
    const categories = await getCategoryRecipes(userId);
    res.status(200).json({ categories });
  } catch (error) {
    console.error('Error fetching category recipes:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCategoryHandler,
  getCategoriesHandler,
  addRecipeToCategoryHandler,
  getCategoryRecipesHandler,
};
