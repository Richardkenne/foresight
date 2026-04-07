import { describe, it, expect } from 'vitest';
import { detectBusinessType } from '../data-fetcher';

describe('detectBusinessType', () => {
  it('detects F&B for cafe scenario', () => {
    expect(detectBusinessType('I want to open a cafe in Bandung')).toBe('fnb-data');
  });

  it('detects F&B for restaurant scenario', () => {
    expect(detectBusinessType('Start a restaurant food business')).toBe('fnb-data');
  });

  it('detects SaaS for software scenario', () => {
    expect(detectBusinessType('I want to build a SaaS platform with MRR')).toBe('saas-data');
  });

  it('detects SaaS for app scenario', () => {
    expect(detectBusinessType('Build a subscription dashboard tool')).toBe('saas-data');
  });

  it('detects agency for consulting scenario', () => {
    expect(detectBusinessType('Start a marketing agency with retainer clients')).toBe('agency-data');
  });

  it('detects ecommerce for shopify scenario', () => {
    expect(detectBusinessType('Launch a shopify e-commerce store')).toBe('ecommerce-data');
  });

  it('detects ecommerce for dropshipping scenario', () => {
    expect(detectBusinessType('Start a dropshipping business on Amazon FBA')).toBe('ecommerce-data');
  });

  it('detects marketplace for two-sided platform', () => {
    expect(detectBusinessType('Build a marketplace with network effect')).toBe('marketplace-data');
  });

  it('detects creator for youtube/content scenario', () => {
    expect(detectBusinessType('Start a youtube channel and newsletter on substack')).toBe('creator-data');
  });

  it('detects upwork for freelancing scenario', () => {
    expect(detectBusinessType('Start freelancing on upwork')).toBe('upwork-data');
  });

  it('returns null for unrecognized scenario', () => {
    expect(detectBusinessType('I want to fly to the moon')).toBeNull();
  });

  it('is case-insensitive', () => {
    expect(detectBusinessType('Open a CAFE in BANDUNG')).toBe('fnb-data');
  });

  it('picks highest-scoring match when multiple keywords present', () => {
    // "cafe coffee restaurant food" = 4 fnb keywords vs 0 saas
    expect(detectBusinessType('cafe coffee restaurant food')).toBe('fnb-data');
  });
});
