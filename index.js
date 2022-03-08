const express = require('express');
const app = express();

const users = require('./data/agentes').results;
const jwt = require('jsonwebtoken');

const secretKey = process.env["SECRET_KEY"]
// const token = jwt.sign(user[0], secretKey)

app.use(express.static("public"))

app.get("/", (_, res) => {
    res.sendFile(__dirname + "index.html");
});

// 1. Crear una ruta que autentique a un agente basado en sus credenciales y genera un
// token con sus datos.
app.get('/SignIn', (req, res) => {
    const { email, password } = req.query;
    const user = users.find((u) => u.email == email && u.password == password);
    if(user) {
        const token = jwt.sign(
        {
        exp: Math.floor(Date.now()/ 1000) + 120,
        data: user,
        },
        secretKey
        );
// 2. Al autenticar un agente, devolver un HTML que:
// ●Muestre el email del agente autorizado.
// ●Guarde un token en SessionStorage con un tiempo de expiración de 2
// minutos.
        res.send(`
        <a href="/RutaRestringida?token=${token}"> <p> Ruta restringida</p></a>
        Bienvenido, ${email}.
        <script>
        localStorage.setItem('token', JSON.stringify("${token}"))
        </script>
                `)
   } else {
       res.send('Usuario o contraseña incorrecta')
   }
})
// 3. Crear una ruta restringida que devuelva un mensaje de Bienvenida con el correo del
// agente autorizado, en caso contrario devolver un estado HTTP que indique que el
// usuario no está autorizado y un mensaje que mencionala descripción del error.
const verificar = (req, res, next) => {
    const { token } = req.query;
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(401).send({
                error: "401 No autorizzado",
                message: err.message,
            })
        } else {
            req.user = decoded;
            next()
        }
    })
}
// ●Disponibiliza un hiperenlace para redirigir al agentea una ruta restringida.
app.get("/RutaRestringida", verificar, (req, res) => {
    res.send(`Bienvenido ${req.user.data.email}`)
})


app.listen(3000, () => console.log('Servidor encendido en el puerto 3000'));







