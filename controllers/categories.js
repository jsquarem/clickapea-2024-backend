const {
  createCategory,
  getCategories,
  addRecipeToCategory,
  getCategoryRecipes,
  reorderCategories,
  reorderRecipesInCategory,
  moveRecipeToCategory,
  deleteCategory,
  removeRecipeFromCategory
} = require('../services/categoryService');

const createCategoryHandler = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;

  try {
    const newCategory = await createCategory(name, userId);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCategoriesHandler = async (req, res) => {
  const userId = req.user.userId;
  console.log(`Fetching categories for user: ${userId}`);

  try {
    const categories = await getCategories(userId);
    console.log(`Categories fetched: ${JSON.stringify(categories)}`);
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const addRecipeToCategoryHandler = async (req, res) => {
  const { categoryId } = req.params;
  const { recipeId } = req.body;
  const userId = req.user.userId;

  try {
    const { category, userRecipeId } = await addRecipeToCategory(categoryId, recipeId, userId);
    res.status(200).json({ category, userRecipeId });
  } catch (error) {
    console.error('Error adding recipe to category:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCategoryRecipesHandler = async (req, res) => {
  const userId = req.user.userId;

  try {
    const categories = await getCategoryRecipes(userId);
    res.status(200).json({ categories });
  } catch (error) {
    console.error('Error fetching category recipes:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const reorderCategoriesHandler = async (req, res) => {
  const { newOrder } = req.body;
  const userId = req.user.userId;

  try {
    console.log('Reorder categories request received:', userId, newOrder);
    await reorderCategories(userId, newOrder);
    res.status(200).json({ message: 'Categories reordered successfully' });
  } catch (error) {
    console.error('Error reordering categories:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const reorderRecipesInCategoryHandler = async (req, res) => {
  const { categoryId, newOrder } = req.body;

  try {
    console.log('Reorder recipes in category request received:', categoryId, newOrder);
    await reorderRecipesInCategory(categoryId, newOrder);
    res.status(200).json({ message: 'Recipes reordered successfully' });
  } catch (error) {
    console.error('Error reordering recipes:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const moveRecipeToCategoryHandler = async (req, res) => {
  const { sourceCategoryId, destCategoryId, recipeId } = req.body;

  try {
    console.log('Move recipe request received:', sourceCategoryId, destCategoryId, recipeId);
    await moveRecipeToCategory(sourceCategoryId, destCategoryId, recipeId);
    res.status(200).json({ message: 'Recipe moved successfully' });
  } catch (error) {
    console.error('Error moving recipe:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCategoryHandler = async (req, res) => {
  const { categoryId } = req.params;
  const userId = req.user.userId;

  try {
    await deleteCategory(categoryId, userId);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeRecipeFromCategoryHandler = async (req, res) => {
  const { categoryId } = req.params;
  const { recipeId } = req.body;

  try {
    const category = await removeRecipeFromCategory(categoryId, recipeId);
    res.status(200).json(category);
  } catch (error) {
    console.error('Error removing recipe from category:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCategoryHandler,
  getCategoriesHandler,
  addRecipeToCategoryHandler,
  getCategoryRecipesHandler,
  reorderCategoriesHandler,
  reorderRecipesInCategoryHandler,
  moveRecipeToCategoryHandler,
  deleteCategoryHandler,
  removeRecipeFromCategoryHandler
};
