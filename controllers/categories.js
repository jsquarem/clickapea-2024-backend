const Category = require('../models/category');

const createCategory = async (req, res) => {
  const { name, user } = req.body;

  try {
    const newCategory = new Category({ name, user });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCategories = async (req, res) => {
  const { userId } = req.query;

  try {
    const categories = await Category.find({ user: userId });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const addRecipeToCategory = async (req, res) => {
    const { categoryId } = req.params;
    const { recipeId } = req.body;
    console.log(recipeId, '<-recipeId');
    console.log(categoryId, '<-categoryId');

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    category.recipes.push(recipeId);
    await category.save();
    res.status(200).json(category);
  } catch (error) {
    console.error('Error adding recipe to category:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCategory,
  getCategories,
  addRecipeToCategory,
};
