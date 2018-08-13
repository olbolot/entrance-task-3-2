const ERRORS = require('./errorTypes');
module.exports = function (inputData) {
    let ratesPerHour = [];

    inputData.rates.forEach(function (el) {
		if (typeof(el.value) === "undefined" ||
			typeof(el.from) === "undefined" || 
			typeof(el.to) === "undefined") {
            throw new Error(ERRORS.MissingSomeRateProperties);
        }

        if (isNaN(parseInt(el.from)) || isNaN(parseInt(el.to))) {
            throw new Error(ERRORS.RateFromToIsNaN);
        }

        if (isNaN(parseFloat(el.value))) {
            throw new Error(ERRORS.RateValueIsNaN);
        } else {
            el.value = parseFloat(el.value);
        }
		
        if (el.from > 24 || el.to > 24) {
            throw new Error(ERRORS.MoreThen24HoursInDay);
        }


        if (isNaN(parseFloat(el.value))) {
            throw new Error(ERRORS.RateValueIsNaN);
        } else {
            el.value = parseFloat(el.value);
        }

        for (let i = el.from; i !== el.to; i++) {
            if (i === 24) {
                i = 0;
            }
            if (typeof (ratesPerHour[i]) !== "undefined") {
                throw new Error(ERRORS.RatesIntersects);
            }
            ratesPerHour[i] = el.value;
        }
    });

	if (ratesPerHour.length === 0) {
		throw new Error(ERRORS.RatesNotDefined);
	}
    for (let i = 0; i < ratesPerHour.length; i++) {
        if (!ratesPerHour[i]) {
            throw new Error(ERRORS.UnspecifiedHourRate);
        }
    }

    let schedule = {};
    let consumed = {
        value: 0,
        devices: []
    };
    let powerUsagePerHour = [];

    for (let i = 0; i < 24; i++) {
        schedule[i] = [];
        powerUsagePerHour[i] = inputData.maxPower;
    };

    let findMinSeries = function (start, end, duration, power) {
        let series = [];

        collectSeries:
        for (let i = start; i !== end; i++) {
            if (i === 24) {
                i = 0;
            }
            let remaining = duration;
            let price = 0;
            let validSeries = true;
            for (let j = i; remaining !== 0; j++) {
                if (j === 24) {
                    j = 0;
                }
                if (powerUsagePerHour[j] - power < 0) {
                    continue collectSeries;
                }
                price += ratesPerHour[j];
                remaining -= 1;
            }
            series.push({
                index: i,
                price: price
            });
        }
        series.sort(function (a, b) {
            if (a.price < b.price) return -1;
            if (a.price > b.price) return 1;
            if (a.price === b.price) return 0;
        });
        return series[0];
    };
    inputData.devices.forEach(function (device) {
        let startScheduleIndex = -1;

        if (device.power > inputData.maxPower) {
            throw new Error(ERRORS.MaxPowerExceededForDevice(device));
        }
        if (device.duration > 24) {
            throw new Error(ERRORS.DeviceCannotRunMoreThen24Hours)
        }

        let startSearchIndex;
        let finishSearchIndex;
        let modeAvaliableHours = 0;

        if (typeof(device.mode) === "undefined") {
            startSearchIndex = 0;
            finishSearchIndex = 23;
            modeAvaliableHours = 24;
        } else if (device.mode === "day") {
            startSearchIndex = 7;
            finishSearchIndex = 21;
            modeAvaliableHours = 14;
        } else if (device.mode === "night") {
            startSearchIndex = 21;
            finishSearchIndex = 7;
            modeAvaliableHours = 10;
        } else {
            throw new Error(ERRORS.UnexpectedModeSpecifiedForDevice(device));
        }
        if (device.duration > modeAvaliableHours) {
            throw new Error(ERRORS.RequestedTooMuchWorkingHoursForDevice(device, modeAvaliableHours));
        }
        let series = findMinSeries(startSearchIndex, finishSearchIndex, device.duration, device.power);
        if (!series) {
            throw new Error(ERRORS.CannotFindHoursForRunningDevice(device));
        }
        startScheduleIndex = series.index;
        consumed.devices[device.id] = parseFloat((series.price / 1000 * device.power).toFixed(4));

        if (startScheduleIndex === -1) {
            throw new Error(ERRORS.CannotFindHoursForRunningDevice(device));
        }
        let hoursRemaining = device.duration;
        for (let i = startScheduleIndex; hoursRemaining !== 0; i++) {
            if (i === 24) {
                i = 0;
            }
            schedule[i].push(device.id);
            powerUsagePerHour[i] -= device.power;
            if (powerUsagePerHour[i] < 0) {
                throw new Error(ERRORS.CannotFindHoursForRunningDevice(device));
            }
            hoursRemaining -= 1;
        }
        consumed.value += parseFloat(consumed.devices[device.id]);
    });
    var result = {
        schedule: schedule,
        consumedEnergy: {
            value: parseFloat(consumed.value.toFixed(4)),
            devices: consumed.devices
        }
    };
    
   return result;
}


