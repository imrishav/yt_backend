const { Op } = require('sequelize');

const {
  User,
  Subscription,
  Video,
  LikeVideo,
  Views,
} = require('../database/associations');
const asyncCatch = require('../handlers/asyncCatch');

const ATTRIBUTES = [
  'id',
  'firstname',
  'lastname',
  'username',
  'channelDesc',
  'avatar',
  'cover',
];

exports.subscriptionToggler = asyncCatch(async (req, res, next) => {
  console.log(req.params.id);

  //the user.id of current user will be passed from authorization router, which has to be implemented next.
  //Until then lets use current route only...

  let userid = '1a89a421-2285-434d-b667-962a072bad4d'; //temp value otherwise req.user.id CURRENT USER

  if (userid === req.params.id) {
    return next({
      message: 'You cannot subsribe to your own channel',
      statusCode: 400,
    });
  }

  const user = await User.findByPk(req.params.id);

  if (!user) {
    return next({
      message: 'You need to be logged in...',
      statusCode: 400,
    });
  }

  const isSubs = await Subscription.findOne({
    where: {
      subscriber: userid,
      subscribeTo: req.params.id,
    },
  });

  if (isSubs) {
    await Subscription.destroy({
      where: {
        subscriber: userid,
        subscribeTo: req.params.id,
      },
    });
  } else {
    await Subscription.create({
      subscriber: userid,
      subscribeTo: req.params.id,
    });
  }

  res.status(200).json({
    success: true,
  });
});

exports.updateUser = asyncCatch(async (req, res, next) => {
  await User.update(req.body, {
    where: { id: req.user.id }, //AUthorization Route here also..
  });

  const user = await User.findByPk(id, {
    attributes: ATTRIBUTES, //returns updated values..
  });

  console.log(user);

  res.status(201).json({
    success: true,
    data: user,
  });
});

exports.recommended = asyncCatch(async (req, res, next) => {
  console.log(req.user);

  const channels = await User.findAll({
    attributes: ['id', 'username', 'avatar', 'channelDesc'],
    where: {
      id: {
        [Op.not]: req.user.id,
      },
    },
  });

  if (!channels.length)
    return res.status(200).json({ success: true, data: channels });

  channels.forEach(async (channel, index) => {
    const subsCount = await Subscription.count({
      where: { subscribeTo: channel.id },
    });
    channel.setDataValue('subscribersCount', subsCount);

    const isSubscribed = await Subscription.findOne({
      where: {
        subscriber: req.user.id,
        subscribeTo: channel.id,
      },
    });

    channel.setDataValue('isSubscribed', !!isSubscribed);

    const videossCount = await Video.count({ where: { userId: channel.id } });
    channel.setDataValue('videosCount', videossCount);

    if (index === channels.length - 1) {
      return res.status(200).json({ success: true, data: channels });
    }
  });
});

exports.recommendedVideos = asyncCatch(async (req, res, next) => {
  const videos = await Video.findAll({
    attributes: [
      'id',
      'title',
      'description',
      'thumbnail',
      'userId',
      'createdAt',
    ],
    include: [
      {
        model: User,
        attributes: ['id', 'username', 'avatar'],
        order: [['createdAt', 'DESC']],
      },
    ],
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

exports.getLikedVideos = asyncCatch(async (req, res, next) => {
  return getVidoes(LikeVideo, req, res, next);
});

exports.getHistory = asyncCatch(async (req, res, next) => {
  return getVideos(View, req, res, next);
});

const getVidoes = async (Model, req, res, next) => {
  const vidRels = await Model.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'ASC']],
  });

  const videoIds = vidRels.map((vidRel) => vidRel.videoId);

  const videos = await Video.findAll({
    attributes: ['id', 'title', 'description', 'createdAt', 'thumbnail', 'url'],
    include: {
      model: User,
      attributes: ['id', 'username', 'avatar'],
    },
    where: {
      id: {
        [Op.in]: videoIds,
      },
    },
  });

  if (!videos.length) {
    return res.status(200).json({ success: true, data: videos });
  }

  videos.forEach(async (video, index) => {
    const views = await Views.count({ where: { videoId: video.id } });
    video.setDataValue('views', views);

    if (index === videos.length - 1) {
      return res.status(200).json({ success: true, data: videos });
    }
  });
};

