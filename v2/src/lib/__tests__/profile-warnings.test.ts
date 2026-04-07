import { describe, it, expect } from 'vitest';
import { analyzeProfile, getFieldWarnings } from '../profile-warnings';
import type { UserProfile } from '../user-profile';

describe('analyzeProfile', () => {
  it('returns sparse-profile warning for nearly empty profile', () => {
    const profile: UserProfile = {};
    const warnings = analyzeProfile(profile, 'I want to start a business');
    const ids = warnings.map(w => w.id);
    expect(ids).toContain('sparse-profile');
  });

  it('returns no-budget-capital for business scenario without capital', () => {
    const profile: UserProfile = { name: 'Test', age: 30 };
    const warnings = analyzeProfile(profile, 'I want to start a business');
    const ids = warnings.map(w => w.id);
    expect(ids).toContain('no-budget-capital');
    const w = warnings.find(w => w.id === 'no-budget-capital');
    expect(w?.severity).toBe('critical');
  });

  it('returns low-budget-fnb for cafe with $500 budget', () => {
    const profile: UserProfile = { capital: 500, name: 'Test', age: 30, skills: ['barista'] };
    const warnings = analyzeProfile(profile, 'I want to open a cafe');
    const ids = warnings.map(w => w.id);
    expect(ids).toContain('low-budget-fnb');
    const w = warnings.find(w => w.id === 'low-budget-fnb');
    expect(w?.severity).toBe('critical');
  });

  it('returns low-runway for business with 3 months runway', () => {
    const profile: UserProfile = {
      name: 'Test', age: 30, capital: 5000, canSurviveMonths: 3,
      skills: ['dev'],
    };
    const warnings = analyzeProfile(profile, 'I want to launch a startup');
    const ids = warnings.map(w => w.id);
    expect(ids).toContain('low-runway');
    const w = warnings.find(w => w.id === 'low-runway');
    expect(w?.severity).toBe('critical');
  });

  it('returns foreign-legal for non-matching nationality and country', () => {
    const profile: UserProfile = {
      name: 'Test', age: 30, nationality: 'Italian', country: 'Indonesia',
      capital: 50000, skills: ['dev'],
    };
    const warnings = analyzeProfile(profile, 'I want to start a business');
    const ids = warnings.map(w => w.id);
    expect(ids).toContain('foreign-legal');
  });

  it('returns no-skills warning for empty skills array', () => {
    const profile: UserProfile = { name: 'Test', age: 30, capital: 50000, skills: [] };
    const warnings = analyzeProfile(profile, 'I want to start a business');
    const ids = warnings.map(w => w.id);
    expect(ids).toContain('no-skills');
  });

  it('returns low-exp-competitive for low experience + business', () => {
    const profile: UserProfile = {
      name: 'Test', age: 22, yearsExperience: 1,
      capital: 10000, skills: ['marketing'],
    };
    const warnings = analyzeProfile(profile, 'I want to start a business');
    const ids = warnings.map(w => w.id);
    expect(ids).toContain('low-exp-competitive');
  });

  it('returns no-network-b2b for B2B without network', () => {
    const profile: UserProfile = {
      name: 'Test', age: 30, networkSize: 'none',
      capital: 10000, skills: ['sales'],
    };
    const warnings = analyzeProfile(profile, 'I want to start a B2B SaaS consulting agency');
    const ids = warnings.map(w => w.id);
    expect(ids).toContain('no-network-b2b');
  });

  it('returns no-financial-base for zero income/savings/capital + business', () => {
    const profile: UserProfile = {
      name: 'Test', age: 25,
      monthlyIncome: 0, savings: 0, capital: 0,
      skills: ['dev'],
    };
    const warnings = analyzeProfile(profile, 'I want to start a business');
    const ids = warnings.map(w => w.id);
    expect(ids).toContain('no-financial-base');
  });

  it('returns trading-no-capital for trading with $100', () => {
    const profile: UserProfile = {
      name: 'Test', age: 30, capital: 100, skills: ['analysis'],
    };
    const warnings = analyzeProfile(profile, 'I want to start trading crypto');
    const ids = warnings.map(w => w.id);
    expect(ids).toContain('trading-no-capital');
  });

  it('complete profile with adequate resources produces fewer warnings', () => {
    const profile: UserProfile = {
      name: 'Test', age: 35, country: 'US', nationality: 'US',
      capital: 100000, monthlyIncome: 5000, savings: 50000,
      skills: ['management', 'finance', 'operations'],
      yearsExperience: 10, networkSize: 'large',
      canSurviveMonths: 18, hasMentor: true,
    };
    const warnings = analyzeProfile(profile, 'I want to start a business');
    // Should have very few or no critical warnings
    const criticals = warnings.filter(w => w.severity === 'critical');
    expect(criticals.length).toBe(0);
  });
});

describe('getFieldWarnings', () => {
  it('flags critical for missing financial data', () => {
    const profile: UserProfile = {};
    const fw = getFieldWarnings(profile);
    expect(fw['capital']).toBe('critical');
    expect(fw['monthlyIncome']).toBe('critical');
  });

  it('flags warning for missing skills', () => {
    const profile: UserProfile = { capital: 1000 };
    const fw = getFieldWarnings(profile);
    expect(fw['skills']).toBe('warning');
  });

  it('flags critical for low runway', () => {
    const profile: UserProfile = { canSurviveMonths: 2, capital: 1000 };
    const fw = getFieldWarnings(profile);
    expect(fw['canSurviveMonths']).toBe('critical');
  });
});
