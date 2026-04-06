'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { precomputeFates } from '@/lib/simulation-types';
import { getShapePositions } from '@/lib/point-cloud-shapes';

/* ── Node type colors ── */
const NODE_COLORS: Record<string, number> = {
  'state':        0x3b82f6,
  'desire':       0x8b5cf6,
  'action':       0x64748b,
  'bottleneck':   0xa78bfa,
  'gate':         0xf59e0b,
  'decision':     0x64748b,
  'trajectory':   0x94a3b8,
  'outcome-good': 0x10b981,
  'outcome-bad':  0xef4444,
};

function getNodeColor(type: string): number {
  return NODE_COLORS[type] || NODE_COLORS.state;
}

/* ── Sacred Root domain color mapping ── */
function getSacredRootColor(sacredRootId: string): number {
  const num = parseInt(sacredRootId.replace('SR-', ''), 10);
  if (num >= 1 && num <= 8)   return 0xfbbf24; // god domain - gold
  if (num >= 9 && num <= 16)  return 0x60a5fa; // self domain - blue
  if (num >= 17 && num <= 19) return 0xa78bfa; // epistemic domain - purple
  if (num >= 20 && num <= 30) return 0x4ade80; // others domain - green
  if (num >= 31 && num <= 36) return 0xf59e0b; // resources domain - amber
  return 0xa78bfa; // fallback purple
}

/* ── Extract node data from RF format ── */
interface NodeData {
  id: string;
  type: string;
  label: string;
  desc?: string;
  source?: string;
  time?: string;
  prob?: number;
  sacredRoots?: string[];
  x: number;
  y: number;
}

function extractNodes(rfNodes: RFNode[]): NodeData[] {
  return rfNodes
    .filter(n => n.type === 'simNode')
    .map(n => {
      const d = n.data as Record<string, any>;
      return {
        id: n.id,
        type: d.nodeType || 'state',
        label: d.label || '',
        desc: d.desc,
        source: typeof d.source === 'string' ? d.source : Array.isArray(d.source) ? d.source.map((s: any) => s.name || s).join(', ') : undefined,
        time: d.time,
        prob: d.prob,
        sacredRoots: Array.isArray(d.sacredRoots) ? d.sacredRoots : undefined,
        x: n.position.x,
        y: n.position.y,
      };
    });
}

interface EdgeData {
  source: string;
  target: string;
  label?: string;
}

function extractEdges(rfEdges: RFEdge[]): EdgeData[] {
  return rfEdges.map(e => ({
    source: e.source,
    target: e.target,
    label: (e.label as string) || '',
  }));
}

/* ── Find a path through the graph (BFS, follow highest-prob edges) ── */
function findPath(nodes: NodeData[], edges: EdgeData[]): string[] {
  if (nodes.length === 0) return [];

  // Find start node (first node that has no incoming edges)
  const hasIncoming = new Set(edges.map(e => e.target));
  const startNode = nodes.find(n => !hasIncoming.has(n.id)) || nodes[0];

  const adjacency: Record<string, EdgeData[]> = {};
  edges.forEach(e => {
    if (!adjacency[e.source]) adjacency[e.source] = [];
    adjacency[e.source].push(e);
  });

  const path: string[] = [startNode.id];
  const visited = new Set<string>([startNode.id]);
  let current = startNode.id;

  while (adjacency[current]) {
    const outEdges = adjacency[current].filter(e => !visited.has(e.target));
    if (outEdges.length === 0) break;

    // Prefer pass/yes edges, otherwise first edge
    const passEdge = outEdges.find(e => {
      const lbl = (e.label || '').toLowerCase();
      return lbl.startsWith('pass') || lbl.startsWith('yes') || lbl === '';
    });
    const next = passEdge || outEdges[0];
    path.push(next.target);
    visited.add(next.target);
    current = next.target;
  }

  return path;
}

/* ── Props ── */
interface Graph3DViewProps {
  nodes: RFNode[];
  edges: RFEdge[];
  layoutDirection?: 'LR' | 'TB';
}

