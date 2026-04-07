import { describe, it, expect } from 'vitest';
import {
  extractBusinessKeywords,
  buildRagSearchQuery,
  isLikelyPhotoScenario,
} from '../photo-preprocessor';

describe('extractBusinessKeywords', () => {
  it('detects cafe from coffee-related description', () => {
    const result = extractBusinessKeywords(
      'A small coffee shop with an espresso machine and barista behind the counter.'
    );
    expect(result.businessType).toBe('cafe');
    expect(result.industry).toBe('food & beverage');
  });

  it('detects salon from hair/beauty description', () => {
    const result = extractBusinessKeywords(
      'A beauty salon with a mirror and hair styling tools.'
    );
    expect(result.businessType).toBe('salon');
    expect(result.industry).toBe('personal services');
  });

  it('detects restaurant from cooking/kitchen description', () => {
    const result = extractBusinessKeywords(
      'A restaurant kitchen with a chef cooking on a stove with multiple plates.'
    );
    expect(result.businessType).toBe('restaurant');
    expect(result.industry).toBe('food & beverage');
  });

  it('detects tech startup from office description', () => {
    const result = extractBusinessKeywords(
      'An office with laptops and a whiteboard showing a startup roadmap.'
    );
    expect(result.businessType).toBe('tech startup');
    expect(result.industry).toBe('technology');
  });

  it('returns generic business for unrecognized description', () => {
    const result = extractBusinessKeywords('An empty room with nothing in it.');
    expect(result.businessType).toBe('business');
    expect(result.industry).toBe('general');
  });

  it('extracts location from description', () => {
    const result = extractBusinessKeywords(
      'A coffee shop located in Bandung with espresso machines.'
    );
    expect(result.location).toBe('Bandung');
  });

  it('estimates high budget from luxury indicators', () => {
    const result = extractBusinessKeywords(
      'A luxury high-end restaurant with marble floors and a chandelier.'
    );
    expect(result.estimatedBudget).toBe('high');
  });

  it('estimates low budget from basic indicators', () => {
    const result = extractBusinessKeywords(
      'A basic small-scale food stall on the street side.'
    );
    expect(result.estimatedBudget).toBe('low');
  });

  it('builds a clean scenario string', () => {
    const result = extractBusinessKeywords(
      'A cafe with an espresso machine, barista, and coffee beans in Bandung.'
    );
    expect(result.scenario.length).toBeGreaterThan(10);
    // Should include the business type prefix
    expect(result.scenario).toContain('cafe');
  });

  it('always returns keywords array', () => {
    const result = extractBusinessKeywords('Random text about nothing specific.');
    expect(Array.isArray(result.keywords)).toBe(true);
    expect(result.keywords.length).toBeGreaterThan(0);
  });
});

describe('buildRagSearchQuery', () => {
  it('combines scenario and keywords', () => {
    const photoKw = extractBusinessKeywords('An espresso machine in a small cafe.');
    const query = buildRagSearchQuery('open a cafe', photoKw);
    expect(query).toContain('open a cafe');
    expect(query).toContain('cafe');
    expect(query).toContain('food & beverage');
  });

  it('includes location when present', () => {
    const photoKw = extractBusinessKeywords('A coffee shop in Bandung with espresso machines.');
    const query = buildRagSearchQuery('open a cafe', photoKw);
    expect(query).toContain('Bandung');
  });

  it('includes budget context when present', () => {
    const photoKw = extractBusinessKeywords('A luxury high-end restaurant.');
    const query = buildRagSearchQuery('open a restaurant', photoKw);
    expect(query).toContain('premium');
  });
});

describe('isLikelyPhotoScenario', () => {
  it('returns true for photo-like descriptions', () => {
    expect(isLikelyPhotoScenario(
      'The photo shows a modern interior of a cozy wooden tables cafe with bright lighting.'
    )).toBe(true);
  });

  it('returns false for plain text scenarios', () => {
    expect(isLikelyPhotoScenario('I want to open a cafe in Bandung')).toBe(false);
  });
});
