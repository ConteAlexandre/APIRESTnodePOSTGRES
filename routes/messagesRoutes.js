//Importation
const express = require('express');
const messagecontroller = require('../controllers/messagesController');

const router = express.Router();

//Routes pour les messages
//Routes get
router.get('/messages/', messagecontroller.listMessage);//Afficher tout les messages en bdd
router.get('/messages/user', messagecontroller.listMessageByIdUser);//Afficher les messages de l'utilisateurs

//Routes post
router.post('/messages/new/', messagecontroller.createMessage);//Créer un nouveau message requis d'etre co

module.exports = router;