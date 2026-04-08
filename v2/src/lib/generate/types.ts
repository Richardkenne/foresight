// ============ Shared types for the generate service layers ============

export interface SacredEntry { s: string; b: string; q: string; c: string; src: string; k: string[] }
export interface SacredIndex { patterns: SacredEntry[]; keywordIndex: Record<string, number[]> }

export interface SacredRoot {
  id: string; domain: string; name_en: string;
  label_positive: string; label_negative: string;
  bible_key: string; bible_text: string;
  quran_key: string; quran_text: string;
  description: string; example_sentences: string[];
  keywords: string[];
}

export interface ArchetypeStage { id: string; label: string; prob: number; time: string; source: string }
export interface Archetype { name: string; description: string; entry_point: string; stages: ArchetypeStage[]; bottlenecks?: string[]; cumulative_end_to_end?: string; end_to_end_conversion?: string; reality_check?: string }
export interface ArchetypeData { archetypes: Record<string, Archetype> }
export interface SectionEntry { metric?: string; value?: string | number; unit?: string; source?: string; year?: string | number; pattern?: string; modern_equivalent?: string; business_application?: string; cycle_name?: string; what_happened?: string; sacred_source_bible?: string; sacred_source_quran?: string; data_confirmation?: string; data_source?: string; modern_parallel?: string; modern_data?: string }
export interface SectionData { sections: Record<string, SectionEntry[]> }
export interface FunnelData { stages?: { label: string; prob: number; source: string }[]; [key: string]: unknown }

export interface RestCountryResponse {
  name: { common: string; official: string };
  population: number;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol: string }>;
  capital?: string[];
  region: string;
}

export interface TeleportCategory { name: string; score_out_of_10: number }
export interface TeleportResponse { teleport_city_score: number; categories: TeleportCategory[] }

export interface NodeDep { targetNodeLabel: string; modifier: number }
export interface FlowNode { id: number; label: string; type: string; prob?: number; modifiesDownstream?: NodeDep[]; [key: string]: unknown }

export interface ParentContext {
  parentScenario: string;
  parentNodeLabel: string;
  parentNodeDescription: string;
  parentNodeProb: number;
  depth: number;
}

export type DepthLevel = 'summary' | 'analysis' | 'full';

export const DEPTH_NODE_COUNTS: Record<DepthLevel, { min: number; max: number; label: string }> = {
  summary: { min: 5, max: 7, label: 'Summary' },
  analysis: { min: 10, max: 14, label: 'Analysis' },
  full: { min: 30, max: 45, label: 'Full Model' },
};

export interface GenerateRequest {
  scenario: string;
  tags?: import('@/lib/context-tags').ContextTags;
  profile?: Record<string, unknown>;
  sacredMode?: boolean;
  parentContext?: ParentContext;
  depthLevel?: DepthLevel;
}
