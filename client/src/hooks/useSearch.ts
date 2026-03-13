import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface UseSearchProps<T> {
    data: T[];
    searchFields: (keyof T)[];
    initialSearch?: string;
    debounceMs?: number;
}

export const useSearch = <T extends Record<string, any>>({
    data,
    searchFields,
    initialSearch = '',
    debounceMs = 300
}: UseSearchProps<T>) => {
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const debouncedSearch = useDebounce(searchTerm, debounceMs);

    const filteredData = useMemo(() => {
        if (!debouncedSearch.trim()) return data;

        const lowerSearch = debouncedSearch.toLowerCase();
        
        return data.filter(item => {
            return searchFields.some(field => {
                const value = item[field];
                return value && String(value).toLowerCase().includes(lowerSearch);
            });
        });
    }, [data, debouncedSearch, searchFields]);

    return {
        searchTerm,
        setSearchTerm,
        filteredData,
        resultCount: filteredData.length,
    };
};