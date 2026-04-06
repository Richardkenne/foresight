// ============================================================
// Point Cloud Shapes Library for Sacred Roots
// 36 parametric 3D shapes, one per Sacred Root
// All shapes fit within a 2x2x2 bounding box centered at origin
// Returns Float32Array of interleaved x,y,z positions
// ============================================================

const { sin, cos, PI, sqrt, abs, pow, random, floor } = Math;
const TAU = PI * 2;

/**
 * Map of Sacred Root ID to shape name (for reference / debugging)
 */
export const SACRED_ROOT_SHAPES: Record<string, string> = {
  'SR-001': 'cross',              // FAITH_VS_DOUBT
  'SR-002': 'ascending-spiral',   // WORSHIP_VS_IDOLATRY
  'SR-003': 'crown',              // OBEDIENCE_VS_REBELLION
  'SR-004': 'cup',                // GRATITUDE_VS_INGRATITUDE
  'SR-005': 'spiral',             // REPENTANCE_VS_HARDENING
  'SR-006': 'brain-sphere',       // REMEMBRANCE_VS_FORGETFULNESS
  'SR-007': 'ascending-column',   // HOPE_VS_DESPAIR
  'SR-008': 'flame',              // FERVOR_VS_LUKEWARMNESS
  'SR-009': 'inverted-cone',      // HUMILITY_VS_PRIDE
  'SR-010': 'hourglass',          // PATIENCE_VS_HASTE
  'SR-011': 'shield',             // SELF_CONTROL_VS_LUST
  'SR-012': 'anvil',              // DILIGENCE_VS_SLOTH
  'SR-013': 'still-water',        // CONTENTMENT_VS_GREED
  'SR-014': 'scales',             // MODERATION_VS_EXCESS
  'SR-015': 'arrow-up',           // CONSCIENCE_VS_NUMBNESS
  'SR-016': 'mask-reveal',        // PURE_INTENTION_VS_PERFORMANCE
  'SR-017': 'book-open',          // WISDOM_VS_FOLLY
  'SR-018': 'lantern',            // TRANSPARENCY_VS_HIDING
  'SR-019': 'pillar',             // ACCOUNTABILITY_VS_BLAME
  'SR-020': 'heart',              // LOVE_VS_HATRED
  'SR-021': 'balance-scales',     // JUSTICE_VS_OPPRESSION
  'SR-022': 'embrace',            // MERCY_VS_VENGEANCE
  'SR-023': 'diamond',            // TRUTH_VS_DECEPTION
  'SR-024': 'open-hand',          // GENEROSITY_VS_HOARDING
  'SR-025': 'ring-of-people',     // COMMUNITY_VS_ISOLATION
  'SR-026': 'chain-link',         // LOYALTY_VS_BETRAYAL
  'SR-027': 'star',               // CELEBRATION_VS_ENVY
  'SR-028': 'wave',               // COMPASSION_VS_INDIFFERENCE
  'SR-029': 'bridge',             // INCLUSION_VS_TRIBALISM
  'SR-030': 'mountain',           // REVERENCE_VS_MOCKERY
  'SR-031': 'tree',               // STEWARDSHIP_VS_WASTE
  'SR-032': 'torch',              // SERVICE_VS_DOMINATION
  'SR-033': 'gear',               // REFORM_VS_CORRUPTION
  'SR-034': 'yin-yang',           // MIDDLE_PATH_VS_EXTREMISM
  'SR-035': 'eye',                // CERTAINTY_VS_CONJECTURE
  'SR-036': 'seed-sprout',        // TEACHABILITY_VS_CLOSEDNESS
};

// -- Shape generators --------------------------------------------------
// Each returns Float32Array of length n*3 (x,y,z interleaved)
// All fit roughly in [-1,1]^3

