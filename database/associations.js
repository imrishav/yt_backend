const { sequelize } = require('./sequelize');
const { DataTypes } = require('sequelize');

const UserModel = require('../models/User');
const SubscriptionModel = require('../models/Subscription');

// (async () => await sequelize.sync({ alter: true }))();

const User = UserModel(sequelize, DataTypes);
const Subscription = SubscriptionModel(sequelize, DataTypes);

//Users
// Subscription.belongsTo(User, {
//   foreignKey: 'subscribeTo',
// });

//SUbscription for users.

User.hasMany(Subscription, {
  foreignKey: 'subscribeTo',
});

module.exports = {
  User,
  Subscription,
};
