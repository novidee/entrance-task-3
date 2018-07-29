const { orderBy, sortBy, find, cloneDeep, includes, concat, reduce, round, mapValues } = require('lodash');
const { Bounded: knapsack } = require('bkp');

const { Hours } = require('./hours');

const MODE = {
  day: {
    from: 7,
    to: 21
  },
  night: {
    from: 21,
    to: 7
  }
};

//todo высокий приоритет имеют также устройства с определенным периодом и duration = оставшемся часам до окончания срока
function calculateDevicesValue(devices, hour) {
  const high = [];
  const medium = [];
  const low = [];

  devices.forEach(device => {
    const { mode, duration } = device;

    if (!mode && duration === 24 - hour) high.push(device);
    else if (!mode) low.push(device);
    else medium.push(device);
  });

  return {
    high,
    medium,
    low
  };
}

function getAvailableDevicesByHour(devices, hour) {
  let mode = null;

  return devices.filter((device) => {
    mode = MODE[device.mode];

    return !mode || includes(new Hours(mode).toArray(), hour);
  }).map(device => device.id);
}

function getDeviceById(devices, id) {
  return find(devices, { id });
}

function decreaseDuration(devices, ids) {
  return devices.filter(device => {
    if (includes(ids, device.id)) device.duration--;

    return device.duration !== 0;
  });
}

function updateAvailability(devices) {
  const result = {};
  for (let i = 0; i < 24; i++) {
    result[i] = getAvailableDevicesByHour(devices, i);
  }

  return result;
}

function getSortedHours(rates) {
  const sortedRates = sortBy(rates, 'value');

  return sortedRates.reduce((hours, rate) => concat(hours, rate.hours), []);
}

function formatRatesToArray(rates) {
  return rates.map(rate => ({
    hours: new Hours(rate).toArray(),
    value: rate.value
  }));
}

function calculateConsumedEnergy(schedule, rates, devices) {
  const d = reduce(schedule, (devicesConsumption, devicesIds, hour) => {
    const hourRate = rates.find(rate => rate.hours.includes(Number(hour))).value;

    devicesIds.forEach(id => {
      const devicePower = devices.find(device => device.id === id).power;
      devicesConsumption[id] = (devicePower / 1000 * hourRate) + (devicesConsumption[id] || 0);
    });

    return devicesConsumption;
  }, {});

  return mapValues(d, value => round(value, 4));
}

function perform(devices, maxPower) {
  const workedDevices = orderBy(devices.map(device => ({
    item: device.id,
    weight: device.power,
    value: device.power,
    pieces: 1
  })), ['value', 'weight'], ['desc', 'desc']);

  return knapsack(workedDevices, maxPower);
}

function start(data) {
  const { rates, devices, maxPower } = data;

  const formattedRates = formatRatesToArray(rates);
  const sortedHours = getSortedHours(formattedRates);

  const finalResult = {};
  let workDevices = cloneDeep(devices);
  let result = updateAvailability(workDevices);

  sortedHours.forEach((hour, key) => {
    result = updateAvailability(workDevices);

    let s = [];
    let workPower = maxPower;
    const { high, medium, low } = calculateDevicesValue(result[hour].map(id => getDeviceById(workDevices, id)), key);
    if (high.length) {
      const h = perform(high, workPower);
      s = concat(s, h.items.map(d => d.item));
      workPower -= h.totalWeight;
    }

    if (medium.length) {
      const m = perform(medium, workPower);
      s = concat(s, m.items.map(d => d.item));
      workPower -= m.totalWeight;
    }

    if (low.length && workPower > 0) {
      const l = perform(low, workPower);
      s = concat(s, l.items.map(d => d.item));
    }

    finalResult[hour] = s;
    workDevices = decreaseDuration(workDevices, s);
  });

  const d = calculateConsumedEnergy(finalResult, formattedRates, devices);
  const e = reduce(d, (sum, item) => sum + item);

  return {
    schedule: finalResult,
    consumedEnergy: {
      value: e,
      devices: d
    }
  };
}

module.exports = {
  start
};
