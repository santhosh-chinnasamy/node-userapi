var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser'),
  cors = require('cors'),
  mongoose = require('mongoose'),
  jwt = require('jsonwebtoken'),
  User = require('./models/users/userModel');

require('dotenv').config({
  path: path.join(__dirname, './.env')
});
var auth = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use(async (req, res, next) => {

  if (req.headers["x-access-token"]) {
    try {
      const accessToken = req.headers["x-access-token"];
      const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);

      // If token has expired
      if (exp < Date.now().valueOf() / 1000) {
        return res.status(401).json({
          error: "JWT token has expired, please login to obtain a new one"
        });
      }
      res.locals.loggedInUser = await User.findById(userId);
      // console.log(res.locals.loggedInUser);
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});
app.use('/', auth);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // next(createError(404));
  console.log("404 error");
  next();

});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// fix mongoose warnings
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// Mongo Connection
var mongoURL = 'mongodb://192.168.2.25:27017/node_express';
mongoose
  .connect(process.env.MONGO_URL || mongoURL)
  .then(() => {
    console.log('\x1b[33m%s\x1b[0m', 'Mongo Connected Successfully');
  });


module.exports = app;
