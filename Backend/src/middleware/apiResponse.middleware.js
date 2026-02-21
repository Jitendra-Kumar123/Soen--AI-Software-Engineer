export const apiResponse = (req, res, next) => {
    res.apiSuccess = (data, message = 'Success', statusCode = 200) => {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    };
    
    res.apiError = (message = 'Error', statusCode = 400, errors = null) => {
        return res.status(statusCode).json({
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString()
        });
    };
    
    next();
};
