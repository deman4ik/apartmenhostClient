/*
	Главная страница
*/
var Main = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},
	//состояние главной страницы
	getInitialState: function () {
		return {
			topicsLoaded: false, //признак загруженности статей
			topics: [], //список статей заглавной страницы
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
			filter: {} //текущее состояние фильтра	(для сервера)				
		}
	},
	//обработка результатов получения статей заглавной страницы
	handleGetTopicsResult: function (resp) {		
		if(resp.STATE == clnt.respStates.ERR) {
			this.setState({topics: [], topicsLoaded: false});
		} else {			
			if((resp.MESSAGE)&&(Array.isArray(resp.MESSAGE))&&(resp.MESSAGE.length > 0)) {
				this.setState({topics: resp.MESSAGE, topicsLoaded: true});
			} else {
				this.setState({topics: [], topicsLoaded: false});
			}
		}
	},
	//загрузка данных статей заглавной страницы
	getTopics: function (language) {		
		var getPrms = {
			language: language, 
			filter: {name: "HOW_IT_WORKS"}
		}
		clnt.getArticles(getPrms, this.handleGetTopicsResult);		
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		this.getTopics(this.props.language);
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
		if(newProps.language != this.props.language) {
			this.getTopics(newProps.language);		
		}
	},
	//обработка нажатия на статью заглавной страницы
	onTopicClick: function (index) {
		this.context.router.transitionTo("articles", {}, {filter: {name: "HOW_IT_WORKS"}, title: "UI_FOOTER_MENU_HOWITWORKS", convertTitle: true});
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
	//генерация представления главной страницы
	render: function () {
		var postsFindForm =	<PostsFindForm language={this.props.language}										
								latitude={this.state.filterClnt.latitude}
								longitude={this.state.filterClnt.longitude}
								address={this.state.filterClnt.address}
								dFrom={this.state.filterClnt.dFrom}
								dTo={this.state.filterClnt.dTo}
								sex={this.state.filterClnt.sex}										
								onFind={this.onFind}
								onFindClear={this.onFindClear}/>		
		//статьи заглавной страницы
		var topics;
		if(this.state.topicsLoaded) {
			var topicsitems = this.state.topics.map(function (item, i) {
				return (
					<div className="w-col w-col-4 u-col-howto card" key={i} onClick={this.onTopicClick.bind(this, i)}>
						<h2>{item.title}</h2>
						<p>{item.text}</p>
					</div>
				);
			}, this);
			topics =	<div className="w-container">
							<h1 className="u-t-h1-main">{Utils.getStrResource({lang: this.props.language, code: "UI_FOOTER_MENU_HOWITWORKS"})}</h1>
							<div className="u-block-spacer"></div>
							<div className="w-row">
								{topicsitems}
							</div>
							<div className="u-block-spacer"></div>
						</div>
		}		
		//генератор		
		return (
			<div name="landing">
				<div className="w-section u-sect-hero">
					<h1 className="u-t-h1-land">Сдай своё жильё</h1>
					<h1 className="u-t-h1-land sub1">И живи спокойно.</h1>
					<div className="u-block-land">
						<a className="w-button u-btn-land" href="#">Попробовать</a>
					</div>
					<div className="u-block-search-main">
							{postsFindForm}					
					</div>					
				</div>
				<div className="w-section u-sect-land under">
					<h1 className="u-t-h1-land2 sub">или</h1>
					<h1 className="u-t-h1-land2">Найди себе новое!</h1>
					<div className="u-block-spacer"></div>
					<div className="w-container">
						<div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/1.jpg"></img></div>
						<div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/2.jpg"></img></div>
						<div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/3.jpg"></img></div>
						<div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/4.jpg"></img></div>
						<div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/5.jpg"></img></div>
						<div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/6.jpg"></img></div>
						<div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/8.jpg"></img></div>
						<div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/2.jpg"></img></div>
					</div>
				</div>
				<div className="w-section u-sect-land">
					{topics}
				</div>
			</div>
		);
	}
});