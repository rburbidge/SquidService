/**
 * Error information.
 */
module.exports = function(code, message) {
    /**
     * A programmatic error code.
     */
    this.code = code;

    /**
     * Detailed error message. 
     */
    this.message = message;
};