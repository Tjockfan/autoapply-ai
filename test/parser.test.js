import { describe, it } from 'node:test';
import assert from 'node:assert';
import { JobParser } from '../src/utils/parser.js';

describe('JobParser', () => {
  const parser = new JobParser();

  describe('parseJob', () => {
    it('should parse a basic job correctly', () => {
      const rawJob = {
        title: 'Executive Chef on 100m Motor Yacht',
        position: 'Executive Chef',
        vesselName: 'M/Y Serenity',
        location: 'Mediterranean - Monaco',
        salary: '€6,000 - €7,000 per month',
        description: 'Looking for an experienced chef',
        url: 'https://example.com/job/123',
        postedDate: '2024-01-15'
      };

      const parsed = parser.parseJob(rawJob, 'yotspot');

      assert.strictEqual(parsed.source, 'yotspot');
      assert.strictEqual(parsed.title, 'Executive Chef on 100m Motor Yacht');
      assert.strictEqual(parsed.position, 'Chef');
      assert.strictEqual(parsed.vessel.name, 'M/Y Serenity');
      assert.strictEqual(parsed.location.region, 'mediterranean');
      assert.strictEqual(parsed.salary.currency, 'EUR');
    });

    it('should handle missing fields gracefully', () => {
      const rawJob = {
        title: 'Deckhand Position',
        url: 'https://example.com/job/456'
      };

      const parsed = parser.parseJob(rawJob, 'yacrew');

      assert.strictEqual(parsed.source, 'yacrew');
      assert.strictEqual(parsed.title, 'Deckhand Position');
      assert.strictEqual(parsed.position, 'Deckhand');
      assert.strictEqual(parsed.salary, null);
    });

    it('should parse salary correctly', () => {
      const testCases = [
        { input: '$5,000 - $6,000 per month', expected: { min: 5000, max: 6000, currency: 'USD' } },
        { input: '€4500 monthly', expected: { min: 4500, max: 4500, currency: 'EUR' } },
        { input: '£4000-£5000 pcm', expected: { min: 4000, max: 5000, currency: 'GBP' } }
      ];

      for (const tc of testCases) {
        const result = parser.parseSalary(tc.input);
        assert.strictEqual(result.min, tc.expected.min);
        assert.strictEqual(result.max, tc.expected.max);
        assert.strictEqual(result.currency, tc.expected.currency);
      }
    });

    it('should parse vessel length correctly', () => {
      const testCases = [
        { input: '100m', expected: { value: 100, unit: 'm' } },
        { input: '150 meters', expected: { value: 150, unit: 'm' } },
        { input: '200ft', expected: { value: 200, unit: 'ft' } }
      ];

      for (const tc of testCases) {
        const result = parser.parseVesselLength(tc.input);
        assert.strictEqual(result.value, tc.expected.value);
        assert.strictEqual(result.unit, tc.expected.unit);
      }
    });
  });

  describe('parsePosition', () => {
    it('should identify positions correctly', () => {
      const testCases = [
        { title: 'Captain needed for 50m yacht', expected: 'Captain' },
        { title: 'Chef position available', expected: 'Chef' },
        { title: 'Looking for a stewardess', expected: 'Steward/Stewardess' },
        { title: 'Engineer required', expected: 'Engineer' },
        { title: 'Deckhand for charter yacht', expected: 'Deckhand' }
      ];

      for (const tc of testCases) {
        const result = parser.parsePosition(tc.title);
        assert.strictEqual(result, tc.expected);
      }
    });
  });

  describe('deduplicateJobs', () => {
    it('should remove duplicate jobs', () => {
      const jobs = [
        { id: '1', title: 'Job 1' },
        { id: '2', title: 'Job 2' },
        { id: '1', title: 'Job 1 duplicate' }
      ];

      const deduplicated = parser.deduplicateJobs(jobs);
      assert.strictEqual(deduplicated.length, 2);
      assert.deepStrictEqual(deduplicated.map(j => j.id), ['1', '2']);
    });
  });
});