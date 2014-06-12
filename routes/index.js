var config = require('../config/config');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var util = require('util');
var googleapis = require('googleapis');
var OAuth2 = googleapis.auth.OAuth2;
/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express', 'user': req.user });
});

router.get('/auth/google', passport.authenticate('google', { 
    scope: 'profile email https://www.googleapis.com/auth/analytics.readonly', 
    accessType: 'offline'
}));

router.get('/auth/google/callback', passport.authenticate('google', { 
    failureRedirect: '/login' 
}), function(req, res) {
    res.redirect('/');
});

router.get('/auth/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/api/google_analytics/:endpoint', function(req, res) {
    if(!req.user || !req.user.accessToken) {
        return res.redirect('/');
    }

    var oauth2Client = new OAuth2(config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET, config.GOOGLE_REDIRECT_URI);
    oauth2Client.credentials = {
        access_token: req.user.accessToken,
        refresh_token: req.user.refreshToken
    };

    googleapis
        .discover('analytics', 'v3')
        .execute(function(err, client) {
        
        if (err) {
            console.log('Problem during the client discovery.', err);
            res.json({});
            return;
        }
        
        
        client.analytics.management.accountSummaries
            .list()
            .withAuthClient(oauth2Client)
            .execute(function (err, response) {
                console.log(err);
                console.log(response);
                res.json(response);
            });
    }); 
});

module.exports = router;
