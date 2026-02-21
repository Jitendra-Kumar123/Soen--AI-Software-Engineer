export const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

export const roundTo = (value, decimals) => {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};
