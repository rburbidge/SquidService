import { testFixture } from './setup';

import * as request from 'supertest';
import * as assert from 'assert';
import { assertContains } from './helpers';

describe('@e2e index', () => {
    describe('GET ""', () => {
        it('Should return 200 and contains "Sir Nommington"', () => {
            return request(testFixture.server)
                .get('')
                .expect(200)
                .expect((res) => {
                    assertContains(res.text, 'Sir Nommington');
                });
        });

        it('Should return page with app insights', () => {
            return request(testFixture.server)
                .get('')
                .expect((res) => {
                    assertContains(res.text, 'var appInsights=window.appInsights');
                });
        });
    });
});