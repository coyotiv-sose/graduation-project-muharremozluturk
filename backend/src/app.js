var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')

const session = require('express-session')
const { MongoStore } = require('connect-mongo')

const mongoose = require('mongoose')

var indexRouter = require('./routes/index');
var expertsRouter = require('./routes/experts');
var clientsRouter = require('./routes/clients');
var appointmentsRouter = require('./routes/appointments');
const accountsRouter = require('./routes/accounts')

const Client = require('./models/client')
const Expert = require('./models/expert')
const passport = require('passport')

// Named strategies so client and expert can both log in; default 'local' would collide.
passport.use('client-local', Client.createStrategy())
passport.use('expert-local', Expert.createStrategy())

passport.serializeUser(function (user, done) {
  const modelName = user && user.constructor && user.constructor.modelName
  var role = modelName === 'Client' ? 'client' : modelName === 'Expert' ? 'expert' : null
  if (!role) {
    return done(new Error('Unsupported user type for session'))
  }
  done(null, { id: user.id, role: role })
})

passport.deserializeUser(async function (payload, done) {
  try {
    if (!payload) {
      return done(null, false)
    }
    // Older sessions may have stored only a Mongo id string (last registered serializer was Expert).
    if (typeof payload === 'string') {
      var legacyExpert = await Expert.findById(payload)
      return done(null, legacyExpert || false)
    }
    if (!payload.id || !payload.role) {
      return done(null, false)
    }
    var Model = payload.role === 'client' ? Client : payload.role === 'expert' ? Expert : null
    if (!Model) {
      return done(null, false)
    }
    var doc = await Model.findById(payload.id)
    done(null, doc || false)
  } catch (err) {
    done(err)
  }
})

require('dotenv').config()
require('./database-connection')
var app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const clientPromise = mongoose.connection.asPromise().then(connection => (connection = connection.getClient()))

app.use(
  session({
    secret: 'asdg2356gb34!!rwet5',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 15, // 15 days
    },
    store: MongoStore.create({ clientPromise, stringify: false }),
  })
)

app.use(passport.session())

app.use((req, res, next) => {
  const numberOfVisits = req.session.numberOfVisits || 0
  req.session.numberOfVisits = numberOfVisits + 1
  req.session.history = req.session.history || []
  req.session.history.push({ url: req.url, ip: req.ip })

  next()
})


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/experts', expertsRouter);
app.use('/clients', clientsRouter);
app.use('/appointments', appointmentsRouter);
app.use('/accounts', accountsRouter)
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
