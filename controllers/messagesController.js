const models = require('../models');
const jwtutils = require('../utils/jwt.utils');
const formidable = require('formidable');
const fs = require('fs')

//Routes
module.exports = {

    //voici notre méthode pour créer un message
    createMessage: (req, res) => {

        //En début on fait le fonctionnement pour pouvoir ajouter une photo avec le post en créant un nouveau formulaire de data
        let form = new formidable.IncomingForm();

        //Ici on décide que les fichier gardent leurs extensions d'origine
        form.keepExtensions = true;

        //Ici on va analyser le fichier
        form.parse(req, (err, fields, files) => {

            //Si une erreur est détecté, voici la réponse
            if (err) {
                return res.status(400).json({
                    error: "Image ne peut etre upload"
                });
            }

            //A ce moent la on sait que le fichier existe et du coup on fait en sorte de relier le post a un user id
            let message = new models.Message(fields);
            message.UserId  = req.profile;

            //Si la photo existe alors on lit le chemin de cette photo
            if (files.photo){
                message.photo.type = fs.readFileSync(files.photo.path)
            }
        })

        //On récupère l'entếte d'authorization
        const headerAuth = req.headers['authorization'];
        const userId = jwtutils.getUserId(headerAuth);

        //Parametre que l'on souhaite ajouter sur le message
        const title = req.body.title;
        const content = req.body.content;

        //Ici on va chercher notre user car on souhaite que la personnes soit connecté pour créer un message
        models.Users.findOne({
            where: { id: userId }
        })
            .then( userFound => {

                //Si user trouvé
                if (userFound){

                    //Alors on créer le message
                    models.Message.create({
                        title: title,
                        content: content,
                        likes: 0,
                        UserId: userFound.id
                    })
                        .then((message) => {

                            //Si tout est bon alors on retourne le message et toutes ces autres données
                            res.status(200).json( message )
                        })
                        .catch(err => {
                            res.status(500).json({ error: err['errors'][0]['message'] })
                        })
                } else {
                    res.status(404).json({ error: 'Utilisateurs non trouvé' })
                }
            })
            .catch(err => {
                res.status(500).json({ error: 'Utilisateur ne peut etre vérifié' })
            })

    },


    //Voici notre méthode pour lister tout les messages sans distinctions
    listMessage: (req, res) => {

        //Voici les différents paramètres
        //Ici ça sera les champs que l'on veut voir
        const fields = req.query.fields;
        //Combien on en veut sur une page
        const limit = parseInt(req.query.limit);
        //
        const offset = parseInt(req.query.offset);
        //L'ordre que l'on veut appliquer
        const order = req.query.order;

        //On va chercher nos messages en bdd
        models.Message.findAll({
            //Voici un filtre sur les paramètres attendus
            //Si ordre différents de null alors on split les : et par défaut
            order: [(order != null) ? order.split(':') : ['title', 'ASC']],
            //Voici les attributs que l'on veut afficher, si fields est renseigné alors on respecte et on split les , ou sinon par défaut on met toute les donées
            attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
            limit: (!isNaN(limit)) ? limit : null,
            offset: (!isNaN(offset)) ? offset : null,
            //Avec include, on fait en sorte d'afficher nos utilisateurs qui ont créer les messages vu qu'ils sont liés
            include: [{
                model: models.Users,
                attributes: ['username']
            }]
        })
            .then(messages => {
                if (messages) {
                    //Si messages sont trouvés alors on les retourne
                    res.status(200).json( messages );
                } else {
                    res.status(404).json({ error: 'Aucun message trouvé' })
                }
            })
            .catch(err => {
                res.status(500).json({ error: 'champs invalide' })
            })
    },


    //Ici on list les messages par utilisateurs connectés
    listMessageByIdUser: (req, res) => {
        //Paramètres pour vérifier l'en-tête
        const headerAuth = req.headers['authorization'];
        const userId = jwtutils.getUserId(headerAuth);

        if (userId < 0)
        //Si pas de token alors
            res.status(400).json({ error: 'Mauvas token' })

        //On check dans notre bdd users si l'id correspond a ce que l'on a dans le token
        models.Users.findOne({where: { id: userId }})
            .then(userFound => {
                if (userFound) {

                    //Si c'est ok alors on lance uen deuxième requete SQL pour trouver les messages correspondant
                    models.Message.findAll({where: { UserId: userId }})
                        .then(messages => {
                            if (messages.length !== 0 ) {
                                //Si il existe des messages alors
                                res.status(200).json( messages )
                            }else {
                                //Si il n'y a pas de messages on retourne ce message
                                res.status(200).json({ message: 'Il n\'y a aucun post pour cet utilisateurs'})
                            }
                        })
                        .catch(err => {
                            res.status(500).json({ error: err['errors'][0]['message'] })
                        })
                } else {
                    res.status(404).json({ error: 'Utilisateurs non trouvé' })
                }
            })
            .catch(err => {
                res.status(403).json({ error: 'Utilisateurs ne peut être vérifié' })
            })
    }
}