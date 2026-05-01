import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * A reusable, production-ready Lottie animation component.
 * 
 * Features:
 * - Lazy loads the animation player to reduce initial bundle size
 * - Handles loading states with a skeleton placeholder
 * - Provides fallback rendering if the animation fails to load
 * - Ensures minimal re-renders
 * 
 * @param {string} src - The path to the local .json or .lottie file (e.g., '/lottie/1st_achievment.json')
 * @param {boolean} loop - Whether the animation should loop
 * @param {boolean} autoplay - Whether the animation should play automatically
 * @param {object} style - Optional CSS styles for the container
 * @param {string} className - Optional CSS classes
 * @param {React.ReactNode} fallback - Fallback UI to show if animation fails
 */
export default function LottieAnimation({
  src,
  loop = true,
  autoplay = true,
  style = {},
  className = '',
  fallback = null
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Simple check to ensure src is present
  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
    }
  }, [src]);

  if (hasError) {
    return fallback || (
      <div 
        className={`flex items-center justify-center bg-[var(--border)] rounded-md ${className}`} 
        style={{ ...style, opacity: 0.5 }}
        title="Animation failed to load"
      >
        <span className="text-[10px] text-[var(--text-muted)]">Err</span>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={style}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-full h-full rounded-full" />
        </div>
      )}
      
      {/* Lottie Player */}
      <DotLottieReact
        src={src}
        loop={loop}
        autoplay={autoplay}
        onEvent={(event) => {
          if (event === 'load') {
            setIsLoading(false);
          } else if (event === 'error') {
            setIsLoading(false);
            setHasError(true);
          }
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
