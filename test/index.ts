import { Config }  from '../config/config';
import { createServer } from '../server';
import { server } from './setup';

import * as express from 'express';
import * as http from 'http';
import * as request from 'supertest';

describe('index', () => {
    it('GET base url should return 200', () =>
        request(server)
            .get('')
            .expect(200)
            .expect('Hello Server')
    );
});