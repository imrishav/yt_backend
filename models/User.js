const { Sequelize, ValidationError } = require('sequelize');

const UserModel = (sequelize, DataTypes) => {
  return sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true, // checks for email format (foo@bar.com)
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          min: 6,
        },
      },
      confirmPassword: {
        //TODO - remove this.
        type: DataTypes.STRING,
        // allowNull: true,
        validate: {
          min: 6,
          check(val) {
            if (!(val === this.password)) {
              throw new ValidationError('CNF is wrong');
            }
          },
        },
      },
      avatar: {
        type: DataTypes.STRING,
        defaultValue: 'https://i.dlpng.com/static/png/7058101_preview.png',
      },
      cover: {
        type: DataTypes.STRING,
        defaultValue: 'https://i.dlpng.com/static/png/7058101_preview.png',
      },
      channelDesc: {
        type: DataTypes.STRING,
      },
      isAdmin: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      hooks: {
        afterValidate: (user, options) => {
          // console.log('Hitttttt...', options);
          // let x = ['id', 'firstname', 'lastname'];
          // options.defaultValue = x;
          // return options;
          // console.log('HitttttUser..t...', (user.confirmPassword = null));
          // user.removeAttribute('conifrmPassword');
        },
      },
    }
  );
};

module.exports = UserModel;

// avatar: {
//   type: DataTypes.STRING,
//   defaultValue: 'https://i.dlpng.com/static/png/7058101_preview.png',
// },
// cover: {
//   type: DataTypes.STRING,
//   defaultValue: 'https://i.dlpng.com/static/png/7058101_preview.png',
// },
// channelDesc: {
//   type: DataTypes,
// },
// isAdmin: {
//   type: DataTypes.STRING,
//   allowNull: false,
//   defaultValue: false,
// },
