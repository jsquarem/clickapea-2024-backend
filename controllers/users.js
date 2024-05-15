const User = require('../models/User');
const Category = require('../models/category');

const addUser = async (req, res) => {
  const { googleId, email, name, picture } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ googleId });

    if (user) {
      // If user exists, return user data
      return res.status(200).json(user);
    }

    // If user does not exist, create a new user
    user = new User({
      googleId,
      email,
      name,
      picture,
    });

    await user.save();

    const allRecipesCategory = new Category({ name: 'All Recipes', user: user._id });
    await allRecipesCategory.save();

    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addUser,
};
