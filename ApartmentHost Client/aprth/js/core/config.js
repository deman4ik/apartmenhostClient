/*
	Конфигурация клиентского приложения
*/
var config = {
	//адрес сервера
	serverAppUrl: "https://apartmenthost.azure-mobile.net/",
	//ключ сервера
	serverAppKey: "ntYnnTKTdxhWcfEDGPQMMYvNKyiUtx61",
	//ключ для Google APIs
	googleAppKey: "AIzaSyCE7mx3wrx6GChi6odnbAZ8jSejP2YnTbM",
	//широта центра карты по-умолчанию
	latitude: 55.755833,
	//долгота центра карты по-умолчанию
	longitude: 37.617778,
	//имя облака Cloudinary для хранения картинок
	cloudinaryCloudName: "apartmenthost",
	//имя демонстрационного пользователя
	demoUser: "parus@parus.ru",
	//пароль демонстрационного пользователя
	demoPassword: "parusina",
	//доступность смены языка интерфейса
	languagesEnabled: true,
	//язык интерфейса по умолчанию
	languageDefault: "RU",
	//картинка по-умолчанию для карточек
	defaultPictureUrl: "aprth/img/def_photo.png",
	//аватар по-умолчани
	defaultProfilePictureUrl: "aprth/img/def_ava.png",
	//радиус поиска на карте по умолчанию (метры)
	searchRadius: 5000,
	//минимальный радиус поиска на карте (метры)
	searchRadiusMin: 1000,
	//максимальный радиус поиска на карте (метры)
	searchRadiusMax: 15000,
	//шаг увеличения/уменьшения радиуса поиска (метры)
	searchRadiusStep: 1000
}