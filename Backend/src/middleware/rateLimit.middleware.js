const requestCounts = new Map();

export const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!requestCounts.has(key)) {
            requestCounts.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }
        
        const userRequests = requestCounts.get(key);
        
        if (now > userRequests.resetTime) {
            requestCounts.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }
        
        if (userRequests.count >= maxRequests) {
            return res.status(429).json({ 
                message: 'Too many requests, please try again later' 
            });
        }
        
        userRequests.count++;
        next();
    };
};
