// modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
app.use(bodyParser.urlencoded({
    extended: true
}));
const port = 4000;
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./DB/register.db');
app.set('view engine', 'ejs');
const nodemailer = require('nodemailer');
const session = require('express-session');
app.use(cookieParser());
const timeEXp = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "rfghf66a76ythggi87au7td",
    saveUninitialized: true,
    cookie: {
        maxAge: timeEXp
    },
    resave: false
}));
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'alertfemc@gmail.com',
        pass: 'xcvjrfbcpbtcsznd'
    }
});
// Rutas ----------------------------------------->
app.get('/alertU', (req, res) => {
    res.render('alertU');
})

app.get('/', (req, res) => {
    res.render('index')
});

app.get('/indexc', (req, res) => {
    res.render('indexc')
});

app.get('/', (req, res) => {
    session = req.session;
    if (sessions.userId) {
        res.render('index')
    } else {
        res.send("Debes iniciar sesión");
    }
});
app.get('/registrook', (req, res) => {
    res.render('registrook')
});
app.get('/registro', (req, res) => {
    res.render('registro')
});

// File Statics ------------>

app.use(express.static(__dirname + '/public'));

app.post('/registro', (req, res) => {
    let name = req.body.nombre;
    let lastName = req.body.apellido;
    let residencia = req.body.residencia;
    let document = req.body.documento;
    let num_id = req.body.num_id;
    let email = req.body.email;
    let password = req.body.password;
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    db.run(`INSERT INTO Registro(name, lastName, residencia, document, num_id,email,password) 
    VALUES(?, ?, ?, ?, ?, ?,?)`,
        [name, lastName, residencia, document, num_id, email, hash],
        function (error) {
            if (!error) {
                console.log('Insert OK');
                return res.render('registrook');
            } else {
                console.log('insert error', error.code);
                if (error.code == "SQLITE_CONSTRAINT") {
                    return res.render('alertU');
                }
                console.log(error);
                return res.send('Error desconocido');
            }
        }
    );

    // Envio de correo de registro
    // const transporter = nodemailer.createTransport({
    //     host: 'smtp.gmail.com',
    //     port: 587,
    //     auth: {
    //         user: 'alertfemc@gmail.com',
    //         pass: 'xcvjrfbcpbtcsznd'
    //     }
    // });

    // send email
    transporter.sendMail({
        from: 'alertfemc@gmail.com',
        to: email,
        subject: 'Test Email Subjects',
        html: '<h1>REGRISTRO EXITOSO</h1><h2>GRACIAS POR EXISTIR 737</H2><img src="https://res.cloudinary.com/click-alert-fem/image/upload/v1656557622/clickalertfem/logoEmail_g5kjqu.jpg">'
    }).then((res) => {
        console.log(res);
    }).catch((err) => {
        console.log(err);
    })
});


app.get('/correo', (req, res) => {
    transporter.sendMail({
        from: '',
        to: 'PoliciaNacionalDeColombia2.0@gmail.com',
        subject: 'Test Email Subjects',
        html: '<h1>NOTIFICACIÓN DE ALERTA!!</h1><h2>Emergencia. </H2><img src="https://res.cloudinary.com/click-alert-fem/image/upload/v1656557622/clickalertfem/logoEmail_g5kjqu.jpg">'
    }).then((res) => {
        console.log(res);
    }).catch((err) => {
        console.log(err);
    })
    res.render('alert')
});


app.post('/login', (req, res) => {
    let num_id = req.body.num_id;
    let password = req.body.password;
    db.get("SELECT password, name FROM Registro WHERE num_id=$num_id", {
        $num_id: num_id
    }, (error, row) => {
        if (error) {
            return res.send("Ha ocurrido un error desconocido");
        }
        console.log("00000000000", row);
        if (row) {
            console.log(row.password);
            if (bcrypt.compareSync(password, row.password)) {
                return res.render("indexc", { name: row.name });
            }
            return res.render("alertL");
        }
        return res.render("alertNu");
    });
})


app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/logout', (req, res) => {
    session = req.session;
    //si hay sesion iniciada...
    if (session.num_id) {
        //la destruimos
        req.session.destroy();
        return res.redirect('/');
    }
    return res.send('No tiene sesion para cerrar')
})

app.get('/logout', (req, res) => {
    res.render('index');
})



// Servidor ---------------------------------->
app.listen(port, () => {
    console.log('Server running uvu');
});

// ------------------------------>


