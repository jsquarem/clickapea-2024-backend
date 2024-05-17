const UserRecipe = require('../models/UserRecipe');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');

const createCategory = async (name, userId) => {
  const newCategory = new Category({ name, user: userId, order: 0 });
  await newCategory.save();
  return newCategory;
};

const getCategories = async (userId) => {
  const categories = await Category.find({ user: userId });
  categories.sort((a, b) => {
    if (a.order === 0 && b.order !== 0) return 1;
    if (b.order === 0 && a.order !== 0) return -1;
    return a.order - b.order;
  });
  return categories;
};

const addRecipeToCategory = async (categoryId, recipeId, userId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  let userRecipe = await UserRecipe.findOne({ user_id: userId, recipe_id: recipeId });

  if (!userRecipe) {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    userRecipe = new UserRecipe({
      user_id: userId,
      recipe_id: recipe._id,
      title: recipe.title,
      author: recipe.author,
      equipment: recipe.equipment,
      host: recipe.host,
      total_time: recipe.total_time,
      yields: recipe.yields,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      nutrients: recipe.nutrients,
      image: recipe.image,
      url: recipe.url,
      is_edited: false
    });

    await userRecipe.save();
  }

  category.recipes.push(userRecipe._id);
  await category.save();

  return { category, userRecipeId: userRecipe._id };
};

const getCategoryRecipes = async (userId) => {
  const categories = await Category.find({ user: userId }).populate('recipes').sort({ order: 1 });

  const recipes = {};
  const categoriesMap = {};
  const categoryOrder = [];

  categories.forEach(category => {
    categoriesMap[category._id] = {
      id: category._id.toString(),
      title: category.name,
      recipeIds: category.recipes.map(recipe => recipe._id.toString()),
      order: category.order
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

  const sortedCategoryOrder = [
    ...categoryOrder
      .filter(id => categoriesMap[id]?.order !== 0)
      .sort((a, b) => {
        const orderA = categoriesMap[a]?.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = categoriesMap[b]?.order ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      }),
    ...categoryOrder.filter(id => categoriesMap[id]?.order === 0),
  ];

  return { recipes, categories: categoriesMap, categoryOrder: sortedCategoryOrder };
};

const reorderCategories = async (userId, newOrder) => {
  console.log(`Reordering categories for user: ${userId}, newOrder: ${newOrder}`);
  const categories = await Category.find({ user: userId });

  for (let i = 0; i < newOrder.length; i++) {
    const category = categories.find(cat => cat._id.toString() === newOrder[i]);
    if (category) {
      console.log(`Setting order of category ${category._id} to ${i + 1}`);
      category.order = i + 1;
      await category.save();
    } else {
      console.log(`Category ${newOrder[i]} not found`);
    }
  }

  // Additional logging to verify that categories were saved correctly
  const updatedCategories = await Category.find({ user: userId }).sort({ order: 1 });
  updatedCategories.forEach(category => {
    console.log(`Category ${category._id} has order ${category.order}`);
  });
};

const reorderRecipesInCategory = async (categoryId, newOrder) => {
  console.log(`Reordering recipes in category: ${categoryId}, newOrder: ${newOrder}`);
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  category.recipes = newOrder;
  await category.save();
};

const moveRecipeToCategory = async (sourceCategoryId, destCategoryId, recipeId) => {
  console.log(`Moving recipe ${recipeId} from category ${sourceCategoryId} to ${destCategoryId}`);
  const sourceCategory = await Category.findById(sourceCategoryId);
  const destCategory = await Category.findById(destCategoryId);

  if (!sourceCategory) {
    console.log(`Source category ${sourceCategoryId} not found`);
    throw new Error('Source category not found');
  }
  if (!destCategory) {
    console.log(`Destination category ${destCategoryId} not found`);
    throw new Error('Destination category not found');
  }

  // Remove recipe from source category
  sourceCategory.recipes = sourceCategory.recipes.filter(id => id.toString() !== recipeId);
  await sourceCategory.save();

  // Add recipe to destination category
  destCategory.recipes.push(recipeId);
  await destCategory.save();

  // Reorder recipes in the destination category
  await reorderRecipesInCategory(destCategoryId, destCategory.recipes);
};

const deleteCategory = async (categoryId, userId) => {
  const allRecipesCategory = await Category.findOne({ user: userId, name: "All Recipes" });
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new Error('Category not found');
  }

  // Move recipes to "All Recipes" category
  if (category.recipes.length > 0) {
    allRecipesCategory.recipes.push(...category.recipes);
    await allRecipesCategory.save();
  }

  await category.remove();
};

const removeRecipeFromCategory = async (categoryId, recipeId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }
  category.recipes = category.recipes.filter(id => id.toString() !== recipeId);
  await category.save();
  return category;
};

module.exports = {
  createCategory,
  getCategories,
  addRecipeToCategory,
  getCategoryRecipes,
  reorderCategories,
  reorderRecipesInCategory,
  moveRecipeToCategory,
  deleteCategory,
  removeRecipeFromCategory
};
