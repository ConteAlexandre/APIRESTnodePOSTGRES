'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    title: {
      type:  DataTypes.STRING,
      validate: {
        notEmpty: { args: true, msg: 'Veuillez mettre un titre' },
        min: { args: 4, msg: 'Le titre doit contenir au moins 4 caractères' },
        max: { args: 14, msg: 'Pas plus de 14 caractères' }
      }
    },
    content: {
      type:  DataTypes.STRING,
      validate: {
        notEmpty: { args: true, msg: 'Veuillez mettre un titre' },
        min: { args: 4, msg: 'Le contenu doit faire au moins 4 caratères' },
        max: { args: 2000, msg: 'Allez un effort tu dois pas dépasser les 2000' }
      }
    },
    photo: DataTypes.BLOB,

    attachement: DataTypes.STRING,
    likes: DataTypes.INTEGER
  }, {});
  Message.associate = function(models) {
    // associations can be defined here
    models.Message.belongsTo(models.Users, {
      foreignKey: {
        allowNull: false
      }
    })
  };
  return Message;
};