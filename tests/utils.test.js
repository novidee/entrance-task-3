const assert = require('assert');
const { isArray } = require('lodash');
const { getHourPeriodByBorders, getHourPeriodByDuration } = require('../src/utils');

describe('getHourPeriodByBorders()', () => {
  it('should be an array', () => {
    assert(isArray(getHourPeriodByBorders({ from: 1, to: 2 })));
  });

  it('should be an array [1, 2, 3]', () => {
    assert.deepEqual([1, 2, 3], getHourPeriodByBorders({ from: 1, to: 4 }));
  });

  it('should be an array [22, 23, 0, 1, 2]', () => {
    assert.deepEqual([22, 23, 0, 1, 2], getHourPeriodByBorders({ from: 22, to: 3 }));
  });

  it('should be an array [1]', () => {
    assert.deepEqual([1], getHourPeriodByBorders({ from: 1, to: 2 }));
  });
});

describe('getHourPeriodByDuration()', () => {
  it('should be an array', () => {
    assert(isArray(getHourPeriodByDuration(1, 2)));
  });

  it('should be an array [1, 2, 3]', () => {
    assert.deepEqual([1, 2, 3], getHourPeriodByDuration(1, 3));
  });

  it('should be an array [22, 23, 0, 1, 2]', () => {
    assert.deepEqual([22, 23, 0, 1, 2], getHourPeriodByDuration(22, 5));
  });

  it('should be an array [1]', () => {
    assert.deepEqual([1], getHourPeriodByDuration(1, 1));
  });
});
