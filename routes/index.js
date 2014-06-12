var config = require('../config/config');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var util = require('util');
var googleapis = require('googleapis');
var OAuth2 = googleapis.auth.OAuth2;
var _ = require('lodash');
//app
router.get('/', function(req, res) {
    res.render('index', { title: 'Express', 'user': req.user });
});

//auth
router.get('/auth/google', passport.authenticate('google', { 
    scope: 'profile email https://www.googleapis.com/auth/analytics.readonly', 
    accessType: 'offline',
    approvalPrompt: 'force'
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

//api
router.get('/api/analytics/*', function(req, res) {

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
            res.json(err);
            return;
        }
        
        var pathParts =  req.params[0].split('/'); 
        var params = _.assign(req.body, req.query);
        var apiRequest = client.analytics;
        for(var i=0; i<pathParts.length; i++){
            apiRequest = apiRequest[pathParts[i]];
            if(!apiRequest){
                res.json({message: 'not a valid endpoint'});
                return;
            }
        };
        
        params = _.isEmpty(params) ? null : params;
        apiRequest(params)
            .withAuthClient(oauth2Client)
            .execute(function (err, response) {
                if(!err) {
                    res.json(response);
                } else {
                    res.json(err);
                }
            });
    }); 
});

module.exports = router;
