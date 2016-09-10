var request = require('supertest'),
    config = require('./config.js');

describe('auth', function() {
    it('GET devices should return 401 with no Authorization header', function(done) {
        request(config.target)
            .get('/api/devices')
            .expect(401)
            .expect('Authorization header must be sent with Google token', done);
    });

    it('GET devices should return 401 with empty Authorization header', function(done) {
        request(config.target)
            .get('/api/devices')
            .set('Authorization', '')
            .expect(401)
            .expect('Authorization header must be sent with Google token', done);
    });

    it('GET devices should return 401 with bad Authorization header', function(done) {
        request(config.target)
            .get('/api/devices')
            .set('Authorization', 'bad auth header')
            .expect(401)
            .expect('Authorization header was invalid', done);
    });

    it('GET devices should return 401 with expired Authorization header', function(done) {
        request(config.target)
            .get('/api/devices')
            .set('Authorization', 'ya29.CjRaAzHLkoHqrbE_AqMGHnUmskY7HfAur_lXoHAqFKNeqPTAN4ONlLZiTiNOY47GLREFnPSF')
            .expect(401)
            .expect('Authorization header was invalid', done);
    });
});