
export const errorHandler = (error, request, response, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error"

    response.status(statusCode).json({
        error: {
            statusCode,
            message,
        }
    })
}

export class CustomerError extends Error{
    statusCode: number;
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode
    }
}