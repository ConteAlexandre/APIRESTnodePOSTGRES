//Importation express
const express = require('express');
const bodyParser = require('body-parser');
// const fileupload = require('express-fileupload');
const cors = require('cors')
const morgan = require('morgan');


const app = express();

app.use(morgan("dev"))
app.use(cors());
//Config bodyparser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(fileupload({
//     limits: {
//         fileSize: 1 * 1024 * 1024,
//         champs: 50,
//         fichiers: 1,
//         parties: 51,
//     }
// }))


app.get('/', function (req, res) {
    res.status(200).send('<h1>Bonjour</h1>')
})

app.use('/', require('./routes/usersRoutes'));
app.use('/', require('./routes/messagesRoutes'));

const port = 8080;

app.listen(port, () => {
    console.log(`Le serveur écoute sur le port : ${port}`)
})
