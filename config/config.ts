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

        /** The MongoDB database connection URL. */
        url: string
    }
}