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
			advertsCnt: 0, //количество объявлений
			advertsReady: false, //флаг доступности списка объявлений для отображения
			filterIsSet: false, //флаг установленности фильтра
			filter: [] //текущее состояние фильтра
		}
	},
	//получение данных объявлений от сервера
	handleSearchResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.setState({adverts: resp.MESSAGE, advertsCnt: resp.MESSAGE.length, advertsReady: true, filterIsSet: true});
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
	onFilterChange: function (filter) {
		if((filter)&&(Array.isArray(filter))&&(filter.length > 0)) {
			this.setState({filter: filter});
			this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
			var getPrms = {
				language: this.props.language, 
				filter: filter, 
				session: this.props.session.sessionInfo
			}			
			clnt.getAdverts(getPrms, this.handleSearchResult);
		} else {
			this.setState({adverts: [], advertsCnt: 0, advertsReady: false, filterIsSet: false, filter: []});
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
				if(_.findWhere(this.state.filter, {fieldName: "DateFrom"})) query.dFrom = _.findWhere(this.state.filter, {fieldName: "DateFrom"}).value;
				if(_.findWhere(this.state.filter, {fieldName: "DateTo"})) query.dTo = _.findWhere(this.state.filter, {fieldName: "DateTo"}).value;
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
					var filter = filterFactory.buildAdvertsFilter({language: this.props.language, isFavorite: true});
					console.log(filter);
					var getPrms = {
						language: this.props.language, 
						filter: filter, 
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
				var postsFilter = <PostsFilter language={this.props.language}
									cntFound={this.state.advertsCnt}
									filterIsSet={this.state.filterIsSet}
									onFilterChange={this.onFilterChange}/>
				//список объявлений
				var postsList;
				if((this.state.advertsReady)&&(this.state.advertsCnt > 0)) {
					postsList = <PostsList onFavorChange={this.onFavorChange}
									onItemClick={this.onItemClick}
									language={this.props.language}
									items={this.state.adverts}/>
				} else {
					if(!this.state.advertsReady) {
						postsList =	<InLineMessage type={Utils.getMessageTypeInf()} 
										message={Utils.getStrResource({lang: this.props.language, code: "UI_NO_FILTER"})}/>
					} else {
						postsList =	<InLineMessage type={Utils.getMessageTypeErr()} 
										message={Utils.getStrResource({lang: this.props.language, code: "UI_NO_DATA_FOUND"})}/>
					}
				}
				//соберем финальный вид компонента
				content =	<div className="w-section u-sect-page-cardlst">
								<div className="w-row">
									<div className="w-col w-col-12 w-col-stack u-col-cardlst1">
										{postsFilter}
										{postsList}
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
										items={this.state.adverts}/>
					} else {					
						postsList =	<InLineMessage type={Utils.getMessageTypeInf()} 
											message={Utils.getStrResource({lang: this.props.language, code: "CLNT_NO_FAVORITES"})}/>					
					}
				} else {
					postsList =	<InLineMessage type={Utils.getMessageTypeErr()} 
										message={Utils.getStrResource({lang: this.props.language, code: "SRV_UNAUTH"})}/>					

				}
				//соберем финальный вид компонента
				content = <div className="w-section u-sect-page-cardlst">
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
			<div className="content-center">
				{content}
			</div>
		);
	}
});