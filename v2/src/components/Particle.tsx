'use client';

const SKIN_TONES = ['#F5D0A9', '#D4A574', '#8D5524', '#C68642', '#E0AC69', '#6B4226', '#F1C27D', '#FFDBAC'];
const SHIRT_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6'];
const HAIR_COLORS = ['#1a1a1a', '#3d2314', '#8B4513', '#D2691E', '#F4C430', '#B22222', '#2F1B14'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createPersonSVG(): string {
  const skin = pick(SKIN_TONES);
  const shirt = pick(SHIRT_COLORS);
  const hair = pick(HAIR_COLORS);
  const pants = Math.random() > 0.5 ? '#1e3a5f' : '#374151';
  const isWoman = Math.random() > 0.5;
  const hairStyle = isWoman
    ? `<ellipse cx="12" cy="5" rx="5" ry="4.5" fill="${hair}"/><path d="M7 6 Q7 12 9 13" stroke="${hair}" stroke-width="1.5" fill="none"/><path d="M17 6 Q17 12 15 13" stroke="${hair}" stroke-width="1.5" fill="none"/>`
    : `<ellipse cx="12" cy="5" rx="4.5" ry="3.5" fill="${hair}"/>`;

  return `<svg viewBox="0 0 24 32" width="24" height="32" xmlns="http://www.w3.org/2000/svg">
    ${hairStyle}
    <circle cx="12" cy="8" r="4" fill="${skin}"/>
    <circle cx="10.5" cy="7.5" r="0.5" fill="#333"/>
    <circle cx="13.5" cy="7.5" r="0.5" fill="#333"/>
    <path d="M10.8 9.5 Q12 10.3 13.2 9.5" stroke="#333" stroke-width="0.4" fill="none"/>
    <rect x="8" y="12" width="8" height="${isWoman ? 9 : 10}" rx="2" fill="${shirt}"/>
    ${isWoman
      ? `<path d="M8 15 L6 20" stroke="${shirt}" stroke-width="2" stroke-linecap="round"/><path d="M16 15 L18 20" stroke="${shirt}" stroke-width="2" stroke-linecap="round"/>`
      : `<path d="M8 14 L5 21" stroke="${shirt}" stroke-width="2" stroke-linecap="round"/><path d="M16 14 L19 21" stroke="${shirt}" stroke-width="2" stroke-linecap="round"/>`}
    <rect x="9" y="${isWoman ? 21 : 22}" width="2.5" height="7" rx="1" fill="${pants}"/>
    <rect x="12.5" y="${isWoman ? 21 : 22}" width="2.5" height="7" rx="1" fill="${pants}"/>
    <rect x="8.5" y="${isWoman ? 27 : 28}" width="3.5" height="2" rx="1" fill="#333"/>
    <rect x="12" y="${isWoman ? 27 : 28}" width="3.5" height="2" rx="1" fill="#333"/>
    <circle cx="${5 + (isWoman ? 1 : 0)}" cy="${isWoman ? 20 : 21}" r="1.2" fill="${skin}"/>
    <circle cx="${19 - (isWoman ? 1 : 0)}" cy="${isWoman ? 20 : 21}" r="1.2" fill="${skin}"/>
  </svg>`;
}

export interface ParticleData {
  id: number;
  personId: number;
  x: number;
  y: number;
  svg: string;
  status: 'moving' | 'success' | 'blocked';
  visitedNodes: Set<string>;
}
