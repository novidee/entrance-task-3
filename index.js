const { start } = require('./source/generator');
const { inputs } = require('./inputs');
const { validate } = require('./source/validation/validator');

const errors = validate(inputs[0]);

const output = start(inputs[0]);

console.log('dsad');
