import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
    data: T[];
    pageSize?: number;
    initialPage?: number;
}

export const usePagination = <T>({
    data,
    pageSize = 10,
    initialPage = 1
}: UsePaginationProps<T>) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSizeState, setPageSize] = useState(pageSize);

    const totalPages = Math.ceil(data.length / pageSizeState);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSizeState;
        const end = start + pageSizeState;
        return data.slice(start, end);
    }, [data, currentPage, pageSizeState]);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const nextPage = () => {
        goToPage(currentPage + 1);
    };

    const prevPage = () => {
        goToPage(currentPage - 1);
    };

    const changePageSize = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    return {
        currentPage,
        pageSize: pageSizeState,
        totalPages,
        paginatedData,
        goToPage,
        nextPage,
        prevPage,
        changePageSize,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
    };
};