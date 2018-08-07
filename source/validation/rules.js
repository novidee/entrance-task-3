function equal(value) {
  return {
    assert(data) {
      return data.maxPower === value;
    },
    message: `Максимальная энергия должна быть равна ${value}`
  };
}

const rules = [equal(33)];

module.exports = {
  rules
};
