// client/src/components/ui/Avatar.tsx
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
    const [imgError, setImgError] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [useDefaultImage, setUseDefaultImage] = useState(false);

    useEffect(() => {
        if (imageUrl) {
            const url = getImageUrl(imageUrl, category, gender);
            setImageSrc(url);
            setImgError(false);
            setUseDefaultImage(false);
        } else {
            // Pas d'image URL, utiliser l'image par défaut selon le genre
            const defaultImg = getDefaultImage(gender, category === 'admin' ? 'admin' : 'member');
            setImageSrc(defaultImg);
            setUseDefaultImage(true);
            setImgError(false);
        }
    }, [imageUrl, category, gender]);

    const handleImageError = () => {
        if (!useDefaultImage) {
            // En cas d'erreur de chargement, passer à l'image par défaut
            const defaultImg = getDefaultImage(gender, category === 'admin' ? 'admin' : 'member');
            setImageSrc(defaultImg);
            setUseDefaultImage(true);
            setImgError(false);
        } else {
            // Si même l'image par défaut a une erreur, afficher les initiales
            setImgError(true);
        }
    };

    const getInitials = () => {
        if (firstName && lastName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase();
        }
        if (firstName) return firstName[0].toUpperCase();
        if (lastName) return lastName[0].toUpperCase();
        return '?';
    };

    // Afficher les initiales si erreur ou pas d'image
    if (imgError || !imageSrc) {
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
            <img
                src={imageSrc}
                alt={`${firstName || ''} ${lastName || ''}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
            />
        </div>
    );
};

export default Avatar;