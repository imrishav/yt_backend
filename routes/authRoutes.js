const express = require('express');
const router = express.Router();
const {
  signUp,
  login,
  protectTo,
  me,
} = require('../controllers/authController');

router.route('/signup').post(signUp);
router.route('/login').post(login);
router.route('/me').get(protectTo, me);

module.exports = router;
