/**
 * Profile Warning Engine
 *
 * Analyzes UserProfile + scenario to surface actionable warnings
 * before simulation runs. Deterministic — same input = same warnings.
 */

import type { UserProfile } from './user-profile';
import type { ContextTags } from './context-tags';

export interface ProfileWarning {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  relatedFields: string[];
}

// Keywords that indicate scenario categories
const BUSINESS_KEYWORDS = ['business', 'startup', 'company', 'launch', 'entrepreneur', 'found'];
const B2B_KEYWORDS = ['b2b', 'enterprise', 'saas', 'agency', 'consulting', 'client'];
const CAFE_RESTAURANT_KEYWORDS = ['cafe', 'restaurant', 'food', 'bar', 'bakery', 'f&b', 'fnb', 'coffee'];
const TECH_STARTUP_KEYWORDS = ['tech startup', 'saas', 'app', 'software', 'ai startup', 'platform'];
const UPWORK_FREELANCE_KEYWORDS = ['upwork', 'freelance', 'freelancing', 'gig', 'fiverr'];
const COMPETITIVE_KEYWORDS = ['competitive', 'saturated', 'red ocean', 'crowded market'];
const CAPITAL_KEYWORDS = ['capital', 'invest', 'funding', 'raise', 'seed', 'venture'];
const FOREIGN_KEYWORDS = ['abroad', 'foreign', 'expat', 'immigrat', 'relocat', 'visa', 'overseas'];
const TRADING_KEYWORDS = ['trading', 'forex', 'crypto', 'stocks', 'invest', 'portfolio'];

