/*
	Конфигурация клиентского приложения
*/
var config = {
	//адрес сервера
	serverAppUrl: "https://apartmenthost.azure-mobile.net/",
	//ключ сервера
	serverAppKey: "ntYnnTKTdxhWcfEDGPQMMYvNKyiUtx61",
	//ключ для Google APIs
	googleAppKey: "AIzaSyB9kvb4U_99FmLMZwlbQzf6AWuM9CDz0hs",
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
	defaultPictureUrl: "http://res.cloudinary.com/apartmenthost/image/upload/v1449434392/def_photo_zjwrwr.png",
	//аватар по-умолчанию
	defaultProfilePictureUrl: "aprth/img/def_ava.png",
	//масштаб карты по умолчанию
	defaultMapZoom: 15,
	//масштаб карты отображения адреса в объявлении
	postMapZoom: 14,
	//масштаб карты поиска
	searchMapZoom: 10,
	//радиус поиска на карте по умолчанию (метры)
	searchRadius: 5000,
	//минимальный радиус поиска на карте (метры)
	searchRadiusMin: 1000,
	//максимальный радиус поиска на карте (метры)
	searchRadiusMax: 15000,
	//шаг увеличения/уменьшения радиуса поиска (метры)
	searchRadiusStep: 1000,
	//признак использования радара для поиска
	useSearchRadar: true,
	//цвет заливки радара
	radarBgColor: "#00ccc5",
	//максимальное количество картинок на объявление
	postMaxPictures: 20
}