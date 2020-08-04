const { Op } = require('sequelize');
const {
  Video,
  User,
  Comment,
  Subscription,
  LikeVideo,
  Views,
} = require('../database/associations');
const asyncCatch = require('../handlers/asyncCatch');

const checkLikes = async (Model, id, userId, like) => {
  return await Model.findOne({
    where: {
      [Op.and]: [{ videoId: id }, { userId }, { likes: like }],
    },
  });
};

const genericCountFunction = async (ModelName, Model, params, paramsValue) => {
  let value;

  if (ModelName === 'LikeVideo') {
    value = await Model.count({
      where: {
        [Op.and]: [{ videoId: params }, { likes: paramsValue }],
      },
    });
  }

  if (ModelName === 'Views' && paramsValue) {
    value = Model.findOne({
      where: {
        userId: params,
        videoId: paramsValue,
      },
    });
  }

  if (ModelName === 'Views') {
    value = await Model.count({
      where: {
        videoId: params,
      },
    });
  }

  if (ModelName === 'Subscription') {
    value = await Model.count({
      where: { subscribeTo: params },
    });
  }

  return value;
};

exports.newVideo = asyncCatch(async (req, res, next) => {
  const userId = req.user.id;
  const video = await Video.create({
    ...req.body,
    userId,
  }); //need to pass userid from authorization

  res.status(201).json({ success: true, data: video });
});

exports.getVideo = asyncCatch(async (req, res, next) => {
  console.log(req.user.id);
  const ATTRIBUTES = ['id', 'title'];
  const userId = req.user.id;

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

  const isLiked = checkLikes(LikeVideo, req.params.id, userId, 1);
  const isDisLiked = checkLikes(LikeVideo, req.params.id, userId, -1);

  const likesCount = await genericCountFunction(
    'LikeVideo',
    LikeVideo,
    req.params.id,
    1
  );
  const dislikesCount = await genericCountFunction(
    'LikeVideo',
    LikeVideo,
    req.params.id,
    -1
  );

  // ModelName, Model, params, paramsValue;

  const views = await genericCountFunction('Views', Views, req.params.id);

  const isSubscribed = await Subscription.findOne({
    where: {
      subscriber: userId,
      subscribeTo: video.userId,
    },
  });

  const isViewed = await genericCountFunction(
    'Views',
    Views,
    req.params.id,
    video.id
  );

  const subscribersCount = await genericCountFunction(
    'Subscription',
    Subscription,
    video.userId
  );

  const isVideoMine = req.user.id === video.userId;

  video.setDataValue('comments', comments);
  video.setDataValue('commentTotal', commentsCount);
  video.setDataValue('isLiked', !!isLiked);
  video.setDataValue('isDisLiked', !!isDisLiked);
  video.setDataValue('likesCount', likesCount);
  video.setDataValue('dislikesCount', dislikesCount);
  video.setDataValue('views', views);
  video.setDataValue('isVideoMine', isVideoMine);
  video.setDataValue('isVideoMine', isVideoMine);
  video.setDataValue('isViewed', !!isViewed);
  video.setDataValue('subscribersCount', subscribersCount);
  video.setDataValue('isSubscribed', !!isSubscribed);

  res.status(201).json({ success: true, data: video });
});

exports.likeDislike = asyncCatch(async (req, res, next) => {
  const choice = req.params.choice;
  const videoId = req.params.id;
  const userId = req.user.id;

  const video = await Video.findByPk(videoId);

  if (!video) {
    return next({
      message: `No video found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }

  const isLiked = await LikeVideo.findOne({
    where: {
      userId,
      videoId,
      likes: 1,
    },
  });

  const isDisLiked = await LikeVideo.findOne({
    where: {
      userId,
      videoId,
      likes: -1,
    },
  });

  if (choice === 'like') {
    if (isLiked) {
      await isLiked.destroy();
    } else if (isDisLiked) {
      isDisLiked.likes = 1;
    } else {
      await LikeVideo.create({
        userId,
        videoId,
        likes: 1,
      });
    }
  } else {
    if (isDisLiked) {
      await isDisLiked.destroy();
    } else if (isLiked) {
      isLiked.likes = -1;
      await isLiked.save();
    } else {
      await LikeVideo.create({
        userId,
        videoId,
        likes: -1,
      });
    }
  }

  res.json({
    success: true,
    data: {
      choice,
      videoId,
      userId,
    },
  });
});

exports.newWatch = asyncCatch(async (req, res, next) => {
  const video = await Video.findByPk(req.params.id);

  if (!video) {
    return next({
      message: `No video found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }

  const viewed = await Views.findOne({
    where: {
      userId: req.user.id,
      videoId: req.params.id,
    },
  });

  if (viewed) {
    return next({ message: 'You already viewed this video', statusCode: 400 });
  }

  await Views.create({
    userId: req.user.id,
    videoId: req.params.id,
  });

  res.status(200).json({ success: true, data: {} });
});

exports.searchVideo = asyncCatch(async (req, res, next) => {
  if (!req.query.searchterm) {
    return next({ message: 'Please enter the searchterm', statusCode: 400 });
  }

  const videos = await Video.findAll({
    include: { model: User, attributes: ['id', 'avatar', 'username'] },
    where: {
      [Op.or]: {
        title: {
          [Op.substring]: req.query.searchterm,
        },
        description: {
          [Op.substring]: req.query.searchterm,
        },
      },
    },
  });

  if (!videos.length)
    return res.status(200).json({ success: true, data: videos });

  videos.forEach(async (video, index) => {
    const views = await Views.count({ where: { videoId: video.id } });
    video.setDataValue('views', views);

    if (index === videos.length - 1) {
      return res.status(200).json({ success: true, data: videos });
    }
  });
});

exports.addComment = asyncCatch(async (req, res, next) => {
  const { id, avatar, username } = req.user;
  const video = await Video.findByPk(req.params.id);

  if (!video) {
    return next({
      message: `No video found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }

  const comment = await Comment.create({
    text: req.body.text,
    userId: id,
    videoId: req.params.id,
  });

  const User = {
    id,
    avatar,
    username,
  };

  comment.setDataValue('User', User);

  res.status(200).json({ success: true, data: comment });
});
