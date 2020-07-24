const { Sequelize, DataTypes } = require('sequelize');

const LikeVideoModel = (sequelize, DataTypes) => {
  return sequelize.define('LikeVideo', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    likes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
};

module.exports = LikeVideoModel;
