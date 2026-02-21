export const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
           req.socket?.remoteAddress ||
           req.connection?.remoteAddress ||
           'unknown';
};

export const isValidIp = (ip) => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};
