'use client';

import { useRef, useMemo, forwardRef, useState, useEffect } from 'react';
import type { Theme } from '@/lib/themes';

// — Verified Icon —
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
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022l-4.2 4.6-1.543-1.493a.75.75 0 0 0-1.07.014.75.75 0 0 0-.014 1.082l2 1.95a.75.75 0 0 0 1.07.016l4.75-5.25a.75.75 0 0 0-.012-1.08z" />
    </svg>
  </span>
);

// — Types —
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

// — Constants —
const AVATAR_FALLBACK =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22128%22 height=%22128%22 viewBox=%220 0 128 128%22%3E%3Cdefs%3E%3CradialGradient id=%22g%22 cx=%2250%25%22 cy=%2235%25%22 r=%2275%25%22%3E%3Cstop offset=%220%25%22 stop-color=%2294a3b8%22/%3E%3Cstop offset=%22100%25%22 stop-color=%22475569%22/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx=%2264%22 cy=%2264%22 r=%2264%22 fill=%22url(%23g)%22/%3E%3Ccircle cx=%2264%22 cy=%2252%22 r=%2222%22 fill=%22rgba(255,255,255,0.85)%22/%3E%3Cpath d=%22M24 110a40 28 0 0 1 80 0%22 fill=%22rgba(255,255,255,0.85)%22/%3E%3C/svg%3E';

const DEFAULT_THEME_IMAGE = '/themes/city.png';

// — Utilities —
function formatCount(count: string | number): string {
  const num =
    typeof count === 'string' ? parseFloat(count.replace(/,/g, '')) : count;
  if (isNaN(num) || !isFinite(num)) return '0';
  try {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  } catch {
    return String(num);
  }
}

function getHiResAvatar(url: string): string {
  if (!url) return AVATAR_FALLBACK;
  if (url.includes('pbs.twimg.com')) {
    return url.replace(/(_normal|_bigger|_200x200|_400x400)\b/g, '');
  }
  return url;
}

function proxyCORS(url: string): string {
  if (!url || url.startsWith('data:') || url.includes('wsrv.nl')) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp`;
}

// — Component —
export const ProfileCardPreview = forwardRef<HTMLDivElement, ProfileCardPreviewProps>(
  ({ data, theme }, ref) => {
    const [localAvatarUrl, setLocalAvatarUrl] = useState<string>(AVATAR_FALLBACK);
    const [ready, setReady] = useState(false);

    const hiResAvatar = useMemo(() => getHiResAvatar(data.avatarUrl), [data.avatarUrl]);
    const proxiedAvatar = useMemo(() => proxyCORS(hiResAvatar), [hiResAvatar]);

    useEffect(() => {
      if (!proxiedAvatar || proxiedAvatar === AVATAR_FALLBACK) {
        setLocalAvatarUrl(AVATAR_FALLBACK);
        return;
      }

      let objectUrl: string | null = null;
      (async () => {
        try {
          const res = await fetch(proxiedAvatar, {
            credentials: 'omit',
            cache: 'force-cache',
          });
          if (!res.ok) throw new Error('avatar fetch failed');
          const blob = await res.blob();
          if (blob.size === 0) throw new Error('avatar blob empty');
          objectUrl = URL.createObjectURL(blob);
          setLocalAvatarUrl(objectUrl);
        } catch {
          setLocalAvatarUrl(AVATAR_FALLBACK);
        } finally {
          // ensure image + fonts fully decoded for export
          try {
            const imgEls = Array.from(document.images);
            await Promise.all(imgEls.map((img) => img.decode?.().catch(() => {})));
            const fonts = (document as any).fonts;
            if (fonts?.ready) await fonts.ready;
          } catch {}
          setReady(true);
        }
      })();

      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }, [proxiedAvatar]);

    const bgSrc = useMemo(() => {
      const src = theme.image || DEFAULT_THEME_IMAGE;
      return src.startsWith('/') ? src : proxyCORS(src);
    }, [theme.image]);

    const formattedFollowers = useMemo(
      () => formatCount(data.followersCount),
      [data.followersCount]
    );
    const formattedFollowing = useMemo(
      () => formatCount(data.followingCount),
      [data.followingCount]
    );

    const cardContainerClasses =
      'left-[12px] right-[12px] top-[10px] bottom-[12px] px-[6px] py-[4px] gap-[3px] justify-between md:left-[clamp(8px,1.8vw,18px)] md:right-[clamp(8px,1.8vw,18px)] md:top-[clamp(6px,1.2vw,14px)] md:bottom-[clamp(8px,1.8vw,18px)] md:px-[clamp(6px,1vw,12px)] md:py-[clamp(4px,0.7vw,6px)] md:gap-[clamp(4px,0.8vw,6px)]';
    const avatarClasses =
      'w-[32px] h-[32px] border-[1px] mb-[1px] md:w-[clamp(20px,2.8vw,28px)] md:h-[clamp(20px,2.8vw,28px)] md:border-[clamp(0.5px,0.15vw,1px)] md:mb-[clamp(3px,0.5vw,4px)]';
    const nameTextSize =
      'text-[13px] leading-tight md:text-[clamp(10px,1.1vw,13px)]';
    const handleTextSize =
      'text-[10px] mb-[0px] md:text-[clamp(8px,0.9vw,10px)] md:mb-[clamp(2px,0.4vw,3px)]';
    const bioTextSize =
      'text-[9px] leading-snug md:text-[clamp(8px,0.9vw,11px)] md:leading-relaxed';
    const statsTextSize =
      'text-[9px] mt-[1px] md:text-[clamp(8px,0.9vw,10px)] md:mt-[clamp(2px,0.4vw,3px)]';

    if (!ready)
      return (
        <div
          ref={ref}
          className="w-full aspect-video flex items-center justify-center text-gray-400 text-xs bg-black/5 dark:bg-white/5 rounded-2xl border border-white/10"
        >
          Loading assets…
        </div>
      );

    return (
      <div className="relative w-full aspect-video">
        <div
          ref={ref}
          className="relative w-full h-full overflow-hidden shadow-2xl transition-shadow duration-300"
        >
          {/* Background */}
          <img
            src={bgSrc}
            alt={theme.name || 'Theme background'}
            className="absolute inset-0 w-full h-full object-cover"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            decoding="sync"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_THEME_IMAGE;
            }}
          />

          {/* Content */}
          <div
            className={`absolute flex flex-col px-4 z-10 transition-all duration-300 ${theme.cardClassName} ${cardContainerClasses}`}
          >
            {/* Top */}
            <div className="relative w-full flex flex-col flex-grow">
              <img
                src={localAvatarUrl}
                alt={`${data.name}'s avatar`}
                className={`rounded-full border-white/50 object-cover ring-0.5 ring-white/50 ${avatarClasses}`}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
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
                    className={`${theme.textColor} max-w-full relative break-words overflow-hidden ${bioTextSize} line-clamp-2 md:line-clamp-3`}
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    title={data.bio}
                  >
                    {data.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom */}
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
