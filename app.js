var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
var cors = require('cors');

const storesController = require('./api/stores');
const productsController = require('./api/products');

var app = express();

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/stores', storesController);
app.use('/products', productsController);
// error handler
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500);
    res.render('error', { error: err });
});
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

module.exports = app;
