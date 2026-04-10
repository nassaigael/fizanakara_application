import React, { useState, useEffect } from 'react';
import { getImageUrl, getDefaultImage } from '../../lib/constant/constant';
import { Gender } from '../../lib/types';

interface AvatarProps {
    imageUrl?: string | null;
    firstName?: string;
    lastName?: string;
    gender?: Gender;
    category?: 'admin' | 'member' | 'assets';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    shape?: 'circle' | 'rounded';
    className?: string;
    onClick?: () => void;
}

const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
};

const shapeClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-lg',
};

export const Avatar: React.FC<AvatarProps> = ({
    imageUrl,
    firstName,
    lastName,
    gender,
    category = 'member',
    size = 'md',
    shape = 'circle',
    className = '',
    onClick,
}) => {
    const [imgSrc, setImgSrc] = useState<string>('');
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Réinitialiser les états quand l'URL change
        setHasError(false);
        setIsLoading(true);
        
        // Obtenir l'URL de l'image (avec fallback si pas d'image)
        const url = getImageUrl(imageUrl, category, gender);
        setImgSrc(url);
        
        // Si c'est une image locale, on peut considérer qu'elle est déjà chargée
        if (url.startsWith('/') || url.startsWith('data:')) {
            setIsLoading(false);
        }
    }, [imageUrl, category, gender]);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            // Fallback vers l'image par défaut
            const defaultImg = getDefaultImage(gender, category === 'admin' ? 'admin' : 'member');
            setImgSrc(defaultImg);
            setIsLoading(false);
        }
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    const getInitials = () => {
        if (firstName && lastName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase();
        }
        if (firstName) return firstName[0].toUpperCase();
        if (lastName) return lastName[0].toUpperCase();
        return '?';
    };

    // Si erreur ou pas d'image valide, afficher les initiales
    if (hasError || (!imgSrc && !imageUrl)) {
        return (
            <div
                onClick={onClick}
                className={`
                    ${sizeClasses[size]} 
                    ${shapeClasses[shape]} 
                    bg-[#E51A1A] 
                    flex items-center justify-center 
                    font-bold text-white
                    ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
                    ${className}
                `}
            >
                {getInitials()}
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={`
                ${sizeClasses[size]} 
                ${shapeClasses[shape]} 
                bg-gray-100 
                flex items-center justify-center 
                overflow-hidden 
                shadow-sm
                relative
                ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
                ${className}
            `}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-[#E51A1A] rounded-full animate-spin" />
                </div>
            )}
            
            <img
                src={imgSrc}
                alt={`${firstName || ''} ${lastName || ''}`}
                className="w-full h-full object-cover"
                onLoad={handleLoad}
                onError={handleError}
                style={{ display: isLoading ? 'none' : 'block' }}
            />
        </div>
    );
};

export default Avatar;