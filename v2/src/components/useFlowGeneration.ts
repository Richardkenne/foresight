import { useCallback, useRef, useState } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { TEMPLATES, TEMPLATE_KEYWORDS, type TemplateNode, type TemplateEdge } from '@/lib/templates';
import type { ContextTags } from '@/lib/context-tags';
import { saveToHistory, createThumbnail, type HistoryEntry } from '@/lib/history';
import { applyRealProbabilities } from '@/lib/probability-matcher';
import type { PruningResult } from './DecisionPruning';
import type { UserProfile } from '@/lib/user-profile';
import { analyzeProfile, type ProfileWarning } from '@/lib/profile-warnings';
import { templateToFlow } from '@/lib/graph-utils';
import { toast } from './ui/Toast';
import { sounds } from '@/lib/sounds';
import type { DepthLevel } from '@/lib/generate/types';

export interface UseFlowGenerationParams {
  nodesRef: React.MutableRefObject<RFNode[]>;
  edgesRef: React.MutableRefObject<RFEdge[]>;
  setNodes: React.Dispatch<React.SetStateAction<RFNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<RFEdge[]>>;
  fitView: (opts?: Record<string, unknown>) => void;
  contextTagsRef: React.MutableRefObject<ContextTags>;
  profileRef: React.MutableRefObject<UserProfile>;
  layoutDirection: 'LR' | 'TB';
  undoPushState: (state: { nodes: RFNode[]; edges: RFEdge[] }) => void;
  // Simulation
  sim: {
    stopSim: () => void;
    setShowDashboard: (v: boolean) => void;
    setParticles: (p: ParticleData[]) => void;
    particlesRef: React.MutableRefObject<ParticleData[]>;
    statsRef: React.MutableRefObject<{ total: number; success: number; blocked: number }>;
    setSimStats: (s: { total: number; success: number; blocked: number }) => void;
    setYouOutcome: (v: null) => void;
    youPathRef: React.MutableRefObject<Set<string>>;
    simRunningRef: React.MutableRefObject<boolean>;
    dataflowRef: React.MutableRefObject<{ buildFromTemplate: (n: TemplateNode[], e: TemplateEdge[]) => Promise<void>; computeAll: () => Promise<Record<string, number>> }>;
    nodeValuesRef: React.MutableRefObject<Record<string, number>>;
    setNodeValues: (v: Record<string, number>) => void;
    handleNodeSliderChange: (nodeId: string, value: number, nodeType: string) => void;
  };
  doSimulate: () => void;
  requestSimulate: () => void;
}

// Minimal type for particle data
type ParticleData = import('./Particle').ParticleData;

