let fs = require('fs');
let file = "./datasets/yandex-input-data.json";

if (process.argv.length > 2) {
	file = process.argv[2];
} else {
	console.log("Usage: node index.js ./path/to/inputData.json");
	return;
}

const energyCounter = require('./energyCounter');
const inputData = JSON.parse(fs.readFileSync(file, 'utf8'));
const outputData = energyCounter(inputData);

console.log(outputData)
