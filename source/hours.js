const HOURS_IN_DAY = 24;

class Hours {
  constructor(range) {
    const { from, to } = range;

    this.from = from;
    this.to = to;

    this.toArray = this.toArray.bind(this);
  }

  [Symbol.iterator]() {
    const { from, to } = this;
    let current = from;

    return {
      next() {
        if (current === to) return { done: true };

        if (current === HOURS_IN_DAY) {
          current = 1;

          return { done: false, value: 0 };
        }

        return { done: false, value: current++ };
      }
    };
  }

  toArray() {
    return Array.from(this);
  }
}

module.exports = {
  Hours
};
