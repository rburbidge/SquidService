export interface Config {

    /** The server port that will be used if process.env.PORT is not defined. */
    defaultPort: number;

    /** The API key used for Google Cloud Messaging service. */
    googleApiKey: string;

    /**
     * A set of valid client Google client IDs. These correspond to the 'aud' field received in a Google ID or access
     * token.
     */
    googleValidClientIds: string[];

    /** The database config. */
    database: {
        /** The MongoDB name. */
        name: string;

        /** The MongoDB connection URL. */
        url: string;
    }
}

/** Throws an error iff the provided config is invalid. */
export function validateConfig(config: Config): void {
    assertIsDefined(config, 'defaultPort');
    assertIsDefined(config, 'googleApiKey');
    assertIsDefined(config, 'googleValidClientIds');
    assertIsDefined(config, 'database');
}

/** Throws an error if the value of key is undefined or null in object. */
function assertIsDefined(object: any, key: string) {
    const value = object[key];
    if(value === undefined || value === null) throw `'${key}' was not defined in ${process.env.NODE_ENV}.json`;
}