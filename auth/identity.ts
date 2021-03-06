import { IGoogleUserInfo, IGoogleIdToken } from '../services/google'
import { IIdentity } from './iidentity';

/** An identity object that is created during authentication. */
export class Identity implements IIdentity {
    /** The prefix used on Google IDs */
    private static GoogleIdPrefix = "google-";
    
    public readonly id: string;

    /**
     * @param id Unique user ID.
     */
    private constructor(
        id: string,
        public readonly name: string,
        public readonly picture: string,
        public readonly email?: string,
        public readonly gender?: string)
    {
        this.id = Identity.GoogleIdPrefix + id;
    }

    /**
     * Creates a new user from a Google user info.
     * The Google ID is scoped with "google-" prefix.
     */
    public static fromUserInfo(userInfo: IGoogleUserInfo): Identity {
        return new Identity(userInfo.sub, userInfo.name, userInfo.picture, userInfo.email, userInfo.gender);
    }

    /**
     * Creates a new user from a Google ID token.
     * The Google ID is scoped with "google-" prefix.
     */
    public static fromIdToken(token: IGoogleIdToken): Identity {
        return new Identity(token.sub, token.name, token.picture, token.email);
    }
}