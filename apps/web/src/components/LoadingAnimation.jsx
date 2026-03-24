import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import animationData from '../assets/animations/loader.json';

const LoadingAnimation = ({ fullScreen = true, size = 150 }) => {
  const content = (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? '' : 'p-8'}`}>
      <div style={{ width: size, height: size }}>
        <DotLottieReact
          data={animationData}
          loop
          autoplay
        />
      </div>
      <p className="text-zinc-500 font-medium tracking-wide mt-4 animate-pulse">
        Loading...
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center">
            {content}
        </div>
      </div>
    );
  }

  return content;
};

export default LoadingAnimation;
