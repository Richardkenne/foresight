/**
 * User Profile — personalizes every simulation
 *
 * Stored in localStorage. Injected into Claude prompt so probabilities
 * are calibrated to THIS person, not generic averages.
 */

export interface UserProfile {
  // Identity
  name?: string;
  age?: number;
  country?: string;           // where they live
  city?: string;
  nationality?: string;       // origin country (can differ from residence)
  languages?: string[];       // spoken languages

  // Financial
  capital?: number;           // available capital in USD
  monthlyIncome?: number;     // current income in USD
  monthlyExpenses?: number;   // fixed expenses in USD
  savings?: number;           // emergency fund in USD
  debt?: number;              // total debt in USD

  // Professional
  skills?: string[];          // key skills (max 5)
  yearsExperience?: number;   // total professional experience
  currentRole?: string;       // current job/role
  industry?: string;          // current industry
  education?: 'high-school' | 'bachelor' | 'master' | 'phd' | 'self-taught' | 'bootcamp';

  // Network & Resources
  networkSize?: 'none' | 'small' | 'medium' | 'large';  // professional network
  hasMentor?: boolean;
  hasCofounder?: boolean;
  hasTeam?: boolean;

  // Platform-specific (Upwork, etc.)
  upworkJSS?: number;         // Job Success Score 0-100
  upworkEarnings?: number;    // lifetime Upwork earnings
  upworkBadge?: 'none' | 'rising-talent' | 'top-rated' | 'top-rated-plus' | 'expert-vetted';
  freelanceRate?: number;     // current hourly rate USD

  // Risk profile
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  canSurviveMonths?: number;  // months of runway without income
}

const STORAGE_KEY = 'simulator-profile';

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch { /* quota exceeded — ignore */ }
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function clearProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if profile has enough data to be useful
 */
export function isProfileComplete(profile: UserProfile): boolean {
  const fields = [profile.age, profile.country, profile.skills?.length, profile.yearsExperience];
  return fields.filter(Boolean).length >= 3;
}

/**
 * Generate prompt modifier from user profile.
 * Injected into Claude system prompt to personalize probabilities.
 */
