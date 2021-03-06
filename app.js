var config = require('./config/config');
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var Parse = require('parse').Parse;
var routes = require('./routes/index');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
//app.use(session({ secret: 'keyboard cat' }));
app.use(session({ store: new RedisStore(), secret: 'keyboard cat' }))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));


//passport
var GoogleUser = Parse.Object.extend('GoogleUser');
Parse.initialize(config.PARSE_APP_ID, config.PARSE_JAVASCRIPT_KEY);
passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://127.0.0.1:3000/auth/google/callback'
}, function(accessToken, refreshToken, profile, done) {
    var query = new Parse.Query(GoogleUser);
    query.equalTo('gid', profile.id);
    //find or create user
    query.find({
        success: function(results){
            if(results.length){
                done(null, results[0].toJSON());
            }else{
                var userJSON = profile._json;
                userJSON.gid = userJSON.id;
                userJSON.accessToken = accessToken;
                userJSON.refreshToken = refreshToken;
                delete userJSON.id;
                var googleUser = new GoogleUser();
                googleUser.save(userJSON, {
                    success: function(user) {
                        done(null, user.toJSON());
                    },
                    error: function(user, err) {
                        done(err, user.toJSON());
                    }
                }); 
            }
        },
        error: function(err){
            done(err);
        }
    });
}));

passport.serializeUser(function(user, done) {
  done(null, user.objectId);
});

passport.deserializeUser(function(id, done) {
    var query = new Parse.Query(GoogleUser);
    query.get(id, {
        success: function(googleUser) {
            done(null, googleUser.toJSON());
        },
        error: function(googleUser, err) {
            done(err, googleUser);
        }
    });
});

app.use('/', routes);



/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
