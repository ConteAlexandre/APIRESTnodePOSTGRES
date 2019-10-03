const crypto = require('crypto');

'use strict';
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    username: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { args: true, msg: 'Veuillez mettre un username' },
        len: { args: [4, 50], msg: 'Username doit être compris entre 4 et 50 caractères'},
      },
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { msg: 'Veuillez mettre un email' },
        isEmail: { msg: 'Veuillez renseigner un email valide' },
      },
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { args: true, msg: 'Veuillez mettre un mot de passe' },
        len: { args: [4, 64], msg: 'Le mot de passe doit être compris entre 4 et 64 caractères'},
        is: { args: [ /\d/], msg: 'Le mot de passe doit contenir au moins 1 chiffre' }
      },
    },
    photo: {
      type: DataTypes.BLOB,
      validate:{
        notEmpty: false
      }
    },
    salt: DataTypes.STRING,
    bio: {
      type: DataTypes.STRING,
      validate: {
        len: { args: [4, 500], msg: 'Votre bio doit être comprise entre 4 et 500 caractères' }
      }
    },
    isAdmin: DataTypes.BOOLEAN,
  }, { sequelize });

//Cette méthode nous permet de générer un salt random et pour cela on utilise crypto
  Users.generateSalt = function() {
    return crypto.randomBytes(16).toString('base64')
  }

//Ici on encode notre mot de passe
  Users.encryptPassword = function(plainText, salt) {
    return crypto
        .createHash('RSA-SHA256')
        .update(plainText)
        .update(salt)
        .digest('hex')
  }

//Ceci nous permet d'envoyer en bdd l'encodage et la génération de salt directement en bdd
  const setSaltandPassword = users => {
    if (users.changed('password')) {
      users.salt = Users.generateSalt()
      users.password = Users.encryptPassword(users.password,
          users.salt)
    }
  }

  Users.beforeCreate(setSaltandPassword);
  Users.beforeUpdate(setSaltandPassword);

//Cette méthode la va nous permettre de comparer le hashage et le mot de passe lors de la connexion
  Users.prototype.correctPassword = function(enteredPassword) {
    return Users.encryptPassword(enteredPassword, this.salt) === this.password
  }

  Users.associate = function(models) {
    // associations can be defined here
    models.Users.hasMany(models.Message)
  };

  return Users;
};