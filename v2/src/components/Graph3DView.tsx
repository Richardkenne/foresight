'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';

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

/* ── Extract node data from RF format ── */
interface NodeData {
  id: string;
  type: string;
  label: string;
  desc?: string;
  source?: string;
  time?: string;
  prob?: number;
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

    // WASD keyboard movement
    const keysPressed = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // Space = pause/resume walk
      if (e.key === ' ' && isWalking) {
        e.preventDefault();
        walkPaused = !walkPaused;
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

    // ── Point Cloud: Hourglass (SR-010 Patience/Sabr) ──
    const PARTICLE_COUNT = 800;
    const hourglassTarget = new Float32Array(PARTICLE_COUNT * 3);
    const hourglassRandom = new Float32Array(PARTICLE_COUNT * 3);

    // Generate hourglass shape: two cones meeting at a point
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = Math.random(); // 0-1 along height
      const angle = Math.random() * Math.PI * 2;

      // Hourglass profile: radius = |t - 0.5| * 2 (narrow at middle, wide at ends)
      const normalizedT = (t - 0.5) * 2; // -1 to 1
      const radius = Math.abs(normalizedT) * 3.5 + 0.15; // min 0.15 at pinch, max 3.65 at ends
      const height = normalizedT * 5; // -5 to 5

      // Add slight noise for organic look
      const noise = 0.3;
      hourglassTarget[i * 3]     = Math.cos(angle) * radius + (Math.random() - 0.5) * noise;
      hourglassTarget[i * 3 + 1] = height + (Math.random() - 0.5) * noise;
      hourglassTarget[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * noise;

      // Random starting positions (scattered sphere)
      hourglassRandom[i * 3]     = (Math.random() - 0.5) * 30;
      hourglassRandom[i * 3 + 1] = (Math.random() - 0.5) * 30;
      hourglassRandom[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }

    // Particle sizes (vary for depth)
    const sizes = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      sizes[i] = 0.08 + Math.random() * 0.12;
    }

    const pcGeo = new THREE.BufferGeometry();
    const pcPositions = new Float32Array(PARTICLE_COUNT * 3);
    // Start at random positions
    pcPositions.set(hourglassRandom);
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

    const triggerHourglass = (nodePos: any) => {
      pcActive = true;
      pcDissolving = false;
      pcAssembleProgress = 0;
      pcNodePos = nodePos;
      pointCloud.visible = true;
      pointCloud.position.set(nodePos.x, nodePos.y + 12, nodePos.z);
      (pcMat as any).opacity = 0.8;
    };

    const dissolveHourglass = () => {
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

    // Expose functions
    (window as any).__sim3d_startWalk = startWalk;
    (window as any).__sim3d_setIsometric = () => {
      // Reset to isometric view
      const center = path.length > 0 && nodePositions[path[Math.floor(path.length / 2)]]
        ? nodePositions[path[Math.floor(path.length / 2)]]
        : firstPos;
      camera.position.set(center.x - 30, 80, center.z + 100);
      controls.target.set(center.x + 50, 0, center.z);
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

      // Point cloud hourglass animation
      if (pcActive) {
        const posAttr = pcGeo.getAttribute('position') as any;
        const arr = posAttr.array as Float32Array;

        if (!pcDissolving && pcAssembleProgress < 1) {
          // Assemble: lerp from random to target
          pcAssembleProgress = Math.min(1, pcAssembleProgress + 0.004); // Slow assembly
          const ease = pcAssembleProgress * pcAssembleProgress * (3 - 2 * pcAssembleProgress); // smoothstep
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            arr[i * 3]     = hourglassRandom[i * 3]     + (hourglassTarget[i * 3]     - hourglassRandom[i * 3])     * ease;
            arr[i * 3 + 1] = hourglassRandom[i * 3 + 1] + (hourglassTarget[i * 3 + 1] - hourglassRandom[i * 3 + 1]) * ease;
            arr[i * 3 + 2] = hourglassRandom[i * 3 + 2] + (hourglassTarget[i * 3 + 2] - hourglassRandom[i * 3 + 2]) * ease;
          }
        } else if (pcDissolving) {
          // Dissolve: expand outward and fade
          pcAssembleProgress = Math.max(0, pcAssembleProgress - 0.015);
          const ease = pcAssembleProgress;
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            arr[i * 3]     = hourglassTarget[i * 3]     + (hourglassRandom[i * 3]     - hourglassTarget[i * 3])     * (1 - ease);
            arr[i * 3 + 1] = hourglassTarget[i * 3 + 1] + (hourglassRandom[i * 3 + 1] - hourglassTarget[i * 3 + 1]) * (1 - ease);
            arr[i * 3 + 2] = hourglassTarget[i * 3 + 2] + (hourglassRandom[i * 3 + 2] - hourglassTarget[i * 3 + 2]) * (1 - ease);
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

          // Camera follows (only in follow mode)
          if (cameraModeRef.current === 'follow') {
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

              // Trigger hourglass at bottleneck/gate nodes (Patience/Sabr SR-010)
              if (nd && (nd.type === 'bottleneck' || nd.type === 'gate')) {
                const nPos = nodePositions[toId];
                if (nPos) {
                  triggerHourglass(nPos);
                  // Dissolve after 3 seconds
                  setTimeout(() => dissolveHourglass(), 3000);
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

      // WASD movement
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
      if (keysPressed.has('q') || keysPressed.has(' ')) { camera.position.y += moveSpeed; controls.target.y += moveSpeed; }
      if (keysPressed.has('e') || keysPressed.has('shift')) { camera.position.y = Math.max(5, camera.position.y - moveSpeed); controls.target.y = Math.max(0, controls.target.y - moveSpeed); }

      controls.update();
      renderer.render(scene, camera);
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
      cssRenderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    sceneRef.current = {
      cleanup: () => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        cancelAnimationFrame(animIdRef.current);
        renderer.dispose();
        scene.clear();
        delete (window as any).__sim3d_startWalk;
        delete (window as any).__sim3d_setIsometric;
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

  if (!mounted) return null;

  const simNodes = nodes.filter(n => n.type === 'simNode');

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#080c14' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Walk button */}
      {simNodes.length > 0 && !walking && (
        <button
          onClick={handleStartWalk}
          style={{
            position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
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
