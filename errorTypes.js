module.exports = {
	MissingSomeRateProperties: "Отсутствуют обязательные параметры у rates",
	MoreThen24HoursInDay: "В сутках не может быть больше 24 часов",
	RateValueIsNaN: "Тариф имеет не числовое значение",
	RateFromToIsNaN: "Часы в тарифе должны иметь целочисленное значение",
	RatesIntersects: "Тарифы накладываются друг на друга",
	RatesNotDefined: "Тарифы не заданы",
	DeviceCannotRunMoreThen24Hours: "Устройства не могут работать более 24 часов в сутки",
	UnspecifiedHourRate: "Отсутствую тарифы для некоторых часов",
	RequestedTooMuchWorkingHoursForDevice: function(device, limit) {
		return `Устройство "${device.name}" требует ${device.duration} часов, но введу режима ${device.mode || ""} доступно лишь ${limit}`;
	},
	RequestedTooMuchWorkingHoursForDeviceRegEx: /Устройство ".+" требует \d+ часов, но введу режима .+/,
	MaxPowerExceededForDevice: function(device) {
		return `Максимальная мощность девайса "${device.name}" превышает максимально допустимую`;
	},
	MaxPowerExceededForDeviceRegEx: /Максимальная мощность девайса ".+" превышает максимально допустимую/,
	CannotFindHoursForRunningDevice: function(device) {
		return `Проблема с расчётом в какие часы запускать девайс ${device.name} ${device.id}`;
	},
	CannotFindHoursForRunningDeviceRegEx: /Проблема с расчётом в какие часы запускать девайс .+/,
	UnexpectedModeSpecifiedForDevice: function(device) {
		return `Задан неизвестный режим "${device.mode}" для устройства ${device.name} ${device.id}`;	
	},
	UnexpectedModeSpecifiedForDeviceRegEx: /Задан неизвестный режим ".+" для устройства .+/
}