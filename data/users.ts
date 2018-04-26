import * as mongodb from 'mongodb';
import { DeviceType } from '../exposed/squid';
import { User } from './models/user';
import { IIdentity } from '../auth/iidentity';

/** The users database. */
export class Users {
    constructor(private readonly collection: mongodb.Collection) { }

    public addUser(user: IIdentity): Promise<boolean> {
        const newUser: User = {
            userId: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            gender: user.gender
        };

        return this.collection.updateOne({ userId: user.id }, newUser, { upsert: true })
            .then(result => result.modifiedCount > 0 || result.upsertedCount > 0);
    }

    public getUser(id: string) : Promise<User> {
        return this.collection.findOne({ userId: id })
            .then(user => {
                if(!user) return user;

                delete user._id;
                return user;
            });
    }
}