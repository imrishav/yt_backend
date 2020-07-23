const { Sequelize } = require('sequelize');

const SubscriptionModel = (sequelize, DataTypes) => {
  return sequelize.define('Subscription', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    subscriber: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });
};

module.exports = SubscriptionModel;
