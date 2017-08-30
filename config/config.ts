export interface Config {

    /** The server port that will be used if process.env.PORT is not defined. */
    defaultPort: number;

    /** The API key used to contact Google Cloud Messaging service. */
    googleApiKey: string;

    /** The database config. */
    database: {

        /** The MongoDB database connection URL. */
        url: string
    }
}