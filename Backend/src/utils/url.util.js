export const parseQueryParams = (query) => {
    const params = {};
    for (const [key, value] of Object.entries(query)) {
        if (value === 'true') params[key] = true;
        else if (value === 'false') params[key] = false;
        else if (!isNaN(value)) params[key] = Number(value);
        else params[key] = value;
    }
    return params;
};

export const buildQueryString = (params) => {
    return Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
};
