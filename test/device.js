var assert = require('assert'),
    request = require('supertest'),
    config = require('./config.js');

describe('devices', function() {
    it('GET devices should return 404', function(done) {
        request(config.target)
            .get('/api/devices')
            .set('Authorization', config.authorization)
            .expect(404)
            .expect('User not found', done);
    });

    it('POST devices should return post new device', function(done) {
        request(config.target)
            .post('/api/devices')
            .set('Authorization', config.authorization)
            .send({ gcmToken: this.test.title })
            .expect(200)
            .end(function(err, res) {

                var data = JSON.parse(res.text);
                assert.ok(data.deviceId, 'No deviceId was returned');
                done();
            });
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
});