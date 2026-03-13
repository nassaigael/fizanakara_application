import React from 'react';
import { PageLoader } from './ui/PageLoader';

interface PageWrapperProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  title,
  description,
  isLoading = false,
  loadingMessage = 'Chargement en cours...',
  error,
  children,
  className = ''
}) => {
  if (isLoading) {
    return <PageLoader message={loadingMessage} />;
  }

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-base text-gray-600">
            {description}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-in fade-in">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      )}

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
