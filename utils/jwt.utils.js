// Imports
const jwt = require('jsonwebtoken');

//On créer un début de token ici pour l'incruster sur notre token final
const JWT_SIGN_SECRET = 'efkjesjfkeskdgdrgdf654g65d4g65d45d1f32qs1d65s4f65s4d32s1f53ds4f65';

// Exported functions
module.exports = {

    //voici une méthode pour générer le token
    generateTokenForUser: function(userData) {

        //Ceci va nous retourner notre token
        return jwt.sign({
                //On décide de ce que l'on met dedans, pas de données sensibles
                userId: userData.id,
                isAdmin: userData.isAdmin
            },
            JWT_SIGN_SECRET,
            {
                //Au bout de combien de temps il expire
                expiresIn: '1h',
            })
    },

    //Voici une méthode qui nous permet de lire le token et d'enleve le Bearer qui est une norme dans le token
    parseAuthorization: function(authorization) {
        return (authorization != null) ? authorization.replace('Bearer ', '') : null;
    },

    //Ici on récupère l'id de l'utilisateurs selon le token que l'on a enregistrer
    getUserId: function(authorization) {
        //On applique une var pour pouvoir lui ajouter ou la modifier par la suite ou dans un autre fichier
        var userId = -1;
        //On appel notre fonction qui enleve le Bearer et de lire le token
        var token = module.exports.parseAuthorization(authorization);
        if(token != null) {
            //Si le token est pas null
            try {
                //Voici notre variable qui récupère la comparaison des deux tokens
                var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
                if(jwtToken != null)
                    //Si le token est bon alors on récupère l'id
                    userId = jwtToken.userId;
            } catch(err) { }
        }
        return userId;
    }
}
