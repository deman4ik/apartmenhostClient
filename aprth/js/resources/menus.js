/*
	Линейки меню
*/
var menus = [
	//основное меню приложения
	{
		menuName: "MAIN_MENU",
		items: [
			{
				code: "Search", 
				title: "UI_MAIN_MENU_SEARCH", 
				link: "search",
				path: "/search",
				authAccess: false,
				excludePaths: ["/main"]
			},
			{
				code: "Profile", 
				title: "UI_MAIN_MENU_PROFILE", 
				link: "profile",
				path: "/profile",
				authAccess: true,
				excludePaths: []
			},
			{
				code: "Favorites", 
				title: "UI_MAIN_MENU_FAVOR", 
				link: "favorites",
				path: "/favorites",
				authAccess: true,
				excludePaths: []
			}			
		]
	},
	//основное меню подвала
	{
		menuName: "FOOTER_MENU",
		cntCols: 2,
		items: [
			{
				code: "HowItWorks", 
				title: "UI_FOOTER_MENU_HOWITWORKS", 
				link: "articles", 
				linkParams: {},
				linkQuery: {filter: {name: "HOW_IT_WORKS"}, title: "UI_FOOTER_MENU_HOWITWORKS", convertTitle: true},
				authAccess: false, 
				col: 1
			},
			{
				code: "TermsOfUse", 
				title: "UI_FOOTER_MENU_TERMSUSE", 
				link: "articles", 
				linkParams: {},
				linkQuery: {filter: {name: "TERMS_OF_USE"}, title: "UI_FOOTER_MENU_TERMSUSE", convertTitle: true},
				authAccess: false, 
				col: 1
			},
			{
				code: "Rules", 
				title: "UI_FOOTER_MENU_RULES", 
				link: "articles", 
				linkParams: {},
				linkQuery: {filter: {name: "RULES"}, title: "UI_FOOTER_MENU_RULES", convertTitle: true},
				authAccess: false, 
				col: 1
			},
			{
				code: "Help", 
				title: "UI_FOOTER_MENU_HELP", 
				link: "articles", 
				linkParams: {},
				linkQuery: {filter: {name: "HELP"}, title: "UI_FOOTER_MENU_HELP", convertTitle: true},
				authAccess: false, 
				col: 2
			},
			{
				code: "Contacts", 
				title: "UI_FOOTER_MENU_CONTACT", 
				link: "NOTIFY_PARENT", 
				linkParams: {},
				linkQuery: {}, 
				authAccess: false, 
				col: 2
			}
		]
	},
	//меню подвала со ссылками на соцсети
	{
		menuName: "FOOTER_MENU_SOCIAL",
		items: [
			{
				code: "VK", 
				title: "UI_FOOTER_MENU_SOCIAL_VK", 
				image: "aprth/img/vkontakte.png",
				link: "https://vk.com/club108035370",				
				authAccess: false
			},		
			{
				code: "FaceBook", 
				title: "UI_FOOTER_MENU_SOCIAL_FACEBOOK", 
				image: "aprth/img/facebook.png",
				link: "https://www.facebook.com/groups/814164982039762/",				
				authAccess: false
			},
			{
				code: "Odnoklassniki", 
				title: "UI_FOOTER_MENU_SOCIAL_OK", 
				image: "aprth/img/ok.png",
				link: "http://www.ok.ru/group/52771912679636",				
				authAccess: false
			}
		]
	}
]