function cross(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  const armW = 0.12;
  const armL = 0.9;
  for (let i = 0; i < n; i++) {
    const branch = floor(random() * 3); // vertical, horiz-x, horiz-z
    let x = 0, y = 0, z = 0;
    if (branch === 0) {
      // vertical beam (taller)
      x = (random() - 0.5) * armW * 2;
      y = (random() - 0.5) * 2;
      z = (random() - 0.5) * armW * 2;
    } else if (branch === 1) {
      // horizontal crossbar (at y=0.3)
      x = (random() - 0.5) * armL * 2;
      y = 0.3 + (random() - 0.5) * armW * 2;
      z = (random() - 0.5) * armW * 2;
    } else {
      // depth crossbar
      x = (random() - 0.5) * armW * 2;
      y = 0.3 + (random() - 0.5) * armW * 2;
      z = (random() - 0.5) * armL * 2;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function ascendingSpiral(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const angle = t * TAU * 4;
    const r = 0.3 + 0.5 * (1 - t); // narrows as it ascends
    const y = t * 2 - 1;
    a[i * 3]     = cos(angle) * r;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = sin(angle) * r;
  }
  return a;
}

function crown(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  const points = 5;
  for (let i = 0; i < n; i++) {
    const t = random();
    const angle = t * TAU;
    const pointPhase = (angle / TAU) * points;
    const pointT = pointPhase - floor(pointPhase);
    // Crown profile: base ring + triangular peaks
    const peakH = abs(pointT - 0.5) < 0.2 ? 0.6 + (0.2 - abs(pointT - 0.5)) * 3 : 0.6;
    const r = 0.6 + (random() - 0.5) * 0.1;
    const y = -0.5 + random() * peakH;
    a[i * 3]     = cos(angle) * r;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = sin(angle) * r;
  }
  return a;
}

function cup(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = random();
    const angle = random() * TAU;
    if (t < 0.3) {
      // base disc
      const r = random() * 0.3;
      a[i * 3]     = cos(angle) * r;
      a[i * 3 + 1] = -1;
      a[i * 3 + 2] = sin(angle) * r;
    } else {
      // bowl walls (paraboloid opening up)
      const y = -1 + t * 1.8;
      const r = 0.3 + (y + 1) * 0.4;
      a[i * 3]     = cos(angle) * r;
      a[i * 3 + 1] = y;
      a[i * 3 + 2] = sin(angle) * r;
    }
  }
  return a;
}

function spiral(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const angle = t * TAU * 6;
    const r = 0.8 * (1 - t * 0.7);
    const y = (t - 0.5) * 2;
    a[i * 3]     = cos(angle) * r;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = sin(angle) * r;
  }
  return a;
}

function brainSphere(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    // Sphere with carved grooves (brain sulci)
    const phi = random() * PI;
    const theta = random() * TAU;
    const groove = 0.05 * sin(theta * 8) * sin(phi * 6);
    const r = 0.85 + groove;
    a[i * 3]     = sin(phi) * cos(theta) * r;
    a[i * 3 + 1] = cos(phi) * r;
    a[i * 3 + 2] = sin(phi) * sin(theta) * r;
  }
  return a;
}

function ascendingColumn(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    // Particles scattered upward, denser at top
    const y = t * 2 - 1;
    const spread = 0.6 * (1 - t * 0.8); // narrows toward top
    const angle = random() * TAU;
    const r = random() * spread;
    a[i * 3]     = cos(angle) * r;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = sin(angle) * r;
  }
  return a;
}

function flame(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = random();
    const y = t * 2 - 1;
    // Flame: wide at base, tapers to point at top
    const radius = (1 - t) * 0.7 * pow(1 - t, 0.3);
    const angle = random() * TAU;
    const flicker = sin(t * PI * 3) * 0.1;
    a[i * 3]     = cos(angle) * (radius + flicker);
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = sin(angle) * (radius + flicker);
  }
  return a;
}

function invertedCone(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = random();
    const y = t * 2 - 1;
    // Wider at bottom, point at top
    const r = (1 - t) * 0.9;
    const angle = random() * TAU;
    a[i * 3]     = cos(angle) * r;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = sin(angle) * r;
  }
  return a;
}

function hourglass(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = random();
    const height = t * 2 - 1;
    const radius = abs(height) * 0.8 + 0.05;
    const angle = random() * TAU;
    const noise = 0.03;
    a[i * 3]     = cos(angle) * radius + (random() - 0.5) * noise;
    a[i * 3 + 1] = height + (random() - 0.5) * noise;
    a[i * 3 + 2] = sin(angle) * radius + (random() - 0.5) * noise;
  }
  return a;
}

