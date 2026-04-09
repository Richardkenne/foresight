'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { TemplateNode, TemplateEdge } from '@/lib/templates';
import { TEMPLATES } from '@/lib/templates';
import { loadProfile } from '@/lib/user-profile';
import { saveToHistory } from '@/lib/history';
import { precomputeFates, type PrecomputedFate } from '@/lib/simulation-types';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

/* ── Type config ── */
const TYPE_CONFIG: Record<string, { color: string; border: string }> = {
  'state':        { color: 'color-mix(in srgb, var(--accent) 12%, transparent)', border: 'var(--accent)' },
  'desire':       { color: 'color-mix(in srgb, var(--purple) 12%, transparent)', border: 'var(--purple)' },
  'action':       { color: 'color-mix(in srgb, var(--muted-foreground) 12%, transparent)', border: 'var(--muted-foreground)' },
  'bottleneck':   { color: 'color-mix(in srgb, var(--purple) 15%, transparent)', border: 'var(--purple)' },
  'gate':         { color: 'color-mix(in srgb, var(--warning) 15%, transparent)', border: 'var(--warning)' },
  'decision':     { color: 'color-mix(in srgb, var(--muted-foreground) 12%, transparent)', border: 'var(--muted-foreground)' },
  'trajectory':   { color: 'color-mix(in srgb, var(--muted) 12%, transparent)', border: 'var(--muted)' },
  'outcome-good': { color: 'color-mix(in srgb, var(--success) 12%, transparent)', border: 'var(--success)' },
  'outcome-bad':  { color: 'color-mix(in srgb, var(--danger) 12%, transparent)', border: 'var(--danger)' },
};

function getCfg(type: string) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.state;
}

/* ── Graph data types ── */
interface GraphNode { id: string; type: string; label: string; desc?: string; source?: string; prob?: number; time?: string; }
interface GraphLink { source: string; target: string; label?: string; }
interface GraphData { nodes: GraphNode[]; links: GraphLink[]; }

// Need at least 1 node for Three.js renderer to initialize (invisible placeholder)
const INIT_GRAPH: GraphData = { nodes: [{ id: '__init__', type: 'state', label: '', prob: 0 }], links: [] };

/* ── Simulation constants ── */
const SIM_WAVES = 10;
const SIM_PER_WAVE = 10;
const SIM_TOTAL = SIM_WAVES * SIM_PER_WAVE; // 100
const SIM_WAVE_DELAY = 500;   // ms between waves
const SIM_EDGE_SPEED = 1300;  // ms per edge traversal
const SIM_SPHERE_RADIUS = 0.15;

interface SimStats {
  launched: number;
  walking: number;
  success: number;
  fail: number;
}

interface ActiveSphere {
  personId: number;
  fate: PrecomputedFate;
  mesh: any; // THREE.Mesh
  pathIndex: number;    // current segment (walking FROM path[pathIndex] TO path[pathIndex+1])
  progress: number;     // 0..1 lerp between current pair
  done: boolean;
  startTime: number;    // when this segment started
  segmentDuration: number; // ms for this segment (adjusted by speedMult)
}

/* Convert 3D GraphNode/GraphLink to RFNode/RFEdge for precomputeFates */
function toRFNodes(nodes: GraphNode[]): RFNode[] {
  return nodes.map(n => ({
    id: n.id,
    type: 'simNode',
    position: { x: 0, y: 0 },
    data: { nodeType: n.type, prob: n.prob, label: n.label },
  }));
}

function toRFEdges(links: GraphLink[]): RFEdge[] {
  return links.map((l, i) => ({
    id: `e-${i}`,
    source: l.source,
    target: l.target,
    label: l.label || '',
    data: {},
  }));
}

function apiToGraphData(nodes: TemplateNode[], edges: TemplateEdge[]): GraphData {
  return {
    nodes: nodes.map(n => ({
      id: String(n.id),
      type: n.type || 'state',
      label: n.label || '',
      desc: n.desc,
      source: typeof n.source === 'string' ? n.source : Array.isArray(n.source) ? (n.source as any[]).map((s: any) => s.name || s).join(', ') : undefined,
      prob: n.prob,
      time: n.time,
    })),
    links: edges.map(e => ({
      source: String(e.from),
      target: String(e.to),
      label: e.label || '',
    })),
  };
}

