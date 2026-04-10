import { useState, useEffect } from 'react';
import { Gender } from '../lib/types';

const DEFAULT_IMAGES = {
  [Gender.MALE]: '/default-avatar-man.png',
  [Gender.FEMALE]: '/default-avatar-woman.png',
  admin: '/default-avatar-admin.png',
  default: '/default-avatar.png',
};

export const useImageWithFallback = (
  originalSrc: string | null | undefined,
  gender?: Gender,
  type: 'member' | 'admin' = 'member'
) => {
  const [imageSrc, setImageSrc] = useState<string>(() => {
    if (originalSrc) return originalSrc;
    if (type === 'admin') return DEFAULT_IMAGES.admin;
    if (gender === Gender.MALE) return DEFAULT_IMAGES[Gender.MALE];
    if (gender === Gender.FEMALE) return DEFAULT_IMAGES[Gender.FEMALE];
    return DEFAULT_IMAGES.default;
  });
  
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Réinitialiser les états quand la source change
    setHasError(false);
    setIsLoading(true);
    
    if (originalSrc) {
      setImageSrc(originalSrc);
    } else {
      // Utiliser l'image par défaut selon le genre
      if (type === 'admin') setImageSrc(DEFAULT_IMAGES.admin);
      else if (gender === Gender.MALE) setImageSrc(DEFAULT_IMAGES[Gender.MALE]);
      else if (gender === Gender.FEMALE) setImageSrc(DEFAULT_IMAGES[Gender.FEMALE]);
      else setImageSrc(DEFAULT_IMAGES.default);
      setIsLoading(false);
    }
  }, [originalSrc, gender, type]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Fallback vers l'image par défaut
      if (type === 'admin') setImageSrc(DEFAULT_IMAGES.admin);
      else if (gender === Gender.MALE) setImageSrc(DEFAULT_IMAGES[Gender.MALE]);
      else if (gender === Gender.FEMALE) setImageSrc(DEFAULT_IMAGES[Gender.FEMALE]);
      else setImageSrc(DEFAULT_IMAGES.default);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return { imageSrc, isLoading, hasError, handleError, handleLoad };
};