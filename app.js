const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const expressSession = require('express-session');

const indexRouter = require('./routes/index');
const accountRouter = require('./routes/account');

mongoose.connect('mongodb+srv://matchMaker:<password>@neckerlove-gen0b.mongodb.net/test?retryWrites=true', {
  auth: {
    user: 'matchMaker',
    password: 'p@ssw0rd'
  },
  useNewUrlParser: true,
  useCreateIndex: true
});

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({
  key: 'user_sid',
  secret: 'somerandomstuff',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 10 * 60 * 1000 // 10 * 60 * 1 second = 10 minutes
  }
}));

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');
  }
  next();
});

app.use('/', indexRouter);
app.use('/account', accountRouter);

app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
