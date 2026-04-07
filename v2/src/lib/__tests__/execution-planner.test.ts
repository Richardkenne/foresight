import { describe, it, expect } from 'vitest';
import { generateExecutionPlan } from '../execution-planner';

describe('generateExecutionPlan', () => {
  it('generates a cafe plan for cafe scenario', () => {
    const plan = generateExecutionPlan('I want to open a cafe', 'US', 50000);
    expect(plan.type).toBe('Cafe');
    expect(plan.steps.length).toBeGreaterThan(5);
  });

  it('generates a SaaS plan for software scenario', () => {
    const plan = generateExecutionPlan('Build a SaaS platform', 'US', 10000);
    expect(plan.type).toBe('Saas');
    expect(plan.steps.length).toBeGreaterThan(5);
  });

  it('generates a freelancing plan for upwork scenario', () => {
    const plan = generateExecutionPlan('Start freelancing on Upwork', 'US', 0);
    expect(plan.type).toBe('Freelancing');
    expect(plan.steps.length).toBeGreaterThan(5);
  });

  it('generates an ecommerce plan for shop scenario', () => {
    const plan = generateExecutionPlan('Launch a Shopify ecommerce store', 'US', 5000);
    expect(plan.type).toBe('Ecommerce');
    expect(plan.steps.length).toBeGreaterThan(5);
  });

  it('generates a generic plan for unknown scenario', () => {
    const plan = generateExecutionPlan('I want to fly to space', 'US', 1000);
    expect(plan.type).toBe('General Business');
    expect(plan.steps.length).toBeGreaterThan(0);
  });

  it('all steps have required fields', () => {
    const plan = generateExecutionPlan('open a cafe', 'US', 50000);
    plan.steps.forEach(step => {
      expect(step.id).toBeGreaterThan(0);
      expect(step.phase).toBeTruthy();
      expect(step.action).toBeTruthy();
      expect(step.description).toBeTruthy();
      expect(step.estimatedCost).toBeTruthy();
      expect(step.estimatedTime).toBeTruthy();
      expect(['ready', 'needs-human', 'coming-soon']).toContain(step.status);
      expect(Array.isArray(step.dependencies)).toBe(true);
    });
  });

  it('calculates total estimated cost ranges', () => {
    const plan = generateExecutionPlan('open a cafe', 'US', 50000);
    expect(plan.totalEstimatedCost.min).toBeGreaterThanOrEqual(0);
    expect(plan.totalEstimatedCost.max).toBeGreaterThanOrEqual(plan.totalEstimatedCost.min);
  });

  it('calculates total estimated weeks', () => {
    const plan = generateExecutionPlan('open a cafe', 'US', 50000);
    expect(plan.totalEstimatedWeeks.min).toBeGreaterThan(0);
    expect(plan.totalEstimatedWeeks.max).toBeGreaterThanOrEqual(plan.totalEstimatedWeeks.min);
  });

  it('uses country-specific registrar for Indonesia', () => {
    const plan = generateExecutionPlan('open a cafe', 'Indonesia', 50000);
    const regStep = plan.steps.find(s => s.action.includes('Register'));
    expect(regStep).toBeDefined();
    expect(regStep!.platform).toContain('OSS');
  });

  it('uses country-specific registrar for UK', () => {
    const plan = generateExecutionPlan('open a cafe', 'UK', 50000);
    const regStep = plan.steps.find(s => s.action.includes('Register'));
    expect(regStep).toBeDefined();
    expect(regStep!.platform).toContain('Companies House');
  });

  it('dependencies reference valid step IDs', () => {
    const plan = generateExecutionPlan('open a cafe', 'US', 50000);
    const ids = new Set(plan.steps.map(s => s.id));
    plan.steps.forEach(step => {
      step.dependencies.forEach(dep => {
        expect(ids.has(dep)).toBe(true);
      });
    });
  });
});
