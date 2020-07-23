const express = require('express');
const router = express.Router();
const {
  subscriptionToggler,
  updateUser,
} = require('../controllers/userController');

router.route('/').patch(updateUser);

router.route('/:id/subscribe').get(subscriptionToggler);

module.exports = router;
