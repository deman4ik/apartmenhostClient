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
			singleMode: true, //признак отображения только одной статьи
			filter: {}, //фильтр статей
			articles: [], //статьи
			currentArticle: 0 //идентификатор текущей статьи
		}
	},
	//обработка результатов получения статей
	handleGetArticlesResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			console.log(resp.MESSAGE);
			if((resp.MESSAGE)&&(Array.isArray(resp.MESSAGE))&&(resp.MESSAGE.length > 0)) {
				this.setState({
					articles: resp.MESSAGE,
					currentArticle: 0,
					articlesReady: true,
					singleMode: (resp.MESSAGE.length == 1)
				});
			} else {
				this.setState({
					articles: [],
					currentArticle: 0,
					articlesReady: false,
					singleMode: true
				});
			}
		}
	},
	//загрузка данных статей
	getArticles: function () {
		this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
		var getPrms = {
			language: this.props.language, 
			filter: this.state.filter
		}
		clnt.getArticles(getPrms, this.handleGetArticlesResult);		
	},
	//инициализация состояния
	initState: function (props) {
		this.setState({filter: this.context.router.getCurrentQuery()}, this.getArticles);
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		this.initState(this.props);
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
		if(
			(newProps.language != this.props.language)||
			(Utils.serialize(this.state.filter) != Utils.serialize(this.context.router.getCurrentQuery()))
		) this.initState(newProps);
	},
	//смена текущего топика
	handleTopicChange: function (index) {
		this.setState({currentArticle: index});
	},
	//генерация представления страницы статьи
	render: function () {
		//список тем
		var articlesTopics;
		if(
			(this.state.articlesReady)&&
			(Array.isArray(this.state.articles))&&
			(!this.state.singleMode)
		) {
			articlesTopics = 	<ArticlesTopics topics={_.pluck(this.state.articles, "title")}
									current={this.state.currentArticle}
									onTopicChange={this.handleTopicChange}/>
		}
		//содержимое активной статьи
		var article;
		if((this.state.articlesReady)&&(Array.isArray(this.state.articles))) {
			article =	<Article title={this.state.articles[this.state.currentArticle].title}
							text={this.state.articles[this.state.currentArticle].text}/>
		}
		//генератор		
		return (
			<div>
				<div>
					<table>
						<tr>
							<td>
								{articlesTopics}
							</td>
							<td>
								{article}
							</td>
						</tr>
					</table>	
				</div>
			</div>
		);
	}
});