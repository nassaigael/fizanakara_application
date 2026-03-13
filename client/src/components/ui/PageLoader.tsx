import React from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface PageLoaderProps {
    message?: string;
    fullScreen?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ 
    message = 'Chargement...',
    fullScreen = false 
}) => {
    const containerClasses = fullScreen 
        ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50'
        : 'w-full h-64';

    return (
        <div className={`${containerClasses} flex flex-col items-center justify-center`}>
            <div className="flex flex-col items-center gap-4">
                <AiOutlineLoading3Quarters 
                    size={40} 
                    className="text-brand-primary animate-spin" 
                />
                <p className="text-sm font-medium text-gray-600">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default PageLoader;