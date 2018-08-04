
module.exports = function (inputData) {

    let ratesPerHour = [];
    // let sumOfAllRates = 0;

    inputData.rates.forEach(function (el) {
        if (el.from > 24 || el.to > 24) {
            throw new Error("В сутках не может быть больше 24 часов");
        }

        if(isNaN(parseFloat(el.value))) {
            throw new Error('что-то не number')
        } else {
            el.value = parseFloat(el.value);
        }

        if (!el.value || !el.from || !el.to) {
            throw new Error("отсутствуют обязательные параметры у rates");
        }

        for (let i = el.from; i !== el.to; i++) {
            if (i === 24) {
                i = 0;
            }
            if (typeof (ratesPerHour[i]) !== "undefined") {
                console.log("Тарифы накладываются друг на друга")
            }
            ratesPerHour[i] = el.value;
            // sumOfAllRates += el.value;
        }
    });

    //обработка часов без тарифов
    for (let i = 0 ; i < ratesPerHour.length ; i++) {
        if(!ratesPerHour[i]){
            throw new Error('Отсутствую тарифы для некоторых часов')
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
        for (let i = start; i !== end; i++) {
            if (i === 24) {
                i = 0;
            }
            let remaining = duration;
            let price = 0;
            let enoughtPower = true;
            for (let j = i; remaining !== 0; j++) {
                if (j === 24) {
                    j = 0;
                }
                if (powerUsagePerHour[i] - power < 0) {
                    enoughtPower = false;
                }
                price += ratesPerHour[j];
                remaining -= 1;
            }
            if (enoughtPower) {
                series.push({
                    index: i,
                    price: price
                });
            }
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
        // if (device.duration === 26) {
        //     startScheduleIndex = 0;
        //     consumed.devices[device.id] = parseFloat((sumOfAllRates / 1000 * device.power).toFixed(4));
        // } else {
            let startSearchIndex;
            let finishSearchIndex;
            
            switch (device.mode) {
                case "night" :
                    startSearchIndex = 21;
                    finishSearchIndex = 7;
                    break;
                case "day" :
                    startSearchIndex = 7;
                    finishSearchIndex = 21;
                    break;
                default :
                    startSearchIndex = 0;
                    finishSearchIndex = 23;

            }
            // if (typeof (device.mode) !== "undefined") {
            //     if (device.mode === "night") {
            //         startSearchIndex = 21;
            //         finishSearchIndex = 7;
            //     } else { //day
            //         startSearchIndex = 7;
            //         finishSearchIndex = 21;
            //     }
            // }
            let series = findMinSeries(startSearchIndex, finishSearchIndex, device.duration, device.power);
            if (!series) {
                console.error("Проблема с расчётом в какие часы запускать девайс " + device.name + " " + device.id);  
            }             
            startScheduleIndex = series.index;
            consumed.devices[device.id] = parseFloat((series.price / 1000 * device.power).toFixed(4));
        // }
        if (startScheduleIndex === -1) {
            console.error("Проблема с расчётом в какие часы запускать девайс " + device.name + " " + device.id)
        }
        let hoursRemaining = device.duration;
        for (let i = startScheduleIndex; hoursRemaining !== 0; i++) {
            if (i === 24) {
                i = 0;
            }
            schedule[i].push(device.id);
            powerUsagePerHour[i] -= device.power;
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

    console.log(result);

    // document.write(JSON.stringify(result, null, '\t'));
}