/* ── Main component ── */
export default function Simulator3D({ onSwitchTo2D }: { onSwitchTo2D: () => void }) {
  const fgRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [scenario, setScenario] = useState('');
  const [generating, setGenerating] = useState(false);
  const [graphData, setGraphData] = useState<GraphData>(INIT_GRAPH);
  const [hasGraph, setHasGraph] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sacredMode, setSacredMode] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const cssRendererReady = useRef(false);
  const graphVersion = useRef(0);

  /* ── Simulation state ── */
  const [simRunning, setSimRunning] = useState(false);
  const [simStats, setSimStats] = useState<SimStats>({ launched: 0, walking: 0, success: 0, fail: 0 });
  const simRunningRef = useRef(false);
  const spheresRef = useRef<ActiveSphere[]>([]);
  const simAnimFrameRef = useRef<number>(0);
  const simFatesRef = useRef<PrecomputedFate[]>([]);
  const simWaveTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* ── Fly-through state ── */
  const [flyThrough, setFlyThrough] = useState(false);
  const flyThroughRef = useRef(false);
  const flyTargetCamPos = useRef<{ x: number; y: number; z: number } | null>(null);
  const flyLookAtPos = useRef<{ x: number; y: number; z: number } | null>(null);

  useEffect(() => { setMounted(true); }, []);

  /* ── CSS2DRenderer + Bloom post-processing — setup once when ForceGraph3D is ready ── */
  const setupCSSRenderer = useCallback(() => {
    if (cssRendererReady.current || !fgRef.current) return;
    try {
      const fg = fgRef.current;
      const THREE = require('three');
      const { CSS2DRenderer } = require('three/examples/jsm/renderers/CSS2DRenderer');
      const { EffectComposer } = require('three/examples/jsm/postprocessing/EffectComposer');
      const { RenderPass } = require('three/examples/jsm/postprocessing/RenderPass');
      const { UnrealBloomPass } = require('three/examples/jsm/postprocessing/UnrealBloomPass');
      const { OutputPass } = require('three/examples/jsm/postprocessing/OutputPass');

      const cssRenderer = new CSS2DRenderer();
      cssRenderer.setSize(window.innerWidth, window.innerHeight);
      cssRenderer.domElement.style.position = 'absolute';
      cssRenderer.domElement.style.top = '0px';
      cssRenderer.domElement.style.pointerEvents = 'none';

      const container = fg.renderer().domElement.parentElement;
      if (container) {
        container.appendChild(cssRenderer.domElement);
        const scene = fg.scene();
        const camera = fg.camera();
        const webglRenderer = fg.renderer();

        // Setup bloom composer on the ForceGraph3D renderer
        const composer = new EffectComposer(webglRenderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          0.4,  // strength
          0.3,  // radius
          0.8   // threshold
        );
        composer.addPass(bloomPass);
        composer.addPass(new OutputPass());

        // Disable ForceGraph3D auto-clear so composer controls rendering
        webglRenderer.autoClear = false;

        let running = true;
        const animate = () => {
          if (!running) return;
          // Render bloom pass (composer clears and renders scene)
          webglRenderer.clear();
          composer.render();
          // Render CSS2D labels on top (unaffected by bloom)
          cssRenderer.render(scene, camera);
          requestAnimationFrame(animate);
        };
        animate();
        cssRendererReady.current = true;

        const onResize = () => {
          cssRenderer.setSize(window.innerWidth, window.innerHeight);
          composer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onResize);
      }
    } catch (e) {
      console.warn('CSS2DRenderer + Bloom setup failed:', e);
    }
  }, []);

  /* ── Poll for fgRef readiness (ForceGraph3D sets ref async after mount) ── */
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      if (fgRef.current && !cssRendererReady.current) {
        setupCSSRenderer();
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [mounted, setupCSSRenderer]);

  /* ── Auto-orbit when user is idle for 3+ seconds ── */
  useEffect(() => {
    if (!mounted) return;
    let lastInteraction = performance.now();
    let autoOrbitActive = false;
    let animId = 0;
    let prevTime = performance.now();
    const IDLE_DELAY = 3000;
    const ORBIT_SPEED = 0.1; // rad/s

    const markInteraction = () => {
      lastInteraction = performance.now();
      autoOrbitActive = false;
    };

    // Listen on the whole container for interaction
    const events = ['mousedown', 'mousemove', 'wheel', 'touchstart', 'touchmove'] as const;
    events.forEach(e => window.addEventListener(e, markInteraction));

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const fg = fgRef.current;
      if (!fg) return;

      const now = performance.now();
      const delta = (now - prevTime) / 1000;
      prevTime = now;

      if (now - lastInteraction > IDLE_DELAY) {
        autoOrbitActive = true;
      }

      if (autoOrbitActive && !flyThroughRef.current) {
        try {
          const camera = fg.camera();
          const controls = fg.controls();
          if (camera && controls && controls.target) {
            const angle = ORBIT_SPEED * delta;
            const offset = camera.position.clone().sub(controls.target);
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const newX = offset.x * cosA + offset.z * sinA;
            const newZ = -offset.x * sinA + offset.z * cosA;
            camera.position.set(
              controls.target.x + newX,
              camera.position.y,
              controls.target.z + newZ
            );
            camera.lookAt(controls.target);
          }
        } catch { /* ForceGraph not ready yet */ }
      }
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      events.forEach(e => window.removeEventListener(e, markInteraction));
    };
  }, [mounted]);

  /* ── Simulation: cleanup ── */
  const stopSimulation = useCallback(() => {
    simRunningRef.current = false;
    setSimRunning(false);

    // Cancel wave timers
    simWaveTimersRef.current.forEach(t => clearTimeout(t));
    simWaveTimersRef.current = [];

    // Cancel animation frame
    if (simAnimFrameRef.current) {
      cancelAnimationFrame(simAnimFrameRef.current);
      simAnimFrameRef.current = 0;
    }

    // Remove all sphere meshes from scene
    const fg = fgRef.current;
    if (fg) {
      try {
        const scene = fg.scene();
        for (const s of spheresRef.current) {
          if (s.mesh) scene.remove(s.mesh);
        }
      } catch { /* scene may not be available */ }
    }
    spheresRef.current = [];
    simFatesRef.current = [];
    setSimStats({ launched: 0, walking: 0, success: 0, fail: 0 });
  }, []);

  /* ── Simulation: get 3D position of a node by id ── */
  const getNodePos = useCallback((nodeId: string): { x: number; y: number; z: number } | null => {
    const fg = fgRef.current;
    if (!fg) return null;
    const gd = fg.graphData();
    const node = gd.nodes.find((n: any) => n.id === nodeId);
    if (!node || node.x == null || node.y == null) return null;
    return { x: node.x, y: node.y, z: node.z || 0 };
  }, []);

  /* ── Simulation: animation loop ── */
  const simAnimationLoop = useCallback(() => {
    if (!simRunningRef.current) return;

    const now = performance.now();
    let walking = 0;
    let successCount = 0;
    let failCount = 0;
    let launchedCount = 0;

    for (const sphere of spheresRef.current) {
      launchedCount++;
      if (sphere.done) {
        if (sphere.fate.outcome === 'success') successCount++;
        else failCount++;
        continue;
      }

      walking++;
      const { fate, mesh } = sphere;
      const pathLen = fate.path.length;

      // Advance progress
      const elapsed = now - sphere.startTime;
      sphere.progress = Math.min(1, elapsed / sphere.segmentDuration);

      // Current segment positions
      const fromId = fate.path[sphere.pathIndex];
      const toId = fate.path[sphere.pathIndex + 1];
      const fromPos = getNodePos(fromId);
      const toPos = toId ? getNodePos(toId) : null;

      if (fromPos && toPos) {
        const t = sphere.progress;
        // Cosmetic offset: small deterministic scatter so spheres don't stack
        const scatter = ((sphere.personId * 7) % 13 - 6) * 0.3;
        const scatterZ = ((sphere.personId * 11) % 9 - 4) * 0.3;
        const bobY = Math.sin(now * 0.003 + sphere.personId) * 0.8;

        mesh.position.set(
          fromPos.x + (toPos.x - fromPos.x) * t + scatter,
          fromPos.y + (toPos.y - fromPos.y) * t + bobY,
          fromPos.z + (toPos.z - fromPos.z) * t + scatterZ,
        );
      } else if (fromPos) {
        // Only start position available (last node or positions not ready)
        const bobY = Math.sin(now * 0.003 + sphere.personId) * 0.8;
        mesh.position.set(fromPos.x, fromPos.y + bobY, fromPos.z);
      }

      // Segment complete: advance to next
      if (sphere.progress >= 1) {
        if (sphere.pathIndex + 1 >= pathLen - 1) {
          // Reached end of path
          sphere.done = true;
          if (fate.outcome === 'success') {
            successCount++;
            walking--;
            // Green glow
            mesh.material.color.setHex(0x34d399);
            mesh.material.emissive.setHex(0x34d399);
            mesh.material.emissiveIntensity = 0.6;
          } else {
            failCount++;
            walking--;
            // Red + drop + fade
            mesh.material.color.setHex(0xf87171);
            mesh.material.emissive.setHex(0xf87171);
            mesh.material.emissiveIntensity = 0.3;
            mesh.material.opacity = 0.4;
          }
        } else {
          // Move to next segment
          sphere.pathIndex++;
          sphere.progress = 0;
          sphere.startTime = now;
          sphere.segmentDuration = SIM_EDGE_SPEED * sphere.fate.speedMult;
        }
      }
    }

    setSimStats({ launched: launchedCount, walking, success: successCount, fail: failCount });

    // Fly-through: track the YOU sphere (personId 0) and animate camera toward it
    if (flyThroughRef.current && fgRef.current) {
      const youSphere = spheresRef.current.find(s => s.personId === 0);
      if (youSphere) {
        const yp = youSphere.mesh.position;
        // Compute movement direction from path
        const { fate } = youSphere;
        let dirX = 0, dirZ = 0;
        if (!youSphere.done && fate.path.length > 1) {
          const fromPos = getNodePos(fate.path[youSphere.pathIndex]);
          const toPos = getNodePos(fate.path[Math.min(youSphere.pathIndex + 1, fate.path.length - 1)]);
          if (fromPos && toPos) {
            const dx = toPos.x - fromPos.x;
            const dz = toPos.z - fromPos.z;
            const len = Math.sqrt(dx * dx + dz * dz) || 1;
            dirX = dx / len;
            dirZ = dz / len;
          }
        }
        // Camera: behind and above
        const behindDist = 5;
        const aboveHeight = 3;
        // Subtle sway for organic feel
        const swayX = Math.sin(now * 0.0007) * 0.3 + Math.sin(now * 0.0013) * 0.15;
        const swayY = Math.sin(now * 0.0005) * 0.2;
        const targetCam = {
          x: yp.x - dirX * behindDist + swayX,
          y: yp.y + aboveHeight + swayY,
          z: yp.z - dirZ * behindDist,
        };
        const lookAt = { x: yp.x + dirX * 3, y: yp.y + 0.5, z: yp.z + dirZ * 3 };

        // Lerp camera position for smooth cinematic movement
        const prev = flyTargetCamPos.current || targetCam;
        const lerpFactor = 0.05;
        const lerpedCam = {
          x: prev.x + (targetCam.x - prev.x) * lerpFactor,
          y: prev.y + (targetCam.y - prev.y) * lerpFactor,
          z: prev.z + (targetCam.z - prev.z) * lerpFactor,
        };
        const prevLook = flyLookAtPos.current || lookAt;
        const lerpedLook = {
          x: prevLook.x + (lookAt.x - prevLook.x) * lerpFactor,
          y: prevLook.y + (lookAt.y - prevLook.y) * lerpFactor,
          z: prevLook.z + (lookAt.z - prevLook.z) * lerpFactor,
        };
        flyTargetCamPos.current = lerpedCam;
        flyLookAtPos.current = lerpedLook;

        fgRef.current.cameraPosition(lerpedCam, lerpedLook, 0);
      }
    }

    // Check if all done
    const allDone = launchedCount === SIM_TOTAL && walking === 0;
    if (allDone) {
      // Keep meshes visible for 2s then auto-stop
      setTimeout(() => {
        if (simRunningRef.current) stopSimulation();
      }, 2000);
    } else {
      simAnimFrameRef.current = requestAnimationFrame(simAnimationLoop);
    }
  }, [getNodePos, stopSimulation]);

  /* ── Simulation: start ── */
  const startSimulation = useCallback(() => {
    if (simRunningRef.current || !hasGraph) return;
    const fg = fgRef.current;
    if (!fg) return;

    // Convert graph data to RFNode/RFEdge for precomputeFates
    const rfNodes = toRFNodes(graphData.nodes);
    const rfEdges = toRFEdges(graphData.links);

    // Find start nodes (no incoming edges)
    const hasIncoming = new Set(graphData.links.map(l => l.target));
    const startNodeIds = graphData.nodes.filter(n => !hasIncoming.has(n.id) && n.id !== '__init__').map(n => n.id);
    if (startNodeIds.length === 0) return;

    const fates = precomputeFates(SIM_TOTAL, startNodeIds[0], rfNodes, rfEdges);
    simFatesRef.current = fates;

    simRunningRef.current = true;
    setSimRunning(true);
    setSimStats({ launched: 0, walking: 0, success: 0, fail: 0 });

    const THREE = require('three');
    const scene = fg.scene();

    // Launch waves
    for (let wave = 0; wave < SIM_WAVES; wave++) {
      const timer = setTimeout(() => {
        if (!simRunningRef.current) return;

        for (let p = 0; p < SIM_PER_WAVE; p++) {
          const idx = wave * SIM_PER_WAVE + p;
          if (idx >= fates.length) continue;

          const fate = fates[idx];
          const startPos = getNodePos(fate.path[0]);

          // Create sphere mesh — personId 0 is "YOU" (gold, larger)
          const isYou = idx === 0;
          const geo = new THREE.SphereGeometry(isYou ? 0.25 : SIM_SPHERE_RADIUS, isYou ? 16 : 8, isYou ? 16 : 8);
          const mat = new THREE.MeshStandardMaterial({
            color: isYou ? 0xfbbf24 : 0x60a5fa,
            emissive: isYou ? 0xfbbf24 : 0x60a5fa,
            emissiveIntensity: isYou ? 0.7 : 0.4,
            transparent: true,
            opacity: isYou ? 1.0 : 0.9,
          });
          const mesh = new THREE.Mesh(geo, mat);

          if (startPos) {
            mesh.position.set(startPos.x, startPos.y, startPos.z);
          }
          scene.add(mesh);

          const sphere: ActiveSphere = {
            personId: fate.personId,
            fate,
            mesh,
            pathIndex: 0,
            progress: 0,
            done: fate.path.length <= 1,
            startTime: performance.now() + fate.startDelay,
            segmentDuration: SIM_EDGE_SPEED * fate.speedMult,
          };
          spheresRef.current.push(sphere);
        }
      }, wave * SIM_WAVE_DELAY);

      simWaveTimersRef.current.push(timer);
    }

    // Start animation loop
    simAnimFrameRef.current = requestAnimationFrame(simAnimationLoop);
  }, [hasGraph, graphData, getNodePos, simAnimationLoop]);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      if (simRunningRef.current) {
        simRunningRef.current = false;
        simWaveTimersRef.current.forEach(t => clearTimeout(t));
        if (simAnimFrameRef.current) cancelAnimationFrame(simAnimFrameRef.current);
        // Remove meshes
        const fg = fgRef.current;
        if (fg) {
          try {
            const scene = fg.scene();
            for (const s of spheresRef.current) {
              if (s.mesh) scene.remove(s.mesh);
            }
          } catch { /* ignore */ }
        }
        spheresRef.current = [];
      }
    };
  }, []);

  /* ── Generate flow via API ── */
  const generateFlow = useCallback(async (inputOverride?: string) => {
    const input = (inputOverride || scenario).trim();
    if (!input || generating) return;

    setGenerating(true);
    setErrorMsg('');
    abortRef.current = new AbortController();

    try {
      const profile = loadProfile();
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: input, profile, sacredMode }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error('Server error');
      const flow = await res.json();
      if (!flow.nodes?.length || !flow.edges?.length) throw new Error('Invalid flow');

      const gd = apiToGraphData(flow.nodes, flow.edges);
      graphVersion.current++;
      setGraphData(gd);
      setHasGraph(true);

      saveToHistory({ scenario: input, flowData: { nodes: flow.nodes, edges: flow.edges } });

      // Zoom to fit after physics settles
      setTimeout(() => {
        fgRef.current?.zoomToFit(600, 40);
      }, 1500);
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setErrorMsg('Generation failed. Try again.');
      }
    } finally {
      setGenerating(false);
    }
  }, [scenario, generating, sacredMode]);

  /* ── Load template ── */
  const loadTemplate = useCallback((key: string) => {
    const t = TEMPLATES[key];
    if (!t) return;
    setScenario(t.input || key);
    if (t.nodes?.length && t.edges?.length) {
      const gd = apiToGraphData(t.nodes, t.edges);
      setGraphData(gd);
      setHasGraph(true);
      setTimeout(() => fgRef.current?.zoomToFit(600, 40), 1500);
    } else {
      setTimeout(() => generateFlow(t.input || key), 50);
    }
  }, [generateFlow]);

  /* ── Node rendering (HTML cards via CSS2DObject) ── */
  const nodeThreeObject = useCallback((node: any) => {
    const { CSS2DObject } = require('three/examples/jsm/renderers/CSS2DRenderer');

    // Hide init placeholder node
    if (node.id === '__init__') {
      const empty = document.createElement('div');
      empty.style.display = 'none';
      const obj = new CSS2DObject(empty);
      obj.layers.set(0);
      return obj;
    }

    const cfg = getCfg(node.type);

    const el = document.createElement('div');
    el.style.cssText = `
      background: ${cfg.color};
      border: 1.5px solid ${cfg.border};
      border-radius: 10px;
      padding: var(--space-3) var(--space-4);
      min-width: 180px;
      max-width: 240px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: var(--border);
      pointer-events: auto;
      cursor: pointer;
      backdrop-filter: blur(8px);
      box-shadow: 0 0 20px color-mix(in srgb, ${cfg.border} 19%, transparent);
      transition: box-shadow 0.2s, transform 0.2s;
    `;

    // Header: type badge + prob
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);';
    const badge = document.createElement('span');
    badge.style.cssText = `font-size:var(--text-xs);font-weight:700;padding:2px var(--space-2);border-radius:4px;background:color-mix(in srgb, ${cfg.border} 13%, transparent);color:${cfg.border};text-transform:uppercase;letter-spacing:0.05em;`;
    badge.textContent = node.type;
    header.appendChild(badge);
    if (node.prob && node.prob < 100) {
      const prob = document.createElement('span');
      prob.style.cssText = `font-size:var(--text-base);font-weight:800;color:${cfg.border};`;
      prob.textContent = `${node.prob}%`;
      header.appendChild(prob);
    }
    el.appendChild(header);

    // Label
    const label = document.createElement('div');
    label.style.cssText = 'font-size:var(--text-sm);font-weight:700;line-height:1.3;margin-bottom:var(--space-1);color:var(--surface);';
    label.textContent = node.label || '';
    el.appendChild(label);

    // Description (truncated)
    if (node.desc) {
      const desc = document.createElement('div');
      desc.style.cssText = 'font-size:var(--text-xs);line-height:1.4;color:var(--muted);margin-bottom:var(--space-1);';
      desc.textContent = node.desc.length > 100 ? node.desc.slice(0, 100) + '...' : node.desc;
      el.appendChild(desc);
    }

    // Footer: source + time
    const footer = document.createElement('div');
    footer.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:var(--space-2);';
    if (node.source) {
      const src = document.createElement('span');
      src.style.cssText = 'font-size:var(--text-xs);color:var(--muted-foreground);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      src.textContent = node.source;
      footer.appendChild(src);
    }
    if (node.time) {
      const time = document.createElement('span');
      time.style.cssText = 'font-size:var(--text-xs);color:var(--muted);white-space:nowrap;';
      time.textContent = node.time;
      footer.appendChild(time);
    }
    el.appendChild(footer);

    // Hover glow
    el.addEventListener('mouseenter', () => {
      el.style.boxShadow = `0 0 40px color-mix(in srgb, ${cfg.border} 38%, transparent)`;
      el.style.transform = 'scale(1.05)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.boxShadow = `0 0 20px color-mix(in srgb, ${cfg.border} 19%, transparent)`;
      el.style.transform = 'scale(1)';
    });

    const obj = new CSS2DObject(el);
    obj.layers.set(0);
    return obj;
  }, []);

  /* ── Node click: camera fly ── */
  const handleNodeClick = useCallback((node: any) => {
    if (!fgRef.current) return;
    const distance = 200;
    const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
    fgRef.current.cameraPosition(
      { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
      node,
      1000
    );
  }, []);

  /* ── Key handler ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !generating && document.activeElement?.tagName === 'INPUT') {
        e.preventDefault();
        generateFlow();
      }
      if (e.key === 'Escape' && generating) {
        abortRef.current?.abort();
      }
      if (e.key === 'Escape' && flyThroughRef.current) {
        setFlyThrough(false);
        flyThroughRef.current = false;
        flyTargetCamPos.current = null;
        flyLookAtPos.current = null;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [generating, generateFlow]);

  const suggestions = ['Open a cafe in Bali', 'Go freelance on Upwork', 'Move to Europe', 'Launch a SaaS'];

  if (!mounted) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontFamily: 'Inter, system-ui' }}>
        Loading 3D Foresight...
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'var(--foreground)', position: 'relative', overflow: 'hidden' }}>

      {/* ── TOP BAR ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        padding: 'var(--space-3) var(--space-6)',
        background: 'linear-gradient(180deg, var(--foreground) 0%, color-mix(in srgb, var(--foreground) 93%, transparent) 60%, transparent 100%)',
        display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
        pointerEvents: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--border)', letterSpacing: '-0.02em', fontFamily: 'Inter, system-ui' }}>
              Foresight
            </span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
            <button onClick={onSwitchTo2D} style={{
              padding: 'var(--space-1) var(--space-3)', background: 'var(--border)', color: 'var(--muted)', borderRadius: 6,
              fontSize: 'var(--text-xs)', fontWeight: 600, border: '1px solid color-mix(in srgb, var(--muted) 40%, transparent)', cursor: 'pointer', fontFamily: 'Inter, system-ui',
            }}>2D</button>
            <span style={{
              padding: 'var(--space-1) var(--space-3)', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', color: 'var(--accent)', borderRadius: 6,
              fontSize: 'var(--text-xs)', fontWeight: 600, border: '1px solid color-mix(in srgb, var(--accent) 19%, transparent)', fontFamily: 'Inter, system-ui',
            }}>3D</span>
            <button onClick={() => setSacredMode(!sacredMode)} style={{
              padding: 'var(--space-1) var(--space-3)', marginLeft: 'var(--space-2)',
              background: sacredMode ? 'color-mix(in srgb, var(--purple) 13%, transparent)' : 'var(--border)',
              color: sacredMode ? 'var(--purple)' : 'var(--muted-foreground)',
              borderRadius: 6, fontSize: 'var(--text-xs)', fontWeight: 600,
              border: `1px solid ${sacredMode ? 'color-mix(in srgb, var(--purple) 25%, transparent)' : 'color-mix(in srgb, var(--muted) 40%, transparent)'}`,
              cursor: 'pointer', fontFamily: 'Inter, system-ui',
            }}>Sacred</button>
            {hasGraph && (
              <button
                onClick={() => simRunning ? stopSimulation() : startSimulation()}
                style={{
                  padding: 'var(--space-1) var(--space-3)', marginLeft: 'var(--space-1)',
                  background: simRunning ? 'color-mix(in srgb, var(--danger) 13%, transparent)' : 'color-mix(in srgb, var(--success) 13%, transparent)',
                  color: simRunning ? 'var(--danger)' : 'var(--success)',
                  borderRadius: 6, fontSize: 'var(--text-xs)', fontWeight: 600,
                  border: `1px solid ${simRunning ? 'color-mix(in srgb, var(--danger) 25%, transparent)' : 'color-mix(in srgb, var(--success) 25%, transparent)'}`,
                  cursor: 'pointer', fontFamily: 'Inter, system-ui',
                }}
              >{simRunning ? 'Stop Sim' : 'Simulate'}</button>
            )}
            {simRunning && (
              <button
                onClick={() => {
                  const next = !flyThrough;
                  setFlyThrough(next);
                  flyThroughRef.current = next;
                  if (!next) {
                    flyTargetCamPos.current = null;
                    flyLookAtPos.current = null;
                  }
                }}
                style={{
                  padding: 'var(--space-1) var(--space-3)', marginLeft: 'var(--space-1)',
                  background: flyThrough ? 'color-mix(in srgb, var(--warning) 15%, transparent)' : 'var(--border)',
                  color: flyThrough ? 'var(--warning)' : 'var(--muted)',
                  borderRadius: 6, fontSize: 'var(--text-xs)', fontWeight: 600,
                  border: `1px solid ${flyThrough ? 'color-mix(in srgb, var(--warning) 40%, transparent)' : 'color-mix(in srgb, var(--muted) 40%, transparent)'}`,
                  cursor: 'pointer', fontFamily: 'Inter, system-ui',
                  display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                Fly-through
              </button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <input
            type="text"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="What do you want to simulate?"
            style={{
              flex: 1, padding: 'var(--space-3) var(--space-4)', borderRadius: 10,
              background: 'var(--foreground)', border: '1px solid var(--border)',
              color: 'var(--border)', fontSize: 'var(--text-base)', fontFamily: 'Inter, system-ui', outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
          <button
            onClick={() => generating ? abortRef.current?.abort() : generateFlow()}
            disabled={!scenario.trim() && !generating}
            style={{
              padding: 'var(--space-3) var(--space-6)', borderRadius: 10,
              background: generating ? 'color-mix(in srgb, var(--danger) 13%, transparent)' : 'var(--accent)',
              color: generating ? 'var(--danger)' : 'var(--surface)',
              fontSize: 'var(--text-base)', fontWeight: 600, border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, system-ui',
              opacity: !scenario.trim() && !generating ? 0.4 : 1,
            }}
          >{generating ? 'Stop' : 'Generate'}</button>
        </div>
      </div>

      {/* ── ERROR ── */}
      {errorMsg && (
        <div style={{
          position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)', zIndex: 30,
          background: 'var(--danger-muted)', border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)', color: 'var(--danger)',
          padding: 'var(--space-2) var(--space-6)', borderRadius: 8, fontSize: 'var(--text-sm)', fontFamily: 'Inter, system-ui',
        }}>{errorMsg}</div>
      )}

      {/* ── GENERATING OVERLAY ── */}
      {generating && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 25,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)',
        }}>
          <div style={{
            width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
            borderRadius: '50%', animation: 'spin 1s linear infinite',
          }} />
          <span style={{ fontSize: 'var(--text-base)', color: 'var(--muted-foreground)', fontFamily: 'Inter, system-ui' }}>Building simulation...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* ── EMPTY STATE with templates ── */}
      {!hasGraph && !generating && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 15,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-6)', textAlign: 'center',
          maxWidth: 600, width: '90%',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="color-mix(in srgb, var(--muted) 40%, transparent)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--border)', letterSpacing: '-0.02em', marginBottom: 'var(--space-2)', fontFamily: 'Inter, system-ui' }}>3D Foresight</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', fontFamily: 'Inter, system-ui' }}>Type a scenario or pick a template</div>
          </div>

          {/* Quick suggestions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-2)' }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => { setScenario(s); setTimeout(() => generateFlow(s), 50); }}
                style={{
                  padding: 'var(--space-2) var(--space-4)', borderRadius: 999, fontSize: 'var(--text-sm)', fontWeight: 500,
                  color: 'var(--muted)', background: 'var(--foreground)', border: '1px solid var(--border)',
                  cursor: 'pointer', fontFamily: 'Inter, system-ui', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--muted) 40%, transparent)'; e.currentTarget.style.color = 'var(--border)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
              >{s}</button>
            ))}
          </div>

          {/* Template grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-2)', width: '100%' }}>
            {Object.entries(TEMPLATES).map(([key, t]) => (
              <button key={key} onClick={() => loadTemplate(key)}
                style={{
                  padding: 'var(--space-3) var(--space-3)', borderRadius: 8, fontSize: 'var(--text-xs)', fontWeight: 500,
                  color: 'var(--muted)', background: 'var(--foreground)', border: '1px solid var(--border)',
                  cursor: 'pointer', fontFamily: 'Inter, system-ui', transition: 'all 0.15s',
                  textAlign: 'left', lineHeight: 1.3,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent) 25%, transparent)'; e.currentTarget.style.color = 'var(--border)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--foreground) 80%, transparent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'var(--foreground)'; }}
              >{t.title}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── CONTROLS HINT ── */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
        display: 'flex', gap: 'var(--space-4)', fontFamily: 'Inter, system-ui', fontSize: 'var(--text-xs)', color: 'color-mix(in srgb, var(--muted) 40%, transparent)',
      }}>
        <span>Drag to rotate</span>
        <span>Scroll to zoom</span>
        <span>Click node to focus</span>
        <span>Right-drag to pan</span>
      </div>

      {/* ── STATS ── */}
      {hasGraph && !simRunning && (
        <div style={{
          position: 'absolute', bottom: 16, right: 20, zIndex: 10,
          fontFamily: 'Inter, system-ui', fontSize: 'var(--text-xs)', color: 'color-mix(in srgb, var(--muted) 40%, transparent)',
        }}>{graphData.nodes.length} nodes / {graphData.links.length} edges</div>
      )}

      {/* ── SIMULATION STATS OVERLAY ── */}
      {simRunning && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 20,
          display: 'flex', gap: 'var(--space-4)', alignItems: 'center',
          background: 'color-mix(in srgb, var(--foreground) 80%, transparent)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--border)', borderRadius: 10,
          padding: 'var(--space-2) var(--space-6)', fontFamily: 'Inter, system-ui',
        }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--border)' }}>
            {simStats.launched}/{SIM_TOTAL}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>
            {simStats.walking} walking
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--success)' }}>
            {simStats.success} success
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)' }}>
            {simStats.fail} failed
          </span>
        </div>
      )}

      {/* ── FLY-THROUGH INDICATOR ── */}
      {flyThrough && (
        <div style={{
          position: 'absolute', top: 100, right: 20, zIndex: 25,
          padding: 'var(--space-2) var(--space-4)', borderRadius: 8,
          background: 'color-mix(in srgb, var(--warning) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--warning) 30%, transparent)',
          fontFamily: 'Inter, system-ui', fontSize: 'var(--text-xs)', fontWeight: 600,
          color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          animation: 'flyPulse3d 2s ease-in-out infinite',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="5"/>
          </svg>
          Following YOU
          <span style={{ fontSize: 'var(--text-xs)', color: 'color-mix(in srgb, var(--warning) 50%, transparent)', marginLeft: 'var(--space-1)' }}>ESC to exit</span>
          <style>{`@keyframes flyPulse3d { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }`}</style>
        </div>
      )}

      {/* ── 3D FORCE GRAPH — always mounted so CSS2DRenderer can attach ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#060810"
        dagMode="td"
        dagLevelDistance={80}
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        nodeOpacity={0}
        nodeResolution={1}
        linkColor={(link: any) => {
          const lbl = (link.label || '').toLowerCase();
          if (lbl.startsWith('fail') || lbl.startsWith('no')) return '#f8717140';
          if (lbl.startsWith('pass') || lbl.startsWith('yes')) return '#34d39950';
          return '#33415540';
        }}
        linkWidth={(link: any) => {
          const lbl = (link.label || '').toLowerCase();
          if (lbl.startsWith('pass') || lbl.startsWith('yes')) return 3;
          if (lbl.startsWith('fail') || lbl.startsWith('no')) return 1.5;
          return 2;
        }}
        linkOpacity={0.5}
        linkCurvature={0.12}
        linkDirectionalParticles={3}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleColor={(link: any) => {
          const lbl = (link.label || '').toLowerCase();
          if (lbl.startsWith('fail') || lbl.startsWith('no')) return '#f87171';
          if (lbl.startsWith('pass') || lbl.startsWith('yes')) return '#34d399';
          return '#60a5fa';
        }}
        linkLabel={(link: any) => link.label ? `<span style="color:var(--muted);font-size:var(--text-xs);font-family:Inter,system-ui;background:var(--foreground);padding:2px var(--space-2);border-radius:4px">${link.label}</span>` : ''}
        onNodeClick={handleNodeClick}
        warmupTicks={100}
        cooldownTicks={0}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
      </div>
    </div>
  );
}
