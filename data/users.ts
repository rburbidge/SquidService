import * as mongodb from 'mongodb';
import { DeviceType } from '../exposed/squid';
import { User } from './models/user';
import { IIdentity } from '../auth/iidentity';

/** The users database. */
export class Users {
    constructor(private readonly collection: mongodb.Collection) { }

    public addUser(user: IIdentity): Promise<boolean> {
        return this.getUser(user.id)
            .then(existingUser => {
                if(existingUser) {
                    return Promise.resolve(false);
                }

                const newUser: User = {
                    userId: user.id,
                    email: user.email,
                    name: user.name,
                    picture: user.picture,
                    gender: user.gender
                };
        
                // Delete any falsy properties to prevent them from being overwritten in the database
                for(let key in newUser) {
                    if(!newUser[key]) delete newUser[key];
                }

                return this.collection.updateOne({ userId: user.id }, newUser, { upsert: true })
                    .then(() => true);
            });
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