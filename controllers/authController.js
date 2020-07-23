const { User } = require('../database/associations');
const bcyptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncCatch = require('../handlers/asyncCatch');

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

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return next({
      message: 'Username not found.',
      statusCode: 400,
    });
  }

  const passwordMatch = await bcyptjs.compare(password, user.password);

  if (!passwordMatch) {
    return next({
      message: 'Username or Password is incorrect.',
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
      attributes: [
        'id',
        'firstname',
        'lastname',
        'username',
        'email',
        'avatar',
        'cover',
        'channelDescription',
      ],
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