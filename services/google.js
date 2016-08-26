var https = require('https'),
    request = require('request');

module.exports = {
    /**
     * Checks if a google token is valid. Callback is invoked with true if the token is valid; false otherwise.
     */
   isValidToken: function(token, callback) {
        var options = {
            method: 'GET',
            host: 'www.googleapis.com',
            path: '/oauth2/v3/tokeninfo?access_token=' + token,
        };
            
        https.request(options, function(resp) {
            callback(resp.statusCode === 200);
        }).end();
    },

    getUserProfile: function(token, callback, errorCallback) {
        // Use request rather than https module here because it provides free response body parsing
        request({
                url: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token,
                json: true
            },
            function(error, response, body) {
                if(error) {
                    errorCallback(error);
                } else {
                    callback(body);
                }
            });
    },

    /**
     * Sends the payload data to a device with GCM registration token. Callback is invoked with true upon success; false otherwise.
     */
    sendGcmMessage: function(data, gcmToken, callback) {
        var postData = JSON.stringify(
            {
                "data": data,
                "to" : gcmToken
            });

        // TODO Do not hardcode API key
        var options = {
            method: 'POST',
            host: 'gcm-http.googleapis.com',
            path: '/gcm/send',
            headers: {
                Authorization: 'key=AIzaSyC5NfTAr56W2v7hRpsRhO11PqcHODVcwOU',
                'Content-Type': 'application/json', 
                'Content-Length': postData.length
            }
        };
        var googleReq = https.request(options, function(resp) {
            if(resp.statusCode === 200) {
                console.log('GCM message sent!');
            } else {
                console.log('GCM message failed: statusCode=' + resp.statusCode);
            }

            callback(resp.statusCode === 200);
        });
        googleReq.write(postData);
        googleReq.end();
    }
};