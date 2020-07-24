const express = require('express');
const router = express.Router();
const {
  newVideo,
  getVideo,
  addComment,
  likeVideo,
  dislikeVideo,
  likeDislike,
  newWatch,
  searchVideo,
} = require('../controllers/videoController');

const { protectTo } = require('../controllers/authController');
const { recommendedVideos } = require('../controllers/userController');

router.route('/').post(protectTo, newVideo);
router.route('/').get(recommendedVideos);
router.route('/search').get(protectTo, searchVideo);
router.route('/:id').get(protectTo, getVideo);
router.route('/:id/addcomment').post(protectTo, addComment);
router.route('/:id/view').get(protectTo, newWatch);
router.route('/:id/:choice').get(protectTo, likeDislike);
// router.route('/:id/like').get(protectTo, likeVideo);
// router.route('/:id/dislike').get(protectTo, dislikeVideo);

module.exports = router;
