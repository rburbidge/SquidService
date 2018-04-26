import { testFixture } from '../setup';
import { Users } from '../../data/users';
import { Collection } from 'mongodb';
import { Identity } from '../../auth/identity';

import * as assert from 'assert';
import { IIdentity } from '../../auth/iidentity';
import { User } from '../../data/models/user';

describe('Users', () => {
    
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
            let input: IIdentity = {
                id: 'id',
                name: 'name',
                picture: 'picture',
                email: 'email',
                gender: 'gender'
            };
            let expected: User = {
                userId: input.id,
                email: input.email,
                name: input.name,
                picture: input.picture,
                gender: input.gender
            };
    
            users.addUser(input)
            .then(() => users.getUser('id'))
            .then(actual => {
                assert.deepEqual(actual, expected);
                done();
            });
        });
    });
});