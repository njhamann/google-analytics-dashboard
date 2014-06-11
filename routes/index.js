var express = require('express');
var router = express.Router();
var passport = require('passport');


/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express', 'user': req.user });
});

router.get('/auth/google', passport.authenticate('google', { scope: 'profile email https://www.googleapis.com/auth/analytics.readonly' }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
    res.redirect('/');
});

router.get('/auth/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
