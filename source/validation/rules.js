const { uniqBy, countBy, difference } = require('lodash');
const { HOURS, PERIOD } = require('../constants');
const { getHourPeriodByBorders } = require('../utils');

function defineRuleModel(isCorrect, message) {
  return {
    isCorrect,
    message: isCorrect ? '' : message
  };
}

function correctDurations({ devices }) {
  const incorrectDevices = devices.filter(
    device => device.duration > HOURS[device.mode || PERIOD.wholeDay].duration
  );
  const message = `Неверная длительность работы устройств: ${
    incorrectDevices.map(device => device.name).join(', ')
  }`;

  return defineRuleModel(incorrectDevices.length === 0, message);
}

function deviceEnergyLessMaxPower({ devices, maxPower }) {
  const incorrectDevices = devices.filter(device => device.power > maxPower);
  const message = `Энергия устройств превышает максимально допустимую: ${
    incorrectDevices.map(device => device.name).join(', ')
  }`;

  return defineRuleModel(incorrectDevices.length === 0, message);
}

function uniqueIds({ devices }) {
  const uniqDevices = uniqBy(devices, device => device.id);
  const message = 'Не все устройства имеют уникальный id';

  return defineRuleModel(uniqDevices.length === devices.length, message);
}

function ratePeriodsNotIntersect({ rates }) {
  const rateHours = rates.reduce((formattedRates, rate) => (
    formattedRates.concat(getHourPeriodByBorders(rate))
  ), []);
  const hourCounts = countBy(rateHours);
  const duplicateHours = Object.keys(hourCounts).filter(hour => hourCounts[hour] > 1);
  const message = `Некоторые часы имеют несколько тарифов: ${duplicateHours}`;

  return defineRuleModel(duplicateHours.length === 0, message);
}

function everyHourHasRate({ rates }) {
  const rateHours = rates.reduce((formattedRates, rate) => (
    formattedRates.concat(getHourPeriodByBorders(rate))
  ), []);
  const hoursWithoutRate = difference(getHourPeriodByBorders(HOURS.wholeDay), uniqBy(rateHours));
  const message = `Некоторые часы не имеют тарифа: ${hoursWithoutRate}`;

  return defineRuleModel(hoursWithoutRate.length === 0, message);
}

const rules = [
  correctDurations,
  deviceEnergyLessMaxPower,
  uniqueIds,
  ratePeriodsNotIntersect,
  everyHourHasRate
];

module.exports = {
  rules
};
