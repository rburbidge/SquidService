import { server } from './setup';
import * as request from 'supertest';

describe('index', () => {
    it('GET base url should return 200', () =>
        request(server)
            .get('')
            .expect(200)
            .expect('Hello Server')
    );
});