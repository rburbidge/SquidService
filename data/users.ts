import User from './models/user';

export default class Users {
    private users: { [id: string]: User; } = {};

    public addUser(id: string): User {
        if (!this.users[id]) {
            console.log('Adding new user');
            this.users[id] = new User();
            console.log('New user added');
        }
        return this.users[id];
    }

    public getUser(id: string): User {
        return this.users[id];
    }
}