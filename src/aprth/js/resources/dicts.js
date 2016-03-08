/*
	Словари
*/
//пол профиля
var profileGender = [
	"PG_MALE",
	"PG_FEMALE"
];
//категории цен
var priceCats = [
	"PC_DOG",
	"PC_CAT",
	"PC_BIRD",
	"PC_FISH",
	"PC_RABBIT",
	"PC_FERRET",
	"PC_MOUSE",	
	"PC_REPTILE",
	"PC_PRIMATE",
	"PC_INSECT",	
	"PC_PLANT",
	"PC_OTHER"
];
//типы объектов обявления
var postObjType = [
	"POT_APARTMENT",
	"POT_ROOM",
	"POT_HOUSE",
	"POT_HOTEL_ROOM"
];
//типы запросов на бронирование
var ordersTypes = [
	"DVAL_OWNER",
	"DVAL_RENTER"
];
//коды телефонных номеров
var phoneCodes = [
	{
		countryCode: "RUSSIA",
		phoneCode: "7",
		phoneLength: 10
	}
];
//дополнительные логические/бинарные признаки в объявлении ситтера
var extraInfo = [
	"EXI_MULTIPLE_PETS",
	"EXI_DELIVERY",
	"EXI_NON_STERILIZED",
	"EXI_NON_VACCINATED",
	"EXI_SPECIAL_FOOD",
	"EXI_FULL_SURVEY",
	"EXI_MEDIA_REPORT",
	"EXI_CONTRACT",
	"EXI_BUY_FOOD",
	"EXI_VET_SERVICE",
	"EXI_VET_PASSPORT"
];