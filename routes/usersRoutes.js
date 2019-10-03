//Importation
const express = require('express');
const userscontroller = require('../controllers/usersController');
const multer = require('multer');
const upload = multer({dest: '../uploads/'})


const router = express.Router();

//Routes utilisateurs
//Routes get
router.get('/users/', userscontroller.getUser);//Afficher tout les users
router.get('/user/profile/:id/', userscontroller.getUserProfile);//Afficher son profil
router.get('/users/logout/', userscontroller.logout);//Se deconnecter
router.get('/users/photo/:id', userscontroller.userPhoto)//On récupe la photo du profil

//Routes post
router.post('/users/register/', userscontroller.register)
;//S'inscrire
router.post('/users/login/', userscontroller.login);//Se connecter

//Routes put
router.put('/user/profile/:id/', upload.single('photo'), userscontroller.updateUserProfile);//Modifier son profil

//Routes delete
router.delete('/user/delete/:id', userscontroller.deleteUser);

module.exports = router;