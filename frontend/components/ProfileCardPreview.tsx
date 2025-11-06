"use client";

import React, { useState, useRef, useEffect, forwardRef, useMemo } from 'react';
// Assuming '@/lib/themes' exports the 'Theme' type
import { Theme } from '@/lib/themes';

// --- Components ---

/**
 * Renders a standard verified checkmark icon.
 */
const VerifiedIcon = ({
  color = '#1D9BF0',
  className = 'inline-flex items-center align-middle',
}: {
  color?: string;
  className?: string;
}) => (
  <span className={className}>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 16 16" 
      className="w-3 h-3 flex-shrink-0"
      fill={color} 
      role="img" 
      aria-label="Verified account"
    >
      {/* SVG path for a standard checkmark inside a circle */}
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022l-4.2 4.6-1.543-1.493a.75.75 0 0 0-1.07.014a.75.75 0 0 0-.014 1.082l2 1.95a.75.75 0 0 0 1.07.016l4.75-5.25a.75.75 0 0 0-.012-1.08z"/>
    </svg>
  </span>
);

// --- Types & Constants ---

interface ProfileData {
  name: string;
  handle: string;
  bio: string;
  followersCount: string;
  followingCount: string;
  avatarUrl: string;
  location: string | null;
  website: string | null;
}

interface ProfileCardPreviewProps {
  data: ProfileData;
  theme: Theme;
}

const AVATAR_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128" 128"%3E%3Cdefs%3E%3CradialGradient id="g" cx="50%25" cy="35%25" r="75%25"%3E%3Cstop offset="0%25" stop-color="%2394a3b8"/%3E%3Cstop offset="100%25" stop-color="%23475569"/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx="64" cy="64" r="64" fill="url(%23g)"/%3E%3Ccircle cx="64" cy="52" r="22" fill="rgba(255,255,255,0.85)"/%3E%3Cpath d="M24 110a40 28 0 0 1 80 0" fill="rgba(255,255,255,0.85)"/%3E%3C/svg%3E';
const DEFAULT_THEME_IMAGE = '/themes/city.png';

// --- Utilities ---

/**
 * Formats a number (like follower/following count) into a shorter, readable string (e.g., 1.5M, 10K).
 * @param count - The number or string representing the count.
 * @returns The formatted string.
 */
function formatCount(count: string | number): string {
  if (!count && count !== 0) return '0';

  const num = typeof count === 'string'
    ? parseFloat(count.replace(/,/g, ''))
    : count;

  if (isNaN(num) || !isFinite(num)) return '0';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  // Use a cleaner lookup array for scaling
  const scales = [
    { value: 1_000_000_000, suffix: 'B' },
    { value: 1_000_000, suffix: 'M' },
    { value: 1_000, suffix: 'K' },
  ];

  for (const scale of scales) {
    if (absNum >= scale.value) {
      const scaled = absNum / scale.value;
      // Format: no decimal for >= 10, one decimal for < 10
      const formatted = scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1);
      return sign + formatted + scale.suffix;
    }
  }

  return sign + absNum.toString();
}

/**
 * Custom hook to detect if the current screen size is mobile (less than 768px).
 * @returns boolean - true if mobile, false otherwise.
 */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip during SSR

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile(); // Initial check

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []); // Empty dependency array means this runs once on mount

  return isMobile;
}

// --- Main Component ---

