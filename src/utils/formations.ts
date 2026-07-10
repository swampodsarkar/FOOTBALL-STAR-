export interface PitchPoint {
  x: number;
  y: number;
}

export type FormationName = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1' | '5-3-2' | '4-3-3 Flat';

export interface Tactics {
  formation: FormationName;
  mentality: 'Attacking' | 'Balanced' | 'Defensive';
}

export const DEFAULT_TACTICS: Tactics = {
  formation: '4-3-3',
  mentality: 'Balanced',
};

const formationTable: Record<FormationName, PitchPoint[]> = {
  '4-3-3': [
    { x: 0.05, y: 0.5 },
    { x: 0.22, y: 0.12 },
    { x: 0.2, y: 0.38 },
    { x: 0.2, y: 0.62 },
    { x: 0.22, y: 0.88 },
    { x: 0.45, y: 0.3 },
    { x: 0.42, y: 0.5 },
    { x: 0.45, y: 0.7 },
    { x: 0.72, y: 0.15 },
    { x: 0.78, y: 0.5 },
    { x: 0.72, y: 0.85 },
  ],
  '4-3-3 Flat': [
    { x: 0.05, y: 0.5 },
    { x: 0.22, y: 0.12 },
    { x: 0.2, y: 0.38 },
    { x: 0.2, y: 0.62 },
    { x: 0.22, y: 0.88 },
    { x: 0.45, y: 0.22 },
    { x: 0.45, y: 0.5 },
    { x: 0.45, y: 0.78 },
    { x: 0.72, y: 0.22 },
    { x: 0.78, y: 0.5 },
    { x: 0.72, y: 0.78 },
  ],
  '4-4-2': [
    { x: 0.05, y: 0.5 },
    { x: 0.22, y: 0.12 },
    { x: 0.2, y: 0.38 },
    { x: 0.2, y: 0.62 },
    { x: 0.22, y: 0.88 },
    { x: 0.45, y: 0.18 },
    { x: 0.45, y: 0.4 },
    { x: 0.45, y: 0.6 },
    { x: 0.45, y: 0.82 },
    { x: 0.74, y: 0.32 },
    { x: 0.74, y: 0.68 },
  ],
  '3-5-2': [
    { x: 0.05, y: 0.5 },
    { x: 0.2, y: 0.28 },
    { x: 0.18, y: 0.5 },
    { x: 0.2, y: 0.72 },
    { x: 0.42, y: 0.12 },
    { x: 0.45, y: 0.36 },
    { x: 0.45, y: 0.5 },
    { x: 0.45, y: 0.64 },
    { x: 0.42, y: 0.88 },
    { x: 0.74, y: 0.34 },
    { x: 0.74, y: 0.66 },
  ],
  '4-2-3-1': [
    { x: 0.05, y: 0.5 },
    { x: 0.22, y: 0.12 },
    { x: 0.2, y: 0.38 },
    { x: 0.2, y: 0.62 },
    { x: 0.22, y: 0.88 },
    { x: 0.4, y: 0.34 },
    { x: 0.4, y: 0.66 },
    { x: 0.6, y: 0.22 },
    { x: 0.6, y: 0.5 },
    { x: 0.6, y: 0.78 },
    { x: 0.78, y: 0.5 },
  ],
  '5-3-2': [
    { x: 0.05, y: 0.5 },
    { x: 0.18, y: 0.1 },
    { x: 0.2, y: 0.3 },
    { x: 0.18, y: 0.5 },
    { x: 0.2, y: 0.7 },
    { x: 0.18, y: 0.9 },
    { x: 0.45, y: 0.3 },
    { x: 0.45, y: 0.5 },
    { x: 0.45, y: 0.7 },
    { x: 0.74, y: 0.34 },
    { x: 0.74, y: 0.66 },
  ],
};

export const FORMATIONS: FormationName[] = Object.keys(formationTable) as FormationName[];

export function getFormationPositions(formation: FormationName): PitchPoint[] {
  return formationTable[formation] ?? formationTable['4-3-3'];
}

export function mirrorFormation(points: PitchPoint[]): PitchPoint[] {
  return points.map((p) => ({ x: 1 - p.x, y: p.y }));
}

export function lighten(hex: string, amount = 0.35): string {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const mix = (v: number) => Math.round(v + (255 - v) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function mentalityPossessionBonus(mentality: Tactics['mentality']): number {
  if (mentality === 'Attacking') return 0.03;
  if (mentality === 'Defensive') return -0.03;
  return 0;
}
