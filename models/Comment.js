const { Sequelize } = require('sequelize');
const sequelize = require('../database/sequelize');

const CommentModel = (sequelize, DataTypes) => {
  return sequelize.define('Comment', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};

module.exports = CommentModel;