export default function Graph3DView({ nodes, edges, layoutDirection = 'LR' }: Graph3DViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const animIdRef = useRef<number>(0);
  const [mounted, setMounted] = useState(false);
  const [walking, setWalking] = useState(false);
  const [currentLabel, setCurrentLabel] = useState('');
  const [currentProb, setCurrentProb] = useState<number | null>(null);
  const [currentType, setCurrentType] = useState('');
  const [walkProgress, setWalkProgress] = useState('');
  const [cameraMode, setCameraMode] = useState<'isometric' | 'follow'>('isometric');
  const cameraModeRef = useRef<'isometric' | 'follow'>('isometric');
  const [flyThrough, setFlyThrough] = useState(false);
  const flyThroughRef = useRef(false);
  const [simulating, setSimulating] = useState(false);
  const [simStats, setSimStats] = useState({ total: 0, walking: 0, succeeded: 0, failed: 0 });

  useEffect(() => { setMounted(true); return () => { cancelAnimationFrame(animIdRef.current); }; }, []);

  /* ── Build 3D scene when nodes change ── */
  useEffect(() => {
    if (!mounted || !containerRef.current) return;
    const simNodes = nodes.filter(n => n.type === 'simNode');
    if (simNodes.length === 0) return;

    const nodeData = extractNodes(nodes);
    const edgeData = extractEdges(edges);
    if (nodeData.length === 0) return;

    // Cleanup previous scene
    cancelAnimationFrame(animIdRef.current);
    if (sceneRef.current) {
      sceneRef.current.cleanup?.();
    }
    containerRef.current.innerHTML = '';

    // Import Three.js
    const THREE = require('three');
    const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls');
    const { EffectComposer } = require('three/examples/jsm/postprocessing/EffectComposer');
    const { RenderPass } = require('three/examples/jsm/postprocessing/RenderPass');
    const { UnrealBloomPass } = require('three/examples/jsm/postprocessing/UnrealBloomPass');
    const { OutputPass } = require('three/examples/jsm/postprocessing/OutputPass');

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080c14);
    scene.fog = new THREE.FogExp2(0x080c14, 0.002);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Post-processing: UnrealBloomPass (subtle glow on emissive materials)
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.4,  // strength — subtle, not overwhelming
      0.3,  // radius
      0.8   // threshold — only bright emissive materials glow
    );
    composer.addPass(bloomPass);
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // CSS2D Renderer (for HTML cards in 3D)
    const { CSS2DRenderer } = require('three/examples/jsm/renderers/CSS2DRenderer');
    const cssRenderer = new CSS2DRenderer();
    cssRenderer.setSize(width, height);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0px';
    cssRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(cssRenderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 800;
    controls.minDistance = 20;
    controls.maxPolarAngle = Math.PI / 2.1; // Cannot go below ground
    controls.minPolarAngle = 0.2; // Cannot go directly overhead

    // Auto-orbit state: orbit slowly when user is idle for 3+ seconds
    let lastInteractionTime = performance.now();
    let autoOrbitActive = false;
    const AUTO_ORBIT_DELAY = 3000; // 3 seconds idle before auto-orbit
    const AUTO_ORBIT_SPEED = 0.1; // rad/s around Y axis

    const markInteraction = () => {
      lastInteractionTime = performance.now();
      autoOrbitActive = false;
    };

    // Track mouse/touch interaction to pause auto-orbit
    const interactionEvents = ['mousedown', 'mousemove', 'mouseup', 'wheel', 'touchstart', 'touchmove'] as const;
    interactionEvents.forEach(evt => {
      renderer.domElement.addEventListener(evt, markInteraction);
    });

    // WASD keyboard movement
    const keysPressed = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // Space = pause/resume walk (only during walk, let global handler manage sim pause)
      if (e.key === ' ') {
        if (isWalking) {
          e.preventDefault();
          e.stopImmediatePropagation();
          walkPaused = !walkPaused;
        }
        // Don't add space to keysPressed — let SimulatorCanvas global handler deal with it
        return;
      }
      // Arrow Up / + = speed up, Arrow Down / - = slow down
      if (e.key === 'ArrowUp' || e.key === '+' || e.key === '=') {
        walkSpeed = Math.min(0.025, walkSpeed * 1.5);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === '-') {
        walkSpeed = Math.max(0.001, walkSpeed / 1.5);
        return;
      }
      keysPressed.add(e.key.toLowerCase());
      if (['w','a','s','d','q','e'].includes(e.key.toLowerCase())) markInteraction();
    };
    const onKeyUp = (e: KeyboardEvent) => { keysPressed.delete(e.key.toLowerCase()); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x334155, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(100, 200, 100);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x3b82f6, 0.2, 500);
    pointLight.position.set(0, 100, 0);
    scene.add(pointLight);

    // Ground plane (subtle grid)
    const groundGeo = new THREE.PlaneGeometry(2000, 2000);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e18,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(800, 40, 0x1a2030, 0x141a28);
    gridHelper.position.y = -1.5;
    scene.add(gridHelper);

    // ── Convert 2D positions to 3D ──
    // Scale factor: RF pixels → 3D units
    const scale = 0.15;
    const nodePositions: Record<string, any> = {};
    const nodeMeshes: Record<string, any> = {};

    // Center the graph
    const avgX = nodeData.reduce((s, n) => s + n.x, 0) / nodeData.length;
    const avgY = nodeData.reduce((s, n) => s + n.y, 0) / nodeData.length;

    // ── Context nodes (photos) ──
    const contextNodes = nodes.filter(n => n.type === 'contextNode');
    contextNodes.forEach(cn => {
      const d = cn.data as Record<string, any>;
      const x = (cn.position.x - avgX) * scale;
      const z = (cn.position.y - avgY) * scale;
      const pos = new THREE.Vector3(x, 4, z);
      nodePositions[cn.id] = pos;

      // Photo as texture on a plane
      if (d.photoUrl) {
        const loader = new THREE.TextureLoader();
        loader.load(d.photoUrl, (texture: any) => {
          const aspect = texture.image.width / texture.image.height;
          const planeW = 12;
          const planeH = planeW / aspect;
          const planeGeo = new THREE.PlaneGeometry(planeW, planeH);
          const planeMat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
          });
          const plane = new THREE.Mesh(planeGeo, planeMat);
          plane.position.set(pos.x, pos.y + 8, pos.z);
          plane.rotation.y = Math.PI / 6;
          scene.add(plane);

          // Frame border
          const borderGeo = new THREE.EdgesGeometry(planeGeo);
          const borderMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.5 });
          const border = new THREE.LineSegments(borderGeo, borderMat);
          border.position.copy(plane.position);
          border.rotation.copy(plane.rotation);
          scene.add(border);
        });
      }

      // Scenario text as CSS2D card
      if (d.scenario) {
        const { CSS2DObject } = require('three/examples/jsm/renderers/CSS2DRenderer');
        const ctxCard = document.createElement('div');
        ctxCard.style.cssText = 'background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:8px;padding:6px 10px;max-width:180px;font-family:Inter,system-ui;';
        const ctxText = document.createElement('div');
        ctxText.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.7);line-height:1.3;';
        ctxText.textContent = d.scenario.length > 60 ? d.scenario.slice(0, 60) + '...' : d.scenario;
        ctxCard.appendChild(ctxText);
        const ctxObj = new CSS2DObject(ctxCard);
        ctxObj.position.set(pos.x, pos.y + 2, pos.z);
        scene.add(ctxObj);
      }

      // Small blue sphere for context node
      const ctxSphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 0.4 })
      );
      ctxSphere.position.copy(pos);
      scene.add(ctxSphere);
      nodeMeshes[cn.id] = ctxSphere;
    });

    // ── Sim nodes ──
    nodeData.forEach(n => {
      const x = (n.x - avgX) * scale;
      const z = (n.y - avgY) * scale;
      const y = 0; // All on ground level, elevated slightly
      const pos = new THREE.Vector3(x, y + 4, z);
      nodePositions[n.id] = pos;

      // Node sphere
      const color = getNodeColor(n.type);
      const isOutcome = n.type.startsWith('outcome');
      const isBottleneck = n.type === 'bottleneck' || n.type === 'gate';
      const radius = isOutcome ? 2.5 : isBottleneck ? 2 : 2;

      const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.3,
        roughness: 0.3,
        metalness: 0.6,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.copy(pos);
      sphere.castShadow = true;
      scene.add(sphere);
      nodeMeshes[n.id] = sphere;

      // Glow ring around sphere
      const ringGeo = new THREE.RingGeometry(radius + 0.5, radius + 0.8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.rotation.x = -Math.PI / 2;
      scene.add(ring);

      // HTML card (CSS2DObject) floating above node
      const colorHex = `#${color.toString(16).padStart(6, '0')}`;
      const card = document.createElement('div');
      card.style.cssText = `
        background: rgba(255,255,255,0.06);
        border: 1px solid ${colorHex}35;
        border-radius: 6px;
        padding: 4px 8px;
        max-width: 200px;
        font-family: 'Inter', system-ui, sans-serif;
        pointer-events: auto;
        cursor: pointer;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: 0 0 12px ${colorHex}10;
        transition: all 0.3s;
        white-space: nowrap;
      `;

      // Compact: type + prob on one line
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:4px;';
      const badge = document.createElement('span');
      badge.style.cssText = `font-size:7px;font-weight:700;padding:1px 4px;border-radius:2px;background:${colorHex}20;color:${colorHex};text-transform:uppercase;letter-spacing:0.04em;`;
      badge.textContent = n.type.replace('outcome-', '');
      row.appendChild(badge);
      if (n.prob && n.prob < 100) {
        const probEl = document.createElement('span');
        probEl.style.cssText = `font-size:10px;font-weight:800;color:${colorHex};text-shadow:0 0 8px ${colorHex}60;margin-left:auto;`;
        probEl.textContent = `${n.prob}%`;
        row.appendChild(probEl);
      }
      card.appendChild(row);

      // Label (compact)
      const labelEl = document.createElement('div');
      labelEl.style.cssText = 'font-size:11px;font-weight:600;line-height:1.3;color:rgba(255,255,255,0.9);margin-top:3px;white-space:normal;';
      labelEl.textContent = n.label;
      card.appendChild(labelEl);

      // Description (always visible)
      if (n.desc) {
        const descEl = document.createElement('div');
        descEl.style.cssText = 'font-size:9px;line-height:1.3;color:rgba(255,255,255,0.45);margin-top:3px;';
        descEl.textContent = n.desc.length > 60 ? n.desc.slice(0, 60) + '...' : n.desc;
        card.appendChild(descEl);
      }
      // Source (always visible)
      if (n.source) {
        const srcEl = document.createElement('div');
        srcEl.style.cssText = 'font-size:7px;color:rgba(255,255,255,0.25);margin-top:2px;';
        srcEl.textContent = n.source.length > 35 ? n.source.slice(0, 35) + '...' : n.source;
        card.appendChild(srcEl);
      }

      // Hover glow
      card.addEventListener('mouseenter', () => {
        card.style.boxShadow = `0 0 24px ${colorHex}25`;
        card.style.borderColor = `${colorHex}70`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.boxShadow = `0 0 12px ${colorHex}10`;
        card.style.borderColor = `${colorHex}35`;
      });

      const { CSS2DObject } = require('three/examples/jsm/renderers/CSS2DRenderer');
      const cardObj = new CSS2DObject(card);
      cardObj.position.set(pos.x, pos.y + radius + 6, pos.z);
      scene.add(cardObj);
    });

    // ── Edges as tubes/lines ──
    edgeData.forEach(e => {
      const from = nodePositions[e.source];
      const to = nodePositions[e.target];
      if (!from || !to) return;

      const lbl = (e.label || '').toLowerCase();
      const isFail = lbl.startsWith('fail') || lbl.startsWith('no');
      const isPass = lbl.startsWith('pass') || lbl.startsWith('yes');

      // Create curved path
      const mid = new THREE.Vector3().lerpVectors(from, to, 0.5);
      mid.y += 3; // Slight arc upward

      const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.3, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: isFail ? 0xef4444 : isPass ? 0x10b981 : 0x475569,
        emissive: isFail ? 0xef4444 : isPass ? 0x10b981 : 0x475569,
        emissiveIntensity: 0.15,
        transparent: true,
        opacity: 0.6,
        roughness: 0.5,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tube);
    });

    // ── Person (walking avatar) ──
    // Capsule body
    const personGroup = new THREE.Group();

    const bodyGeo = new THREE.CapsuleGeometry(0.8, 1.8, 8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 2;
    body.castShadow = true;
    personGroup.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      emissive: 0xfde68a,
      emissiveIntensity: 0.3,
      roughness: 0.3,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 3.8;
    personGroup.add(head);

    // Point light on person (personal glow)
    const personLight = new THREE.PointLight(0xfbbf24, 1, 30);
    personLight.position.y = 4;
    personGroup.add(personLight);

    // Place at start
    const path = findPath(nodeData, edgeData);
    if (path.length > 0 && nodePositions[path[0]]) {
      const startPos = nodePositions[path[0]];
      personGroup.position.set(startPos.x, startPos.y - 2, startPos.z);
    }
    scene.add(personGroup);

    // ── Point Cloud: Dynamic Sacred Root Shapes ──
    const PARTICLE_COUNT = 800;
    // Current shape target positions (updated dynamically per sacred root)
    let shapeTarget = getShapePositions('SR-010', PARTICLE_COUNT); // default hourglass
    const shapeRandom = new Float32Array(PARTICLE_COUNT * 3);

    // Generate random scattered positions
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      shapeRandom[i * 3]     = (Math.random() - 0.5) * 30;
      shapeRandom[i * 3 + 1] = (Math.random() - 0.5) * 30;
      shapeRandom[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }

    // Scale factor: point-cloud-shapes returns positions in [-1,1]^3, scale up to ~5 units
    const PC_SCALE = 5;

    // Particle sizes (vary for depth)
    const sizes = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      sizes[i] = 0.08 + Math.random() * 0.12;
    }

    const pcGeo = new THREE.BufferGeometry();
    const pcPositions = new Float32Array(PARTICLE_COUNT * 3);
    pcPositions.set(shapeRandom);
    pcGeo.setAttribute('position', new THREE.BufferAttribute(pcPositions, 3));
    pcGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const pcMat = new THREE.PointsMaterial({
      color: 0xa78bfa,
      size: 0.15,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const pointCloud = new THREE.Points(pcGeo, pcMat);
    pointCloud.visible = false;
    scene.add(pointCloud);

    // Animation state for point cloud
    let pcAssembleProgress = 0; // 0 = scattered, 1 = assembled
    let pcActive = false;
    let pcDissolving = false;
    let pcNodePos: any = null;

    /** Update the point cloud shape and color for a given sacred root */
    const updatePointCloudShape = (sacredRootId: string) => {
      // Get new shape target positions
      shapeTarget = getShapePositions(sacredRootId, PARTICLE_COUNT);
      // Regenerate random scatter positions for fresh dissolve/assembly
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        shapeRandom[i * 3]     = (Math.random() - 0.5) * 30;
        shapeRandom[i * 3 + 1] = (Math.random() - 0.5) * 30;
        shapeRandom[i * 3 + 2] = (Math.random() - 0.5) * 30;
      }
      // Set domain color tint
      const domainColor = getSacredRootColor(sacredRootId);
      (pcMat as any).color.setHex(domainColor);
    };

    const triggerPointCloud = (nodePos: any, nd?: NodeData) => {
      // Determine sacred root shape
      const rootId = nd?.sacredRoots?.[0] || 'SR-010';
      updatePointCloudShape(rootId);

      pcActive = true;
      pcDissolving = false;
      pcAssembleProgress = 0;
      pcNodePos = nodePos;
      pointCloud.visible = true;
      pointCloud.position.set(nodePos.x, nodePos.y + 12, nodePos.z);
      (pcMat as any).opacity = 0.8;
    };

    const dissolvePointCloud = () => {
      pcDissolving = true;
    };

    // ── Camera position ──
    const firstPos = path.length > 0 && nodePositions[path[0]] ? nodePositions[path[0]] : new THREE.Vector3(0, 0, 0);
    // Isometric / 3/4 view (like SimCity, stadium view)
    camera.position.set(firstPos.x - 30, 80, firstPos.z + 100);
    controls.target.set(firstPos.x + 50, 0, firstPos.z);
    controls.update();

    // ── Walking animation state ──
    let walkIndex = 0;
    let walkT = 0;
    let isWalking = false;
    let walkPaused = false;
    let walkSpeed = 0.003; // Start slow

    const startWalk = () => {
      walkIndex = 0;
      walkT = 0;
      isWalking = true;
      setWalking(true);
      if (path.length > 0) {
        const nd = nodeData.find(n => n.id === path[0]);
        if (nd) {
          setCurrentLabel(nd.label);
          setCurrentProb(nd.prob ?? null);
          setCurrentType(nd.type);
          setWalkProgress(`1 / ${path.length}`);
        }
      }
    };

    // ── Fly-through state ──
    let flyOrbitAngle = 0; // Accumulated orbit angle when character stops at a node
    let flyLastWalkIndex = -1; // Track when character arrives at a new node

    // ── 100-Person Wave Simulation ──
    interface SimPerson {
      id: number;
      fate: { personId: number; path: string[]; outcome: 'success' | 'blocked'; speedMult: number; startDelay: number; deathNode?: string };
      pathIndex: number;
      t: number;
      state: 'waiting' | 'walking' | 'succeeded' | 'failed';
      mesh: any;
      launched: boolean;
    }

    const simPersons: SimPerson[] = [];
    let simRunning = false;
    let simWaveTimers: ReturnType<typeof setTimeout>[] = [];
    const SIM_EDGE_SPEED = 0.0006;

    const createPersonMesh = (color: number) => {
      const grp = new THREE.Group();
      const capGeo = new THREE.CapsuleGeometry(0.1, 0.25, 4, 8);
      const capMat = new THREE.MeshStandardMaterial({
        color, emissive: color, emissiveIntensity: 0.4, roughness: 0.3, metalness: 0.5,
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.2;
      grp.add(cap);
      const hdGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const hdMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
      const hd = new THREE.Mesh(hdGeo, hdMat);
      hd.position.y = 0.48;
      grp.add(hd);
      grp.visible = false;
      return grp;
    };

    const cleanupSimulation = () => {
      simRunning = false;
      simWaveTimers.forEach(tmr => clearTimeout(tmr));
      simWaveTimers = [];
      simPersons.forEach(sp => {
        scene.remove(sp.mesh);
        sp.mesh.traverse((ch: any) => {
          if (ch.geometry) ch.geometry.dispose();
          if (ch.material) ch.material.dispose();
        });
      });
      simPersons.length = 0;
    };

    const startSimulation = () => {
      cleanupSimulation();
      simRunning = true;
      setSimulating(true);
      setSimStats({ total: 0, walking: 0, succeeded: 0, failed: 0 });

      const hasInc = new Set(edgeData.map(ed => ed.target));
      const startId = nodeData.find(nd => !hasInc.has(nd.id))?.id || nodeData[0]?.id;
      if (!startId) return;

      const rfN = nodes.filter(nd => nd.type === 'simNode');
      const fates = precomputeFates(100, startId, rfN, edges);

      for (let i = 0; i < fates.length; i++) {
        const fate = fates[i];
        const mesh = createPersonMesh(0x94a3b8);
        const oX = ((i % 10) - 4.5) * 0.25;
        const oZ = (Math.floor(i / 10) % 3 - 1) * 0.2;
        mesh.userData = { offsetX: oX, offsetZ: oZ };
        scene.add(mesh);
        simPersons.push({ id: i, fate, pathIndex: 0, t: 0, state: 'waiting', mesh, launched: false });
      }

      for (let wave = 0; wave < 10; wave++) {
        const wTimer = setTimeout(() => {
          if (!simRunning) return;
          for (let jj = 0; jj < 10; jj++) {
            const idx = wave * 10 + jj;
            if (idx >= simPersons.length) break;
            const sp = simPersons[idx];
            const iTimer = setTimeout(() => {
              if (!simRunning) return;
              sp.state = 'walking';
              sp.launched = true;
              sp.mesh.visible = true;
              const sPos = nodePositions[sp.fate.path[0]];
              if (sPos) {
                sp.mesh.position.set(sPos.x + sp.mesh.userData.offsetX, sPos.y - 2, sPos.z + sp.mesh.userData.offsetZ);
              }
            }, sp.fate.startDelay);
            simWaveTimers.push(iTimer);
          }
        }, wave * 500);
        simWaveTimers.push(wTimer);
      }
    };

    const stopSimulation = () => {
      cleanupSimulation();
      setSimulating(false);
      setSimStats({ total: 0, walking: 0, succeeded: 0, failed: 0 });
    };

    // Track which bottleneck/gate nodes have people arriving (for point cloud triggers during sim)
    let simPcCooldown = 0; // cooldown timer to avoid rapid re-triggers
    const simPcTriggeredNodes = new Set<string>();

    const updateSimPersons = (dt: number, et: number) => {
      if (!simRunning && simPersons.every(sp => sp.state !== 'walking' && sp.state !== 'failed')) return;

      simPcCooldown = Math.max(0, simPcCooldown - dt);
      let wlk = 0, suc = 0, fld = 0, tot = 0;

      for (const sp of simPersons) {
        if (!sp.launched) continue;
        tot++;

        if (sp.state === 'succeeded') { suc++; continue; }
        if (sp.state === 'failed') {
          fld++;
          if (sp.mesh.position.y > -5) {
            sp.mesh.position.y -= 0.06;
            sp.mesh.traverse((ch: any) => {
              if (ch.material && ch.material.opacity > 0.05) {
                ch.material.transparent = true;
                ch.material.opacity -= 0.015;
              }
            });
          }
          continue;
        }
        if (sp.state !== 'walking') continue;
        wlk++;

        const pIds = sp.fate.path;
        if (sp.pathIndex >= pIds.length - 1) {
          if (sp.fate.outcome === 'success') {
            sp.state = 'succeeded';
            sp.mesh.traverse((ch: any) => {
              if (ch.material) { ch.material.color.setHex(0x10b981); ch.material.emissive.setHex(0x10b981); ch.material.emissiveIntensity = 1.0; }
            });
            setTimeout(() => { sp.mesh.traverse((ch: any) => { if (ch.material) ch.material.emissiveIntensity = 0.3; }); }, 600);
            suc++;
          } else {
            sp.state = 'failed';
            sp.mesh.traverse((ch: any) => {
              if (ch.material) { ch.material.color.setHex(0xef4444); ch.material.emissive.setHex(0xef4444); ch.material.emissiveIntensity = 0.6; }
            });
            fld++;
          }
          wlk--;
          continue;
        }

        const fId = pIds[sp.pathIndex];
        const tId = pIds[sp.pathIndex + 1];
        const fPos = nodePositions[fId];
        const tPos = nodePositions[tId];

        if (!fPos || !tPos) {
          sp.state = 'failed';
          sp.mesh.traverse((ch: any) => { if (ch.material) { ch.material.color.setHex(0xef4444); ch.material.emissive.setHex(0xef4444); } });
          fld++; wlk--;
          continue;
        }

        sp.t += SIM_EDGE_SPEED * sp.fate.speedMult * dt * 60;
        if (sp.t >= 1) {
          sp.t = 0;
          sp.pathIndex++;
          // Trigger point cloud when person arrives at a bottleneck/gate node
          const arrivedId = pIds[sp.pathIndex];
          if (arrivedId && simPcCooldown <= 0) {
            const arrivedNode = nodeData.find(n => n.id === arrivedId);
            if (arrivedNode && (arrivedNode.type === 'bottleneck' || arrivedNode.type === 'gate') && !simPcTriggeredNodes.has(arrivedId)) {
              const nPos = nodePositions[arrivedId];
              if (nPos) {
                simPcTriggeredNodes.add(arrivedId);
                triggerPointCloud(nPos, arrivedNode);
                simPcCooldown = 3; // 3 second cooldown between triggers
                setTimeout(() => {
                  dissolvePointCloud();
                  // Allow re-trigger after dissolve
                  setTimeout(() => simPcTriggeredNodes.delete(arrivedId), 2000);
                }, 2500);
              }
            }
          }
          continue;
        }

        const px = fPos.x + (tPos.x - fPos.x) * sp.t + sp.mesh.userData.offsetX;
        const pz = fPos.z + (tPos.z - fPos.z) * sp.t + sp.mesh.userData.offsetZ;
        const py = fPos.y + (tPos.y - fPos.y) * sp.t - 2;
        const bob = Math.sin(et * 4 + sp.id * 0.7) * 0.08;
        const arc = Math.sin(sp.t * Math.PI) * 1.5;
        sp.mesh.position.set(px, py + arc + bob, pz);

        const ddx = tPos.x - fPos.x;
        const ddz = tPos.z - fPos.z;
        if (Math.abs(ddx) > 0.01 || Math.abs(ddz) > 0.01) {
          sp.mesh.lookAt(sp.mesh.position.x + ddx, sp.mesh.position.y, sp.mesh.position.z + ddz);
        }
      }

      setSimStats({ total: tot, walking: wlk, succeeded: suc, failed: fld });
      if (tot >= 100 && wlk === 0) simRunning = false;
    };

    // Expose functions
    (window as any).__sim3d_startWalk = startWalk;
    (window as any).__sim3d_startSimulation = startSimulation;
    (window as any).__sim3d_stopSimulation = stopSimulation;
    (window as any).__sim3d_setIsometric = () => {
      // Reset to isometric view
      const center = path.length > 0 && nodePositions[path[Math.floor(path.length / 2)]]
        ? nodePositions[path[Math.floor(path.length / 2)]]
        : firstPos;
      camera.position.set(center.x - 30, 80, center.z + 100);
      controls.target.set(center.x + 50, 0, center.z);
    };
    (window as any).__sim3d_toggleFlyThrough = (active: boolean) => {
      if (active) {
        controls.enabled = false;
        flyOrbitAngle = 0;
        flyLastWalkIndex = -1;
      } else {
        controls.enabled = true;
      }
    };

    // ── Render loop ──
    const clock = new THREE.Clock();

    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Bob animation for person
      const time = clock.getElapsedTime();
      body.position.y = 2 + Math.sin(time * 3) * 0.2;
      head.position.y = 3.8 + Math.sin(time * 3) * 0.2;

      // Node floating animation
      Object.values(nodeMeshes).forEach((mesh: any, i: number) => {
        mesh.position.y = 4 + Math.sin(time * 1.5 + i * 0.5) * 0.5;
      });

      // Point cloud sacred root shape animation
      if (pcActive) {
        const posAttr = pcGeo.getAttribute('position') as any;
        const arr = posAttr.array as Float32Array;

        if (!pcDissolving && pcAssembleProgress < 1) {
          // Assemble: lerp from random to scaled target
          pcAssembleProgress = Math.min(1, pcAssembleProgress + 0.004); // Slow assembly
          const ease = pcAssembleProgress * pcAssembleProgress * (3 - 2 * pcAssembleProgress); // smoothstep
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const tx = shapeTarget[i * 3]     * PC_SCALE;
            const ty = shapeTarget[i * 3 + 1] * PC_SCALE;
            const tz = shapeTarget[i * 3 + 2] * PC_SCALE;
            arr[i * 3]     = shapeRandom[i * 3]     + (tx - shapeRandom[i * 3])     * ease;
            arr[i * 3 + 1] = shapeRandom[i * 3 + 1] + (ty - shapeRandom[i * 3 + 1]) * ease;
            arr[i * 3 + 2] = shapeRandom[i * 3 + 2] + (tz - shapeRandom[i * 3 + 2]) * ease;
          }
        } else if (pcDissolving) {
          // Dissolve: expand outward and fade
          pcAssembleProgress = Math.max(0, pcAssembleProgress - 0.015);
          const ease = pcAssembleProgress;
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const tx = shapeTarget[i * 3]     * PC_SCALE;
            const ty = shapeTarget[i * 3 + 1] * PC_SCALE;
            const tz = shapeTarget[i * 3 + 2] * PC_SCALE;
            arr[i * 3]     = tx + (shapeRandom[i * 3]     - tx) * (1 - ease);
            arr[i * 3 + 1] = ty + (shapeRandom[i * 3 + 1] - ty) * (1 - ease);
            arr[i * 3 + 2] = tz + (shapeRandom[i * 3 + 2] - tz) * (1 - ease);
          }
          (pcMat as any).opacity = ease * 0.8;
          if (pcAssembleProgress <= 0) {
            pcActive = false;
            pointCloud.visible = false;
          }
        }

        // Slow rotation while assembled
        pointCloud.rotation.y = time * 0.3;

        posAttr.needsUpdate = true;
      }

      // Walking (respects pause)
      if (isWalking && !walkPaused && walkIndex < path.length - 1) {
        const fromId = path[walkIndex];
        const toId = path[walkIndex + 1];
        const fromPos = nodePositions[fromId];
        const toPos = nodePositions[toId];

        if (fromPos && toPos) {
          walkT += walkSpeed;

          // Lerp person position
          const px = fromPos.x + (toPos.x - fromPos.x) * walkT;
          const pz = fromPos.z + (toPos.z - fromPos.z) * walkT;
          const py = fromPos.y + (toPos.y - fromPos.y) * walkT - 2;
          // Arc: slight jump
          const arc = Math.sin(walkT * Math.PI) * 3;
          personGroup.position.set(px, py + arc, pz);

          // Face direction of movement
          const dir = new THREE.Vector3(toPos.x - fromPos.x, 0, toPos.z - fromPos.z).normalize();
          if (dir.length() > 0) {
            personGroup.lookAt(personGroup.position.x + dir.x, personGroup.position.y, personGroup.position.z + dir.z);
          }

          // Camera follows (only in follow mode OR fly-through mode)
          if (flyThroughRef.current) {
            // Fly-through: cinematic third-person with subtle sway
            const behindDist = 4;
            const aboveHeight = 2.5;
            const camOffset = new THREE.Vector3(-dir.x * behindDist, aboveHeight, -dir.z * behindDist);
            // Subtle organic sway using sin waves at different frequencies
            const swayX = Math.sin(time * 0.7) * 0.15 + Math.sin(time * 1.3) * 0.08;
            const swayY = Math.sin(time * 0.5) * 0.1;
            camOffset.x += swayX;
            camOffset.y += swayY;
            const targetCamPos = personGroup.position.clone().add(camOffset);
            camera.position.lerp(targetCamPos, 0.05);
            // Look slightly ahead of the character
            const lookTarget = personGroup.position.clone().add(new THREE.Vector3(dir.x * 3, 0.5, dir.z * 3));
            const currentLook = new THREE.Vector3();
            camera.getWorldDirection(currentLook);
            const desiredLook = lookTarget.clone().sub(camera.position).normalize();
            currentLook.lerp(desiredLook, 0.05);
            camera.lookAt(lookTarget);
            flyOrbitAngle = 0; // Reset orbit when moving
            flyLastWalkIndex = walkIndex;
          } else if (cameraModeRef.current === 'follow') {
            // Third-person: behind and slightly above the person
            const camOffset = new THREE.Vector3(-dir.x * 20, 12, -dir.z * 20);
            const targetCamPos = personGroup.position.clone().add(camOffset);
            camera.position.lerp(targetCamPos, 0.04);
            controls.target.lerp(personGroup.position, 0.08);
          }

          // Highlight target node
          const targetMesh = nodeMeshes[toId];
          if (targetMesh) {
            (targetMesh.material as any).emissiveIntensity = 0.6 + Math.sin(time * 5) * 0.3;
          }

          if (walkT >= 1) {
            walkT = 0;
            walkIndex++;

            // Update info
            const nd = nodeData.find(n => n.id === toId);
            if (nd) {
              setCurrentLabel(nd.label);
              setCurrentProb(nd.prob ?? null);
              setCurrentType(nd.type);
              setWalkProgress(`${walkIndex + 1} / ${path.length}`);

              // Flash node
              if (nodeMeshes[toId]) {
                (nodeMeshes[toId].material as any).emissiveIntensity = 1;
                setTimeout(() => {
                  if (nodeMeshes[toId]) (nodeMeshes[toId].material as any).emissiveIntensity = 0.3;
                }, 500);
              }

              // Trigger sacred root point cloud at bottleneck/gate nodes
              if (nd && (nd.type === 'bottleneck' || nd.type === 'gate')) {
                const nPos = nodePositions[toId];
                if (nPos) {
                  triggerPointCloud(nPos, nd);
                  // Dissolve after 3 seconds
                  setTimeout(() => dissolvePointCloud(), 3000);
                }
              }
            }

            // End of walk
            if (walkIndex >= path.length - 1) {
              isWalking = false;
              setWalking(false);
            }
          }
        }
      }

      // Fly-through: slow orbit around character when stopped at a node (paused or between moves)
      if (flyThroughRef.current && isWalking && (walkPaused || walkT === 0)) {
        flyOrbitAngle += delta * 0.3; // Slow orbit speed
        const orbitRadius = 5;
        const orbitHeight = 3;
        const charPos = personGroup.position;
        const orbitPos = new THREE.Vector3(
          charPos.x + Math.cos(flyOrbitAngle) * orbitRadius,
          charPos.y + orbitHeight + Math.sin(time * 0.4) * 0.15,
          charPos.z + Math.sin(flyOrbitAngle) * orbitRadius
        );
        camera.position.lerp(orbitPos, 0.03);
        camera.lookAt(charPos.x, charPos.y + 1, charPos.z);
      }

      // Fly-through: orbit at end of walk
      if (flyThroughRef.current && !isWalking && path.length > 0) {
        flyOrbitAngle += delta * 0.25;
        const orbitRadius = 6;
        const orbitHeight = 3;
        const charPos = personGroup.position;
        const orbitPos = new THREE.Vector3(
          charPos.x + Math.cos(flyOrbitAngle) * orbitRadius,
          charPos.y + orbitHeight,
          charPos.z + Math.sin(flyOrbitAngle) * orbitRadius
        );
        camera.position.lerp(orbitPos, 0.03);
        camera.lookAt(charPos.x, charPos.y + 1, charPos.z);
      }

      // WASD movement (disabled during fly-through)
      if (!flyThroughRef.current) {
        const moveSpeed = 0.8;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
        if (keysPressed.has('w')) { camera.position.addScaledVector(forward, moveSpeed); controls.target.addScaledVector(forward, moveSpeed); }
        if (keysPressed.has('s')) { camera.position.addScaledVector(forward, -moveSpeed); controls.target.addScaledVector(forward, -moveSpeed); }
        if (keysPressed.has('a')) { camera.position.addScaledVector(right, -moveSpeed); controls.target.addScaledVector(right, -moveSpeed); }
        if (keysPressed.has('d')) { camera.position.addScaledVector(right, moveSpeed); controls.target.addScaledVector(right, moveSpeed); }
        if (keysPressed.has('q')) { camera.position.y += moveSpeed; controls.target.y += moveSpeed; }
        if (keysPressed.has('e')) { camera.position.y = Math.max(5, camera.position.y - moveSpeed); controls.target.y = Math.max(0, controls.target.y - moveSpeed); }
      }

      // Auto-orbit when idle (not walking in follow mode, not pressing keys, not fly-through)
      const now = performance.now();
      const idle = now - lastInteractionTime > AUTO_ORBIT_DELAY;
      if (idle && !isWalking && keysPressed.size === 0 && !flyThroughRef.current) {
        autoOrbitActive = true;
      }
      if (autoOrbitActive && !flyThroughRef.current) {
        // Rotate camera around the controls target on Y axis
        const angle = AUTO_ORBIT_SPEED * delta;
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
      }

      // Update 100-person simulation
      updateSimPersons(delta, time);

      controls.update();
      // Render with bloom post-processing (does NOT affect CSS2D labels)
      composer.render();
      cssRenderer.render(scene, camera);
    };
    animate();

    // ── Resize ──
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      cssRenderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    sceneRef.current = {
      cleanup: () => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        interactionEvents.forEach(evt => {
          renderer.domElement.removeEventListener(evt, markInteraction);
        });
        cancelAnimationFrame(animIdRef.current);
        composer.dispose();
        renderer.dispose();
        if (cssRenderer.domElement.parentNode) {
          cssRenderer.domElement.parentNode.removeChild(cssRenderer.domElement);
        }
        cleanupSimulation();
        scene.clear();
        delete (window as any).__sim3d_startWalk;
        delete (window as any).__sim3d_startSimulation;
        delete (window as any).__sim3d_stopSimulation;
        delete (window as any).__sim3d_setIsometric;
        delete (window as any).__sim3d_toggleFlyThrough;
      },
    };

    return () => {
      sceneRef.current?.cleanup();
    };
  }, [mounted, nodes, edges, layoutDirection]);

  const handleStartWalk = useCallback(() => {
    setCameraMode('follow');
    cameraModeRef.current = 'follow';
    (window as any).__sim3d_startWalk?.();
  }, []);

  const handleCameraToggle = useCallback(() => {
    const next = cameraMode === 'isometric' ? 'follow' : 'isometric';
    setCameraMode(next);
    cameraModeRef.current = next;
    if (next === 'isometric') {
      (window as any).__sim3d_setIsometric?.();
    }
  }, [cameraMode]);

  const handleStartSimulation = useCallback(() => {
    (window as any).__sim3d_startSimulation?.();
  }, []);

  const handleStopSimulation = useCallback(() => {
    (window as any).__sim3d_stopSimulation?.();
  }, []);

  const handleFlyThroughToggle = useCallback(() => {
    const next = !flyThrough;
    setFlyThrough(next);
    flyThroughRef.current = next;
    (window as any).__sim3d_toggleFlyThrough?.(next);
    // If enabling fly-through and not already walking, start the walk
    if (next && !walking) {
      setCameraMode('follow');
      cameraModeRef.current = 'follow';
      (window as any).__sim3d_startWalk?.();
    }
    // If disabling, restore isometric
    if (!next) {
      setCameraMode('isometric');
      cameraModeRef.current = 'isometric';
      (window as any).__sim3d_setIsometric?.();
    }
  }, [flyThrough, walking]);

  // ESC to exit fly-through
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && flyThroughRef.current) {
        setFlyThrough(false);
        flyThroughRef.current = false;
        (window as any).__sim3d_toggleFlyThrough?.(false);
        setCameraMode('isometric');
        cameraModeRef.current = 'isometric';
        (window as any).__sim3d_setIsometric?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!mounted) return null;

  const simNodes = nodes.filter(n => n.type === 'simNode');

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#080c14' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Walk button */}
      {simNodes.length > 0 && !walking && !simulating && (
        <button
          onClick={handleStartWalk}
          style={{
            position: 'absolute', bottom: 80, left: 'calc(50% - 80px)', transform: 'translateX(-50%)',
            padding: '10px 24px', borderRadius: 12,
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            color: '#1e293b', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, system-ui', boxShadow: '0 4px 20px rgba(251,191,36,0.4)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>
          Walk through
        </button>
      )}

      {/* Simulate button (100 people) */}
      {simNodes.length > 0 && !walking && !simulating && (
        <button
          onClick={handleStartSimulation}
          style={{
            position: 'absolute', bottom: 80, left: 'calc(50% + 80px)', transform: 'translateX(-50%)',
            padding: '10px 24px', borderRadius: 12,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#ffffff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, system-ui', boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          Simulate 100
        </button>
      )}

      {/* Stop simulation button */}
      {simulating && (
        <button
          onClick={handleStopSimulation}
          style={{
            position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
            padding: '10px 24px', borderRadius: 12,
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#ffffff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, system-ui', boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
          Stop
        </button>
      )}

      {/* Simulation stats overlay */}
      {simulating && (
        <div style={{
          position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', borderRadius: 12,
          background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          fontFamily: 'Inter, system-ui', textAlign: 'center',
          display: 'flex', gap: 20, alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: 2 }}>Launched</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0' }}>{simStats.total}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#3b82f6', marginBottom: 2 }}>Walking</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#3b82f6' }}>{simStats.walking}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981', marginBottom: 2 }}>Passed</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{simStats.succeeded}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ef4444', marginBottom: 2 }}>Failed</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#ef4444' }}>{simStats.failed}</div>
          </div>
          {simStats.total >= 100 && simStats.walking === 0 && (
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#fbbf24', padding: '4px 10px',
              background: 'rgba(251,191,36,0.1)', borderRadius: 6, border: '1px solid rgba(251,191,36,0.3)',
            }}>
              COMPLETE
            </div>
          )}
        </div>
      )}

      {/* Current node info (during walk) */}
      {walking && currentLabel && (
        <div style={{
          position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)',
          border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          fontFamily: 'Inter, system-ui', textAlign: 'center',
          maxWidth: 400,
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
            color: `#${(NODE_COLORS[currentType] || 0x3b82f6).toString(16).padStart(6, '0')}`,
            marginBottom: 4,
          }}>{currentType}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>{currentLabel}</div>
          {currentProb !== null && currentProb < 100 && (
            <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>{currentProb}%</div>
          )}
          <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Step {walkProgress}</div>
        </div>
      )}

      {/* Camera mode toggle */}
      {simNodes.length > 0 && (
        <button
          onClick={handleCameraToggle}
          style={{
            position: 'absolute', bottom: 80, right: 20,
            padding: '8px 14px', borderRadius: 10,
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)',
            color: '#e2e8f0', fontSize: 11, fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer', fontFamily: 'Inter, system-ui',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {cameraMode === 'isometric' ? (
              <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
            ) : (
              <><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></>
            )}
          </svg>
          {cameraMode === 'isometric' ? 'Isometric' : 'Follow'}
        </button>
      )}

      {/* Fly-through toggle */}
      {simNodes.length > 0 && (
        <button
          onClick={handleFlyThroughToggle}
          style={{
            position: 'absolute', bottom: 120, right: 20,
            padding: '8px 14px', borderRadius: 10,
            background: flyThrough ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)',
            color: flyThrough ? '#fbbf24' : '#e2e8f0',
            fontSize: 11, fontWeight: 600,
            border: `1px solid ${flyThrough ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.15)'}`,
            cursor: 'pointer', fontFamily: 'Inter, system-ui',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          Fly-through
        </button>
      )}

      {/* Following YOU indicator */}
      {flyThrough && (
        <div style={{
          position: 'absolute', top: 60, right: 20,
          padding: '6px 14px', borderRadius: 8,
          background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
          fontFamily: 'Inter, system-ui', fontSize: 11, fontWeight: 600,
          color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6,
          animation: 'flyPulse 2s ease-in-out infinite',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="5"/>
          </svg>
          Following YOU
          <span style={{ fontSize: 9, color: 'rgba(251,191,36,0.5)', marginLeft: 4 }}>ESC to exit</span>
          <style>{`@keyframes flyPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }`}</style>
        </div>
      )}

      {/* Controls hint */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 16, fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, system-ui',
        pointerEvents: 'none',
      }}>
        <span>WASD move</span>
        <span>Space pause</span>
        <span>+/- speed</span>
        <span>Drag rotate</span>
        <span>Scroll zoom</span>
      </div>
    </div>
  );
}
