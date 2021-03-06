const sequelize = require('./sequelize');
const { DataTypes } = require('sequelize');

const UserModel = require('../models/User');
const SubscriptionModel = require('../models/Subscription');
const VideoModel = require('../models/Video');
const CommentModel = require('../models/Comment');
const VideoLikeModel = require('../models/LikeVideo');
const ViewsModel = require('../models/Views');

// (async () => await sequelize.sync({ alter: true }))();

const User = UserModel(sequelize, DataTypes);
const Subscription = SubscriptionModel(sequelize, DataTypes);
const Video = VideoModel(sequelize, DataTypes);
const Comment = CommentModel(sequelize, DataTypes);
const LikeVideo = VideoLikeModel(sequelize, DataTypes);
const Views = ViewsModel(sequelize, DataTypes);
//Users
// Subscription.belongsTo(User, {
//   foreignKey: 'subscribeTo',
// });

//Video Association
Video.belongsTo(User, { foreignKey: 'userId' });

//Likes Association;
User.belongsToMany(Video, { through: LikeVideo, foreignKey: 'userId' });
Video.belongsToMany(User, { through: LikeVideo, foreignKey: 'videoId' });

//SUbscription for users.
User.hasMany(Subscription, {
  foreignKey: 'subscribeTo',
});

//Comments Association
User.hasMany(Comment, {
  foreignKey: 'userId',
});
Comment.belongsTo(User, { foreignKey: 'userId' });

Video.hasMany(Comment, { foreignKey: 'videoId' });

//Views Association..
User.belongsToMany(Video, { through: Views, foreignKey: 'userId' });
Video.belongsToMany(User, { through: Views, foreignKey: 'videoId' });

module.exports = {
  User,
  Subscription,
  Video,
  Comment,
  LikeVideo,
  Views,
};
