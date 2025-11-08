'use client';

import { useState, useRef, useEffect, useMemo, forwardRef } from 'react';
import type { Theme } from '@/lib/themes';

// --- Verified Icon ---
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
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022l-4.2 4.6-1.543-1.493a.75.75 0 0 0-1.07.014a.75.75 0 0 0-.014 1.082l2 1.95a.75.75 0 0 0 1.07.016l4.75-5.25a.75.75 0 0 0-.012-1.08z" />
    </svg>
  </span>
);

// --- Types ---
export interface ProfileData {
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

// --- Constants ---
const AVATAR_FALLBACK =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"%3E%3Cdefs%3E%3CradialGradient id="g" cx="50%25" cy="35%25" r="75%25"%3E%3Cstop offset="0%25" stop-color="%2394a3b8"/%3E%3Cstop offset="100%25" stop-color="%23475569"/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx="64" cy="64" r="64" fill="url(%23g)"/%3E%3Ccircle cx="64" cy="52" r="22" fill="rgba(255,255,255,0.85)"/%3E%3Cpath d="M24 110a40 28 0 0 1 80 0" fill="rgba(255,255,255,0.85)"/%3E%3C/svg%3E';

const DEFAULT_THEME_IMAGE = '/themes/city.png';

// --- Utilities ---
function formatCount(count: string | number): string {
  if (!count && count !== 0) return '0';
  const num = typeof count === 'string' ? parseFloat(count.replace(/,/g, '')) : count;
  if (isNaN(num) || !isFinite(num)) return '0';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  const scales = [
    { value: 1_000_000_000, suffix: 'B' },
    { value: 1_000_000, suffix: 'M' },
    { value: 1_000, suffix: 'K' },
  ];

  for (const scale of scales) {
    if (absNum >= scale.value) {
      const scaled = absNum / scale.value;
      const formatted = scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1);
      return sign + formatted + scale.suffix;
    }
  }
  return sign + absNum.toString();
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// --- Main Component ---
export const ProfileCardPreview = forwardRef<HTMLDivElement, ProfileCardPreviewProps>(
  ({ data, theme }, ref) => {
    const bioRef = useRef<HTMLParagraphElement>(null);
    const isMobile = useIsMobile();

    const avatarSrc = useMemo(
      () =>
        data.avatarUrl
          ? `https://wsrv.nl/?url=${encodeURIComponent(
              data.avatarUrl
            )}&w=128&h=128&fit=cover&output=webp`
          : AVATAR_FALLBACK,
      [data.avatarUrl]
    );

    const formattedFollowers = useMemo(() => formatCount(data.followersCount), [data.followersCount]);
    const formattedFollowing = useMemo(() => formatCount(data.followingCount), [data.followingCount]);

    const cardContainerClasses = isMobile
      ? 'left-[12px] right-[12px] top-[10px] bottom-[12px] px-[6px] py-[4px] gap-[3px] justify-between'
      : 'left-[clamp(8px,1.8vw,18px)] right-[clamp(8px,1.8vw,18px)] top-[clamp(6px,1.2vw,14px)] bottom-[clamp(8px,1.8vw,18px)] px-[clamp(6px,1vw,12px)] py-[clamp(4px,0.7vw,6px)] gap-[clamp(4px,0.8vw,6px)]';

    const avatarClasses = isMobile
      ? 'w-[32px] h-[32px] border-[1px] mb-[1px]'
      : 'w-[clamp(20px,2.8vw,28px)] h-[clamp(20px,2.8vw,28px)] border-[clamp(0.5px,0.15vw,1px)] mb-[clamp(3px,0.5vw,4px)]';

    const nameTextSize = isMobile ? 'text-[13px] leading-tight' : 'text-[clamp(10px,1.1vw,13px)] leading-tight';
    const handleTextSize = isMobile ? 'text-[10px] mb-[0px]' : 'text-[clamp(8px,0.9vw,10px)] mb-[clamp(2px,0.4vw,3px)]';
    const bioTextSize = isMobile ? 'text-[9px] leading-snug' : 'text-[clamp(8px,0.9vw,11px)] leading-relaxed';
    const statsTextSize = isMobile ? 'text-[9px] mt-[1px]' : 'text-[clamp(8px,0.9vw,10px)] mt-[clamp(2px,0.4vw,3px)]';

    const bioLineClamp =
      isMobile ? 3 : data.bio.length > 200 ? 4 : data.bio.length > 100 ? 3 : 2;

    return (
      <div className="relative w-full aspect-video">
        <div
          ref={ref}
          className="relative w-full h-full overflow-hidden shadow-2xl transition-shadow duration-300"
        >
          {/* Background */}
          <img
            src={theme.image || DEFAULT_THEME_IMAGE}
            alt={theme.name || 'Theme background'}
            className="absolute inset-0 w-full h-full object-cover"
            crossOrigin="anonymous"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_THEME_IMAGE;
            }}
          />

          {/* Content */}
          <div
            className={`absolute flex flex-col px-4 z-10 transition-all duration-300 ${theme.cardClassName} ${cardContainerClasses}`}
          >
            {/* Top Section */}
            <div className="relative w-full flex flex-col flex-grow">
              <img
                src={avatarSrc}
                alt={`${data.name}'s avatar`}
                className={`rounded-full border-white/50 object-cover ring-0.5 ring-white/50 ${avatarClasses}`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK;
                }}
              />

              <div className="w-full mt-1 overflow-hidden">
                <h2
                  className={`font-bold flex items-center ${theme.textColor} ${nameTextSize} gap-[1px] truncate`}
                >
                  <span className="inline truncate">{data.name}</span>
                  <VerifiedIcon
                    color={theme.accentColor || '#1D9BF0'}
                    className="inline-flex flex-shrink-0 items-center text-[clamp(8px,0.9vw,11px)] ml-[1px]"
                  />
                </h2>
              </div>

              <p
                className={`${theme.handleColor} truncate ${handleTextSize}`}
                title={data.handle}
              >
                {data.handle}
              </p>

              {data.bio && (
                <div className="w-full">
                  <p
                    ref={bioRef}
                    className={`${theme.textColor} max-w-full relative break-words overflow-hidden ${bioTextSize}`}
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: bioLineClamp,
                      overflow: 'hidden',
                    }}
                    title={data.bio}
                  >
                    {data.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Section */}
            <div
              className={`flex gap-[2px] relative z-10 p-1 ${theme.statColor} leading-tight whitespace-nowrap text-nowrap ${statsTextSize}`}
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
