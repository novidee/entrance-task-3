function getHourPeriodByDuration(start, duration) {
  return Array.from({ length: duration }, (v, key) => (key + start) % 24);
}

function getHourPeriodByBorders({ from, to }) {
  const duration = from > to ? 24 - from + to : to - from;

  return getHourPeriodByDuration(from, duration);
}

module.exports = {
  getHourPeriodByDuration,
  getHourPeriodByBorders
};
