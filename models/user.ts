import { IGoogleUserInfo, IGoogleIdToken } from '../services/google'

export class User {
    /**
     * @param id Unique user ID.
     */
    private constructor(
        public readonly id,
        public readonly name: string,
        public readonly picture,
        public readonly email?,
        public readonly gender?:
        string) { }

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