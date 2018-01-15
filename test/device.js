var assert = require('assert'),
    request = require('supertest'),
    config = require('./config.js'),
    uuid = require('uuid');

describe.skip('devices', function() {
    it('GET devices should return 404', function(done) {
        request(config.target)
            .get('/api/devices')
            .set('Authorization', config.authorization)
            .expect(404)
            .expect('User not found', done);
    });

    it('POST devices should return new device', function(done) {
        request(config.target)
            .post('/api/devices')
            .set('Authorization', config.authorization)
            .send({ gcmToken: uuid.v4() })
            .expect(200)
            .end(function(err, res) {
                var data = JSON.parse(res.text);
                assert.ok(data.deviceId, 'No deviceId was returned');
                done();
            });
    });

    it('POST devices should return 400 if gcmToken not passed', function(done) {
        var deviceId1;
        var deviceId2;
        var gcmToken = this.test.title;

        request(config.target)
            .post('/api/devices')
            .set('Authorization', config.authorization)
            .expect(400)
            .expect('Must pass gcmToken', done);
    });


    it('POST devices should return original deviceId the second time', function(done) {
        var deviceId1;
        var deviceId2;
        var gcmToken = this.test.title;

        // First request returns a 200
        request(config.target)
            .post('/api/devices')
            .set('Authorization', config.authorization)
            .send({ gcmToken: gcmToken })
            .expect(200)
            .end(function(err, res) {
                var data = JSON.parse(res.text);
                deviceId1 = data.deviceId;
                
                // Second request returns 304 Not Modified
                request(config.target)
                    .post('/api/devices')
                    .set('Authorization', config.authorization)
                    .send({ gcmToken: gcmToken })
                    .expect(304)
                    .end(done);
            });
    });

    it('POST devices/<deviceId>/commands should return 200', function(done) {
        var gcmToken = uuid.v4();
        addDevice(gcmToken, function(deviceId) {
            request(config.target)
            .post('/api/devices/' + deviceId + '/commands')
            .set('Authorization', config.authorization)
            .send({ url: 'http://www.google.com' })
            .expect(200, done);
        });
    });

    function addDevice(gcmToken, done) {
        request(config.target)
            .post('/api/devices')
            .set('Authorization', config.authorization)
            .send({ gcmToken: gcmToken })
            .expect(200)
            .end(function(err, res) {
                var data = JSON.parse(res.text);
                assert.ok(data.deviceId, 'No device ID was returned');

                done(data.deviceId);
            }); 
    }
});