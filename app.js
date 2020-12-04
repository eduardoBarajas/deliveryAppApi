var express = require('express');
const dotenv = require('dotenv');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const jwt = require('express-jwt');

const storesController = require('./api/stores');
const productsController = require('./api/products');
const favoritesController = require('./api/favorites');
const ordersController = require('./api/orders');
const authController = require('./api/auth');
const notificationsController = require('./api/notifications');

var app = express();

dotenv.config();

const store = new MongoDBStore({uri: 'mongodb+srv://deliveryAppDBManager:@manager1029@cluster0.tzsxp.mongodb.net/DELIVERYAPPTEST?retryWrites=true&w=majority', collection: 'sessions'});

store.on('error', (err) => {
    console.log(err);
});

var mSession = {
    secret: process.env.SESSION_SECRET,
    store: store,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

if (app.get('env') === 'production') {
    mSession.cookie.secure = true // serve secure cookies
}

app.use(session(mSession));
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/stores', storesController);
app.use('/products', productsController);
app.use('/favorites', favoritesController);
app.use('/orders', ordersController);
app.use('/auth', authController);
app.use('/notifications', notificationsController);
app.use('/', jwt({ 
    secret: process.env.JWT_SECRET, 
    algorithms: ['RS256'],
    credentialsRequired: true,
    getToken: function fromHeaderOrQuerystring (req) {
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
          return req.headers.authorization.split(' ')[1];
      } else if (req.query && req.query.token) {
        return req.query.token;
      }
      return null;
    }
}).unless({path: ['/auth/login', '/auth/saveUser']}));

// error handler
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send({error: err});
        console.log(err);
    } else {
        console.log(err);
        res.status(500).send({error: err});
    }
    //res.render('error', { error: err });
});

mongoose.connect('mongodb+srv://deliveryAppDBManager:@manager1029@cluster0.tzsxp.mongodb.net/DELIVERYAPPTEST?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

module.exports = app;
