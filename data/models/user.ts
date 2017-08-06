import Device from './device';

interface User {

    //TODO Scope these to Google
    /**
     * The user ID.
     */
    userId: string;

    /**
     * The user's devices.
     */
    devices: Device[];
}

export default User;