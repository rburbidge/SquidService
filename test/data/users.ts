import { testFixture } from '../setup';
import { Users } from '../../data/users';
import { Collection } from 'mongodb';
import { Identity } from '../../auth/identity';

import * as assert from 'assert';
import { IIdentity } from '../../auth/iidentity';
import { User } from '../../data/models/user';

describe('data/Users', () => {
    
    let collection: Collection<any>;
    let users: Users;

    beforeEach((done) => {
        testFixture.serverOptions.db.createCollection('users')
            .then(c => {
                collection = c;
                users = new Users(c);
                done();
            });
    })

    describe('addUser()', () => {
        it('Adds a user', (done) => {
            let input = createIdentity();
            let expected = createUser();
    
            users.addUser(input)
                .then(() => users.getUser(input.id))
                .then(actual => {
                    assert.deepEqual(actual, expected);
                    done();
                });
        });

        it('Only sets fields that are truthy', (done) => {
            // Add a new user with email missing, check that it is missing
            let input = createIdentity();
            delete input.email;
            let expected = createUser();
            delete expected.email;

            users.addUser(input)
                .then(() => users.getUser(input.id))
                .then(actual => {
                    assert.deepEqual(actual, expected);
                    done();
                });
        });

        it('Inputs fields that were previously null', (done) => {
            // Add a new user with email missing, then update it with the email
            let input = createIdentity();
            delete input.email;
            let expected = createUser();
            delete expected.email;

            users.addUser(input)
                .then(() => users.getUser(input.id))
                .then(actual => {
                    assert.deepEqual(actual, expected);

                    input.email = "foo@foo.foo";
                    expected.email = input.email;
                    return users.addUser(input);
                })
                .then(() => users.getUser(input.id))
                .then(updatedActual => {
                    assert.deepEqual(updatedActual, expected);
                    done();
                });
        });

        function createIdentity(): IIdentity {
            return {
                id: 'id',
                name: 'name',
                picture: 'picture',
                email: 'email',
                gender: 'gender'
            };
        }
        
        function createUser(): User {
            return {
                userId: 'id',
                name: 'name',
                picture: 'picture',
                email: 'email',
                gender: 'gender'
            }
        }
    });
});