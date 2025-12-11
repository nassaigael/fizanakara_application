import React from 'react';
import { AiOutlineSearch, AiOutlineClose } from 'react-icons/ai';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    onSearch?: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder = "Rechercher...",
    className = "",
    onSearch,
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
        onSearch?.(e.target.value);
    };

    const handleClear = () => {
        onChange("");
        onSearch?.("");
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="relative">
                <AiOutlineSearch 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    size={20} 
                />
                
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    className="
                        w-full
                        pl-12 pr-10 py-3 md:py-4
                        rounded-xl md:rounded-2xl
                        border-2 border-gray-300
                        focus:outline-none
                        focus:border-brand-primary
                        focus:ring-2 focus:ring-brand-primary/20
                        bg-white
                        text-gray-900 text-sm md:text-base
                        placeholder-gray-400
                        shadow-sm hover:shadow
                        transition-all duration-200
                    "
                />
                
                {value && (
                    <button
                        onClick={handleClear}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Effacer la recherche"
                    >
                        <AiOutlineClose size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};