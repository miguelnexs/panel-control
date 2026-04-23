import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackIcon?: React.ReactNode;
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt, className, fallbackIcon, ...props }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 ${className}`}>
        {fallbackIcon || <ImageIcon className="w-1/3 h-1/3 opacity-20" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
};

export default SafeImage;
