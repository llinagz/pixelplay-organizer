// Pixel art icons as SVG components

export const GamepadIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor">
    <rect x="4" y="10" width="24" height="14" />
    <rect x="2" y="12" width="4" height="10" />
    <rect x="26" y="12" width="4" height="10" />
    {/* D-pad */}
    <rect x="8" y="14" width="4" height="2" fill="hsl(var(--background))" />
    <rect x="9" y="13" width="2" height="4" fill="hsl(var(--background))" />
    {/* Buttons */}
    <rect x="20" y="14" width="2" height="2" fill="hsl(var(--background))" />
    <rect x="23" y="14" width="2" height="2" fill="hsl(var(--background))" />
    <rect x="21" y="17" width="2" height="2" fill="hsl(var(--background))" />
  </svg>
);

export const BookIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor">
    {/* Book cover */}
    <rect x="6" y="4" width="20" height="24" />
    {/* Spine */}
    <rect x="6" y="4" width="4" height="24" fill="hsl(var(--pixel-dark))" opacity="0.5" />
    {/* Pages */}
    <rect x="10" y="6" width="14" height="20" fill="hsl(var(--pixel-cream))" />
    {/* Lines */}
    <rect x="12" y="10" width="10" height="2" fill="hsl(var(--muted))" />
    <rect x="12" y="14" width="10" height="2" fill="hsl(var(--muted))" />
    <rect x="12" y="18" width="6" height="2" fill="hsl(var(--muted))" />
  </svg>
);

export const FilmIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor">
    {/* Clapperboard top */}
    <rect x="4" y="4" width="24" height="6" />
    <rect x="6" y="4" width="2" height="6" fill="hsl(var(--pixel-cream))" />
    <rect x="12" y="4" width="2" height="6" fill="hsl(var(--pixel-cream))" />
    <rect x="18" y="4" width="2" height="6" fill="hsl(var(--pixel-cream))" />
    <rect x="24" y="4" width="2" height="6" fill="hsl(var(--pixel-cream))" />
    {/* Clapperboard body */}
    <rect x="4" y="10" width="24" height="18" />
    {/* Center square */}
    <rect x="10" y="14" width="12" height="10" fill="hsl(var(--pixel-dark))" />
  </svg>
);

export const MusicIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor">
    {/* Note body */}
    <rect x="8" y="18" width="6" height="6" />
    <rect x="6" y="20" width="2" height="4" />
    <rect x="14" y="20" width="2" height="4" />
    {/* Stem */}
    <rect x="12" y="6" width="2" height="14" />
    {/* Flag */}
    <rect x="14" y="6" width="6" height="2" />
    <rect x="18" y="8" width="2" height="4" />
  </svg>
);

export const TvIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor">
    {/* TV body */}
    <rect x="4" y="8" width="24" height="18" />
    {/* Screen */}
    <rect x="6" y="10" width="16" height="12" fill="hsl(var(--pixel-dark))" />
    {/* Buttons */}
    <rect x="24" y="12" width="2" height="2" fill="hsl(var(--pixel-cream))" />
    <rect x="24" y="16" width="2" height="2" fill="hsl(var(--pixel-cream))" />
    {/* Stand */}
    <rect x="12" y="26" width="8" height="2" />
  </svg>
);

export const StarIcon = ({ className = "w-8 h-8", filled = false }: { className?: string; filled?: boolean }) => (
  <svg className={className} viewBox="0 0 32 32" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <polygon points="16,4 20,12 28,14 22,20 24,28 16,24 8,28 10,20 4,14 12,12" />
  </svg>
);

export const PlusIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor">
    <rect x="14" y="6" width="4" height="20" />
    <rect x="6" y="14" width="20" height="4" />
  </svg>
);

export const CheckIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor">
    <rect x="6" y="14" width="4" height="4" />
    <rect x="10" y="18" width="4" height="4" />
    <rect x="14" y="14" width="4" height="4" />
    <rect x="18" y="10" width="4" height="4" />
    <rect x="22" y="6" width="4" height="4" />
  </svg>
);

export const TrashIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor">
    {/* Lid */}
    <rect x="6" y="6" width="20" height="4" />
    <rect x="12" y="4" width="8" height="2" />
    {/* Body */}
    <rect x="8" y="10" width="16" height="18" />
    {/* Lines */}
    <rect x="11" y="14" width="2" height="10" fill="hsl(var(--background))" />
    <rect x="15" y="14" width="2" height="10" fill="hsl(var(--background))" />
    <rect x="19" y="14" width="2" height="10" fill="hsl(var(--background))" />
  </svg>
);

export const getIconByType = (type: string) => {
  switch (type) {
    case 'gamepad':
      return GamepadIcon;
    case 'book':
      return BookIcon;
    case 'film':
      return FilmIcon;
    case 'music':
      return MusicIcon;
    case 'tv':
      return TvIcon;
    default:
      return GamepadIcon;
  }
};
