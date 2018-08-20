const {
  compact,
  groupBy,
  sortBy,
  mapValues,
  chain,
  round
} = require('lodash');

const { getHourPeriodByBorders, getHourPeriodByDuration } = require('./utils');
const { HOURS, PERIOD } = require('./constants');
const { validate } = require('./validation/validator');

const DAY_HOURS = getHourPeriodByBorders(HOURS.day);
const NIGHT_HOURS = getHourPeriodByBorders(HOURS.night);
const WHOLE_DAY_HOURS = getHourPeriodByBorders(HOURS.wholeDay);

const WATTS_IN_KILOWATT = 1000;
const MAX_SCHEDULES = 100;
const CORRECT_RATIO = 2;

function calculateSchedulePrice(schedule, key) {
  return schedule.reduce((info, item) => ({ sum: info.sum + item.price, key }), { sum: 0 });
}

function addDeviceToSchedule(schedule, device, startHour) {
  const hours = getHourPeriodByDuration(startHour, device.duration);

  const scheduleExist = schedule.every((hour, index) => {
    if (!hours.includes(index)) return true;

    const newPower = hour.power - device.power;
    return newPower >= 0;
  });

  if (!scheduleExist) return false;

  return schedule.map((hour, index) => {
    if (!hours.includes(index)) return hour;

    return {
      power: hour.power - device.power,
      devices: hour.devices.concat(device),
      price: hour.price + (device.power / WATTS_IN_KILOWATT * hour.rate),
      rate: hour.rate
    };
  });
}

function filterCheapSchedules(schedules) {
  const schedulesWithPrice = schedules.map(calculateSchedulePrice);

  if (schedules.length <= MAX_SCHEDULES) return schedules;

  const cheapScheduleIndexes = chain(schedulesWithPrice)
    .orderBy(['sum'], ['asc'])
    .take(schedules.length / CORRECT_RATIO)
    .map(item => item.key)
    .value();

  return schedules.filter((item, key) => cheapScheduleIndexes.includes(key));
}

function generateDeviceSchedules(schedules, device) {
  return schedules.reduce((allSchedules, schedule) => {
    const deviceSchedules = device.startHours.map(
      hour => addDeviceToSchedule(schedule, device, hour)
    );

    const mergedSchedules = allSchedules.concat(compact(deviceSchedules));

    return filterCheapSchedules(mergedSchedules);
  }, []);
}

function getDeviceStartHours(device) {
  if (device.mode === PERIOD.day) return DAY_HOURS.slice(0, -device.duration + 1);
  if (device.mode === PERIOD.night) return NIGHT_HOURS.slice(0, -device.duration + 1);

  return WHOLE_DAY_HOURS;
}

function findStartHours(devices) {
  return devices.map(
    device => Object.assign({}, device, { startHours: getDeviceStartHours(device) })
  );
}

function addIndependentDevicesToSchedule(schedule, devices = []) {
  const workDevices = devices.map(
    device => Object.assign({}, device, { startHour: HOURS[device.mode || PERIOD.wholeDay].from })
  );

  return workDevices.reduce(
    (workSchedule, device) => addDeviceToSchedule(workSchedule, device, device.startHour), schedule
  );
}

function formatHoursRates(rates) {
  return rates.reduce((formattedRates, rate) => (
    formattedRates.concat({ rate: rate.value, hours: getHourPeriodByBorders(rate) })
  ), []);
}

function initSchedule(rates, maxPower) {
  return Array.from({ length: HOURS.wholeDay.duration }, (v, key) => ({
    power: maxPower,
    devices: [],
    rate: rates.find(rate => rate.hours.includes(key)).rate,
    price: 0
  }));
}

function groupDevices(devices) {
  let workedWholeDay = false;
  let workedDay = false;
  let workedNight = false;

  return groupBy(devices, ({ mode, duration }) => {
    workedWholeDay = !mode && duration === HOURS.wholeDay.duration;
    workedDay = mode === 'day' && duration === HOURS.day.duration;
    workedNight = mode === 'night' && duration === HOURS.night.duration;

    return (workedWholeDay || workedDay || workedNight) ? 'independentDevices' : 'dependentDevices';
  });
}

function generateSchedules(schedule, devices) {
  return devices.reduce(generateDeviceSchedules, [schedule]);
}

function calculateConsumedEnergy(schedule, rates, devices) {
  const devicesConsumption = {};

  WHOLE_DAY_HOURS.forEach((hour) => {
    const devicesIds = schedule[hour];
    const hourRate = rates.find(rate => rate.hours.includes(hour)).rate;

    devicesIds.forEach((deviceId) => {
      const devicePower = devices.find(device => device.id === deviceId).power;
      devicesConsumption[deviceId] = (devicePower / WATTS_IN_KILOWATT * hourRate)
        + (devicesConsumption[deviceId] || 0);
    });
  });

  return mapValues(devicesConsumption, value => round(value, 4));
}

function formatScheduleDevices(rawSchedule) {
  const schedule = {};

  rawSchedule.forEach((hourInfo, hour) => {
    schedule[hour] = hourInfo.devices.map(device => device.id);
  });

  return schedule;
}

function start(data) {
  const errors = validate(data);

  if (errors.length !== 0) return errors.join('\n');

  const { rates, devices, maxPower } = data;
  const hoursRates = formatHoursRates(rates);
  const initialSchedule = initSchedule(hoursRates, maxPower);

  const { independentDevices, dependentDevices } = groupDevices(devices);
  const startSchedule = addIndependentDevicesToSchedule(initialSchedule, independentDevices);
  const devicesWithStartHours = findStartHours(dependentDevices);
  const sorted = devicesWithStartHours.sort((a, b) => a.startHours.length - b.startHours.length);
  const schedules = generateSchedules(startSchedule, sorted);

  const schedulesWithPrice = schedules.map(calculateSchedulePrice);

  if (schedulesWithPrice.length === 0) return 'Невозможно распределить все устройства';

  const cheapestSchedule = sortBy(schedulesWithPrice, 'sum')[0];

  const schedule = formatScheduleDevices(schedules[cheapestSchedule.key]);
  const devicesConsumedEnergy = calculateConsumedEnergy(schedule, hoursRates, devices);

  return {
    schedule,
    consumedEnergy: {
      value: round(cheapestSchedule.sum, 4),
      devices: devicesConsumedEnergy
    }
  };
}

module.exports = {
  formatHoursRates,
  groupDevices,
  getDeviceStartHours,
  start
};
