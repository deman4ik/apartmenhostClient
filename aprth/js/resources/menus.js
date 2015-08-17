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
				authAccess: false
			},
			{
				code: "Profile", 
				title: "UI_MAIN_MENU_PROFILE", 
				link: "profile",
				path: "/profile",
				authAccess: true
			},
			{
				code: "Favorites", 
				title: "UI_MAIN_MENU_FAVOR", 
				link: "favorites",
				path: "/favorites",
				authAccess: true
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
				link: "article", 
				linkParams: {articleId: "HOW_IT_WORKS"}, 
				authAccess: false, 
				col: 1
			},
			{
				code: "TermsOfUse", 
				title: "UI_FOOTER_MENU_TERMSUSE", 
				link: "article", 
				linkParams: {articleId: "TERMS_OF_USE"}, 
				authAccess: false, 
				col: 1
			},
			{
				code: "Rules", 
				title: "UI_FOOTER_MENU_RULES", 
				link: "article", 
				linkParams: {articleId: "RULES"}, 
				authAccess: false, 
				col: 1
			},
			{
				code: "Help", 
				title: "UI_FOOTER_MENU_HELP", 
				link: "article", 
				linkParams: {articleId: "HELP"}, 
				authAccess: false, 
				col: 2
			},
			{
				code: "Contacts", 
				title: "UI_FOOTER_MENU_CONTACT", 
				link: "article", 
				linkParams: {articleId: "CONTACTS"}, 
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
				code: "FaceBook", 
				title: "UI_FOOTER_MENU_SOCIAL_FACEBOOK", 
				link: "http://www.fb.com",				
				authAccess: false
			},
			{
				code: "Twitter", 
				title: "UI_FOOTER_MENU_SOCIAL_TWITTER", 
				link: "http://www.twitter.com",				
				authAccess: false
			},
			{
				code: "Instagram", 
				title: "UI_FOOTER_MENU_SOCIAL_INSTAGRAM", 
				link: "http://www.instagram.com",				
				authAccess: false
			},
			{
				code: "GooglePlus", 
				title: "UI_FOOTER_MENU_SOCIAL_GOOGLEPLUS", 
				link: "http://plus.google.com",				
				authAccess: false
			}
		]
	}
]