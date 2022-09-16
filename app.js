var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const db = require("./configuration/connection");
const session = require('express-session');



var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');



db.connect((err)=>{
  if(err){
    console.log("connection eror"+err)
  }else{
    console.log("connected to the port 27017")
  }
})

const hbs = require('express-handlebars');
var Handlebars = require('handlebars');

Handlebars.registerHelper('inc', function (value, options) {
    return parseInt(value) + 1;
  });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs' ,hbs.engine ({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials'}));
var Hbs=hbs.create({});
Hbs.handlebars.registerHelper('if_eq', function(a, b, opts) {
  if(a == b) // Or === depending on your needs
      return opts.fn(this);
  else
      return opts.inverse(this);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/public/user')));
app.use(express.static(path.join(__dirname, '/public/admin')));

app.use(session({resave: true,
  saveUninitialized: true,
  secret:'key',
  cookie:{maxAge:600000}}));

  app.use((req, res, next) => {
    if (!req.user) {
      res.header("cache-control", "private,no-cache,no-store,must revalidate");
      res.header("Express", "-3");
    }
    next();
  });


app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
