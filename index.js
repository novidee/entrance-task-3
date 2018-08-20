const { generate } = require('./src');
const { input } = require('./input');

const output = generate(input);

console.log('output', output);
