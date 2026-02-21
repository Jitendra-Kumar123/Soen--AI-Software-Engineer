export const validateEnv = () => {
    const required = ['PORT', 'MONGO_URI', 'JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    return true;
};
