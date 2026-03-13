import { useState, useMemo } from 'react';

type SortOrder = 'asc' | 'desc';

interface UseSortProps<T> {
    data: T[];
    initialSortField?: keyof T;
    initialSortOrder?: SortOrder;
}

export const useSort = <T extends Record<string, any>>({
    data,
    initialSortField,
    initialSortOrder = 'asc'
}: UseSortProps<T>) => {
    const [sortField, setSortField] = useState<keyof T | undefined>(initialSortField);
    const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

    const sortedData = useMemo(() => {
        if (!sortField) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];

            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return sortOrder === 'asc' ? 1 : -1;
            if (bVal == null) return sortOrder === 'asc' ? -1 : 1;

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortOrder === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortField, sortOrder]);

    const toggleSort = (field: keyof T) => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    return {
        sortedData,
        sortField,
        sortOrder,
        toggleSort,
    };
};