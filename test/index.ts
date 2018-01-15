import { createServer } from '../server';

import * as express from 'express';
import * as http from 'http';
import * as request from 'supertest';
    
describe('index', () => {
    let app: http.Server;

    before(() => createServer()
        .then(expressApp => app = expressApp));

    after(() => app.close());

    it('GET base url should return 200', () =>
        request(app)
            .get('')
            .expect(200)
            .expect('Hello Server')
    );
});