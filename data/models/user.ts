import { Device } from './device';

/** A user in the database. */
export interface User {
    /**
     * The user ID.
     */
    userId: string;

    /**
     * The user's devices.
     */
    devices: Device[];
}