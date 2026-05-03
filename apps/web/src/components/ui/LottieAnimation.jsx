import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LottieAnimation({
  src,
  loop = true,
  autoplay = true,
  style = {},
  className = '',
  fallback = null
}) {
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    fetch(src)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load lottie');
        return res.json();
      })
      .then(data => {
        setAnimationData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Lottie load error:', err);
        setHasError(true);
        setIsLoading(false);
      });
  }, [src]);

  if (hasError) {
    return fallback || (
      <div 
        className={`flex items-center justify-center bg-[var(--border)] rounded-md ${className}`} 
        style={{ ...style, opacity: 0.5 }}
      >
        <span className="text-[10px] text-[var(--text-muted)]">!</span>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-full h-full rounded-full" />
        </div>
      )}
      
      {animationData && (
        <Lottie
          animationData={animationData}
          loop={loop}
          autoplay={autoplay}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  );
}
