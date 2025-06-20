class AuthError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'AuthError';
        this.statusCode = statusCode;
    }

    sendResponse(res) {
        return res.status(this.statusCode).json({
            status: 'error',
            message: this.message
        });
    }
}

module.exports = {
    AuthError
}; 