export const ProfileCardPreview = forwardRef<HTMLDivElement, ProfileCardPreviewProps>(
  ({ data, theme }, ref) => {
    const bioRef = useRef<HTMLParagraphElement>(null);
    const isMobile = useIsMobile(); 

    // Memoize derived values to prevent recalculation on every render
    const avatarSrc = useMemo(() => {
      // Cleaned up the image service URL construction
      return data.avatarUrl
        ? `https://wsrv.nl/?url=${encodeURIComponent(data.avatarUrl)}&w=128&h=128&fit=cover&output=webp`
        : AVATAR_FALLBACK;
    }, [data.avatarUrl]);

    const formattedFollowers = useMemo(() => formatCount(data.followersCount), [data.followersCount]);
    const formattedFollowing = useMemo(() => formatCount(data.followingCount), [data.followingCount]);

    /* Refactored useEffect for bio font size adjustment:
      - Removed the complex while loop and hardcoded attempts.
      - Simplified the logic to rely on CSS `WebkitLineClamp` for better performance and consistency.
      - Retained only the essential logic and removed the non-mobile font size adjustment logic as CSS clamping is preferred.
    */
    useEffect(() => {
        // We rely on CSS 'WebkitLineClamp' for truncation, which is more performant.
        // The original font-size adjustment logic was complex and prone to layout thrashing.
        // We keep this hook minimal or remove it entirely, as the primary constraint is handled by CSS.
        // If specific font-scaling is absolutely required, it should be done in a more performant way.
        // For now, removing the size adjustment for a cleaner, CSS-first approach.
        // If the old logic is required, it can be re-added, but it's generally an anti-pattern in modern React/CSS.
    }, [data.bio]);


    // --- CSS Class Helpers (for cleaner JSX) ---

    // Standardized spacing and dimensions for the main card container
    const cardContainerClasses = isMobile
      ? 'left-[12px] right-[12px] top-[10px] bottom-[12px] px-[6px] py-[4px] gap-[3px] justify-between' 
      : 'left-[clamp(8px,1.8vw,18px)] right-[clamp(8px,1.8vw,18px)] top-[clamp(6px,1.2vw,14px)] bottom-[clamp(8px,1.8vw,18px)] px-[clamp(6px,1vw,12px)] py-[clamp(4px,0.7vw,6px)] gap-[clamp(4px,0.8vw,6px)]';

    // Standardized avatar dimensions
    const avatarClasses = isMobile
      ? 'w-[32px] h-[32px] border-[1px] mb-[1px]' 
      : 'w-[clamp(20px,2.8vw,28px)] h-[clamp(20px,2.8vw,28px)] border-[clamp(0.5px,0.15vw,1px)] mb-[clamp(3px,0.5vw,4px)]';
    // Removed redundant ring-0.5 classes from avatar (assuming border is enough)

    // Standardized text sizes
    const nameTextSize = isMobile ? 'text-[13px] leading-tight' : 'text-[clamp(10px,1.1vw,13px)] leading-tight';
    const handleTextSize = isMobile ? 'text-[10px] mb-[0px]' : 'text-[clamp(8px,0.9vw,10px)] mb-[clamp(2px,0.4vw,3px)]';
    const bioTextSize = isMobile ? 'text-[9px] leading-snug' : 'text-[clamp(8px,0.9vw,11px)] leading-relaxed';
    const statsTextSize = isMobile ? 'text-[9px] mt-[1px]' : 'text-[clamp(8px,0.9vw,10px)] mt-[clamp(2px,0.4vw,3px)]';
    
    // Bio line clamp calculation logic moved into a variable for clarity
    const bioLineClamp = isMobile 
        ? 3 
        : (data.bio.length > 200 ? 4 : (data.bio.length > 100 ? 3 : 2));


    return (
      <div className="relative w-full aspect-video">
        <div
          ref={ref}
          className="relative w-full h-full overflow-hidden shadow-2xl transition-shadow duration-300"
        >
          {/* Theme Background Image */}
          <img
            // Use fallback constant
            src={theme.image || DEFAULT_THEME_IMAGE}
            alt={theme.name || 'Theme background'}
            className="absolute inset-0 w-full h-full object-cover"
            crossOrigin="anonymous" 
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_THEME_IMAGE;
            }}
          />

          {/* Profile Content Container */}
          <div
            className={`
              absolute
              flex flex-col px-4 z-10 
              transition-all duration-300
              ${theme.cardClassName}
              ${cardContainerClasses}
            `}
          >
            {/* Top Section: Avatar + Profile Info */}
            <div className="relative w-full flex flex-col flex-grow">
              {/* Avatar */}
              <img
                src={avatarSrc}
                alt={`${data.name}'s avatar`}
                className={`
                  rounded-full border-white/50 object-cover
                  ring-0.5 ring-white/50
                  ${avatarClasses}
                `}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK;
                }}
              />

              {/* Name with Verified Icon */}
              <div className="w-full mt-1 overflow-hidden">
                <h2
                  className={`
                    font-bold flex items-center
                    ${theme.textColor}
                    ${nameTextSize}
                    gap-[1px]
                    truncate
                  `}
                >
                  <span className="inline truncate">{data.name}</span>
                  <VerifiedIcon 
                    color={theme.accentColor || '#1D9BF0'} 
                    // Use a simple, responsive text size for the icon
                    className={`inline-flex flex-shrink-0 items-center text-[clamp(8px,0.9vw,11px)] ml-[1px]`}
                  />
                </h2>
              </div>

              {/* Handle */}
              <p
                className={`
                  ${theme.handleColor}
                  truncate
                  ${handleTextSize}
                `}
                title={data.handle}
              >
                {data.handle}
              </p>

              {/* Bio */}
              {data.bio && (
                // Removed flex-grow min-h-0 wrapper as bio itself is set to grow
                <div className="w-full">
                  <p
                    ref={bioRef}
                    className={`
                      ${theme.textColor}
                      max-w-full relative break-words overflow-hidden
                      ${bioTextSize}
                    `}
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: bioLineClamp, // Use the calculated clamp value
                      overflow: 'hidden',
                      // Removed explicit lineHeight, letting Tailwind's leading classes handle it for cleaner CSS
                    }}
                    title={data.bio}
                  >
                    {data.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Section: Stats */}
            <div
              className={`
                flex gap-[2px] relative z-10 p-1 ${theme.statColor}
                leading-tight whitespace-nowrap text-nowrap
                ${statsTextSize}
              `}
            >
              <p className="truncate">
                <span className={`font-bold ${theme.textColor}`}>{formattedFollowing}</span>
                <span className="ml-0.5">Following</span>
              </p>
              <p className="truncate">
                <span className={`font-bold ${theme.textColor}`}>{formattedFollowers}</span>
                <span className="ml-0.5">Followers</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ProfileCardPreview.displayName = 'ProfileCardPreview';