'use client';

import { PatchCheckFill } from 'react-bootstrap-icons';

export function VerifiedIcon({
  size = 18,
  color = '#1D9BF0',
  className = 'ml-1 shrink-0',
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <PatchCheckFill
      size={size}
      color={color}
      className={className}
      role="img"
      aria-label="Verified account"
    />
  );
}
