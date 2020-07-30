const { User, Subscription } = require('../database/associations');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncCatch = require('../handlers/asyncCatch');
const { Op } = require('sequelize');
const sequelize = require('../database/sequelize');
const { Sequelize } = require('../database/sequelize');

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

  const salt = await bcryptjs.genSalt(10);
  user.password = await bcryptjs.hash(user.password, salt);
  await user.save();

  const payload = { id: user.id };

  const token = signToken(payload);
  user.password = undefined;
  user.confirmPassword = undefined;

  user.setDataValue('token', token);

  res.status(201).json({
    sucess: true,
    user,
    // token,
  });
});

exports.login = asyncCatch(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user || !(await bcryptjs.compare(password, user.password))) {
    return next({
      message: 'Username or Password is incorrect.',
      statusCode: 401,
    });
  }

  user.password = undefined;
  user.confirmPassword = undefined;

  const payload = { id: user.id };

  const token = signToken(payload);
  user.setDataValue('token', token);

  res.status(200).json({
    success: true,
    user,
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
