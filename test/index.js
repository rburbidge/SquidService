var request = require('supertest');
    config = require('./config.js');

describe('index', function() {
    it('GET base url should return 200', function(done) {
        request(config.target)
            .get('')
            .expect(200)
            .expect('Sir Nommington', done);
    });
});