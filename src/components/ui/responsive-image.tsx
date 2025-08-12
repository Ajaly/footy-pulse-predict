import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getFallbackTeamLogo } from '@/utils/validation';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  fallbackName?: string;
  className?: string;
  sizes?: string;
}

export const ResponsiveImage = ({ 
  src, 
  alt, 
  fallbackName, 
  className,
  sizes = "32px"
}: ResponsiveImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <img
        src={getFallbackTeamLogo(fallbackName)}
        alt={alt}
        className={cn("object-contain", className)}
        sizes={sizes}
      />
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "object-contain transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onError={handleError}
        onLoad={handleLoad}
        sizes={sizes}
        loading="lazy"
      />
    </div>
  );
};