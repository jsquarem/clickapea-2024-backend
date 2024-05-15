const express = require('express');
const { addUser } = require('../controllers/users');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('List of users');
});
router.post('/add', addUser);

module.exports = router;
