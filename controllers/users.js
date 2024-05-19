const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');

const loginUser = async (req, res) => {
  const { googleId, email, name, picture } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ googleId });

    if (!user) {
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
    } else {
      // Ensure "All Recipes" category exists for existing users
      const allRecipesCategory = await Category.findOne({ user: user._id, name: 'All Recipes' });
      if (!allRecipesCategory) {
        const newAllRecipesCategory = new Category({ name: 'All Recipes', user: user._id });
        await newAllRecipesCategory.save();
      }
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ token, user });
  } catch (error) {
    console.error('Error during login:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  loginUser,
};
