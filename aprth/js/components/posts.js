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
			filterClnt: { //текущее состояние фильтра
				useRadius: "", //искать в радиусе
				radius: config.searchRadius, //радиус поиска по карте
				latitude: "", //широта выбранной точки поиска
				longitude: "", //долгота выбранной точки поиска
				address: "", //адрес жилья		
				swLat: "", //широта ЮВ угла квадрата поиска по выбранной точке
				swLong: "", //долгота ЮВ угла квадрата поиска по выбранной точке
				neLat: "", //широта СЗ угла квадрата поиска по выбранной точке
				neLong: "", //долгота СЗ угла квадрата поиска по выбранной точке
				dFrom: "", //дата начала периода бронирования
				dTo: "", //дата коночания периода бронирования
				sex: "", //пол постояльца
				apartType: "", //тип жилья
				priceFrom: "", //цена с
				priceTo: "", //цена по
				price: "" //цена (сводное состояние)
			},
			filter: {}, //текущее состояние фильтра	(для сервера)			
		}
	},
	//расчет "цены за период" объявлений по датам
	calcAdvertsPricePeriod: function (adverts) {
		var hlC = this.state.filterClnt.sex;
		if((adverts)&&(Array.isArray(adverts))) {
			if((this.state.filterClnt.dFrom)&&(this.state.filterClnt.dTo)&&(hlC)) {
				var dFrom = new Date(this.state.filterClnt.dFrom);
				var dTo = new Date(this.state.filterClnt.dTo);
				adverts.map(function (item, i) {
					var pr = _.findWhere(item.genders, {name: hlC});					
					if(pr) {
						item.pricePeriod = pr.price * 1 * Utils.daysBetween(dFrom, dTo);
						item.higlightPriceCat = hlC;
					} else {
						item.pricePeriod = 0;
						item.higlightPriceCat = hlC;
					}
				});
			} else {
				if((this.state.filterClnt.dFrom)&&(this.state.filterClnt.dTo)) {
					var dFrom = new Date(this.state.filterClnt.dFrom);
					var dTo = new Date(this.state.filterClnt.dTo);				
					adverts.map(function (item, i) {
						item.pricePeriod = _.min(_.pluck(item.genders, "price")) * 1 * Utils.daysBetween(dFrom, dTo);
						item.higlightPriceCat = hlC;
					});
				} else {
					adverts.map(function (item, i) {
						item.pricePeriod = 0;
						item.higlightPriceCat = hlC;
					});
				}
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
							var linkQ = "";
							if((this.state.filterClnt.dFrom)&&(this.state.filterClnt.dTo)) {								
								linkQ += ((linkQ == "")?"":"&") + "dFrom=" + this.state.filterClnt.dFrom + "&dTo=" + this.state.filterClnt.dTo;
							}
							if(this.state.filterClnt.sex) {
								linkQ += ((linkQ == "")?"":"&") + "priceCat=" + this.state.filterClnt.sex;
							}							
							link += (linkQ == "")?"":"?" + linkQ;
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
					this.calcAdvertsPricePeriod(resp.MESSAGE);
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
	//сохранение фильтра
	saveFilterState: function () {
		Utils.saveObjectState("filterParams", this.state.filterClnt);
	},
	//загрузка сохраненного фильтра
	loadFilterState: function (callBack) {
		var filterParams = Utils.loadObjectState("filterParams");
		if(filterParams) {
			if((!config.useSearchRadar)||(filterParams.useRadius != PostsFilterPrms.postFilterUseRadius)) {
				filterParams.radius = config.searchRadius;
				this.setState({filterClnt: filterParams}, Utils.bind(function () {
					this.recalcSearchArea(callBack);
				}, this));					
			} else {
				this.setState({filterClnt: filterParams}, callBack);
			}
		} else {
			callBack();
		}	
	},
	//формирование фильтра для передачи на сервер
	buildSrvAdvertsFilter: function () {
		var serverFilter = {};
		if(this.state.filterClnt.address) serverFilter.adress = this.state.filterClnt.address;
		if(this.state.filterClnt.swLat) serverFilter.swLat = this.state.filterClnt.swLat;
		if(this.state.filterClnt.swLong) serverFilter.swLong = this.state.filterClnt.swLong;
		if(this.state.filterClnt.neLat) serverFilter.neLat = this.state.filterClnt.neLat;
		if(this.state.filterClnt.neLong) serverFilter.neLong = this.state.filterClnt.neLong;
		if(this.state.filterClnt.sex) serverFilter.genders = [this.state.filterClnt.sex];
		if(this.state.filterClnt.dFrom) serverFilter.availableDateFrom = this.state.filterClnt.dFrom;
		if(this.state.filterClnt.dFrom) serverFilter.availableDateTo = this.state.filterClnt.dTo;
		if(this.state.filterClnt.priceFrom) serverFilter.priceDayFrom = this.state.filterClnt.priceFrom;
		if(this.state.filterClnt.priceTo) serverFilter.priceDayTo = this.state.filterClnt.priceTo;
		if(this.state.filterClnt.apartType) serverFilter.type = [this.state.filterClnt.apartType];
		return serverFilter;
	},
	//пересчет области поиска
	recalcSearchArea: function (callBack)  {
		var tmp = {};
		_.extend(tmp, this.state.filterClnt);
		tmp.swLat = "";
		tmp.swLong = "";
		tmp.neLat = "";
		tmp.neLong = "";
		if((tmp.latitude)&&(tmp.longitude)&&(tmp.radius)) {
			var c = new google.maps.Circle({center: new google.maps.LatLng(tmp.latitude, tmp.longitude), radius: tmp.radius});
			var bounds = c.getBounds();			
			tmp.swLat = bounds.getSouthWest().lat();
			tmp.swLong = bounds.getSouthWest().lng();
			tmp.neLat = bounds.getNorthEast().lat();
			tmp.neLong = bounds.getNorthEast().lng();
		}
		this.setState({filterClnt: tmp}, callBack);
	},
	//поиск и фильтрация
	findAndFilter: function () {
		if(this.state.filterIsSet) {
			this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
			var getPrms = {
				language: this.props.language, 
				filter: this.buildSrvAdvertsFilter(), 
				session: this.props.session.sessionInfo
			}			
			clnt.getAdverts(getPrms, this.handleSearchResult);
		}
	},	
	//смена параметров поиска
	onFindChange: function (find, callBack) {
		var recalcSA = false;
		var tmp = {};
		_.extend(tmp, this.state.filterClnt);
		if(
			(this.state.filterClnt.latitude != find.latitude)||
			(this.state.filterClnt.longitude != find.longitude)||
			(this.state.filterClnt.address != find.address)
		) recalcSA = true;
		tmp.latitude = find.latitude;
		tmp.longitude = find.longitude;
		tmp.address = find.address;
		tmp.dFrom = find.dFrom;
		tmp.dTo = find.dTo;
		tmp.sex = find.sex;
		this.setState({filterClnt: tmp}, function () {
			this.saveFilterState();
			if(recalcSA) {
				this.recalcSearchArea(callBack);
			} else {
				if((callBack)&&(Utils.isFunction(callBack))) callBack();
			}
		});		
	},
	//смена параметров фильтра
	onFilterChange: function (filter) {		
		var recalcSA = false;
		var tmp = {};
		_.extend(tmp, this.state.filterClnt);
		if(this.state.filterClnt.radius != filter.radius) recalcSA = true;
		tmp.useRadius = filter.useRadius;
		tmp.radius = filter.radius;
		tmp.apartType = filter.apartType;
		tmp.priceFrom = filter.priceFrom;
		tmp.priceTo = filter.priceTo;
		tmp.price = filter.price;
		this.setState({filterClnt: tmp}, function () {
			this.saveFilterState();
			if(recalcSA) {
				this.recalcSearchArea(this.findAndFilter);
			} else {
				this.findAndFilter();
			}						
		});	
	},
	//нажатие на поиск
	onFind: function (find) {
		this.setState({filterIsSet: true}, Utils.bind(function () {			
			this.onFindChange(find, this.findAndFilter);
		}, this));
	},
	//нажатие на очистку поиска
	onFindClear: function () {
		var tmp = {};
		_.extend(tmp, this.state.filterClnt);
		tmp.useRadius = PostsFilterPrms.postFilterUseRadius;
		tmp.radius = config.searchRadius;
		tmp.latitude = "";
		tmp.longitude = "";
		tmp.address = "";
		tmp.swLat = "";
		tmp.swLong = "";
		tmp.neLat = "";
		tmp.neLong = "";
		tmp.dFrom = "";
		tmp.dTo = "";
		tmp.sex = "";
		tmp.apartType = "";
		tmp.priceFrom = "";
		tmp.priceTo = "";
		tmp.price = "";
		this.setState({filterClnt: tmp, adverts: [], advertsCnt: 0, advertsReady: false, markers: [], filterIsSet: false}, function () {
			this.saveFilterState();
		});
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
				if(this.state.filterClnt.dFrom) query.dFrom = this.state.filterClnt.dFrom;
				if(this.state.filterClnt.dTo) query.dTo = this.state.filterClnt.dTo;
				if(this.state.filterClnt.sex) query.priceCat = this.state.filterClnt.sex;
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
		var tmp = {};
		_.extend(tmp, this.state.filterClnt);
		tmp.radius = radius;		
		this.setState({filterClnt: tmp}, function () {
			this.saveFilterState();
			this.recalcSearchArea(this.findAndFilter);
		});
	},
	handleMapRadarPlaceChanged: function (newPlace) {
		var tmp = {};
		_.extend(tmp, this.state.filterClnt);
		tmp.latitude = newPlace.center.lat();
		tmp.longitude = newPlace.center.lng();
		tmp.address = newPlace.address;
		this.setState({filterClnt: tmp}, function () {
			this.saveFilterState();
			this.recalcSearchArea(this.findAndFilter);
		});		
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		//инициализируем в зависимости от режима работы
		switch(this.props.mode) {
			//режим поиска
			case(PostsModes.SEARCH): {				
				$(".nano").nanoScroller();
				this.loadFilterState(Utils.bind(function () {
					if(!$.isEmptyObject(this.buildSrvAdvertsFilter())) {
						this.setState({filterIsSet: true}, this.findAndFilter);
					}
				}, this));
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
		fixFooter();
	},
	//завершение генерации/обновления представления компонента
	componentDidUpdate: function (prevProps, prevState) {
		fixFooter();		
		$(".nano").nanoScroller();
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
				//форма поиска
				var postsFindForm =	<PostsFindForm language={this.props.language}										
										latitude={this.state.filterClnt.latitude}
										longitude={this.state.filterClnt.longitude}
										address={this.state.filterClnt.address}
										dFrom={this.state.filterClnt.dFrom}
										dTo={this.state.filterClnt.dTo}
										sex={this.state.filterClnt.sex}										
										onFind={this.onFind}
										onFindClear={this.onFindClear}/>
				//форма фильтра
				var postsFilterForm =	<PostsFilterForm language={this.props.language}											
											useRadius={this.state.filterClnt.useRadius}
											radius={this.state.filterClnt.radius}
											apartType={this.state.filterClnt.apartType}											
											priceFrom={this.state.filterClnt.priceFrom}											
											priceTo={this.state.filterClnt.priceTo}
											price={this.state.filterClnt.price}
											onFilterChange={this.onFilterChange}/>
				//счетчик результатов поиска
				var postsSearchCounter;
				if((this.state.filterIsSet)&&(this.state.advertsReady)) {
					postsSearchCounter = <PostsSearchCounter language={this.props.language} cntFound={this.state.advertsCnt}/>
				}
				//карта
				var map;				
				map =	<Map latitude={this.state.filterClnt.latitude}
							longitude={this.state.filterClnt.longitude}							
							radius={this.state.filterClnt.radius}
							address={this.state.filterClnt.address}
							markers={this.state.markers}
							mode={mapModes.modeGroup}
							zoom={10}
							showRadar={(this.state.filterClnt.useRadius == PostsFilterPrms.postFilterUseRadius)?true:false}
							onSearchRadarRadiusChange={this.handleMapRadarRadiusChanged}
							onSearchRadarPlaceChange={this.handleMapRadarPlaceChanged}/>
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
									<div className="w-col w-col-12 w-col-stack u-col-cardlst1">
										{postsFindForm}					
									</div>
								</div>
								<div className="w-row">
									<div className="w-col w-col-7 w-col-stack u-col-cardlst1">
									  <div className="nano has-scrollbar">
										  <div className="nano-content">
										  		{postsSearchCounter}
												{postsFilterForm}		
												{postsList}	
											</div>		
										</div>	
									</div>
									<div className="w-col w-col-5 w-col-stack u-col-cardlst2">
										{map}
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