export default  interface IConfig {

    /** The server port that will be used if process.env.PORT is not defined. */
    defaultPort: number;

    /** The database config. */
    database: {

        /** The MongoDB database connection URL. */
        url: string
    }
}