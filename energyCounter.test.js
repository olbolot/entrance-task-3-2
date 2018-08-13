const fs = require('fs');
const energyCounter = require('./energyCounter');
const ERRORS = require('./energyCounter');

let GetInitDataFromFile = function(file) {
	return JSON.parse(fs.readFileSync(file, 'utf8'));
}

test('Initial Yandex input data', () => {
	let inputData = GetInitDataFromFile("./datasets/yandex-input-data.json");
	expect(energyCounter(inputData)).toMatchSnapshot();
});

test('Device that consumes more then possible', () => {
	let inputData = GetInitDataFromFile("./datasets/impossible-power.json");
	expect(() => energyCounter(inputData)).toThrow(ERRORS.MaxPowerExceededForDeviceRegEx);
});

test('Empty input data', () => {
	let inputData = GetInitDataFromFile("./datasets/empty-json.json");
	expect(() => energyCounter(inputData)).toThrow(ERRORS.RatesNotDefined);
});

test('Unknown modes handling', () => {
	let inputData = GetInitDataFromFile("./datasets/unexpected-mode.json");
	expect(() => energyCounter(inputData)).toThrow(ERRORS.UnexpectedModeSpecifiedForDeviceRegEx);
});

test('Rate value isNaN', () => {
	let inputData = GetInitDataFromFile("./datasets/rates-1.json");
	expect(() => energyCounter(inputData)).toThrow(ERRORS.RateValueIsNaN);
});

test('Missing some hours rates', () => {
	let inputData = GetInitDataFromFile("./datasets/rates-4.json");
	expect(() => energyCounter(inputData)).toThrow(ERRORS.UnspecifiedHourRate);
});

test('Rate does not have value', () => {
	let inputData = GetInitDataFromFile("./datasets/rates-2.json");
	expect(() => energyCounter(inputData)).toThrow(ERRORS.MissingSomeRateProperties);
});

test('Rate to isNaN', () => {
	let inputData = GetInitDataFromFile("./datasets/rates-3.json");
	expect(() => energyCounter(inputData)).toThrow(ERRORS.RateFromToIsNaN);
});

test('Rate intersection test #1', () => {
	let inputData = GetInitDataFromFile("./datasets/rates-intersect-1.json");
	expect(() => energyCounter(inputData)).toThrow(ERRORS.RatesIntersects);
});

test('Rate intersection test #2', () => {
	let inputData = GetInitDataFromFile("./datasets/rates-intersect-2.json");
	expect(() => energyCounter(inputData)).toThrow(ERRORS.RatesIntersects);
});

test('Rate intersection test #3', () => {
	let inputData = GetInitDataFromFile("./datasets/rates-intersect-3.json");
	expect(() => energyCounter(inputData)).toThrow(ERRORS.RatesIntersects);
});

test('Device that wants to run for 26 hours', () => {
	let inputData = GetInitDataFromFile("./datasets/26-hour-running-device.json");
	expect(() => energyCounter(inputData)).toThrow(ERRORS.DeviceCannotRunMoreThen24Hours);
});

test('Not enough power for hungry devices', () => {
	let inputData = GetInitDataFromFile("./datasets/hungry-devices.json");
	expect(() => energyCounter(inputData)).toThrow(ERRORS.CannotFindHoursForRunningDeviceRegEx);
});

test('Not enough power for mining rigs', () => {
	let inputData = GetInitDataFromFile("./datasets/mining-rigs.json");
	expect(() => energyCounter(inputData)).toThrow(ERRORS.CannotFindHoursForRunningDeviceRegEx);
});

test('Device running more then hour avaliable in selected mode', () => {
	let inputData = GetInitDataFromFile("./datasets/very-night-dish-wash.json");
	expect(() => energyCounter(inputData)).toThrow(ERRORS.RequestedTooMuchWorkingHoursForDeviceRegEx);
});