import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function Logo({ className = "size-8", ...props }: LogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="brandGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
        <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#c2410c" floodOpacity="0.6" />
        </filter>
      </defs>

      <rect x="64" y="64" width="384" height="384" rx="96" fill="url(#brandGradient)" />
      
      <path 
        d="M64 160 C64 107 107 64 160 64 L352 64 C405 64 448 107 448 160 L448 180 C448 127 405 84 352 84 L160 84 C107 84 64 127 64 180 Z" 
        fill="#ffffff" 
        opacity="0.25" 
      />

      <g filter="url(#innerShadow)" stroke="#ffffff" strokeWidth="56" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M 160 176 L 240 256 L 160 336" />
        <path d="M 272 336 L 352 336" />
      </g>
    </svg>
  );
}
