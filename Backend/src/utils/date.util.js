export const formatDate = (date) => {
    return new Date(date).toISOString();
};

export const getTimestamp = () => {
    return Date.now();
};

export const isExpired = (timestamp, expiryMs) => {
    return Date.now() - timestamp > expiryMs;
};
