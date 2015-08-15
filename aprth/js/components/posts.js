/*
	Объявления
*/
//режимы работы клсса объявлений
var PostsModes = {
	FAVORITES: "favorites", //режим избранного
	SEARCH: "search" //режим поиска
}
//класс объявлений
var Posts = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},	
	//состояние
	getInitialState: function () {
		return {
			adverts: [], //список объявлений
			markers: [], //список маркеров для карты
			advertsCnt: 0, //количество объявлений
			advertsReady: false, //флаг доступности списка объявлений для отображения
			filterIsSet: false, //флаг установленности фильтра
			filter: {}, //текущее состояние фильтра	(для сервера)
			radius: config.searchRadius, //радиус поиска		
			searchCenterLat: "", //широта центральной точки поиска
			searchCenterLon: "" //долгота центральной точки поиска
		}
	},
	//расчет "цены за период" объявлений по датам
	calcAdvertsPricePeriod: function (adverts, from, to) {
		if((adverts)&&(Array.isArray(adverts))) {
			if((from)&&(to)) {
				var dFrom = new Date(from);
				var dTo = new Date(to);
				adverts.map(function (item, i) {item.pricePeriod = item.priceDay * 1 * Utils.daysBetween(dFrom, dTo);});
			} else {
				adverts.map(function (item, i) {item.pricePeriod = 0;});
			}
		}
	},
	//получение данных объявлений от сервера
	handleSearchResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			var markers = [];
			//обработаем ответ в зависимости от режима
			switch(this.props.mode) {
				//режим поиска
				case(PostsModes.SEARCH): {					
					//наделаем маркеров для карты
					resp.MESSAGE.map(function (item, i) {
						if((item.apartment.latitude)&&(item.apartment.longitude)) {
							var link = "#/posts/" + item.id;
							if(("availableDateFrom" in this.state.filter)&&("availableDateTo" in this.state.filter)) {
								link += "?dFrom=" + this.state.filter.availableDateFrom + "&dTo=" + this.state.filter.availableDateTo;
							}							
							var content = "<div>" +
								"<b>" + Utils.getStrResource({lang: this.props.language, code: item.apartment.type}) + "</b><br>" + 
								item.user.lastName + " " + item.user.firstName + "<br>" +								
								item.priceDay + " " + Utils.getStrResource({lang: this.props.language, code: "CURRENCY"}) + "/" +
								Utils.getStrResource({lang: this.props.language, code: "UI_LBL_PERIOD_DAY"}) + "<br>" +
								item.description + "<br>" +
								"<b><a href='" + link + "'>>>></a></b>" +
								"</div>";							 
							markers.push({
								latitude: item.apartment.latitude,
								longitude: item.apartment.longitude,
								title: item.apartment.name,
								content: content
							});
						}
					}, this);
					//если это поиск, то необходимо расчитать цену за период для каждого объявления
					if(("availableDateFrom" in this.state.filter)&&("availableDateTo" in this.state.filter))
						this.calcAdvertsPricePeriod(
							resp.MESSAGE, 
							this.state.filter.availableDateFrom, 
							this.state.filter.availableDateTo
						);
					else
						this.calcAdvertsPricePeriod(resp.MESSAGE);
					break;
				}
				//режим избранного
				case(PostsModes.FAVORITES): {
					//для избранного - просто затираем цену за период
					this.calcAdvertsPricePeriod(resp.MESSAGE);
					break;
				}
				//прочие режимы
				default: {}
			}
			//теперь выставляем состояние компоненты
			this.setState({adverts: resp.MESSAGE, advertsCnt: resp.MESSAGE.length, markers: markers, advertsReady: true, filterIsSet: true});
		}
	},
	//получение ответа о смене статуса в избранном
	handleFavorChange: function (resp, itemId) {
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			var advTmp = this.state.adverts;
			var advLengthTmp = this.state.advertsCnt;
			//обработаем ответ в зависимости от режима
			switch(this.props.mode) {
				//режим поиска
				case(PostsModes.SEARCH): {
					_.where(advTmp, {id: itemId})[0].isFavorite = resp.MESSAGE.data[0];
					break;
				}
				//режим избранного
				case(PostsModes.FAVORITES): {
					advTmp = _.without(advTmp, _.findWhere(advTmp, {id: itemId}));
					advLengthTmp --;
					break;
				}
				//прочие режимы
				default: {}
			}
			this.setState({adverts: advTmp, advertsCnt: advLengthTmp});
		}
	},
	//изменение состояния элемента в избранном
	toggleAdvertFavor: function (itemId) {
		var self = this;
		var togglePrms = {
			language: this.props.language, 
			postId: itemId, 
			session: this.props.session.sessionInfo
		}
		clnt.toggleAdvertFavor(togglePrms, function (resp) {self.handleFavorChange(resp, itemId)});
	},	
	//смена фильтра
	onFilterChange: function (prms) {		
		if(!$.isEmptyObject(prms.filter)) {			
			this.setState({
				filter: prms.filter,
				radius: prms.radius,
				searchCenterLat: prms.latitude,
				searchCenterLon: prms.longitude
			});
			this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
			var getPrms = {
				language: this.props.language, 
				filter: prms.filter, 
				session: this.props.session.sessionInfo
			}			
			clnt.getAdverts(getPrms, this.handleSearchResult);
		} else {
			this.setState({
				adverts: [],				
				advertsCnt: 0,
				advertsReady: false,
				markers: [],
				filterIsSet: false,
				filter: {},
				radius: config.searchRadius,
				searchCenterLat: "",
				searchCenterLon: ""
			});
		}
	},
	//нажатие на кнопку избранного
	onFavorChange: function (itemId) {
		if(this.props.session.loggedIn)
			this.toggleAdvertFavor(itemId);
		else
			this.props.onLogIn({
				actionType: AppAfterAuthActionTypes.CALLBACK, 
				actionPrms: {callBack: this.toggleAdvertFavor, prms: itemId}
			});
	},
	//нажатие на элемент списка
	onItemClick: function (itemId) {
		var query = {};
		//соберем запрос на переход от режима работы
		switch(this.props.mode) {
			//поиск
			case(PostsModes.SEARCH): {
				if("availableDateFrom" in this.state.filter) query.dFrom = this.state.filter.availableDateFrom;
				if("availableDateTo" in this.state.filter) query.dTo = this.state.filter.availableDateTo;
				break;
			}
			//избранное
			case(PostsModes.FAVORITES): {
				break;
			}
			//прочие режимы
			default: {}
		}
		this.context.router.transitionTo("post", {postId: itemId}, query);
	},
	//смена радиуса поиска на карте
	handleMapRadarRadiusChanged: function (radius) {
		this.setState({radius: radius});
	},
	handleMapRadarPlaceChanged: function (center) {
		this.setState({
			searchCenterLat: center.lat(),
			searchCenterLon: center.lng()
		});
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		//инициализируем в зависимости от режима работы
		switch(this.props.mode) {
			//режим поиска
			case(PostsModes.SEARCH): {
				break;
			}
			//режим избранного
			case(PostsModes.FAVORITES): {
				if(this.props.session.loggedIn) {
					this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
					var getPrms = {
						language: this.props.language, 
						filter: {isFavoritedUserId: this.props.session.sessionInfo.user.profile.id},
						session: this.props.session.sessionInfo
					}
					clnt.getAdverts(getPrms, this.handleSearchResult);
				}
				break;
			}
			//прочие режимы
			default: {}
		};
	},
	//завершение генерации/обновления представления компонента
	componentDidUpdate: function (prevProps, prevState) {
		fixFooter();
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
	},
	//генерация представления класса
	render: function () {
		//финальное содержимое
		var content;
		//собираем компонент от режима
		switch(this.props.mode) {
			//режим поиска
			case(PostsModes.SEARCH): {
				//форма фильтра
				var postsFilter =	<PostsFilter language={this.props.language}
										cntFound={this.state.advertsCnt}
										filterIsSet={this.state.filterIsSet}
										radius={this.state.radius}
										latitude={this.state.searchCenterLat}
										longitude={this.state.searchCenterLon}
										onFilterChange={this.onFilterChange}/>
				//карта
				var map;				
				map =	<Map latitude={this.state.searchCenterLat}
							longitude={this.state.searchCenterLon}
							address={this.state.filter.adress}
							radius={this.state.radius}
							markers={this.state.markers}
							mode={mapModes.modeGroup}
							zoom={10}
							onSearchRadarRadiusChange={this.handleMapRadarRadiusChanged}
							onSearchRadarPlaceChange={this.handleMapRadarPlaceChanged}
							showRadar={this.state.filterIsSet}/>
				//список объявлений
				var postsList;
				if((this.state.advertsReady)&&(this.state.advertsCnt > 0)) {
					postsList = <PostsList onFavorChange={this.onFavorChange}
									onItemClick={this.onItemClick}
									language={this.props.language}
									items={this.state.adverts}
									mode={this.props.mode}/>
				}
				//соберем финальный вид компонента
				content =	<div className="w-section u-sect-page-cardlst">
								<div className="w-row">
									<div className="w-col w-col-6 w-col-stack u-col-cardlst1">
										{postsFilter}					
									</div>
									<div className="w-col w-col-6 w-col-stack u-col-cardlst2">
										{map}
									</div>									
								</div>	
								<div className="w-container">
									<div className="w-row">
										<div className="w-col w-col-12 w-col-stack u-col-cardlst1">
											{postsList}								
										</div>
									</div>
								</div>
							</div>
				break;
			}
			//режим избранного
			case(PostsModes.FAVORITES): {
				//список объявлений
				var postsList;
				if(this.props.session.loggedIn) {
					if((this.state.advertsReady)&&(this.state.advertsCnt > 0)) {
						postsList = <PostsList onFavorChange={this.onFavorChange}
										onItemClick={this.onItemClick}
										language={this.props.language}
										items={this.state.adverts}
										mode={this.props.mode}/>
					} else {
						if((this.state.advertsReady)&&(this.state.advertsCnt == 0)) {				
							postsList =	<InLineMessage type={Utils.getMessageTypeInf()} 
											message={Utils.getStrResource({lang: this.props.language, code: "CLNT_NO_FAVORITES"})}/>
						}
					}
				} else {
					postsList =	<InLineMessage type={Utils.getMessageTypeErr()} 
									message={Utils.getStrResource({lang: this.props.language, code: "SRV_UNAUTH"})}/>					

				}
				//соберем финальный вид компонента
				content =	<div className="w-section u-sect-page-cardlst">
								<div className="w-row">
									<div className="w-col w-col-12 w-col-stack u-col-cardlst1">										
										{postsList}
									</div>
								</div>
							</div>
				break;
			}
			//прочие режимы
			default: {
				content =	<InLineMessage type={Utils.getMessageTypeErr()} 
								message={Utils.getStrResource({lang: this.props.language, code: "CLNT_NO_MODE"})}/>
			}
		}
		//генератор		
		return (
			<div name="posts" className="content-center">
				{content}
			</div>
		);
	}
});