function shield(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    // Shield: rounded top, pointed bottom
    const t = random();
    const y = 1 - t * 2;
    let halfW: number;
    if (y > 0) {
      // top half: semicircle
      halfW = sqrt(1 - y * y) * 0.7;
    } else {
      // bottom half: taper to point
      halfW = 0.7 * (1 + y);
    }
    const x = (random() - 0.5) * 2 * halfW;
    const z = (random() - 0.5) * 0.15;
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function anvil(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const part = random();
    let x: number, y: number, z: number;
    if (part < 0.4) {
      // base block
      x = (random() - 0.5) * 1.4;
      y = -1 + random() * 0.5;
      z = (random() - 0.5) * 0.6;
    } else if (part < 0.7) {
      // middle column
      x = (random() - 0.5) * 0.6;
      y = -0.5 + random() * 0.7;
      z = (random() - 0.5) * 0.4;
    } else {
      // top face (horn shape, wider on one side)
      const tx = random();
      x = (tx - 0.3) * 1.6;
      y = 0.2 + random() * 0.3;
      z = (random() - 0.5) * (0.5 - tx * 0.3);
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function stillWater(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const angle = random() * TAU;
    const r = random() * 0.95;
    // Flat disc with concentric ripple ridges
    const ripple = sin(r * PI * 5) * 0.05;
    a[i * 3]     = cos(angle) * r;
    a[i * 3 + 1] = ripple;
    a[i * 3 + 2] = sin(angle) * r;
  }
  return a;
}

function scales(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const part = random();
    let x: number, y: number, z: number;
    if (part < 0.15) {
      // center beam (vertical)
      x = (random() - 0.5) * 0.06;
      y = (random() - 0.5) * 1.6;
      z = (random() - 0.5) * 0.06;
    } else if (part < 0.3) {
      // horizontal bar
      x = (random() - 0.5) * 1.8;
      y = 0.6 + (random() - 0.5) * 0.06;
      z = (random() - 0.5) * 0.06;
    } else if (part < 0.65) {
      // left pan (bowl)
      const angle = random() * TAU;
      const r = random() * 0.35;
      x = -0.7 + cos(angle) * r;
      y = -0.2 + sin(r * PI) * -0.15;
      z = sin(angle) * r;
    } else {
      // right pan (bowl)
      const angle = random() * TAU;
      const r = random() * 0.35;
      x = 0.7 + cos(angle) * r;
      y = -0.2 + sin(r * PI) * -0.15;
      z = sin(angle) * r;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function arrowUp(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const part = random();
    let x: number, y: number, z: number;
    if (part < 0.6) {
      // shaft
      x = (random() - 0.5) * 0.12;
      y = -1 + random() * 1.4;
      z = (random() - 0.5) * 0.12;
    } else {
      // arrowhead (cone)
      const t = random();
      const angle = random() * TAU;
      const r = (1 - t) * 0.4;
      y = 0.4 + t * 0.6;
      x = cos(angle) * r;
      z = sin(angle) * r;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function maskReveal(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  // Two face halves offset: one mask (left), one true face (right)
  for (let i = 0; i < n; i++) {
    const side = i < n / 2 ? -1 : 1;
    const phi = random() * PI;
    const theta = (random() - 0.5) * PI; // half sphere
    const r = 0.6;
    let x = sin(phi) * cos(theta) * r;
    const y = cos(phi) * r;
    const z = sin(phi) * sin(theta) * r * 0.3;
    x = x * 0.5 + side * 0.35; // offset halves
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function bookOpen(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const side = i < n / 2 ? -1 : 1;
    const u = random(); // along page
    const v = random(); // across page
    // Pages curve slightly upward at edges
    const x = side * (0.05 + v * 0.7);
    const y = -0.5 + u * 1.4;
    const curve = sin(v * PI * 0.5) * 0.2;
    const z = curve * side;
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function lantern(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = random();
    const y = t * 2 - 1;
    const angle = random() * TAU;
    let r: number;
    if (abs(y) > 0.8) {
      // top and bottom caps
      r = 0.15;
    } else {
      // bulging glass body
      r = 0.3 + 0.3 * sin((y + 0.8) / 1.6 * PI);
    }
    a[i * 3]     = cos(angle) * r;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = sin(angle) * r;
  }
  return a;
}

function pillar(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = random();
    const y = t * 2 - 1;
    const angle = random() * TAU;
    // Column with capital and base
    let r: number;
    if (y < -0.8 || y > 0.8) {
      r = 0.35; // wider capital/base
    } else {
      r = 0.2; // shaft
      // fluting: subtle ridges
      const flute = 1 + 0.08 * cos(angle * 12);
      r *= flute;
    }
    a[i * 3]     = cos(angle) * r;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = sin(angle) * r;
  }
  return a;
}

function heart(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    // 3D cardioid surface
    const u = random() * TAU;
    const v = random() * PI;
    const r = 0.04;
    // Heart parametric (2D cardioid extruded)
    const heartX = 16 * pow(sin(u), 3);
    const heartY = 13 * cos(u) - 5 * cos(2 * u) - 2 * cos(3 * u) - cos(4 * u);
    const scale = 0.055;
    a[i * 3]     = heartX * scale;
    a[i * 3 + 1] = heartY * scale;
    a[i * 3 + 2] = cos(v) * r * (8 + heartX * 0.1);
  }
  return a;
}

function balanceScales(n: number): Float32Array {
  // Similar to scales but with a triangular fulcrum
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const part = random();
    let x: number, y: number, z: number;
    if (part < 0.2) {
      // triangle fulcrum base
      const t = random();
      x = (random() - 0.5) * 0.5 * (1 - t);
      y = -1 + t * 1.2;
      z = (random() - 0.5) * 0.3 * (1 - t);
    } else if (part < 0.35) {
      // beam
      x = (random() - 0.5) * 1.8;
      y = 0.2 + (random() - 0.5) * 0.05;
      z = (random() - 0.5) * 0.05;
    } else if (part < 0.5) {
      // chains (left and right)
      const side = random() < 0.5 ? -0.8 : 0.8;
      x = side + (random() - 0.5) * 0.04;
      y = -0.6 + random() * 0.8;
      z = (random() - 0.5) * 0.04;
    } else if (part < 0.75) {
      // left dish
      const angle = random() * TAU;
      const r = random() * 0.3;
      x = -0.8 + cos(angle) * r;
      y = -0.6 - sin(r * PI) * 0.1;
      z = sin(angle) * r;
    } else {
      // right dish
      const angle = random() * TAU;
      const r = random() * 0.3;
      x = 0.8 + cos(angle) * r;
      y = -0.6 - sin(r * PI) * 0.1;
      z = sin(angle) * r;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function embrace(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  // Two arcs reaching toward each other
  for (let i = 0; i < n; i++) {
    const side = i < n / 2 ? -1 : 1;
    const t = (i % (n / 2)) / (n / 2);
    const angle = t * PI * 0.8 - PI * 0.4;
    const r = 0.7;
    const x = side * (0.15 + cos(angle) * r * 0.5);
    const y = sin(angle) * r;
    const z = (random() - 0.5) * 0.15;
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function diamond(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  // Double pyramid (octahedron)
  for (let i = 0; i < n; i++) {
    const t = random();
    const y = t * 2 - 1;
    const r = (1 - abs(y)) * 0.85;
    const angle = random() * TAU;
    // Faceted: snap to 8 faces
    const faceAngle = floor(angle / (TAU / 8)) * (TAU / 8) + TAU / 16;
    const blend = 0.7;
    const finalAngle = angle * (1 - blend) + faceAngle * blend;
    a[i * 3]     = cos(finalAngle) * r;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = sin(finalAngle) * r;
  }
  return a;
}

function openHand(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const part = random();
    let x: number, y: number, z: number;
    if (part < 0.4) {
      // palm
      x = (random() - 0.5) * 0.8;
      y = -0.5 + random() * 0.6;
      z = (random() - 0.5) * 0.1;
    } else {
      // five fingers
      const finger = floor(random() * 5);
      const fingerX = -0.32 + finger * 0.16;
      const length = finger === 2 ? 0.7 : finger === 0 || finger === 4 ? 0.4 : 0.6;
      const t = random();
      x = fingerX + (random() - 0.5) * 0.06;
      y = 0.1 + t * length;
      z = (random() - 0.5) * 0.06;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function ringOfPeople(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  const clusterCount = 12;
  for (let i = 0; i < n; i++) {
    const cluster = floor(random() * clusterCount);
    const clusterAngle = (cluster / clusterCount) * TAU;
    const R = 0.7; // ring radius
    const cx = cos(clusterAngle) * R;
    const cz = sin(clusterAngle) * R;
    // Each "person" is a small vertical blob
    const spread = 0.08;
    a[i * 3]     = cx + (random() - 0.5) * spread;
    a[i * 3 + 1] = (random() - 0.5) * 0.3;
    a[i * 3 + 2] = cz + (random() - 0.5) * spread;
  }
  return a;
}

function chainLink(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  // Two interlocking torus rings
  for (let i = 0; i < n; i++) {
    const ring = i < n / 2 ? 0 : 1;
    const theta = random() * TAU;
    const phi = random() * TAU;
    const R = 0.45; // major radius
    const r = 0.1;  // minor radius
    let x = (R + r * cos(phi)) * cos(theta);
    let y = (R + r * cos(phi)) * sin(theta);
    let z = r * sin(phi);
    if (ring === 1) {
      // second ring: rotated 90 degrees and offset
      const temp = x;
      x = z + 0.45;
      z = temp;
    } else {
      x -= 0.45;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function star(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  const points = 5;
  for (let i = 0; i < n; i++) {
    const t = random();
    const angle = t * TAU;
    const pointPhase = (angle / TAU) * points;
    const fractional = pointPhase - floor(pointPhase);
    // Alternating inner/outer radii
    const outerR = 0.9;
    const innerR = 0.35;
    const r = fractional < 0.5
      ? innerR + (outerR - innerR) * (1 - abs(fractional - 0.25) / 0.25)
      : innerR + (outerR - innerR) * (1 - abs(fractional - 0.75) / 0.25);
    const z = (random() - 0.5) * 0.15;
    a[i * 3]     = cos(angle) * r;
    a[i * 3 + 1] = sin(angle) * r;
    a[i * 3 + 2] = z;
  }
  return a;
}

function wave(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const x = (random() - 0.5) * 2;
    const z = (random() - 0.5) * 2;
    const y = sin(x * PI * 2) * 0.3 * cos(z * PI);
    a[i * 3]     = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function bridge(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const part = random();
    let x: number, y: number, z: number;
    if (part < 0.15) {
      // left pillar
      x = -0.8 + (random() - 0.5) * 0.15;
      y = -1 + random() * 1.2;
      z = (random() - 0.5) * 0.3;
    } else if (part < 0.3) {
      // right pillar
      x = 0.8 + (random() - 0.5) * 0.15;
      y = -1 + random() * 1.2;
      z = (random() - 0.5) * 0.3;
    } else if (part < 0.7) {
      // arch (catenary curve)
      const t = random();
      x = (t - 0.5) * 1.6;
      const archY = 0.2 + 0.5 * cos(t * PI);
      y = archY;
      z = (random() - 0.5) * 0.3;
    } else {
      // deck
      x = (random() - 0.5) * 1.8;
      y = -0.1 + (random() - 0.5) * 0.06;
      z = (random() - 0.5) * 0.4;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function mountain(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = random();
    const y = t * 2 - 1;
    // Pyramid that tapers to peak
    const r = (1 - t) * 0.9;
    // Square-ish base blended with circular
    const angle = random() * TAU;
    const squareness = 0.3;
    const rSquare = r / (abs(cos(angle)) * squareness + abs(sin(angle)) * squareness + (1 - squareness));
    a[i * 3]     = cos(angle) * rSquare;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = sin(angle) * rSquare;
  }
  return a;
}

function tree(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const part = random();
    let x: number, y: number, z: number;
    if (part < 0.25) {
      // trunk
      const angle = random() * TAU;
      const r = 0.08 + random() * 0.04;
      y = -1 + random() * 0.8;
      x = cos(angle) * r;
      z = sin(angle) * r;
    } else {
      // canopy (layered sphere)
      const phi = random() * PI * 0.7;
      const theta = random() * TAU;
      const r = 0.5 + random() * 0.2;
      x = sin(phi) * cos(theta) * r;
      y = -0.2 + cos(phi) * r + 0.3;
      z = sin(phi) * sin(theta) * r;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function torch(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const part = random();
    let x: number, y: number, z: number;
    if (part < 0.5) {
      // handle
      const angle = random() * TAU;
      const r = 0.08;
      y = -1 + random() * 1.2;
      x = cos(angle) * r;
      z = sin(angle) * r;
    } else {
      // flame at top
      const t = random();
      const angle = random() * TAU;
      const flameR = (1 - t) * 0.35;
      y = 0.2 + t * 0.8;
      x = cos(angle) * flameR;
      z = sin(angle) * flameR;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function gear(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  const teeth = 10;
  for (let i = 0; i < n; i++) {
    const angle = random() * TAU;
    const toothPhase = (angle / TAU) * teeth;
    const frac = toothPhase - floor(toothPhase);
    const innerR = 0.5;
    const outerR = 0.8;
    const r = frac < 0.5 ? outerR : innerR;
    const radial = innerR + random() * (r - innerR);
    const z = (random() - 0.5) * 0.2;
    a[i * 3]     = cos(angle) * radial;
    a[i * 3 + 1] = sin(angle) * radial;
    a[i * 3 + 2] = z;
  }
  return a;
}

function yinYang(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const angle = random() * TAU;
    const r = random() * 0.9;
    let x = cos(angle) * r;
    let y = sin(angle) * r;
    // S-curve divider: offset small circles
    if (r < 0.25) {
      // inner dots: small spheres at top and bottom
      const dot = i % 2 === 0 ? 0.4 : -0.4;
      x = (random() - 0.5) * 0.15;
      y = dot + (random() - 0.5) * 0.15;
    }
    const z = (random() - 0.5) * 0.15;
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function eye(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const part = random();
    let x: number, y: number, z: number;
    if (part < 0.3) {
      // iris (sphere)
      const phi = random() * PI;
      const theta = random() * TAU;
      const r = 0.25;
      x = sin(phi) * cos(theta) * r;
      y = sin(phi) * sin(theta) * r;
      z = cos(phi) * r * 0.3;
    } else {
      // eye outline (almond/vesica piscis)
      const t = random() * TAU;
      const eyeR = 0.8;
      x = cos(t) * eyeR;
      // Almond shape: intersection of two circles
      const envelope = sin(t);
      y = envelope * 0.35;
      z = (random() - 0.5) * 0.1;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function seedSprout(n: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const part = random();
    let x: number, y: number, z: number;
    if (part < 0.3) {
      // seed (small sphere at base)
      const phi = random() * PI;
      const theta = random() * TAU;
      const r = 0.2;
      x = sin(phi) * cos(theta) * r;
      y = -0.8 + cos(phi) * r;
      z = sin(phi) * sin(theta) * r;
    } else if (part < 0.55) {
      // stem (curved upward)
      const t = random();
      y = -0.6 + t * 1.2;
      x = sin(t * PI * 0.3) * 0.05;
      z = (random() - 0.5) * 0.04;
    } else {
      // two leaves
      const leaf = random() < 0.5 ? -1 : 1;
      const t = random();
      const leafLen = 0.5;
      x = leaf * t * leafLen;
      y = 0.3 + sin(t * PI) * 0.25;
      z = (random() - 0.5) * 0.06;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

// -- Shape registry ----------------------------------------------------

type ShapeGenerator = (n: number) => Float32Array;

const GENERATORS: Record<string, ShapeGenerator> = {
  'SR-001': cross,
  'SR-002': ascendingSpiral,
  'SR-003': crown,
  'SR-004': cup,
  'SR-005': spiral,
  'SR-006': brainSphere,
  'SR-007': ascendingColumn,
  'SR-008': flame,
  'SR-009': invertedCone,
  'SR-010': hourglass,
  'SR-011': shield,
  'SR-012': anvil,
  'SR-013': stillWater,
  'SR-014': scales,
  'SR-015': arrowUp,
  'SR-016': maskReveal,
  'SR-017': bookOpen,
  'SR-018': lantern,
  'SR-019': pillar,
  'SR-020': heart,
  'SR-021': balanceScales,
  'SR-022': embrace,
  'SR-023': diamond,
  'SR-024': openHand,
  'SR-025': ringOfPeople,
  'SR-026': chainLink,
  'SR-027': star,
  'SR-028': wave,
  'SR-029': bridge,
  'SR-030': mountain,
  'SR-031': tree,
  'SR-032': torch,
  'SR-033': gear,
  'SR-034': yinYang,
  'SR-035': eye,
  'SR-036': seedSprout,
};

/**
 * Get target positions for a point cloud shape associated with a Sacred Root.
 *
 * @param sacredRootId - e.g. "SR-010"
 * @param particleCount - number of particles (default 800)
 * @returns Float32Array of length particleCount * 3 (interleaved x,y,z)
 *          Falls back to hourglass if ID not found.
 */
export function getShapePositions(
  sacredRootId: string,
  particleCount: number = 800,
): Float32Array {
  const gen = GENERATORS[sacredRootId] ?? hourglass;
  return gen(particleCount);
}
