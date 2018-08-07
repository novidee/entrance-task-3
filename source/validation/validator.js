const { rules } = require('./rules');

const validate = (data) => {
  const errors = [];

  rules.forEach((rule) => {
    if (!rule.assert(data)) {
      errors.push(rule.message);
    }
  });

  return errors;
};

module.exports = {
  validate
};
