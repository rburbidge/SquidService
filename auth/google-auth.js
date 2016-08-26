var google = require('../services/google.js');

module.exports = {
    googleAuthZ: function (req, res, next) {
        // Extract the token and return an error immediately if not found
        var token = req.get('Authorization');
        if(!token) {
            console.error('AuthZ failed. No token was found');
            res.status(401).send('Authorization header must be sent with Google token');
            return;
        }

        // Get the user profile. If this succeeds, we have auth Z
        google.getUserProfile(
            token,
            function(user) {
                if(!user) {
                    console.error('AuthZ failed. Unable to obtain identity. user is falsy');
                    res.status(401).send('Could not retrieve user profile');
                }

                console.log('User is authZd');
                req.user = user;
                next();
            },
            function(error) {
                console.error('AuthZ failed. google.getUserProfile() returned error=' + error);
                res.status(500).end();
            });
    }
};