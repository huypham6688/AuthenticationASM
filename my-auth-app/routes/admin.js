const express = require('express');
const router = express.Router();
const { authenticateToken, adminMiddleware } = require('../middleware/auth');


router.get('/', authenticateToken, adminMiddleware, (req, res) => {
  res.render('admin', { user: req.user }); 
});

module.exports = router;
