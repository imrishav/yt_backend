const { User, Subscription } = require('../database/associations');
const asyncCatch = require('../handlers/asyncCatch');

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
  const id = 'd23d274c-9030-43c4-b5c0-8c1587bb8ea0';

  await User.update(req.body, {
    where: { id }, //AUthorization Route here also..
  });

  const ATTRIBUTES = [
    'id',
    'firstname',
    'lastname',
    'username',
    'channelDesc',
    'avatar',
    'cover',
  ];

  const user = await User.findByPk(id, {
    attributes: ATTRIBUTES, //returns updated values..
  });

  console.log(user);

  res.status(201).json({
    success: true,
    data: user,
  });
});
