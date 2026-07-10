import type { Club } from '../../types';
import { lighten } from '../../utils/formations';

interface ClubCrestProps {
  club?: Club | null;
  name?: string;
  color?: string;
  size?: number;
  className?: string;
}

export default function ClubCrest({ club, name, color, size = 36, className = '' }: ClubCrestProps) {
  const primary = club?.colors?.primary ?? color ?? '#6366f1';
  const secondary = club?.colors?.secondary ?? '#ffffff';
  const label = (club?.shortName ?? name ?? '?').replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || '?';

  if (club?.crest) {
    return (
      <img
        src={club.crest}
        alt={club.name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full font-black text-white shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${primary}, ${lighten(primary, 0.4)})`,
        border: `2px solid ${secondary}`,
        fontSize: size * 0.32,
      }}
      title={club?.name ?? name}
    >
      {label}
    </div>
  );
}
