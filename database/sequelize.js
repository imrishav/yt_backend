const pg = require('pg');
const { Sequelize } = require('sequelize');

pg.defaults.ssl = true;

const sequelize = new Sequelize('youtube', 'postgres', 'admin', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

(async () => await sequelize.sync({ alter: true }))();

module.exports = sequelize;
