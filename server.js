const PORT = process.env.PORT || 3000; // process utilisé par l'application nodeJS.

const express = require('express'); // appelle express dans une variable
const app = express(); // équivaut à une instance de express
const passport = require('passport');
const Strategy = require('passport-local').Strategy;

const knex = require('knex');
/* const db = knex({
    client:'pg',
    connection:'' // se connecter sur une base de donner postgrsql - demander à Cyril car lié à Heroku
}) */
const db = require('./db');

/* app.get('/', function (req, res) { // fonction 1 : .get est la méthode (get, post, update, delete)
    // dans le controleur il y a deux paramètres : req et res, req est l'objet de la request (adress ip, navigateur...), res est l'objet de la response (qu'allons-nous renvoyer ?)
  res.json({
      Hello: "World!"
    })
}) */

app.get('/users', require('./routes/getUsers'));
app.get('/users/:username', require('./routes/getUsersByUsername'));
// app.get('/passport', require('./routes/passport'));

// Local strategy with 'verify'
passport.use(new Strategy(
    function(username, password, cb) {
      db.users.findByUsername(username, function(err, user) {
        if (err) { return cb(err); }
        if (!user) { return cb(null, false); }
        if (user.password != password) { return cb(null, false); }
        return cb(null, user);
    });
}));
  
// Restore authentification state accross HTTP
passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});
  
passport.deserializeUser(function(id, cb) {
    db.users.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

// View engine (EJS)
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Logging - Parsing - Sessions handler ?
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/',
    function(req, res) {
        res.render('home', {user: req.user});
    }
);

app.get('/login',
    function(req, res) {
        res.render('login');
    }
);

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login'}),
    function(req, res) {
        res.redirect('/');
    }
);

app.get('/logout',
    function(req, res) {
        req.logout();
        res.redirect('/');
    }
);

app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        res.render('profile', { user: req.user });
  }
);






app.listen(PORT, function () { // 3000 = nom du port sur lequel le serveur va être lancé
    console.log(`Example app listening on port ${PORT}!`)
  })