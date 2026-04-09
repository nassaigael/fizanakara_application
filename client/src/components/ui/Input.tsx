interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    className?: string;
    errorClassName?: string;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    className = '',
    errorClassName = '',
    ...props
}) => {
    const hasError = !!error;
    
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    className={`
                        w-full px-3 py-2.5 rounded-xl border-2 bg-white text-gray-800
                        transition-all duration-200 outline-none
                        ${icon ? 'pl-9' : 'pl-3'}
                        ${hasError 
                            ? `border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 ${errorClassName}` 
                            : `border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 ${className}`
                        }
                    `}
                    {...props}
                />
            </div>
            {hasError && (
                <p className="text-red-500 text-xs font-medium mt-1.5 ml-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;