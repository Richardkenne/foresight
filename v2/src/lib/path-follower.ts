/**
 * SVG Path Following Engine
 *
 * Extracts edge SVG paths from the React Flow DOM and provides
 * getPointAtLength-based interpolation for smooth particle movement
 * along actual bezier curves instead of straight lines.
 */

export interface EdgePathInfo {
  edgeId: string;
  sourceId: string;
  targetId: string;
  totalLength: number;
  // We store an offline SVGPathElement clone so it works even after edges are hidden
  pathElement: SVGPathElement;
}

// Namespace for creating SVG elements
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Extract all edge SVG path elements from the React Flow DOM.
 * React Flow renders edges as <path> elements with id={edgeId} inside
 * an SVG container with class "react-flow__edges".
 *
 * We clone each path's `d` attribute into an offscreen SVGPathElement
 * so that getPointAtLength() works even after the edge is hidden.
 *
 * Call this AFTER simulation starts and edges are rendered (visible in DOM).
 */
export function extractEdgePaths(
  edges: Array<{ id: string; source: string; target: string }>,
): Map<string, EdgePathInfo> {
  const pathMap = new Map<string, EdgePathInfo>();

  // Create an offscreen SVG element to host cloned paths
  let offscreenSVG = document.getElementById('__sim-offscreen-svg') as SVGSVGElement | null;
  if (!offscreenSVG) {
    offscreenSVG = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
    offscreenSVG.id = '__sim-offscreen-svg';
    offscreenSVG.style.position = 'absolute';
    offscreenSVG.style.width = '0';
    offscreenSVG.style.height = '0';
    offscreenSVG.style.overflow = 'hidden';
    offscreenSVG.style.pointerEvents = 'none';
    document.body.appendChild(offscreenSVG);
  }
  // Clear previous paths
  offscreenSVG.innerHTML = '';

  for (const edge of edges) {
    // React Flow renders edge paths with id={edge.id}
    const pathEl = document.getElementById(edge.id) as SVGPathElement | null;
    if (!pathEl || typeof pathEl.getTotalLength !== 'function') continue;

    const d = pathEl.getAttribute('d');
    if (!d) continue;

    // Clone the path into offscreen SVG so it persists after edge is hidden
    const clone = document.createElementNS(SVG_NS, 'path') as SVGPathElement;
    clone.setAttribute('d', d);
    offscreenSVG.appendChild(clone);

    const totalLength = clone.getTotalLength();

    pathMap.set(`${edge.source}->${edge.target}`, {
      edgeId: edge.id,
      sourceId: edge.source,
      targetId: edge.target,
      totalLength,
      pathElement: clone,
    });
  }

  return pathMap;
}

/**
 * Get a point along an edge path at a given progress (0-1).
 * Returns {x, y} in SVG coordinates (which match React Flow canvas coordinates).
 *
 * Falls back to linear interpolation if the SVG path is not available.
 */
export function getPointOnEdge(
  pathInfo: EdgePathInfo | undefined,
  progress: number,
  fallbackSource: { x: number; y: number },
  fallbackTarget: { x: number; y: number },
): { x: number; y: number } {
  if (!pathInfo) {
    // Linear fallback
    return {
      x: fallbackSource.x + (fallbackTarget.x - fallbackSource.x) * progress,
      y: fallbackSource.y + (fallbackTarget.y - fallbackSource.y) * progress,
    };
  }

  const pathEl = pathInfo.pathElement;
  if (!pathEl || typeof pathEl.getPointAtLength !== 'function') {
    return {
      x: fallbackSource.x + (fallbackTarget.x - fallbackSource.x) * progress,
      y: fallbackSource.y + (fallbackTarget.y - fallbackSource.y) * progress,
    };
  }

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const length = clampedProgress * pathInfo.totalLength;
  const point = pathEl.getPointAtLength(length);

  return { x: point.x, y: point.y };
}

/**
 * Deterministic speed multiplier based on person index.
 * Range: 0.7x to 1.3x, evenly distributed.
 * Person 0 (YOU) always gets 1.0x.
 */
export function deterministicSpeedMult(personIndex: number, totalPeople: number): number {
  if (personIndex === 0) return 1.0; // YOU
  // Spread evenly from 0.7 to 1.3 based on position
  const t = (personIndex - 1) / Math.max(1, totalPeople - 2);
  return 0.7 + t * 0.6;
}

/**
 * Deterministic start delay based on person index.
 * Range: 0 to 400ms for wave mode, 0 to 200ms for simultaneous mode.
 * Person 0 (YOU) always starts first (0ms).
 */
export function deterministicStartDelay(
  personIndex: number,
  totalPeople: number,
  simultaneous: boolean,
): number {
  if (personIndex === 0) return 0; // YOU launches first
  if (simultaneous) {
    // Small stagger so they don't all overlap perfectly
    const t = (personIndex - 1) / Math.max(1, totalPeople - 2);
    return Math.round(t * 200);
  }
  // Wave mode: delay is handled by wave system, this is intra-wave stagger
  return Math.round(((personIndex - 1) % 10) / 9 * 200);
}
