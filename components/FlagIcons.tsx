import React from 'react';
import { Language } from '../types';

interface FlagIconProps {
  code: Language;
  className?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ code, className = "w-6 h-6" }) => {
  const clipId = `flag-clip-${code}`;
  
  // Base Wrapper: Circular Clip, Border, and Shadow
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className={className}>
      <defs>
        <clipPath id={clipId}>
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {/* Default background to prevent transparency artifacts */}
        <rect width="32" height="32" fill="#f8fafc" />
        {children}
      </g>
      {/* Inner border for definition */}
      <circle cx="16" cy="16" r="15.5" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      <circle cx="16" cy="16" r="15.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
    </svg>
  );

  switch (code) {
    case 'en': // United Kingdom
      return (
        <Wrapper>
          <rect width="32" height="32" fill="#012169" />
          <path d="M0,0 L32,32 M32,0 L0,32" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 L32,32 M32,0 L0,32" stroke="#C8102E" strokeWidth="2" />
          <path d="M16,0 V32 M0,16 H32" stroke="#fff" strokeWidth="10" />
          <path d="M16,0 V32 M0,16 H32" stroke="#C8102E" strokeWidth="6" />
        </Wrapper>
      );
    case 'ar': // Saudi Arabia
      return (
        <Wrapper>
          <rect width="32" height="32" fill="#16913e" />
          {/* Stylized Shahada */}
          <path d="M8,10 C10,10 12,12 14,12 C16,12 18,10 20,10 M10,14 C12,14 14,12 16,12" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
          {/* Sword */}
          <path d="M8,22 L24,22" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <path d="M9,22 L9,24 M11,22 L11,24" stroke="#fff" strokeWidth="1" />
        </Wrapper>
      );
    case 'es': // Spain
      return (
        <Wrapper>
          <rect width="32" height="32" fill="#AA151B" />
          <rect y="8" width="32" height="16" fill="#F1BF00" />
          {/* Simplified Coat of Arms position */}
          <circle cx="8" cy="16" r="3" fill="#AA151B" opacity="0.8" />
        </Wrapper>
      );
    case 'fr': // France
      return (
        <Wrapper>
          <rect width="10.7" height="32" fill="#0055A4" />
          <rect x="10.7" width="10.6" height="32" fill="#fff" />
          <rect x="21.3" width="10.7" height="32" fill="#EF4135" />
        </Wrapper>
      );
    case 'de': // Germany
      return (
        <Wrapper>
          <rect width="32" height="10.7" fill="#000" />
          <rect y="10.7" width="32" height="10.6" fill="#DD0000" />
          <rect y="21.3" width="32" height="10.7" fill="#FFCE00" />
        </Wrapper>
      );
    case 'hi': // India
      return (
        <Wrapper>
          <rect width="32" height="10.7" fill="#FF9933" />
          <rect y="10.7" width="32" height="10.6" fill="#fff" />
          <rect y="21.3" width="32" height="10.7" fill="#138808" />
          <circle cx="16" cy="16" r="3.5" fill="none" stroke="#000080" strokeWidth="1" />
          <g stroke="#000080" strokeWidth="0.5">
            <path d="M16,12.5 v7" />
            <path d="M12.5,16 h7" />
            <path d="M13.5,13.5 l5,5" />
            <path d="M13.5,18.5 l5,-5" />
          </g>
        </Wrapper>
      );
    case 'it': // Italy
      return (
        <Wrapper>
          <rect width="10.7" height="32" fill="#009246" />
          <rect x="10.7" width="10.6" height="32" fill="#fff" />
          <rect x="21.3" width="10.7" height="32" fill="#CE2B37" />
        </Wrapper>
      );
    case 'pl': // Poland
      return (
        <Wrapper>
          <rect width="32" height="16" fill="#fff" />
          <rect y="16" width="32" height="16" fill="#DC143C" />
        </Wrapper>
      );
    case 'pt': // Portugal
      return (
        <Wrapper>
          <rect width="32" height="32" fill="#FF0000" />
          <rect width="12" height="32" fill="#006600" />
          {/* Armillary sphere */}
          <circle cx="12" cy="16" r="5" fill="#FFC400" />
          <circle cx="12" cy="16" r="3" fill="#fff" />
          <rect x="10.5" y="14.5" width="3" height="3" fill="#FF0000" rx="0.5" />
        </Wrapper>
      );
    case 'zh-CN': // CPC Emblem (Hammer and Sickle)
      return (
        <Wrapper>
          <rect width="32" height="32" fill="#DE2910" />
          {/* Official Geometric Construction style */}
          <g transform="translate(16, 16) scale(0.045)">
             {/* Hammer: Rotated -45deg equivalent roughly */}
             {/* Head */}
             <path d="M-150,-50 L-90,10 L-60,-20 L-120,-80 Z" fill="#FFDE00" />
             {/* Handle */}
             <path d="M-105,-65 L100,140 A15,15 0 0,0 120,120 L-85,-85 Z" fill="#FFDE00" />
             
             {/* Sickle */}
             {/* Blade circle minus inner circle */}
             <path d="M-10,140 A100,100 0 1,1 120,-50 L100,-30 A75,75 0 1,0 10,120 Z" fill="#FFDE00" transform="rotate(-15)" />
             {/* Handle */}
             <path d="M10,120 L10,170 A15,15 0 0,0 40,170 L40,120 Z" fill="#FFDE00" transform="rotate(-15)" />
          </g>
        </Wrapper>
      );
    case 'zh-TW': // Taiwan (Blue Sky, White Sun, Red Earth)
      return (
        <Wrapper>
          <rect width="32" height="32" fill="#FE0000" />
          <rect width="16" height="16" fill="#000095" />
          {/* Sun Body */}
          <circle cx="8" cy="8" r="3.5" fill="#fff" />
          {/* 12 Rays */}
          <g transform="translate(8,8)" fill="#fff">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
               <polygon key={deg} points="-0.8,-5.5 0.8,-5.5 0,-3.5" transform={`rotate(${deg})`} />
            ))}
          </g>
        </Wrapper>
      );
    case 'ja': // Japan
      return (
        <Wrapper>
          <rect width="32" height="32" fill="#fff" />
          <circle cx="16" cy="16" r="9" fill="#BC002D" />
        </Wrapper>
      );
    case 'ko': // South Korea
      return (
        <Wrapper>
          <rect width="32" height="32" fill="#fff" />
          
          {/* Taegeuk (Center) */}
          <g transform="translate(16, 16) rotate(-33.7) scale(0.6)">
            <path d="M0,-12 A12,12 0 1,1 0,12 A12,12 0 1,1 0,-12" fill="none" />
            <path d="M12,0 A12,12 0 0,0 -12,0 A6,6 0 0,1 0,0 A6,6 0 0,0 12,0" fill="#0047A0" />
            <path d="M-12,0 A12,12 0 0,1 12,0 A6,6 0 0,0 0,0 A6,6 0 0,1 -12,0" fill="#CD2E3A" />
          </g>
          
          {/* Trigrams (4 Corners) */}
          <g fill="#000">
             {/* Top Left (Geon) 3 Solid */}
             <g transform="translate(5, 5) rotate(135)">
                <rect x="-4" y="-3" width="8" height="1.2" />
                <rect x="-4" y="-0.6" width="8" height="1.2" />
                <rect x="-4" y="1.8" width="8" height="1.2" />
             </g>
             {/* Bottom Right (Gon) 3 Broken */}
             <g transform="translate(27, 27) rotate(135)">
                <rect x="-4" y="-3" width="3.5" height="1.2" /> <rect x="0.5" y="-3" width="3.5" height="1.2" />
                <rect x="-4" y="-0.6" width="3.5" height="1.2" /> <rect x="0.5" y="-0.6" width="3.5" height="1.2" />
                <rect x="-4" y="1.8" width="3.5" height="1.2" /> <rect x="0.5" y="1.8" width="3.5" height="1.2" />
             </g>
             {/* Top Right (Gam) Broken-Solid-Broken */}
             <g transform="translate(27, 5) rotate(-135)">
                <rect x="-4" y="-3" width="3.5" height="1.2" /> <rect x="0.5" y="-3" width="3.5" height="1.2" />
                <rect x="-4" y="-0.6" width="8" height="1.2" />
                <rect x="-4" y="1.8" width="3.5" height="1.2" /> <rect x="0.5" y="1.8" width="3.5" height="1.2" />
             </g>
             {/* Bottom Left (Ri) Solid-Broken-Solid */}
             <g transform="translate(5, 27) rotate(-45)">
                <rect x="-4" y="-3" width="8" height="1.2" />
                <rect x="-4" y="-0.6" width="3.5" height="1.2" /> <rect x="0.5" y="-0.6" width="3.5" height="1.2" />
                <rect x="-4" y="1.8" width="8" height="1.2" />
             </g>
          </g>
        </Wrapper>
      );
    default:
      return (
        <Wrapper>
          <rect width="32" height="32" fill="#cbd5e1" />
          <text x="16" y="22" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#64748b">?</text>
        </Wrapper>
      );
  }
};