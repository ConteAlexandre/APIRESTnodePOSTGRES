//Nous importons notre fichier qui génère le token
const jwtutils = require('../utils/jwt.utils');

//Nous importons ici nos modèles en général
const models = require('../models/');





//Routes
module.exports = {

    //Cette méthode va nous permettre de s'inscrire sur le site
    register:  (req, res) => {

        //Parametre qui serons à renseigner
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;


        //Nous importons notre model Users pour lui appiquer une requete SQL
        models.Users.findOne({
            attributes: ['email'],
            where: { email: email }
        })
        //On vérifie ici que tout les champs ont bien été enregistré
            .then(userFound =>{
                if (!userFound) {
                    //Une fois cela fait, on intègre les éléments en bdd tout en cryptant le password
                        models.Users.create({
                            username: username,
                            email: email,
                            password: password,
                            isAdmin: 0
                        })

                        //Une fois cela fais, on retourne l'utilisateurs avec les données
                            .then(() => {
                                return res.status(200).json({
                                    message: "Bravo, Vous êtes inscrit !"
                                })
                            })
                            .catch(err => {
                                res.status(422).json({error: err['errors'][0]['message']})
                            })

                    //Si plus haut lors de la recherche d'email on en trouve un existant alors on a ce message
                } else {
                    return res.status(409).json({ error: 'Utilisateurs déjà existant'})
                }

            })
            .catch(err => {
                return res.status(500).json({ error: err['errors'][0]['message'] })
            })



    },


    //Ici on récupère tout nos utilisateurs enregistrés en bdd
    getUser: (req, res) => {
        models.Users.findAll()
            .then(newUser => {
                res.status(200).json( newUser )
            })
            .catch(err => {
                res.status(404).json({ error: 'Utilisateurs non trouvé' })
            })
    },


    //Voici notre méthode permettant de se connecter
    login:  (req, res) => {

        //Parametre qui sont demandés
        const email = req.body.email;
        const password = req.body.password;

        //Vérification si les champs sont null ou pas
        if (email == null || password == null) {
            return res.status(400).json({ error: 'Il manque des paramètres'});
        }

        //Une fois cela fais on va consulter la bdd pour savoir si il existe
        models.Users.findOne({
            where: { email: email}
        })

        //Une fois trouvé
            .then( userFound => {
                if (userFound) {

                    //On compare le mot de passe avec celui que l'on a en bdd et on fait appel a bcrypt pour cela
                        if (userFound.correctPassword(password)) {

                            //Si cela est bon on donne l'user et on génère un token
                            return res.status(200).json({
                                'userId': userFound.id,
                                'username':  userFound.username,
                                'email':  userFound.email,
                                'token': jwtutils.generateTokenForUser(userFound),
                            })
                        } else {
                            return res.status(403).json({ error: 'Mot de passe incorrect'})
                        }
                }  else
                    return res.status(401).json({ error: 'Utilisateur non trouvé'})
            })
            .catch(err => {
                return res.status(500).json({ error: 'Aucune identification possible'})
            });
    },


    //Voici notre méthode de déconnexion
    logout: (req, res ) => {
        res.clearCookie("token")
        res.json({ message: 'Vous êtes déconnecté' })
    },


    //Ici on récupère les données du profil utilisateurs
    getUserProfile: (req, res) => {

        // //On récupère l'entếte d'authorization
        // const headerAuth = req.headers['authorization'];
        // const userId = jwtutils.getUserId(headerAuth);
        //
        // //Ici on regarde bien si il y a un token
        // if (userId < 0)
        //     return res.status(400).json({ error: 'Mauvais token' })

        const { id } = req.params

        //Si oui alors on lance la requete SQL
        models.Users.findOne({
            attributes: [ 'id', 'username', 'email', 'bio', 'photo' ],
            where: { id: id }
        })
            .then( user => {

                //Ensuite si notre user existe on lui retourne les données
                if (user) {
                    res.status(201).json(user)
                } else {
                    res.status(404).json({ error: "Utilisateurs non trouvé" })
                }
            })
            .catch(err => {
                res.status(500).json({ error: 'Utilisateurs non trouvé' })
            })
    },


    //Voici notre méthode pour modif son profil
    updateUserProfile: (req, res ) => {

        const { id } = req.params

        //Paramètres que l'on souhaite modifier dans son profil
        const bio = req.body.bio

        models.Users.findOne({
            // attributes: ['id', 'bio', 'username', 'email', 'password'],
            where: { id: id }
        })
            .then( userFound => {
                if (userFound) {
                    userFound.update({
                        bio: ( bio ? bio : userFound.bio ),
                        username: req.body.username,
                        email: req.body.email,
                        password: req.body.password,
                        photo: req.files
                    })
                        .then( () => {
                            res.status(200).json(userFound)
                        })
                        .catch(err => {
                            res.status(500).json({ error: err['errors'][0]['message']})
                        });
                } else {
                    res.status(404).json({ error: 'Utilisateur non trouvé' })
                }
            })
    },

    deleteUser: (req, res) => {

        const { id } = req.params

        models.Users.findOne({
            where: { id: id }
        })
            .then(user => {
                if (user) {
                    user.destroy()
                        .then(response => {
                            res.status(200).json({ message: 'Utilisateurs supprimé'})
                        })
                        .catch(err => {
                            res.status(404).json({ error: 'L\'utilisateurs ne peut être supprimé'})
                        })
                } else {
                    res.status(500).json({ error: 'L\'utilisateurs ne peut être supprimé'})
                }
            })
            .catch(err => {
                res.status(404).json({ error: 'L\'utilisateurs n\'a pas été trouvé'})
            })
    },


    userPhoto: (req, res, next) => {

        const {id} = req.params

        models.Users.findOne({where: { id: id }})

            .then(user => {
                if (user.photo) {

                    // res.set(("Content-Type", user.photo));
                     res.json((user.photo))

                } else {
                    res.status(400).json({ error: 'Image non trouvé' })
                }
            })
            .catch(err => {
                res.status(404).json({ error: 'Utilisateurs non trouvé'})
            })
        next
    }
}