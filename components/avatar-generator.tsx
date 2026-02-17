import { useMemo } from 'react';

interface AvatarGeneratorProps {
  seed: string;
  size?: number;
  className?: string;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateColor(seed: string, index: number): string {
  const hash = hashCode(seed + index);
  const hue = hash % 360;
  const saturation = 50 + (hash % 30);
  const lightness = 40 + (hash % 20);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function AvatarGenerator({ seed, size = 40, className = '' }: AvatarGeneratorProps) {
  const dataUri = useMemo(() => {
    const hash = hashCode(seed);
    const color1 = generateColor(seed, 0);
    const color2 = generateColor(seed, 1);
    const color3 = generateColor(seed, 2);
    const pattern = hash % 4;

    const patterns = [
      `<circle cx="50" cy="30" r="20" fill="${color1}"/>
       <circle cx="30" cy="70" r="25" fill="${color2}"/>
       <circle cx="75" cy="75" r="18" fill="${color3}"/>`,

      `<rect x="10" y="10" width="35" height="35" rx="8" fill="${color1}"/>
       <rect x="55" y="25" width="35" height="35" rx="8" fill="${color2}"/>
       <rect x="25" y="60" width="30" height="30" rx="8" fill="${color3}"/>`,

      `<polygon points="50,10 90,40 75,85 25,85 10,40" fill="${color1}"/>
       <circle cx="50" cy="50" r="25" fill="${color2}"/>
       <circle cx="50" cy="50" r="12" fill="${color3}"/>`,

      `<circle cx="50" cy="50" r="40" fill="${color1}"/>
       <path d="M 30 30 Q 50 10 70 30 Q 90 50 70 70 Q 50 90 30 70 Q 10 50 30 30" fill="${color2}"/>
       <circle cx="50" cy="50" r="15" fill="${color3}"/>`,
    ];

    const svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="url(#grad-${hash})"/>
      <defs>
        <linearGradient id="grad-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      ${patterns[pattern]}
    </svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  }, [seed, size]);

  return (
    <img
      src={dataUri}
      alt="Avatar"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
}
