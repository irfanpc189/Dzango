import assert from 'node:assert/strict';
import { factAge } from './audit-facts';

const today = new Date(2026, 10, 11);
assert.equal(factAge('2026-11-11', today).age, 0);
assert.equal(factAge('2026-11-13', today).age, -2);
assert.equal(factAge('2025-10-07', today).age, 400);
console.log('Fact-date tests passed: today, future date, and stale date.');
