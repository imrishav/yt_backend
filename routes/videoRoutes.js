const express = require('express');
const router = express.Router();
const {
  newVideo,
  getVideo,
  addComment,
} = require('../controllers/videoController');

router.route('/').post(newVideo);
router.route('/:id').get(getVideo);
router.route('/:id/addcomment').post(addComment);

module.exports = router;
