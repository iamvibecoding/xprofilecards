// components/ProfileCardPreview.tsx - Full Content

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Theme } from '@/lib/themes';
import { PatchCheckFill } from 'react-bootstrap-icons';

const VerifiedIcon = ({
  color = '#1D9BF0',
  className = 'inline-flex items-center align-middle',
}: {
  color?: string;
  className?: string;
}) => (
  <span className={className}>
    <PatchCheckFill color={color} role="img" aria-label="Verified account" />
  </span>
);

interface ProfileCardPreviewProps {
  data: {
    name: string;
    handle: string;
    bio: string;
    followersCount: string;
    followingCount: string;
    avatarUrl: string;
    location: string | null;
    website: string | null;
  };
  theme: Theme;
}

const AVATAR_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128" 128"%3E%3Cdefs%3E%3CradialGradient id="g" cx="50%25" cy="35%25" r="75%25"%3E%3Cstop offset="0%25" stop-color="%2394a3b8"/%3E%3Cstop offset="100%25" stop-color="%23475569"/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx="64" cy="64" r="64" fill="url(%23g)"/%3E%3Ccircle cx="64" cy="52" r="22" fill="rgba(255,255,255,0.85)"/%3E%3Cpath d="M24 110a40 28 0 0 1 80 0" fill="rgba(255,255,255,0.85)"/%3E%3C/svg%3E';

function formatCount(count: string | number): string {
  if (!count && count !== 0) return '0';

  const num = typeof count === 'string'
    ? parseFloat(count.replace(/,/g, ''))
    : count;

  if (isNaN(num) || !isFinite(num)) return '0';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1_000_000_000) {
    const billions = absNum / 1_000_000_000;
    return sign + (billions >= 10 ? billions.toFixed(0) : billions.toFixed(1)) + 'B';
  }

  if (absNum >= 1_000_000) {
    const millions = absNum / 1_000_000;
    return sign + (millions >= 10 ? millions.toFixed(0) : millions.toFixed(1)) + 'M';
  }

  if (absNum >= 1_000) {
    const thousands = absNum / 1_000;
    return sign + (thousands >= 10 ? thousands.toFixed(0) : thousands.toFixed(1)) + 'K';
  }

  return sign + absNum.toString();
}

export const ProfileCardPreview = React.forwardRef<HTMLDivElement, ProfileCardPreviewProps>(
  ({ data, theme }, ref) => {
    const bioRef = useRef<HTMLParagraphElement>(null);
    
    function useIsMobile(): boolean {
      const [isMobile, setIsMobile] = useState(false);

      useEffect(() => {
        if (typeof window !== 'undefined') {
          setIsMobile(window.innerWidth < 768);

          const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
          };

          window.addEventListener('resize', handleResize);
          return () => window.removeEventListener('resize', handleResize);
        }
        return () => {}; 
      }, []);

      return isMobile;
    }
    
    const isMobile = useIsMobile(); 

    useEffect(() => {
      if (bioRef.current && data.bio && !isMobile) {
        const maxHeight = bioRef.current.parentElement?.offsetHeight || 100;
        const scrollHeight = bioRef.current.scrollHeight;

        if (scrollHeight > maxHeight * 1.15) {
          let fontSize = parseFloat(window.getComputedStyle(bioRef.current).fontSize);
          let attempts = 0;

          while (bioRef.current.scrollHeight > maxHeight * 1.1 && fontSize > 6 && attempts < 3) {
            fontSize -= 0.5;
            bioRef.current.style.fontSize = fontSize + 'px';
            attempts++;
          }
        }
      }
    }, [data.bio, isMobile]);

    const avatarSrc = data.avatarUrl
      ? `https://wsrv.nl/?url=${encodeURIComponent(data.avatarUrl)}&w=128&h=128&fit=cover&output=webp`
      : AVATAR_FALLBACK;

    const formattedFollowers = formatCount(data.followersCount);
    const formattedFollowing = formatCount(data.followingCount);

    return (
      <div className="relative w-full aspect-video">
        <div
          ref={ref}
          className="relative w-full h-full overflow-hidden shadow-2xl transition-shadow duration-300"
        >
          <img
            src={theme.image}
            alt={theme.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/themes/city.png';
            }}
          />

          <div
            className={`
              absolute
              flex flex-col px-4
              transition-all duration-300
              ${theme.cardClassName}
              ${
                isMobile
                  ? 'left-[12px] right-[12px] top-[10px] bottom-[12px] px-[6px] py-[4px] gap-[3px] justify-between' 
                  : 'left-[clamp(8px,1.8vw,18px)] right-[clamp(8px,1.8vw,18px)] top-[clamp(6px,1.2vw,14px)] bottom-[clamp(8px,1.8vw,18px)] px-[clamp(6px,1vw,12px)] py-[clamp(4px,0.7vw,6px)] gap-[clamp(4px,0.8vw,6px)]'
              }
            `}
          >
            {/* Top Section: Avatar + Profile Info */}
            <div className="relative z-10 w-full flex flex-col flex-grow">
              {/* Avatar */}
              <img
                src={avatarSrc}
                alt={`${data.name}'s avatar`}
                className={`
                  rounded-full border-white/50 object-cover
                  ${
                  isMobile
                    ? 'w-[32px] h-[32px] border-[1px] ring-0.5 ring-white/50 mb-[1px]' 
                    : 'w-[clamp(20px,2.8vw,28px)] h-[clamp(20px,2.8vw,28px)] border-[clamp(0.5px,0.15vw,1px)] ring-0.5 ring-white/50 mb-[clamp(3px,0.5vw,4px)]'
                }

                `}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK;
                }}
              />

              {/* Name with Verified */}
              <div className="w-full mt-1 overflow-hidden">
                <h2
                  className={`
                    font-bold flex items-center
                    ${theme.textColor}
                    ${isMobile ? 'text-[13px] leading-tight' : 'text-[clamp(10px,1.1vw,13px)] leading-tight'} 
                    gap-[1px]
                    truncate
                  `}
                >
                  <span className="inline truncate">{data.name}</span>
                  <VerifiedIcon 
                    className={`inline-flex flex-shrink-0 items-center ${
                      isMobile ? 'text-[13px] ml-[1px]' : 'text-[clamp(8px,0.9vw,11px)] ml-[1px]'
                    }`}
                  />
                </h2>
              </div>

              {/* Handle */}
              <p
                className={`
                  ${theme.handleColor}
                  truncate
                  ${isMobile ? 'text-[10px] mb-[0px]' : 'text-[clamp(8px,0.9vw,10px)] mb-[clamp(2px,0.4vw,3px)]'} 
                `}
                title={data.handle}
              >
                {data.handle}
              </p>

              {/* Bio */}
              {data.bio && (
                <div className="flex-grow min-h-0 w-full">
                  <p
                    ref={bioRef}
                    className={`
                      ${theme.textColor}
                      max-w-full relative z-10 break-words overflow-hidden
                      ${isMobile 
                        ? 'text-[9px] leading-snug' 
                        : 'text-[clamp(8px,0.9vw,11px)] leading-relaxed'
                      }
                    `}
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: isMobile ? 3 : (data.bio.length > 200 ? 4 : (data.bio.length > 100 ? 3 : 2)), 
                      overflow: 'hidden',
                      lineHeight: isMobile ? '1.1' : '1.5', 
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
                ${isMobile ? 'text-[9px] mt-[1px]' : 'text-[clamp(8px,0.9vw,10px)] mt-[clamp(2px,0.4vw,3px)]'}
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