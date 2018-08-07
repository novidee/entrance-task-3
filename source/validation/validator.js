const { rules } = require('./rules');

function validate(data) {
  const errors = [];

  rules.forEach((rule) => {
    const { isCorrect, message } = rule(data);

    if (!isCorrect) {
      errors.push(message);
    }
  });

  return errors;
}

module.exports = {
  validate
};
