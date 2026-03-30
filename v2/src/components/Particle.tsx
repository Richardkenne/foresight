'use client';

const SKIN_TONES = ['#FDDCB5', '#E8B88A', '#D4976A', '#C68642', '#8D5524', '#6B4226', '#4A2912', '#F5D0A9'];
const HAIR_COLORS = ['#1a1a1a', '#2C1608', '#3d2314', '#8B4513', '#D2691E', '#B8860B', '#F4C430', '#A52A2A', '#654321'];
const TOP_COLORS = ['#334155', '#475569', '#1e40af', '#1d4ed8', '#047857', '#b91c1c', '#7c3aed', '#0f766e', '#9333ea', '#c2410c', '#4338ca', '#0369a1'];
const BOTTOM_COLORS = ['#1e293b', '#374151', '#1f2937', '#292524', '#27272a'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function createPersonSVG(): string {
  const skin = pick(SKIN_TONES);
  const hair = pick(HAIR_COLORS);
  const top = pick(TOP_COLORS);
  const bottom = pick(BOTTOM_COLORS);
  const isWoman = Math.random() > 0.5;
  const hasBeard = !isWoman && Math.random() > 0.7;
  const hasGlasses = Math.random() > 0.8;

  // Head proportions
  const headR = 3.8;
  const headCY = 7;
  const neckW = 1.8;

  // Hair styles
  let hairSVG: string;
  if (isWoman) {
    const longHair = Math.random() > 0.4;
    if (longHair) {
      // Long flowing hair
      hairSVG = `<ellipse cx="12" cy="${headCY - 1.5}" rx="${headR + 1.2}" ry="${headR + 0.5}" fill="${hair}"/>
        <path d="M${12 - headR - 0.8} ${headCY} Q${12 - headR - 1} ${headCY + 7} ${12 - headR + 1} ${headCY + 8}" stroke="${hair}" stroke-width="2" fill="none"/>
        <path d="M${12 + headR + 0.8} ${headCY} Q${12 + headR + 1} ${headCY + 7} ${12 + headR - 1} ${headCY + 8}" stroke="${hair}" stroke-width="2" fill="none"/>`;
    } else {
      // Short bob
      hairSVG = `<ellipse cx="12" cy="${headCY - 1.8}" rx="${headR + 1}" ry="${headR}" fill="${hair}"/>
        <path d="M${12 - headR - 0.5} ${headCY - 1} Q${12 - headR - 0.3} ${headCY + 2} ${12 - headR + 1} ${headCY + 2.5}" stroke="${hair}" stroke-width="1.8" fill="none"/>
        <path d="M${12 + headR + 0.5} ${headCY - 1} Q${12 + headR + 0.3} ${headCY + 2} ${12 + headR - 1} ${headCY + 2.5}" stroke="${hair}" stroke-width="1.8" fill="none"/>`;
    }
  } else {
    const buzzCut = Math.random() > 0.6;
    if (buzzCut) {
      // Short/buzz
      hairSVG = `<ellipse cx="12" cy="${headCY - 2}" rx="${headR + 0.3}" ry="${headR - 0.8}" fill="${hair}"/>`;
    } else {
      // Side part
      hairSVG = `<ellipse cx="12" cy="${headCY - 2}" rx="${headR + 0.5}" ry="${headR - 0.5}" fill="${hair}"/>
        <path d="M${12 - headR} ${headCY - 3} Q${12 - 1} ${headCY - 4.5} ${12 + headR - 1} ${headCY - 2.5}" stroke="${hair}" stroke-width="1.2" fill="none"/>`;
    }
  }

  // Beard
  const beardSVG = hasBeard
    ? `<path d="M${12 - 2} ${headCY + 1.5} Q12 ${headCY + 4} ${12 + 2} ${headCY + 1.5}" fill="${hair}" opacity="0.6"/>`
    : '';

  // Glasses
  const glassesSVG = hasGlasses
    ? `<circle cx="10.3" cy="${headCY - 0.3}" r="1.8" fill="none" stroke="#555" stroke-width="0.5"/>
       <circle cx="13.7" cy="${headCY - 0.3}" r="1.8" fill="none" stroke="#555" stroke-width="0.5"/>
       <path d="M12.1 ${headCY - 0.3} L11.9 ${headCY - 0.3}" stroke="#555" stroke-width="0.4"/>`
    : '';

  // Body
  const torsoTop = headCY + headR + 0.5;
  const shoulderW = isWoman ? 7 : 8.5;
  const torsoH = isWoman ? 8 : 9;
  const waist = isWoman ? 5.5 : 7;

  // Arms with elbows
  const armY1 = torsoTop + 1.5;
  const armY2 = torsoTop + 5;
  const elbowY = torsoTop + 3.5;
  const leftArmX = 12 - shoulderW / 2;
  const rightArmX = 12 + shoulderW / 2;
  // Slight random arm pose
  const lElbowOff = rand(-1.5, -0.5);
  const rElbowOff = rand(0.5, 1.5);

  // Legs
  const legTop = torsoTop + torsoH;
  const legH = 8;
  const legSpread = 1.2;

  return `<svg viewBox="0 0 24 34" width="22" height="30" xmlns="http://www.w3.org/2000/svg">
    ${hairSVG}
    <circle cx="12" cy="${headCY}" r="${headR}" fill="${skin}"/>
    ${beardSVG}
    <circle cx="10.5" cy="${headCY - 0.5}" r="0.45" fill="#2a2a2a"/>
    <circle cx="13.5" cy="${headCY - 0.5}" r="0.45" fill="#2a2a2a"/>
    <path d="M11 ${headCY + 1.2} Q12 ${headCY + 1.8} 13 ${headCY + 1.2}" stroke="#2a2a2a" stroke-width="0.35" fill="none"/>
    ${glassesSVG}
    <rect x="${12 - neckW / 2}" y="${headCY + headR - 0.5}" width="${neckW}" height="2" fill="${skin}" rx="0.5"/>
    <path d="M${12 - shoulderW / 2} ${torsoTop + 1} Q12 ${torsoTop - 0.5} ${12 + shoulderW / 2} ${torsoTop + 1} L${12 + waist / 2} ${torsoTop + torsoH} L${12 - waist / 2} ${torsoTop + torsoH} Z" fill="${top}" rx="1"/>
    ${isWoman ? `<path d="M${12 - waist / 2 - 0.5} ${torsoTop + torsoH} Q12 ${torsoTop + torsoH + 1} ${12 + waist / 2 + 0.5} ${torsoTop + torsoH}" stroke="${top}" stroke-width="0.5" fill="none"/>` : ''}
    <path d="M${leftArmX} ${armY1} L${leftArmX + lElbowOff} ${elbowY} L${leftArmX + lElbowOff + 0.5} ${armY2}" stroke="${top}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M${rightArmX} ${armY1} L${rightArmX + rElbowOff} ${elbowY} L${rightArmX + rElbowOff - 0.5} ${armY2}" stroke="${top}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <circle cx="${leftArmX + lElbowOff + 0.5}" cy="${armY2 + 0.3}" r="1" fill="${skin}"/>
    <circle cx="${rightArmX + rElbowOff - 0.5}" cy="${armY2 + 0.3}" r="1" fill="${skin}"/>
    <rect x="${12 - legSpread - 1.2}" y="${legTop}" width="2.4" height="${legH}" rx="1" fill="${bottom}"/>
    <rect x="${12 + legSpread - 1.2}" y="${legTop}" width="2.4" height="${legH}" rx="1" fill="${bottom}"/>
    <ellipse cx="${12 - legSpread}" cy="${legTop + legH + 0.3}" rx="1.8" ry="0.9" fill="#333"/>
    <ellipse cx="${12 + legSpread}" cy="${legTop + legH + 0.3}" rx="1.8" ry="0.9" fill="#333"/>
  </svg>`;
}

export interface ParticleData {
  id: number;
  personId: number;
  x: number;
  y: number;
  svg: string;
  status: 'moving' | 'success' | 'blocked' | 'failing';
  visitedNodes: Set<string>;
  signalDelta?: number;
  speedMult: number; // Per-person speed variation (0.8–1.2)
}
