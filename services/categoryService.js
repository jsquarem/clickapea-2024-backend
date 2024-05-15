const Category = require('../models/Category');
const Recipe = require('../models/Recipe');

const createCategory = async (name, userId) => {
  const newCategory = new Category({ name, user: userId });
  await newCategory.save();
  return newCategory;
};

const getCategories = async (userId) => {
  return await Category.find({ user: userId });
};

const addRecipeToCategory = async (categoryId, recipeId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }
  category.recipes.push(recipeId);
  await category.save();
  return category;
};

const getCategoryRecipes = async (userId) => {
  const categories = await Category.find({ user: userId }).populate('recipes');

  const recipes = {};
  const categoriesMap = {};
  const categoryOrder = [];

  categories.forEach(category => {
    categoriesMap[category._id] = {
      id: category._id.toString(),
      title: category.name,
      recipeIds: category.recipes.map(recipe => recipe._id.toString())
    };
    categoryOrder.push(category._id.toString());

    category.recipes.forEach(recipe => {
      recipes[recipe._id] = {
        id: recipe._id.toString(),
        content: recipe.title,
        image: recipe.image
      };
    });
  });

  return { recipes, categories: categoriesMap, categoryOrder };
};

module.exports = {
  createCategory,
  getCategories,
  addRecipeToCategory,
  getCategoryRecipes,
};
