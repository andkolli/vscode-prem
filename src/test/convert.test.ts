import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULT_PIXELS_PER_REM,
  findShortcut,
  normalizePixelsPerRem,
  parseSelection,
  toRemText,
} from '../convert';

describe('findShortcut', () => {
  it('finds prem and pxrem shortcuts at the end of the line prefix', () => {
    assert.deepEqual(findShortcut('margin: 16prem'), { pixels: 16, rawValue: '16prem' });
    assert.deepEqual(findShortcut('margin: 24pxrem'), { pixels: 24, rawValue: '24pxrem' });
  });

  it('supports decimals, negative values and any casing', () => {
    assert.deepEqual(findShortcut('1.5prem'), { pixels: 1.5, rawValue: '1.5prem' });
    assert.deepEqual(findShortcut('.5prem'), { pixels: 0.5, rawValue: '.5prem' });
    assert.deepEqual(findShortcut('margin:-16prem'), { pixels: -16, rawValue: '-16prem' });
    assert.deepEqual(findShortcut('16PRem'), { pixels: 16, rawValue: '16PRem' });
  });

  it('ignores values glued to identifiers or other numbers', () => {
    assert.equal(findShortcut('w-16prem'), undefined);
    assert.equal(findShortcut('foo16prem'), undefined);
    assert.equal(findShortcut('1.2.5prem'), undefined);
  });

  it('ignores plain px and incomplete values', () => {
    assert.equal(findShortcut('16px'), undefined);
    assert.equal(findShortcut('16pre'), undefined);
    assert.equal(findShortcut('10.prem'), undefined);
  });
});

describe('parseSelection', () => {
  it('accepts exactly one value', () => {
    assert.deepEqual(parseSelection('16px'), { pixels: 16, rawValue: '16px' });
    assert.deepEqual(parseSelection('24prem'), { pixels: 24, rawValue: '24prem' });
    assert.deepEqual(parseSelection('24pxrem'), { pixels: 24, rawValue: '24pxrem' });
    assert.deepEqual(parseSelection('14.35'), { pixels: 14.35, rawValue: '14.35' });
    assert.deepEqual(parseSelection('-8PX'), { pixels: -8, rawValue: '-8PX' });
  });

  it('tolerates surrounding whitespace', () => {
    assert.deepEqual(parseSelection(' 16px\n'), { pixels: 16, rawValue: '16px' });
  });

  it('rejects selections containing more than the value', () => {
    assert.equal(parseSelection('margin: 16px'), undefined);
    assert.equal(parseSelection('16px 32px'), undefined);
    assert.equal(parseSelection('abc16px'), undefined);
    assert.equal(parseSelection('16em'), undefined);
    assert.equal(parseSelection(''), undefined);
  });
});

describe('toRemText', () => {
  it('converts and rounds to five fraction digits', () => {
    assert.equal(toRemText(16, 16), '1rem');
    assert.equal(toRemText(14.35, 16), '0.89688rem');
    assert.equal(toRemText(15, 10), '1.5rem');
  });

  it('rounds negative values symmetrically', () => {
    assert.equal(toRemText(16.00008, 16), '1.00001rem');
    assert.equal(toRemText(-16.00008, 16), '-1.00001rem');
  });

  it('never produces negative zero', () => {
    assert.equal(toRemText(-0.00001, 16), '0rem');
    assert.equal(toRemText(0, 16), '0rem');
  });
});

describe('normalizePixelsPerRem', () => {
  it('keeps valid values', () => {
    assert.equal(normalizePixelsPerRem(10), 10);
    assert.equal(normalizePixelsPerRem(1), 1);
  });

  it('falls back to the default for invalid values', () => {
    for (const value of [undefined, null, 0, 0.5, -16, Number.NaN, Infinity, '16', 'abc']) {
      assert.equal(normalizePixelsPerRem(value), DEFAULT_PIXELS_PER_REM);
    }
  });
});
