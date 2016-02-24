/*
	Главная страница
*/
//статья главной страницы
var MainTopic = React.createClass({
	//оповещение родителя о нажатии на статью
	notifyParentTopicClick: function () {
		if((this.props.onTopiclClick)&&(Utils.isFunction(this.props.onTopiclClick))) {
				this.props.onTopiclClick(this.props.topic.index);
		}
	},
	//форммирование содержимого сатьи
	createTopicText: function (topic) {
		$("#TopicText" + topic.index).html(topic.text);		
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		this.createTopicText(this.props.topic)
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {		
		if(newProps.topic.text != this.props.topic.text)
			this.createTopicText(newProps.topic);		
	},
	//обработка нажатия на элемент
	onTopicClick: function () {
		this.notifyParentTopicClick();
	},
	//генерация представления топика
	render: function () {
		return (
			<div className="w-col w-col-4 u-col-howto card" onClick={this.onTopicClick}>
				<h2>{this.props.topic.title}</h2>
				<p id={"TopicText" + this.props.topic.index}></p>
			</div>
		);
	}
});
//класс главной страницы
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
			filter: {name: "HOW_IT_WORKS_TOPIC"}
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
	goToHowItWorks: function (activeIndex) {
		this.context.router.transitionTo("articles",
			{},
			{filter: {name: "HOW_IT_WORKS"}, 
			title: "UI_FOOTER_MENU_HOWITWORKS",
			activeArticle: activeIndex||0,
			convertTitle: true
		});
	},
	//обработка нажатия на статью заглавной страницы
	onTopicClick: function (index) {
		this.goToHowItWorks(index);
	},
	//нажатие на поиск
	onFind: function (find) {
		if((find.latitude)&&(find.longitude)) {
			Utils.deleteObjectState("filterParams");
			Utils.saveObjectState("filterParams", find);
			this.context.router.transitionTo("search", {}, {});
		}
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
	//обработка нажатия на кнопку "Попробовать"
	onTryButtonClick: function () {
		this.goToHowItWorks();
	},
	//генерация представления главной страницы
	render: function () {
		var postsFindForm =	<PostsFindForm language={this.props.language} onFind={this.onFind} onShowError={this.props.onShowError}/>		
		//статьи заглавной страницы
		var topics;
		if(this.state.topicsLoaded) {
			var topicsitems = this.state.topics.map(function (item, i) {
				item.index = i;
				return (
					<div>
						<MainTopic topic={item} key={i} onTopiclClick={this.onTopicClick}/>
					</div>
				);
			}, this);
			topics =	<div className="w-container">
							<h1 className="u-t-h1 main">{Utils.getStrResource({lang: this.props.language, code: "UI_FOOTER_MENU_HOWITWORKS"})}</h1>
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
					<h1 className="u-t-h1-land">
						{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_MAIN_MAKE_ACTION"})}
					</h1>
					<h1 className="u-t-h1-land sub1">
						{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_MAIN_AND_BE_OK"})}
					</h1>
					<div className="u-block-land">
						<a className="w-button u-btn-land"
							href="javascript:void(0);"
							onClick={this.onTryButtonClick}>
							{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_MAIN_TRY_NOW"})}
						</a>
					</div>
					<div className="content-center u-block-search-main">
						{postsFindForm}
					</div>
				</div>
				<div className="w-section u-sect-land under">
					<div className="u-block-spacer"></div>
				</div>
				<div className="w-section u-sect-land">
					{topics}
				</div>
			</div>
		);
	}
});