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
			topics: [] //список статей заглавной страницы
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
	//генерация представления главной страницы
	render: function () {
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
			topics = <div className="w-container">
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
						<div className="u-block-land-item center">
							<br/><span>здесь будет форма поиска<br/></span>
						</div>
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