const HOURS = {
  wholeDay: {
    duration: 24,
    from: 0,
    to: 24
  },
  day: {
    duration: 14,
    from: 7,
    to: 21
  },
  night: {
    duration: 10,
    from: 21,
    to: 7
  }
};

const PERIOD = {
  wholeDay: 'wholeDay',
  day: 'day',
  night: 'night'
};

module.exports = {
  HOURS,
  PERIOD
};
