/*
	Конфигурация клиентского приложения
*/
var config = {
	//адрес сервера
	serverAppUrl: "https://petforaweekservice.azure-mobile.net/",
	//ключ сервера
	serverAppKey: "WKsVSboerZAjHgVnoczlziKGkeoRvn91",
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
	defaultPictureUrl: "http://res.cloudinary.com/apartmenthost/image/upload/c_thumb,h_128,w_128/v1449434392/def_photo_zjwrwr.png",
	defaultPictureLarge: "http://res.cloudinary.com/apartmenthost/image/upload/c_fill,h_225,w_370/v1449434392/def_photo_zjwrwr.png",
	defaultPictureMid: "http://res.cloudinary.com/apartmenthost/image/upload/c_fill,h_225,w_370/v1449434392/def_photo_zjwrwr.png",
	defaultPictureSmall: "http://res.cloudinary.com/apartmenthost/image/upload/c_thumb,h_190,w_190/v1449434392/def_photo_zjwrwr.png",
	defaultPictureXlarge: "http://res.cloudinary.com/apartmenthost/image/upload/c_fill,h_225,w_370/v1449434392/def_photo_zjwrwr.png",
	defaultPictureXsmall: "http://res.cloudinary.com/apartmenthost/image/upload/c_thumb,h_143,w_143/v1449434392/def_photo_zjwrwr.png", 
	//аватар по-умолчанию
	defaultProfilePictureUrl: "http://res.cloudinary.com/apartmenthost/image/upload/c_thumb,h_76,w_76/v1449434389/def_ava_yta7tp.png",
	defaultProfilePictureLarge: "http://res.cloudinary.com/apartmenthost/image/upload/c_thumb,h_76,w_76/v1449434389/def_ava_yta7tp.png",
	defaultProfilePictureMid: "http://res.cloudinary.com/apartmenthost/image/upload/c_thumb,h_62,w_62/v1449434389/def_ava_yta7tp.png",
	defaultProfilePictureSmall: "http://res.cloudinary.com/apartmenthost/image/upload/c_thumb,h_34,w_34/v1449434389/def_ava_yta7tp.png",
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