export function getProfilePromptModifier(profile: UserProfile): string {
  if (!profile || Object.keys(profile).length === 0) return '';

  const parts: string[] = [];

  // Identity context
  const identity: string[] = [];
  if (profile.age) identity.push(`${profile.age} years old`);
  if (profile.nationality && profile.country && profile.nationality !== profile.country) {
    identity.push(`${profile.nationality} national living in ${profile.country}${profile.city ? ` (${profile.city})` : ''}`);
  } else if (profile.country) {
    identity.push(`based in ${profile.country}${profile.city ? ` (${profile.city})` : ''}`);
  }
  if (profile.languages?.length) identity.push(`speaks ${profile.languages.join(', ')}`);
  if (identity.length > 0) parts.push(`PERSON: ${identity.join(', ')}.`);

  // Financial context
  const finance: string[] = [];
  if (profile.capital != null) finance.push(`available capital: $${profile.capital.toLocaleString()}`);
  if (profile.monthlyIncome != null) finance.push(`monthly income: $${profile.monthlyIncome.toLocaleString()}`);
  if (profile.monthlyExpenses != null) finance.push(`monthly expenses: $${profile.monthlyExpenses.toLocaleString()}`);
  if (profile.savings != null) finance.push(`savings: $${profile.savings.toLocaleString()}`);
  if (profile.debt != null && profile.debt > 0) finance.push(`debt: $${profile.debt.toLocaleString()}`);
  if (profile.canSurviveMonths != null) finance.push(`runway: ${profile.canSurviveMonths} months without income`);
  if (finance.length > 0) parts.push(`FINANCES: ${finance.join(', ')}. Adjust all monetary bottlenecks to this person's financial reality.`);

  // Professional context
  const pro: string[] = [];
  if (profile.currentRole) pro.push(`current role: ${profile.currentRole}`);
  if (profile.industry) pro.push(`industry: ${profile.industry}`);
  if (profile.yearsExperience != null) pro.push(`${profile.yearsExperience} years experience`);
  if (profile.skills?.length) pro.push(`skills: ${profile.skills.join(', ')}`);
  if (profile.education) pro.push(`education: ${profile.education}`);
  if (pro.length > 0) {
    const expMod = profile.yearsExperience != null
      ? profile.yearsExperience >= 7 ? 'Experienced — reduce beginner failure rates by 15-20%.'
        : profile.yearsExperience >= 3 ? 'Moderate experience — use standard probabilities.'
        : profile.yearsExperience >= 1 ? 'Junior — increase failure rates by 10-15%.'
        : 'No experience — increase failure rates by 20-30%, add learning curve nodes.'
      : '';
    parts.push(`PROFESSIONAL: ${pro.join(', ')}. ${expMod}`);
  }

  // Network context
  const net: string[] = [];
  if (profile.networkSize) {
    const netMod: Record<string, string> = {
      'none': 'No professional network — add networking/cold outreach bottlenecks. Multiply community_and_counsel modifiers negatively.',
      'small': 'Small network (5-20 contacts) — some referrals possible but limited.',
      'medium': 'Medium network (20-100) — referrals and warm intros available.',
      'large': 'Large network (100+) — strong referral pipeline, reduce client acquisition friction.',
    };
    net.push(netMod[profile.networkSize]);
  }
  if (profile.hasMentor) net.push('Has a mentor — increase success probabilities by 10-15% (SCORE/SBA data: mentored businesses 5x survival rate).');
  if (profile.hasCofounder) net.push('Has a co-founder — reduce solo-founder failure penalty.');
  if (profile.hasTeam) net.push('Has a team — can delegate, reduce bottleneck on personal time.');
  if (net.length > 0) parts.push(`NETWORK: ${net.join(' ')}`);

  // Upwork/freelance specific
  const upwork: string[] = [];
  if (profile.upworkBadge && profile.upworkBadge !== 'none') {
    const badges: Record<string, string> = {
      'rising-talent': 'Rising Talent badge — 1.5-2x visibility boost, still building JSS.',
      'top-rated': 'Top Rated — 3-5x more invites, 90%+ JSS, $10K+ earned. Use Top Rated conversion rates (15-25% proposal-to-interview).',
      'top-rated-plus': 'Top Rated Plus — elite tier (1-2% of active). Use 30-50% proposal-to-interview rate.',
      'expert-vetted': 'Expert-Vetted — top 1%. Rates $150-300/hr. Skip early-stage bottlenecks.',
    };
    upwork.push(badges[profile.upworkBadge]);
  }
  if (profile.upworkJSS != null) upwork.push(`JSS: ${profile.upworkJSS}%${profile.upworkJSS >= 90 ? ' (strong — 2-3x hire rate)' : profile.upworkJSS < 80 ? ' (low — visibility penalty)' : ''}`);
  if (profile.upworkEarnings != null) upwork.push(`lifetime earnings: $${profile.upworkEarnings.toLocaleString()}`);
  if (profile.freelanceRate != null) upwork.push(`current rate: $${profile.freelanceRate}/hr`);
  if (upwork.length > 0) parts.push(`UPWORK PROFILE: ${upwork.join(', ')}. Calibrate all Upwork-related probabilities to this specific profile level.`);

  // Risk profile
  if (profile.riskTolerance) {
    const risk: Record<string, string> = {
      'conservative': 'Conservative risk profile — will not bet everything, prefers stable paths. Weight retainer/employment paths higher.',
      'moderate': 'Moderate risk — open to calculated bets with fallback plans.',
      'aggressive': 'Aggressive risk — willing to go all-in. Weight high-risk/high-reward paths.',
    };
    parts.push(`RISK: ${risk[profile.riskTolerance]}`);
  }

  if (parts.length === 0) return '';

  return '\n\nUSER PROFILE (calibrate ALL probabilities to this specific person — NOT generic averages):\n' + parts.join('\n');
}