export function useFlowGeneration({
  nodesRef,
  edgesRef,
  setNodes,
  setEdges,
  fitView,
  contextTagsRef,
  profileRef,
  layoutDirection,
  undoPushState,
  sim,
  doSimulate,
  requestSimulate,
}: UseFlowGenerationParams) {
  const [scenario, setScenario] = useState('');
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<import('./TopBar').Attachment[]>([]);
  const [lastFlowData, setLastFlowData] = useState<Record<string, unknown> | null>(null);
  const [sacredMode, setSacredMode] = useState(false);
  const [profileWarnings, setProfileWarnings] = useState<ProfileWarning[]>([]);
  const [apiPruningQuestions, setApiPruningQuestions] = useState<Array<{id:string;question:string;section:string;yesModifier:number;noModifier:number;yesLabel:string;noLabel:string;insight:string}>>([]);
  const [depthLevel, setDepthLevel] = useState<DepthLevel>('analysis');

  const abortRef = useRef<AbortController | null>(null);

  // Load a template
  const loadTemplate = useCallback((key: string, autoSim = false) => {
    const t = TEMPLATES[key];
    if (!t) return;
    setPhotoPreview(null);
    sim.statsRef.current = { total: 0, success: 0, blocked: 0 };
    sim.setSimStats({ total: 0, success: 0, blocked: 0 });
    sim.setYouOutcome(null);
    sim.youPathRef.current = new Set();
    sim.stopSim();
    sim.setShowDashboard(false);
    sim.particlesRef.current = [];
    sim.setParticles([]);
    setScenario(t.input);

    // ALWAYS load hardcoded template instantly (0 seconds, no API call)
    const enrichedNodes = applyRealProbabilities(t.nodes) as typeof t.nodes;
    const { nodes: ln, edges: le } = templateToFlow(enrichedNodes, t.edges, undefined, layoutDirection);
    setNodes(ln);
    setEdges(le);
    setErrorMsg('');
    sounds.whoosh();
    undoPushState({ nodes: ln, edges: le });

    sim.dataflowRef.current.buildFromTemplate(t.nodes, t.edges).then(async () => {
      const values = await sim.dataflowRef.current.computeAll();
      sim.nodeValuesRef.current = values;
      sim.setNodeValues(values);
      setNodes(prev => prev.map(n => {
        const nt = (n.data as Record<string, unknown>).nodeType as string;
        const isInteractive = nt === 'start' || nt === 'bottleneck' || nt === 'decision' || nt === 'gate';
        return {
          ...n,
          data: {
            ...n.data,
            computedValue: values[n.id],
            onSliderChange: isInteractive
              ? (val: number) => sim.handleNodeSliderChange(n.id, val, nt)
              : undefined,
          },
        };
      }));
    });

    setTimeout(() => {
      fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 });
      if (autoSim) setTimeout(() => doSimulate(), 500);
    }, 100);

    // Background refresh: Tavily fetches fresh data and updates probabilities in-place
    // No loading spinner, no regeneration — just silently updates numbers
    fetch('/api/refresh-probs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: t.input, nodes: t.nodes }),
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data?.updates || data.updates.length === 0) return;
        // Apply fresh probabilities to existing nodes
        setNodes(prev => prev.map(n => {
          const update = data.updates.find((u: { id: string; prob: number; source: string; probRange?: { optimistic: number; adverse: number } }) => String(u.id) === n.id);
          if (!update) return n;
          return {
            ...n,
            data: {
              ...n.data,
              prob: update.prob,
              probRange: update.probRange || (n.data as Record<string, unknown>).probRange,
              source: update.source || (n.data as Record<string, unknown>).source,
              freshData: true, // flag to show "updated" indicator
            },
          };
        }));
        console.log(`[REFRESH] Updated ${data.updates.length} node probabilities from web search`);
      })
      .catch(() => { /* silent fail — hardcoded data is already loaded */ });

  }, [setNodes, setEdges, fitView, sacredMode, layoutDirection, undoPushState, doSimulate, sim, contextTagsRef, profileRef]); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate from AI
  const generateFlow = useCallback(async () => {
    const textInput = scenario.trim();
    let input = textInput;
    if (attachments.length > 0) {
      const parts: string[] = [];
      if (textInput) parts.push(textInput);
      for (const att of attachments) {
        parts.push(`[${att.type.toUpperCase()} source: ${att.label}]\n${att.content}`);
      }
      input = parts.join('\n\n---\n\n');
    }
    if (!input) return;
    sounds.click();
    const inputLower = input.toLowerCase();
    const inputWords = inputLower.split(/\s+/).filter(w => w.length > 2);

    const fuzzyMatch = (word: string, keyword: string): boolean => {
      if (keyword.length < 3) return word === keyword;
      if (inputLower.includes(keyword)) return true;
      for (const w of inputWords) {
        if (w.length < 3) continue;
        if (w.startsWith(keyword) || keyword.startsWith(w)) return true;
        if (Math.abs(w.length - keyword.length) <= 1) {
          const longer = w.length >= keyword.length ? w : keyword;
          const shorter = w.length < keyword.length ? w : keyword;
          let diffs = 0;
          let si = 0;
          for (let li = 0; li < longer.length && diffs <= 2; li++) {
            if (shorter[si] === longer[li]) { si++; }
            else { diffs++; if (longer.length === shorter.length) si++; }
          }
          diffs += shorter.length - si;
          if (diffs <= 2 && shorter.length >= 4) return true;
        }
      }
      return false;
    };

    let best: string | null = null;
    let bestScore = 0;
    for (const [k, words] of Object.entries(TEMPLATE_KEYWORDS)) {
      const sc = words.filter(w => fuzzyMatch(inputLower, w)).length;
      if (sc > bestScore) { bestScore = sc; best = k; }
    }
    if (bestScore >= 3 && best) { loadTemplate(best, true); return; }

    setGenerating(true);
    setErrorMsg('');
    abortRef.current = new AbortController();
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: input, tags: contextTagsRef.current, profile: profileRef.current, sacredMode, depthLevel }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error('Server error');
      const flow = await res.json();
      if (!flow.nodes || !flow.edges) throw new Error('Invalid flow');
      setLastFlowData(flow);

      if (flow.pruning_questions && Array.isArray(flow.pruning_questions)) {
        setApiPruningQuestions(flow.pruning_questions);
      } else {
        setApiPruningQuestions([]);
      }

      sim.statsRef.current = { total: 0, success: 0, blocked: 0 };
      sim.setSimStats({ total: 0, success: 0, blocked: 0 });
      sim.stopSim();
      sim.setShowDashboard(false);
      sim.particlesRef.current = [];
      sim.setParticles([]);
      const tNodes: TemplateNode[] = flow.nodes.map((n: TemplateNode) => ({ ...n, source: n.source || 'AI generated' }));
      const nodeTypeMap: Record<number, string> = {};
      for (const n of tNodes) nodeTypeMap[n.id] = n.type;
      const tEdges: TemplateEdge[] = (flow.edges as TemplateEdge[]).map(e => {
        if (e.label) return e;
        const srcType = nodeTypeMap[e.from];
        const tgtType = nodeTypeMap[e.to];
        if (srcType === 'bottleneck' || srcType === 'decision' || srcType === 'gate') {
          if (tgtType === 'outcome-bad') return { ...e, label: srcType === 'decision' ? 'no' : 'fail' };
          const siblings = (flow.edges as TemplateEdge[]).filter(s => s.from === e.from && s !== e);
          const siblingGoesToBad = siblings.some(s => nodeTypeMap[s.to] === 'outcome-bad');
          if (siblingGoesToBad) return { ...e, label: srcType === 'decision' ? 'yes' : 'pass' };
          if (srcType === 'gate' && tgtType === 'state') return { ...e, label: 'partial' };
        }
        return e;
      });
      const ctx = photoPreview ? { photoUrl: photoPreview, scenario: input } : undefined;
      const { nodes: ln, edges: le } = templateToFlow(tNodes, tEdges, ctx, layoutDirection);
      setNodes(ln);
      setEdges(le);
      undoPushState({ nodes: ln, edges: le });

      const warnings = analyzeProfile(profileRef.current, input, contextTagsRef.current);
      setProfileWarnings(warnings);

      const historyEntry: Omit<HistoryEntry, 'id' | 'timestamp'> = {
        scenario: input,
        tags: contextTagsRef.current ? { ...contextTagsRef.current } : undefined,
        flowData: { nodes: flow.nodes, edges: flow.edges },
      };
      if (photoPreview) {
        createThumbnail(photoPreview).then(thumb => {
          saveToHistory({ ...historyEntry, photoThumbnail: thumb || undefined });
        });
      } else {
        saveToHistory(historyEntry);
      }

      setTimeout(() => {
        fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 });
        setTimeout(() => requestSimulate(), 500);
      }, 100);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // User cancelled
      } else if (best && bestScore >= 2) {
        loadTemplate(best, true);
      } else {
        setErrorMsg('Could not generate scenario. Check your internet connection or pick a template.');
        toast.error('Generation failed. Check your connection or pick a template.');
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }, [scenario, attachments, loadTemplate, setNodes, setEdges, fitView, sacredMode, layoutDirection, photoPreview, undoPushState, requestSimulate, sim, contextTagsRef, profileRef]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle photo scenario generation
  const handlePhotoScenario = useCallback((s: string, preview?: string) => {
    setScenario(s);
    if (preview) setPhotoPreview(preview);
    setTimeout(() => {
      const input = s.trim();
      if (!input) return;
      setGenerating(true);
      setErrorMsg('');
      fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: input, tags: contextTagsRef.current, profile: profileRef.current, sacredMode, fromPhoto: true }),
      })
        .then(res => { if (!res.ok) throw new Error('Server error'); return res.json(); })
        .then(flow => {
          if (!flow.nodes || !flow.edges) throw new Error('Invalid flow');
          setLastFlowData(flow);
          sim.statsRef.current = { total: 0, success: 0, blocked: 0 };
          sim.setSimStats({ total: 0, success: 0, blocked: 0 });
          sim.stopSim();
          sim.setShowDashboard(false);
          sim.particlesRef.current = [];
          sim.setParticles([]);
          const tNodes = flow.nodes.map((n: TemplateNode) => ({ ...n, source: n.source || 'AI generated (photo)' }));
          const { nodes: ln, edges: le } = templateToFlow(tNodes, flow.edges, preview ? { photoUrl: preview, scenario: s } : undefined, layoutDirection);
          setNodes(ln);
          setEdges(le);

          const photoHistEntry: Omit<HistoryEntry, 'id' | 'timestamp'> = {
            scenario: s,
            tags: contextTagsRef.current ? { ...contextTagsRef.current } : undefined,
            flowData: { nodes: flow.nodes, edges: flow.edges },
          };
          if (preview) {
            createThumbnail(preview).then(thumb => {
              saveToHistory({ ...photoHistEntry, photoThumbnail: thumb || undefined });
            });
          } else {
            saveToHistory(photoHistEntry);
          }

          setTimeout(() => {
            fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 });
            setTimeout(() => doSimulate(), 500);
          }, 100);
        })
        .catch(() => { setErrorMsg('Could not generate scenario from photo.'); toast.error('Could not generate scenario from photo.'); })
        .finally(() => setGenerating(false));
    }, 50);
  }, [sacredMode, layoutDirection, setNodes, setEdges, fitView, doSimulate, sim, contextTagsRef, profileRef]); // eslint-disable-line react-hooks/exhaustive-deps

  // History: load a saved simulation entry
  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    const flow = entry.flowData;
    if (!flow?.nodes || !flow?.edges) return;

    setScenario(entry.scenario || '');
    setPhotoPreview(entry.photoThumbnail || null);
    setLastFlowData(flow as Record<string, unknown>);

    sim.statsRef.current = { total: 0, success: 0, blocked: 0 };
    sim.setSimStats({ total: 0, success: 0, blocked: 0 });
    sim.stopSim();
    sim.setShowDashboard(false);
    sim.particlesRef.current = [];
    sim.setParticles([]);
    setErrorMsg('');

    const tNodes = (flow.nodes as TemplateNode[]).map(n => ({ ...n, source: n.source || 'History' }));
    const ctx = entry.photoThumbnail ? { photoUrl: entry.photoThumbnail, scenario: entry.scenario } : undefined;
    const { nodes: ln, edges: le } = templateToFlow(tNodes, flow.edges as TemplateEdge[], ctx, layoutDirection);
    setNodes(ln);
    setEdges(le);

    setTimeout(() => {
      fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 });
      setTimeout(() => doSimulate(), 500);
    }, 100);
  }, [setNodes, setEdges, fitView, layoutDirection, sim, doSimulate]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    scenario,
    setScenario,
    generating,
    setGenerating,
    errorMsg,
    setErrorMsg,
    photoPreview,
    setPhotoPreview,
    attachments,
    setAttachments,
    lastFlowData,
    setLastFlowData,
    sacredMode,
    setSacredMode,
    profileWarnings,
    setProfileWarnings,
    apiPruningQuestions,
    depthLevel,
    setDepthLevel,
    abortRef,
    loadTemplate,
    generateFlow,
    handlePhotoScenario,
    handleHistorySelect,
  };
}
