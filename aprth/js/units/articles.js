/*
	Статьи
*/
var Articles = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},
	//состояние страницы статьи
	getInitialState: function () {
		return {
			articlesReady: false, //признак загруженности статей			
			query: { //запрос на отображение статей
				title: "", //заголовок статей
				filter: {}, //фильтр статей
				activeArticle: 0 //статья, активируемая при подключении к странице
			},
			articles: [], //статьи
			currentArticle: 0 //текущая статья		
		}
	},
	//обработка результатов получения статей
	handleGetArticlesResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {			
			if((resp.MESSAGE)&&(Array.isArray(resp.MESSAGE))&&(resp.MESSAGE.length > 0)) {
				console.log(resp.MESSAGE);
				this.setState({
					articles: resp.MESSAGE,
					articlesReady: true
				});
			} else {
				this.setState({
					articles: [],
					articlesReady: false					
				});
			}
		}
	},
	//загрузка данных статей
	getArticles: function () {
		this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
		var f = {};
		_.extend(f, this.state.query.filter);
		f.type = "ARTICLE";
		var getPrms = {
			language: this.props.language, 
			filter: f
		}
		clnt.getArticles(getPrms, this.handleGetArticlesResult);		
	},
	//разбор запроса из URL
	parseQuery: function () {
		var query = {
			filter: {},
			title: "",
			activeArticle: 0
		}
		var tmp = this.context.router.getCurrentQuery();
		_.extend(query.filter, tmp.filter);
		query.title = tmp.title;
		if(tmp.convertTitle === "true") {
			query.title = Utils.getStrResource({lang: this.props.language, code: tmp.title});
		}
		if(tmp.activeArticle) query.activeArticle = tmp.activeArticle;
		return query;
	},
	//инициализация состояния
	initState: function (props) {		
		var q = this.parseQuery();
		this.setState({query: q, currentArticle: q.activeArticle}, this.getArticles);		
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		this.initState(this.props);
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
		var q = this.parseQuery();
		if(
			(newProps.language != this.props.language)||
			(Utils.serialize(this.state.query) != Utils.serialize(q))
		) this.initState(newProps);
	},
	//смена текущего топика
	handleTopicChange: function (index) {
		this.setState({currentArticle: index});
	},
	//генерация представления страницы статьи
	render: function () {
		//содержимое статей
		var articles;
		if((this.state.articlesReady)&&(Array.isArray(this.state.articles))) {
			if(_.pluck(this.state.articles, "title").length > 1) {
				articles =	<div>
								<div className="w-col w-col-3">
									<ArticleTopicsList topics={_.pluck(this.state.articles, "title")}
										onTopicChange={this.handleTopicChange}
										current={this.state.currentArticle}/>
								</div>
								<div className="w-col w-col-9 u-col-howto">
									<Article article={this.state.articles[this.state.currentArticle]}
										hideTitle={true}/>
								</div>
							</div>
			} else {
				articles =	<div>
								<div className="w-col w-col-12 u-col-howto">
									<Article article={this.state.articles[this.state.currentArticle]}
										hideTitle={false}/>
								</div>
							</div>
			}
		}
		//генератор		
		return (
			<div className="w-container">
				<div className="u-block-spacer"></div>
				<div className="u-block-spacer"></div>
				<h1 className="u-t-h1-main">{this.state.query.title}</h1>
				{articles}
			</div>			
		);
	}
});