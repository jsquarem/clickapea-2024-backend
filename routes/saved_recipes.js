const express = require('express');
const router = express.Router();

// Example route for fetching saved recipes
router.get('/', (req, res) => {
  res.send('List of saved recipes');
});

module.exports = router;
