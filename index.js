const { start } = require('./source/test');

const input = {
  "devices": [
    {
      "id": "F972B82BA56A70CC579945773B6866FB",
      "name": "Посудомоечная машина",
      "power": 800,
      "duration": 3,
      "mode": "night"
    },
    {
      "id": "C515D887EDBBE669B2FDAC62F571E9E9",
      "name": "Духовка",
      "power": 1050,
      "duration": 2,
      "mode": "day"
    },
    {
      "id": "TTT15D887EDBBE669B2FDAC62F571E9E9",
      "name": "gdfgdg",
      "power": 1000,
      "duration": 24
    },
    {
      "id": "02DDD23A85DADDD71198305330CC386D",
      "name": "Холодильник",
      "power": 50,
      "duration": 24
    },
    {
      "id": "1E6276CC231716FE8EE8BC908486D41E",
      "name": "Термостат",
      "power": 50,
      "duration": 24
    },
    {
      "id": "7D9DC84AD110500D284B33C82FE6E85E",
      "name": "Кондиционер",
      "power": 850,
      "duration": 1
    },
    {
      "id": "222DDD23A85DADDD71198305330CC386D",
      "name": "Холодильник",
      "power": 300,
      "duration": 7,
      mode: "night"
    },
    {
      "id": "111DDD23A85DADDD71198305330CC386D",
      "name": "Холодильник",
      "power": 300,
      "duration": 7,
      mode: "night"
    },
    {
      "id": "333DDD23A85DADDD71198305330CC386D",
      "name": "Холодильник",
      "power": 300,
      "duration": 5,
      mode: "night"
    },
    {
      "id": "444DDD23A85DADDD71198305330CC386D",
      "name": "Холодильник",
      "power": 200,
      "duration": 5,
      mode: "night"
    },
  ],
  "rates": [
    {
      "from": 7,
      "to": 10,
      "value": 6.46
    },
    {
      "from": 10,
      "to": 17,
      "value": 5.38
    },
    {
      "from": 17,
      "to": 21,
      "value": 6.46
    },
    {
      "from": 21,
      "to": 23,
      "value": 5.38
    },
    {
      "from": 23,
      "to": 7,
      "value": 1.79
    }
  ],
  "maxPower": 2100
};

const output = start(input);
console.log('ouda');
