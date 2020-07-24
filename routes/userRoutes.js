const express = require('express');
const router = express.Router();
const {
  subscriptionToggler,
  updateUser,
  recommended,
  getLikedVideos,
  getHistory,
  getFeed,
  searchUser,
  getUserProfile,
} = require('../controllers/userController');

const { protectTo } = require('../controllers/authController');

router.route('/').patch(protectTo, updateUser);
router.route('/').get(protectTo, recommended);
router.route('/feed').get(protectTo, getFeed);
router.route('/likevideos').get(protectTo, getLikedVideos);
router.route('/history').get(protectTo, getHistory);
router.route('/search').get(protectTo, searchUser);
router.route('/:id').get(protectTo, getUserProfile);
router.route('/:id/subscribe').get(subscriptionToggler);

module.exports = router;
