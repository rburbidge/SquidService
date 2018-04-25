import { IGoogleUserInfo, IGoogleIdToken } from '../services/google'

/** An identity object that is created during authentication. */
export class User {
    /**
     * @param id Unique user ID.
     */
    private constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly picture: string,
        public readonly email?: string,
        public readonly gender?: string) { }

    /** The prefix used on Google IDs */
    private static GoogleIdPrefix = "google-";

    /**
     * Creates a new user from a Google user info.
     * The Google ID is scoped with "google-" prefix.
     */
    public static fromUserInfo(userInfo: IGoogleUserInfo): User {
        return new User(User.GoogleIdPrefix + userInfo.sub, userInfo.name, userInfo.picture, userInfo.email, userInfo.gender);
    }

    /**
     * Creates a new user from a Google ID token.
     * The Google ID is scoped with "google-" prefix.
     */
    public static fromIdToken(token: IGoogleIdToken): User {
        return new User(User.GoogleIdPrefix + token.sub, token.name, token.picture);
    }
}