exports.getFeed = asyncCatch(async (req, res, next) => {
  const subsTo = await Subscription.findAll({
    where: {
      subscriber: req.user.id,
    },
  });

  const subscriptions = subsTo.map((sub) => sub.subscribeTo);

  const feeds = await Video.findAll({
    include: {
      model: User,
      attributes: ['id', 'avatar', 'username'],
    },
    where: {
      userId: {
        [Op.in]: subscriptions,
      },
    },
    order: [['createdAt', 'DESC']],
  });

  if (!feeds.length) {
    return res.status(200).json({ success: true, data: feeds });
  }

  feed.forEach(async (video, index) => {
    const views = await Views.count({ where: { videoId: video.id } });
    video.setDataValue('views', views);

    if (index === feed.length - 1) {
      return res.status(200).json({ success: true, data: feeds });
    }
  });
});

exports.getUserProfile = asyncCatch(async (req, res, next) => {
  const userId = req.params.id;

  if (!userId) {
    return next({
      message: 'Please Pass a used Id.',
      statusCode: 400,
    });
  }

  const user = await User.findByPk(userId, {
    attributes: [
      'id',
      'firstname',
      'lastname',
      'username',
      'cover',
      'avatar',
      'email',
      'channelDesc',
    ],
  });

  if (!user) {
    return next({
      message: `No user found for ID - ${req.params.id}`,
      statusCode: 404,
    });
  }

  const subscribersCount = await Subscription.count({
    where: { subscribeTo: req.params.id },
  });
  user.setDataValue('subscribersCount', subscribersCount);

  const isMe = req.user.id === req.params.id;
  user.setDataValue('isMe', isMe);

  const isSubscribed = await Subscription.findOne({
    where: {
      [Op.and]: [{ subscriber: req.user.id }, { subscribeTo: req.params.id }],
    },
  });

  user.setDataValue('isSubscribed', !!isSubscribed);

  const subscriptions = await Subscription.findAll({
    where: { subscriber: req.params.id },
  });
  const channelIds = subscriptions.map((sub) => sub.subscribeTo);

  const channels = await User.findAll({
    attributes: ['id', 'avatar', 'username'],
    where: {
      id: { [Op.in]: channelIds },
    },
  });

  channels.forEach(async (channel) => {
    const subscribersCount = await Subscription.count({
      where: { subscribeTo: channel.id },
    });
    channel.setDataValue('subscribersCount', subscribersCount);
  });

  user.setDataValue('channels', channels);

  const videos = await Video.findAll({
    where: { userId: req.params.id },
    attributes: ['id', 'thumbnail', 'title', 'createdAt'],
  });

  if (!videos.length)
    return res.status(200).json({ success: true, data: user });

  videos.forEach(async (video, index) => {
    const views = await Views.count({ where: { videoId: video.id } });
    video.setDataValue('views', views);

    if (index === videos.length - 1) {
      user.setDataValue('videos', videos);
      return res.status(200).json({ success: true, data: user });
    }
  });
});

exports.searchUser = asyncCatch(async (req, res, next) => {
  if (!req.query.searchterm) {
    return next({ message: 'Please enter your search term', statusCode: 400 });
  }

  const users = await User.findAll({
    attributes: ['id', 'username', 'avatar', 'channelDesc'],
    where: {
      username: {
        [Op.substring]: req.query.searchterm,
      },
    },
  });

  if (!users.length)
    return res.status(200).json({ success: true, data: users });

  users.forEach(async (user, index) => {
    const subscribersCount = await Subscription.count({
      where: { subscribeTo: user.id },
    });

    const videosCount = await Video.count({
      where: { userId: user.id },
    });

    const isSubscribed = await Subscription.findOne({
      where: {
        [Op.and]: [{ subscriber: req.user.id }, { subscribeTo: user.id }],
      },
    });

    const isMe = req.user.id === user.id;

    user.setDataValue('subscribersCount', subscribersCount);
    user.setDataValue('videosCount', videosCount);
    user.setDataValue('isSubscribed', !!isSubscribed);
    user.setDataValue('isMe', isMe);

    if (index === users.length - 1) {
      return res.status(200).json({ success: true, data: users });
    }
  });
});
