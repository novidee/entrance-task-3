const assert = require('assert');
const { isArray, isObject } = require('lodash');
const {
  formatHoursRates,
  groupDevices,
  getDeviceStartHours
} = require('../src/generator');

describe('formatHoursRates()', () => {
  const rates = [{
    from: 7,
    to: 10,
    value: 6.46
  }];

  it('should be an array', () => {
    assert(isArray(formatHoursRates(rates)));
  });

  it('each element should has rate field', () => {
    assert('rate' in formatHoursRates(rates)[0]);
  });

  it('each element should has hours field', () => {
    assert('hours' in formatHoursRates(rates)[0]);
  });

  it('each element should has hours field to be array', () => {
    assert(isArray(formatHoursRates(rates)[0].hours));
  });

  it('should has rate equal to value', () => {
    assert.equal(formatHoursRates(rates)[0].rate, rates[0].value);
  });
});

describe('groupDevices()', () => {
  const devices = [{
    id: 1,
    name: 'Духовка',
    power: 2000,
    duration: 2,
    mode: 'day'
  }, {
    id: 2,
    name: 'Холодильник',
    power: 50,
    duration: 24
  }];

  it('should be an object', () => {
    assert(isObject(groupDevices(devices)));
  });

  it('should has an independentDevices field', () => {
    assert('independentDevices' in groupDevices(devices));
  });

  it('should has a dependentDevices field', () => {
    assert('dependentDevices' in groupDevices(devices));
  });

  it('should has a dependentDevices with element with id 1', () => {
    assert(groupDevices(devices).dependentDevices.map(device => device.id).includes(1));
  });

  it('should has an independentDevices with element with id 2', () => {
    assert(groupDevices(devices).independentDevices.map(device => device.id).includes(2));
  });
});

describe('getDeviceStartHours()', () => {
  it('should be an array', () => {
    const device = {
      id: 2,
      name: 'Холодильник',
      power: 50,
      duration: 24
    };

    assert(isArray(getDeviceStartHours(device)));
  });

  it('should be an array [7, 8, 9, 10, 11, 12, 13, 14]', () => {
    const device = {
      id: 2,
      name: 'Холодильник',
      power: 50,
      duration: 7,
      mode: 'day'
    };

    assert.deepEqual([7, 8, 9, 10, 11, 12, 13, 14], getDeviceStartHours(device));
  });

  it('should be an array [21, 22, 23, 0]', () => {
    const device = {
      id: 2,
      name: 'Холодильник',
      power: 50,
      duration: 7,
      mode: 'night'
    };

    assert.deepEqual([21, 22, 23, 0], getDeviceStartHours(device));
  });

  it('should be an array [0..23]', () => {
    const device = {
      id: 2,
      name: 'Холодильник',
      power: 50,
      duration: 7
    };

    assert.deepEqual(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
      getDeviceStartHours(device)
    );
  });
});
