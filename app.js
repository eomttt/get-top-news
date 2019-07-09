/***************************************************************
// Copyright 2017-2018 SavannaBoat Inc. All rights reserved.
  ___   ___   ___   _  _ _  _   _     ___  ___   _ _____
 / __| /_\ \ / /_\ | \| | \| | /_\   | _ )/ _ \ /_\_   _|
 \__ \/ _ \ V / _ \| .` | .` |/ _ \  | _ \ (_) / _ \| |
 |___/_/ \_\_/_/ \_\_|\_|_|\_/_/ \_\ |___/\___/_/ \_\_|

*****************************************************************/

global.SAVANNA_LOCAL = true;
global.SAVANNA_DEV = false;
global.SAVANNA_PUBLIC = false;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var appView = require('./app_server/routes/app_view');
var api = require('./app_server/routes/api');

var app = express();

// view engine setup
app.set('views', [path.join(__dirname, 'public'),
                  path.join(__dirname, 'public', 'index')]);
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);


if (!global.SAVANNA_LOCAL) {
    app.set('port', process.env.PORT || 9000);
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

appView(app);
app.use('/api', api);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/index')));


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

if (!global.SAVANNA_LOCAL) {
    var server = app.listen(app.get('port'), function() {
        console.log('Express server listening on port');
    });
}

module.exports = app;
