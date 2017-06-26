const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const parseurl = require('parseurl');
const session = require('express-session');
const data = require('./users');
const app = express();

app.use(session({
  secret: 'something',
  resave: false,
  saveUninitialized: true
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static('public'));
app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

app.use(function (req, res, next) {
  var views = req.session.views;

  if (!views) {
    views = req.session.views = {};
  }

  var pathname = parseurl(req).pathname;

  views[pathname] = (views[pathname] ) + 1

  next();
})

function authenticate (req, username, password){
  var authenticatedUser = data.users.find(function(user){
    if (username === user.username && password === user.password){
      req.session.authenticated = true;
    } else {
      return false;
    }
  })
  return req.session;
}


app.get('/', function (req, res){
  if (!req.session.authenticated){
    res.render('index');
  } else {
    req.session.destroy();
  }
});

app.get('/login', function (req, res) {
  let viewNumber = req.session.views['/login']
  res.render('hello', {viewNumber} );
});

app.post('/login', function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  authenticate(req, username, password);
  if (req.session && req.session.authenticated){
    res.render('hello', {username: username})
  } else {
    res.redirect('/');
  }
})

app.listen(3000, function(){
  console.log("Connected so good!");
})
