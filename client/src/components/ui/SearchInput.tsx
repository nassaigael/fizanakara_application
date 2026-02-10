import React from 'react';
import { AiOutlineSearch, AiOutlineClose } from 'react-icons/ai';

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
	value,
	onChange,
	placeholder = "Rechercher...",
	className = "",
}) => {
	return (
		<div className={`relative ${className}`}>
			<div className="relative">
				<AiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
				<input
					type="text"
					placeholder={placeholder}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="
						w-full
						pl-12 pr-10 py-3
						rounded-xl
						border-2 border-gray-300
						focus:outline-none
						focus:border-red-500
						focus:ring-2 focus:ring-red-100
						bg-white
						text-gray-900
						placeholder-gray-400
						shadow-sm hover:shadow
						transition-all duration-200
					"
				/>
				{value && (
					<button
						onClick={() => onChange("")}
						className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
					>
						<AiOutlineClose size={18} />
					</button>
				)}
			</div>
		</div>
	);
};