export const getPagination = (page = 1, limit = 10) => {
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;
    
    return {
        page: parsedPage,
        limit: parsedLimit,
        skip: (parsedPage - 1) * parsedLimit
    };
};

export const getPaginationResponse = (page, limit, total) => {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
    };
};
