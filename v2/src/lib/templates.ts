export interface TemplateNode {
  id: number;
  type: string;
  label: string;
  x: number;
  y: number;
  prob: number;
  desc: string;
  source: string;
  sourceUrl?: string;
  time?: string;
  sacredRoots?: string[];
}

export interface TemplateEdge {
  from: number;
  to: number;
  label?: string;
}

export interface Template {
  title: string;
  input: string;
  nodes: TemplateNode[];
  edges: TemplateEdge[];
}

import { businessTemplates } from './templates/business';
import { richardTemplates } from './templates/richard';
import { lifeTemplates } from './templates/life';

export const TEMPLATES: Record<string, Template> = {
  ...businessTemplates,
  ...lifeTemplates,
  ...richardTemplates,
};

// Keyword matching for auto-selecting templates
export const TEMPLATE_KEYWORDS: Record<string, string[]> = {
  startup: ['startup', 'company', 'venture', 'founder', 'lanciare', 'avviare', 'impresa'],
  unicorn_startup: ['unicorn', 'billion', '$1b', 'decacorn', 'ipo', 'series a', 'series b', 'series c', 'venture capital', 'vc funded', 'miliardo', 'unicorno'],
  money: ['money', 'desire', 'want', 'sell', 'profit', 'rich', 'wealth', 'soldi', 'vendere', 'guadagn', 'ricco'],
  cafe: ['cafe', 'coffee', 'restaurant', 'food', 'bar', 'caffè', 'ristorante', 'locale', 'pizzeria'],
  content: ['content', 'creator', 'youtube', 'tiktok', 'influencer', 'video', 'contenut', 'creatore'],
  saas: ['saas', 'software', 'app', 'tool', 'platform', 'subscription', 'piattaforma', 'abbonamento'],
  freelance: ['freelance', 'consulting', 'independent', 'gig', 'consulente', 'libero professionista', 'freelancer'],
  app: ['app', 'mobile', 'ios', 'android', 'application', 'download', 'applicazione'],
  lend_money: ['lend', 'borrow', 'loan', 'friend', 'money', 'debt', 'prestare', 'prestito', 'debito', 'amico'],
  lose_weight: ['weight', 'lose', 'diet', 'gym', 'fat', 'fitness', 'exercise', 'dimagrire', 'peso', 'dieta', 'palestra'],
  learn_skill: ['learn', 'skill', 'course', 'study', 'tutorial', 'certification', 'imparare', 'corso', 'studiare', 'competenza'],
  youtube_guru: ['guru', 'course', 'youtube', 'buy course', 'iman', 'liam', '$10k', 'comprare corso'],
  ai_agency: ['ai agency', 'automation', 'agency', 'ai', 'accelerator', 'n8n', 'agenzia', 'automazione'],
  career_change: ['career change', 'change career', 'switch job', 'new career', 'cambiare carriera', 'cambio lavoro', 'reinvent', 'pivot career', 'after 30', 'midlife'],
  upwork_freelance: ['upwork', 'fiverr', 'freelance', 'freelancing', 'gig', 'proposal'],
  saas_scratch: ['saas', 'mvp', 'product hunt', 'arr', 'mrr', 'solo founder', 'indie'],
  side_hustle: ['side hustle', 'side project', 'quit job', '9-5', 'full-time', 'secondo lavoro', 'lavoretto', 'lasciare lavoro'],
  buy_business: ['buy business', 'acquire', 'acquisition', 'bizbuy', 'due diligence', 'comprare azienda', 'acquisizione'],
  affiliate_blog: ['affiliate', 'blog', 'seo', 'commission', 'passive income', 'niche site', 'reddito passivo', 'affiliazione'],
  paid_community: ['community', 'skool', 'circle', 'membership', 'members', 'comunità', 'membri'],
  buy_house: ['house', 'home', 'mortgage', 'buy house', 'comprare casa', 'mutuo', 'first home', 'apartment', 'property', 'real estate', 'down payment', 'affitto vs comprare'],
  richard_cafepedia: ['cafepedia', 'cafe search', 'monetize', 'b2b', 'indonesia cafe'],
  richard_move_abroad: ['move abroad', 'expat', 'leave country', 'trasferirsi', 'emigrare', 'southeast asia'],
  richard_interfaith: ['interfaith', 'christian muslim', 'mixed religion', 'relationship', 'faith couple'],
  richard_break_pattern: ['never sell', 'build dont sell', 'no revenue', 'pattern', 'non vendo mai'],
  richard_first_million: ['100k', 'first million', 'save money', 'geo arbitrage', 'indonesia income'],
  richard_perfectionism: ['perfectionism', 'never ship', 'overpolish', 'perfezionismo', 'non finisco mai'],
  richard_faith_business: ['faith business', 'kingdom', 'christian entrepreneur', 'fede', 'imprenditore cristiano'],
  richard_provider: ['provider', 'provide', 'family', 'mantenere', 'provvedere', 'before 30'],
  richard_polymarket: ['polymarket', 'prediction market', 'bet', 'trading prediction'],
  richard_leverage: ['leverage', 'passive income', 'reddito passivo', 'leva', 'sleep money'],
  want_to_win: ['win', 'winner', 'vincere', 'vittoria', 'success', 'achieve', 'competitive', 'champion', 'first place', 'voglio vincere'],
};
