import { testFixture } from './setup';

import * as request from 'supertest';

describe('@e2e index', () => {
    it('GET base url should return 200', () =>
        request(testFixture.server)
            .get('')
            .expect(200)
            .expect('Hello Server')
    );
});