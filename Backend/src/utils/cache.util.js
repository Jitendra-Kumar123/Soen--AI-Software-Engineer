const cache = new Map();

export const setCache = (key, value, ttl = 300000) => {
    cache.set(key, {
        value,
        expiry: Date.now() + ttl
    });
};

export const getCache = (key) => {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }
    return item.value;
};

export const deleteCache = (key) => {
    cache.delete(key);
};

export const clearCache = () => {
    cache.clear();
};
