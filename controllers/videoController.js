const {
  Video,
  User,
  Comment,
  Subscription,
} = require('../database/associations');
const asyncCatch = require('../handlers/asyncCatch');

exports.newVideo = asyncCatch(async (req, res, next) => {
  const userId = '1a89a421-2285-434d-b667-962a072bad4d';
  const video = await Video.create({
    ...req.body,
    userId,
  }); //need to pass userid from authorization

  res.status(201).json({ success: true, data: video });
});

exports.getVideo = asyncCatch(async (req, res, next) => {
  const ATTRIBUTES = ['id', 'title'];
  const video = await Video.findByPk(req.params.id, {
    // attributes: ATTRIBUTES,
    include: [
      {
        model: User,
        attributes: ['id', 'username', 'avatar', 'firstname'],
      },
    ],
  });

  if (!video) {
    return next({
      message: `No video found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }

  const comments = await video.getComments({
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'text', 'videoId', 'createdAt'],
    include: [
      {
        model: User,
        attributes: ['id', 'username', 'avatar'],
      },
    ],
  });

  const commentsCount = await Comment.count({
    where: {
      videoId: req.params.id,
    },
  });

  //TODO liked..Disliked,likescount,dislikecount
  const userId = '1a89a421-2285-434d-b667-962a072bad4d';

  const isSubscribed = await Subscription.findOne({
    where: {
      subscriber: userId,
      subscribeTo: video.userId,
    },
  });

  const subscribersCount = await Subscription.count({
    where: { subscribeTo: video.userId },
  });

  video.setDataValue('subscribersCount', subscribersCount);
  video.setDataValue('isSubscribed', !!isSubscribed);

  video.setDataValue('comments', comments);
  video.setDataValue('commentCount', commentsCount);

  res.status(201).json({ success: true, data: video });
});

exports.addComment = asyncCatch(async (req, res, next) => {
  const video = await Video.findByPk(req.params.id);

  const userId = '1a89a421-2285-434d-b667-962a072bad4d';

  if (!video) {
    return next({
      message: `No video found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }

  const comment = await Comment.create({
    text: req.body.text,
    userId: userId,
    videoId: req.params.id,
  });

  const User = {
    id: userId,
    avatar: 'userAvatar',
    username: 'imrishav',
  };

  comment.setDataValue('User', User);

  res.status(200).json({ success: true, data: comment });
});
