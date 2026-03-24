import React from 'react';

/**
 * FocusFlow Logo Components
 * These SVGs use currentColor so they adapt to the theme (text-primary, etc.)
 */

export const LogoMark = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))' }}
  >
    {/* Combined Capsule + Hole using fill-rule="evenodd" */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      stroke="currentColor"
      strokeWidth="0.5"
      d="M32 15C24.268 15 18 21.268 18 29V71C18 78.732 24.268 85 32 85C39.732 85 46 78.732 46 71V29C46 21.268 39.732 15 32 15ZM32 37C36.4183 37 40 33.4183 40 29C40 24.5817 36.4183 21 32 21C27.5817 21 24 24.5817 24 29C24 33.4183 27.5817 37 32 37Z"
      fill="currentColor"
    />
    {/* Dots */}
    <circle cx="68" cy="30" r="12" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="68" cy="62" r="12" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
  </svg>
);

export const LogoWordmark = ({ height = 32, className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`} style={{ height }}>
    <LogoMark size={height * 0.8} />
    <span style={{ 
      fontSize: height * 0.65, 
      fontWeight: 800, 
      letterSpacing: '-0.02em',
      color: 'currentColor',
      fontFamily: 'Inter, sans-serif'
    }}>
      FocusFlow
    </span>
  </div>
);

export const AppLogo = ({ size = 40, className = "" }) => (
  <div 
    className={`flex items-center justify-center rounded-xl bg-primary shadow-sm ${className}`}
    style={{ width: size, height: size }}
  >
    <LogoMark size={size * 0.6} className="text-primary-foreground" />
  </div>
);

export default LogoMark;