function scenarioMatches(scenario: string, keywords: string[]): boolean {
  const lower = scenario.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

// Low ease-of-business countries (World Bank bottom quartile approximation)
const LOW_EASE_COUNTRIES = [
  'venezuela', 'libya', 'somalia', 'eritrea', 'chad', 'south sudan',
  'central african republic', 'congo', 'haiti', 'myanmar', 'afghanistan',
  'iraq', 'syria', 'yemen', 'sudan', 'north korea',
];

export function analyzeProfile(
  profile: UserProfile,
  scenario: string,
  tags?: ContextTags,
): ProfileWarning[] {
  const warnings: ProfileWarning[] = [];
  const lower = scenario.toLowerCase();
  const isBusiness = scenarioMatches(scenario, BUSINESS_KEYWORDS);
  const isB2B = scenarioMatches(scenario, B2B_KEYWORDS);
  const isCafeRestaurant = scenarioMatches(scenario, CAFE_RESTAURANT_KEYWORDS);
  const isTechStartup = scenarioMatches(scenario, TECH_STARTUP_KEYWORDS);
  const isUpwork = scenarioMatches(scenario, UPWORK_FREELANCE_KEYWORDS);
  const isCompetitive = scenarioMatches(scenario, COMPETITIVE_KEYWORDS);
  const requiresCapital = scenarioMatches(scenario, CAPITAL_KEYWORDS) || isCafeRestaurant || isBusiness;
  const isForeign = scenarioMatches(scenario, FOREIGN_KEYWORDS);
  const isTrading = scenarioMatches(scenario, TRADING_KEYWORDS);

  // 1. No budget + expensive scenario
  if (!profile.capital && !tags?.budget && requiresCapital) {
    warnings.push({
      id: 'no-budget-capital',
      severity: 'critical',
      title: 'No budget defined',
      message: 'This scenario requires capital. Set your budget in Profile or Context tags so the simulation can calibrate financial bottlenecks.',
      relatedFields: ['capital'],
    });
  }

  // 2. Low experience + competitive market
  if (
    (profile.yearsExperience != null && profile.yearsExperience < 2) &&
    (isCompetitive || isBusiness)
  ) {
    warnings.push({
      id: 'low-exp-competitive',
      severity: 'warning',
      title: 'Low experience in a competitive market',
      message: 'Less than 2 years of experience significantly reduces success probability in saturated markets. Consider niche positioning.',
      relatedFields: ['yearsExperience'],
    });
  }

  // 3. No network + B2B
  if ((!profile.networkSize || profile.networkSize === 'none') && isB2B) {
    warnings.push({
      id: 'no-network-b2b',
      severity: 'warning',
      title: 'B2B requires a network',
      message: 'B2B success heavily depends on warm introductions and referrals. Your network is empty — expect cold outreach bottlenecks.',
      relatedFields: ['networkSize'],
    });
  }

  // 4. Low runway
  if (profile.canSurviveMonths != null && profile.canSurviveMonths < 6 && isBusiness) {
    warnings.push({
      id: 'low-runway',
      severity: 'critical',
      title: 'Less than 6 months runway',
      message: `${profile.canSurviveMonths} months of runway is dangerously low for a business launch. Most businesses need 12-18 months to reach profitability.`,
      relatedFields: ['canSurviveMonths'],
    });
  }

  // 5. Age > 50 + tech startup
  if (profile.age != null && profile.age > 50 && isTechStartup) {
    warnings.push({
      id: 'age-tech-startup',
      severity: 'info',
      title: 'Tech startups skew younger',
      message: 'Average successful tech founder age is 45 (Kellogg 2018). Your experience is an advantage — leverage domain expertise over speed.',
      relatedFields: ['age'],
    });
  }

  // 6. No skills listed
  if (!profile.skills || profile.skills.length === 0) {
    warnings.push({
      id: 'no-skills',
      severity: 'warning',
      title: 'No skills listed',
      message: 'Profile skills are empty. The simulation cannot personalize bottleneck probabilities without knowing your competencies.',
      relatedFields: ['skills'],
    });
  }

  // 7. Low ease-of-business country
  const country = (profile.country || tags?.location || '').toLowerCase();
  if (country && LOW_EASE_COUNTRIES.some(c => country.includes(c)) && isBusiness) {
    warnings.push({
      id: 'low-ease-country',
      severity: 'warning',
      title: 'Difficult business environment',
      message: 'This country ranks low on ease-of-doing-business. Expect regulatory, bureaucratic, and infrastructure bottlenecks.',
      relatedFields: ['country'],
    });
  }

  // 8. Budget < $1000 + cafe/restaurant
  const budgetUsd = profile.capital || parseBudgetApprox(tags?.budget);
  if (budgetUsd != null && budgetUsd < 1000 && isCafeRestaurant) {
    warnings.push({
      id: 'low-budget-fnb',
      severity: 'critical',
      title: 'Insufficient capital for F&B',
      message: `$${budgetUsd.toLocaleString()} is far below the minimum for a food & beverage business. Average cafe startup costs $80K-$300K.`,
      relatedFields: ['capital'],
    });
  }

  // 9. Foreign country + no visa mention
  if (
    profile.nationality && profile.country &&
    profile.nationality.toLowerCase() !== profile.country.toLowerCase() &&
    (isBusiness || isForeign)
  ) {
    warnings.push({
      id: 'foreign-legal',
      severity: 'warning',
      title: 'Foreign national — check legal status',
      message: 'Operating a business as a foreign national adds visa, work permit, and ownership restrictions. Verify legal requirements.',
      relatedFields: ['nationality', 'country'],
    });
  }

  // 10. Timeline too aggressive
  const timelineMonths = parseTimelineApprox(tags?.timeline);
  if (timelineMonths != null && timelineMonths < 3 && isBusiness) {
    warnings.push({
      id: 'aggressive-timeline',
      severity: 'warning',
      title: 'Timeline too aggressive',
      message: `${timelineMonths} month${timelineMonths === 1 ? '' : 's'} is very tight for a business launch. Most need 6-12 months minimum to validate and reach first revenue.`,
      relatedFields: [],
    });
  }

  // 11. No income + no savings + business
  if (
    (profile.monthlyIncome == null || profile.monthlyIncome === 0) &&
    (profile.savings == null || profile.savings === 0) &&
    (profile.capital == null || profile.capital === 0) &&
    isBusiness
  ) {
    warnings.push({
      id: 'no-financial-base',
      severity: 'critical',
      title: 'No financial base',
      message: 'No income, savings, or capital detected. Starting a business with zero financial resources has an extremely high failure rate.',
      relatedFields: ['monthlyIncome', 'savings', 'capital'],
    });
  }

  // 12. JSS < 80 for Upwork
  if (profile.upworkJSS != null && profile.upworkJSS < 80 && isUpwork) {
    warnings.push({
      id: 'low-jss',
      severity: 'warning',
      title: 'Low JSS score',
      message: `JSS ${profile.upworkJSS}% triggers a visibility penalty on Upwork. Below 80% dramatically reduces invite rates and search ranking.`,
      relatedFields: ['upworkJSS'],
    });
  }

  // 13. High debt + new venture
  if (profile.debt != null && profile.debt > 10000 && isBusiness) {
    warnings.push({
      id: 'high-debt',
      severity: 'warning',
      title: 'Existing debt burden',
      message: `$${profile.debt.toLocaleString()} in debt adds financial pressure. Debt servicing reduces effective runway and increases stress-related failure.`,
      relatedFields: ['debt'],
    });
  }

  // 14. No mentor + solo founder
  if (!profile.hasMentor && !profile.hasCofounder && !profile.hasTeam && isBusiness) {
    warnings.push({
      id: 'solo-no-mentor',
      severity: 'info',
      title: 'Solo founder with no mentor',
      message: 'Solo founders without mentors have 3.6x lower survival rate (SBA data). Consider finding an advisor or accountability partner.',
      relatedFields: ['hasMentor', 'hasCofounder'],
    });
  }

  // 15. Aggressive risk + low experience
  if (
    profile.riskTolerance === 'aggressive' &&
    (profile.yearsExperience == null || profile.yearsExperience < 3)
  ) {
    warnings.push({
      id: 'aggressive-low-exp',
      severity: 'info',
      title: 'Aggressive risk with limited experience',
      message: 'Aggressive risk tolerance combined with limited experience often leads to costly mistakes. Data shows conservative-first strategies compound faster for beginners.',
      relatedFields: ['riskTolerance', 'yearsExperience'],
    });
  }

  // 16. Trading without capital
  if (isTrading && (budgetUsd == null || budgetUsd < 500)) {
    warnings.push({
      id: 'trading-no-capital',
      severity: 'critical',
      title: 'Insufficient trading capital',
      message: 'Trading with less than $500 makes position sizing nearly impossible. Commission and spread costs consume a disproportionate share of small accounts.',
      relatedFields: ['capital'],
    });
  }

  // 17. Empty profile entirely
  const filledCount = Object.entries(profile).filter(
    ([, v]) => v != null && v !== '' && (!Array.isArray(v) || v.length > 0),
  ).length;
  if (filledCount < 3 && scenario.length > 0) {
    warnings.push({
      id: 'sparse-profile',
      severity: 'info',
      title: 'Profile mostly empty',
      message: 'Only a few fields filled. The simulation will use generic averages instead of personalized probabilities. Fill your profile for accurate results.',
      relatedFields: [],
    });
  }

  // 18. Upwork no badge + freelance scenario
  if (isUpwork && (!profile.upworkBadge || profile.upworkBadge === 'none') && profile.upworkEarnings == null) {
    warnings.push({
      id: 'upwork-new-account',
      severity: 'warning',
      title: 'New Upwork account detected',
      message: 'No badge and no earnings history. New accounts face 90%+ proposal rejection rates. First 5 reviews are critical.',
      relatedFields: ['upworkBadge', 'upworkEarnings'],
    });
  }

  return warnings;
}

/**
 * Get field-level warnings for ProfilePanel indicators
 */
export function getFieldWarnings(profile: UserProfile): Record<string, 'critical' | 'warning'> {
  const fieldWarnings: Record<string, 'critical' | 'warning'> = {};

  // Critical: no financial data at all
  if (profile.capital == null && profile.monthlyIncome == null && profile.savings == null) {
    fieldWarnings['capital'] = 'critical';
    fieldWarnings['monthlyIncome'] = 'critical';
    fieldWarnings['savings'] = 'critical';
  }

  // Warning: no skills
  if (!profile.skills || profile.skills.length === 0) {
    fieldWarnings['skills'] = 'warning';
  }

  // Warning: no experience
  if (profile.yearsExperience == null) {
    fieldWarnings['yearsExperience'] = 'warning';
  }

  // Critical: low runway
  if (profile.canSurviveMonths != null && profile.canSurviveMonths < 6) {
    fieldWarnings['canSurviveMonths'] = 'critical';
  }

  // Warning: no country
  if (!profile.country) {
    fieldWarnings['country'] = 'warning';
  }

  // Warning: low JSS
  if (profile.upworkJSS != null && profile.upworkJSS < 80) {
    fieldWarnings['upworkJSS'] = 'critical';
  }

  // Warning: no network
  if (!profile.networkSize || profile.networkSize === 'none') {
    fieldWarnings['networkSize'] = 'warning';
  }

  return fieldWarnings;
}

// Simple budget parser (approximate)
function parseBudgetApprox(raw?: string): number | null {
  if (!raw) return null;
  const clean = raw.replace(/[,\s]/g, '').toLowerCase();
  const numMatch = clean.match(/\$?([\d.]+)(k|m)?/);
  if (numMatch) {
    let val = parseFloat(numMatch[1]);
    if (numMatch[2] === 'k') val *= 1000;
    if (numMatch[2] === 'm') val *= 1000000;
    return val;
  }
  const jutaMatch = raw.match(/([\d.]+)\s*juta/i);
  if (jutaMatch) return parseFloat(jutaMatch[1]) * 1000000 / 16000;
  return null;
}

// Simple timeline parser (returns months)
function parseTimelineApprox(raw?: string): number | null {
  if (!raw) return null;
  const clean = raw.toLowerCase().trim();
  const mMatch = clean.match(/(\d+)\s*(month|mesi|bulan|mo)/);
  if (mMatch) return parseInt(mMatch[1]);
  const yMatch = clean.match(/(\d+)\s*(year|anni|tahun|yr)/);
  if (yMatch) return parseInt(yMatch[1]) * 12;
  const wMatch = clean.match(/(\d+)\s*(week|settiman|minggu)/);
  if (wMatch) return Math.ceil(parseInt(wMatch[1]) / 4.3);
  return null;
}
