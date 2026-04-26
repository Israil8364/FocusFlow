import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import animationData from '../assets/animations/loader.json';

const LoadingAnimation = ({ fullScreen = true, size = 150 }) => {
  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]' : 'flex items-center justify-center p-4'}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin"></div>
        {fullScreen && <p className="text-sm font-medium text-[var(--text-muted)] animate-pulse">Loading FocusFlow...</p>}
      </div>
    </div>
  );
};

export default LoadingAnimation;
