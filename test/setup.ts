/**
 * Sets up the test fixture, server, and database before each test.
 */

import { Config }  from '../config/config';
import { createServer, ServerOptions } from '../server';
import { Google } from '../services/google';

import * as http from 'http';
import * as mockgo from 'mockgo';
import * as mongodb from 'mongodb';
import * as winston from 'winston';

export let testFixture: ServerOptions;
export let server: http.Server;

let db: mongodb.Db;

/**
 * Connect to an in-memory database that the tests will execute upon.
 * This is done once.
 */
before((done) => {
    // Turn off server logging for tests. Turning it on causes the output to be interlaced with the test log output,
    // making it hard to read
    winston.configure({
        transports: []
    });

    mockgo.getConnection((error, connection) => {
        db = connection;
        done();
    })
});

/**
 * Before each tests runs, create the server and the test fixture.
 */
beforeEach(() => {
    function createTestFixture(db: mongodb.Db): ServerOptions {
        const config: Config = {
            defaultPort: 3001,
            googleApiKey: "apiKey",
            googleValidClientIds: ["clientId1", "clientId2"],
            database: {
                url: ''
            }
        };
        return {
            db: db,
            config: config,
            google: new Google(config.googleApiKey, config.googleValidClientIds)
        }
    }

    testFixture = createTestFixture(db);
    server = createServer(testFixture);
});

/**
 * After each test runs, close the server and drop the entire database.
 */
afterEach(() => {
    server.close();
    return db.dropDatabase();
});