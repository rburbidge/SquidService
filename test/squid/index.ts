import { testFixture } from '../setup';

import * as request from 'supertest';
import * as assert from 'assert';
import { assertContains } from '../helpers';

describe('@e2e /squid', () => {
    describe('GET /squid/about', () => {
        it('Should return about page', () => {
            return request(testFixture.server)
                .get('/squid/about')
                .expect(200)
                .expect((res) => {
                    assertContains(res.text, 'Thank you for using Squid!');
                });
        });
    });

    describe('GET /squid/instructions', () => {
        it('Should return instructions page', () => {
            return request(testFixture.server)
                .get('/squid/instructions')
                .expect(200)
                .expect((res) => {
                    assertContains(res.text, 'From Chrome');
                    assertContains(res.text, 'From Android');
                });
        });
    });

    describe('GET /squid/test', () => {
        it('Should return test page', () => {
            return request(testFixture.server)
                .get('/squid/test')
                .expect(200)
                .expect((res) => {
                    assertContains(res.text, 'Congratulations');
                });
        });
    });
});