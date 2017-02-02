module.exports = function() {
    var google = require('../services/google.js');

    function getStringAfterPrefix(s, prefix) {
        if(s.startsWith(prefix)) {
            return s.substring(prefix.length, s.length);
        }
        
        return null;
    }

    var ACCESS_TOKEN = 'access_token';
    var ID_TOKEN = 'id_token';

    var tokenPrefixToType = {
        'Bearer Google OAuth Access Token=': ACCESS_TOKEN,
        'Bearer Google OAuth ID Token=': ID_TOKEN
    };

    return function (req, res, next) {
        // Extract the token and return an error immediately if not found
        var authHeader = req.get('Authorization');
        if(!authHeader) {
            console.error('AuthZ failed. No token was found');
            res.status(401).send('Authorization header must be sent with Google token');
            return;
        }

        // Parse the token and determine the token type
        var token, tokenType;
        for(var key in tokenPrefixToType) {
            if(tokenPrefixToType.hasOwnProperty(key)) {
                // If we successfuly parse a token, then stop
                token = getStringAfterPrefix(authHeader, key);
                if(token) {
                    tokenType = tokenPrefixToType[key];
                    break;
                }
            }
        }

        // If parsing failed, bomb out
        if(!token || !tokenType) {
            console.error(`AuthZ failed. token or tokenType could not be parsed ${authHeader}`);
            res.status(401).send('Unable to parse Authorization header token');
            return;   
        }

        console.log(`Google ${tokenType} received. Validating...`);

        // Get the user info inside the token. If this succeeds, we have auth Z
        google.getTokenInfo(
            tokenType,
            token,
            function(user) {
                if(!user) {
                    console.error('AuthZ failed. Unable to obtain identity. user is falsy');
                    res.status(401).send('Authorization did not return a user');
                    return;
                }

                console.log('Token is valid');

                // If using id_token, account ID is returned in the response
                // For access_token, must call getUserInfo() to retrieve the ID
                if(tokenType === ID_TOKEN) {
                    req.user = user.sub;
                    console.log('User is authZd');
                    next();
                } else {
                    console.log('Getting user ID for access_token');
                    google.getUserInfo(token,
                        function(user) {
                            req.user = user.sub;
                            console.log('Google ID retrieved');
                            console.log('User is authZd');
                            next();
                        },
                        function(error) {
                            console.error('AuthZ failed. google.getTokenInfo() returned error=' + error);
                            res.status(401).send('Authorization header was invalid').end();
                        });
                }
            },
            function(error) {
                console.error('AuthZ failed. google.getTokenInfo() returned error=' + error);
                res.status(401).send('Authorization header was invalid').end();
            });
    }
};