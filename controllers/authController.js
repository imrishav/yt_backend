const { User, Subscription } = require('../database/associations');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncCatch = require('../handlers/asyncCatch');
const { Op } = require('sequelize');

const ATTRIBUTES = [
  'id',
  'firstname',
  'lastname',
  'username',
  'email',
  'avatar',
  'cover',
  'channelDesc',
];

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = asyncCatch(async (req, res, next) => {
  const user = await User.create(req.body);

  const salt = await bcyptjs.genSalt(10);
  user.password = await bcyptjs.hash(user.password, salt);
  await user.save();

  const payload = { id: user.id };

  const token = signToken(payload);

  res.status(201).json({
    sucess: true,
    user,
    token,
  });
});

exports.login = asyncCatch(async (req, res, next) => {
  const { email, password } = req.body;

  console.log({ email, password });

  const user = await User.findOne({ where: { email } });

  const passwordMatch = await bcryptjs.compare(password, user.password);

  if (!user || !passwordMatch) {
    return next({
      message: 'Username not found.',
      statusCode: 400,
    });
  }

  const payload = { id: user.id };

  const token = signToken(payload);

  res.status(200).json({
    sucess: true,
    token,
    data: {
      user,
    },
  });
});

exports.protectTo = async (req, res, next) => {
  if (!req.headers.authorization) {
    return next({
      message: 'You need to be logged in to visit this route',
      statusCode: 401,
    });
  }

  const token = req.headers.authorization.replace('Bearer', '').trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      attributes: ATTRIBUTES,
      where: {
        id: decoded.id,
      },
    });

    req.user = user;
    next();
  } catch (err) {
    next({
      message: 'You need to be logged in to visit this route',
      statusCode: 401,
    });
  }
};

exports.me = asyncCatch(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId, {
    attributes: ATTRIBUTES,
  });

  const subs = await Subscription.findAll({
    where: { subscriber: userId },
  });

  const userIds = subs.map((sub) => sub.subscribeTo);

  const channels = await User.findAll({
    attributes: ['id', 'avatar', 'username'],
    where: {
      id: {
        [Op.in]: userIds,
      },
    },
  });

  user.setDataValue('channels', channels);

  res.status(200).json({
    success: true,
    data: user,
  });
});
