const calculatePagination = (totalItems, page, limit) => {
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages || 1));
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;
    const nextPage = hasNextPage ? currentPage + 1 : null;
    const prevPage = hasPrevPage ? currentPage - 1 : null;

    return {
        currentPage,
        totalPages: totalPages || 0,
        totalItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage
    };
};

const getPaginationParams = (req) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    return {
        page: Math.max(1, page),
        limit: Math.max(1, Math.min(limit, 100))
    };
};

module.exports = {
    calculatePagination,
    getPaginationParams
};

