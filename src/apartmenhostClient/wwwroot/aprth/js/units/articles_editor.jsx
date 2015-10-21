/*
	Редактор статей
*/
//режимы редактора
var AriclesEditorMode = {
	INSERT: "INSERT",
	UPDATE: "UPDATE"
};
//редактор
var AriclesEditor = React.createClass({	
	//состояние редактора
	getInitialState: function () {
		return {
			articlesLoaded: false, //признак загруженности статей
			articles: [], //список статей
			iuArtForm: {}, //форма добавления/исправления
			mode: "", //режим работы
			currentArticle: {} //текущая статья
		}
	},
	//сборка формы добавления/исправления
	buildAddUpdForm: function (props, article, mode) {
		var formTmp = formFactory.buildForm({
			language: props.language,
			title: ((mode == AriclesEditorMode.INSERT)?"Добавление":"Исправление") + " статьи"
		});		
		var langTmp = formFactory.buildFormItem({
			language: props.language,
			label: "Язык",
			name: "lang",
			dataType: formFactory.itemDataType.STR,
			inputType: formFactory.itemInputType.MANUAL,
			required: true,
			value: article.lang
		});
		var typeTmp = formFactory.buildFormItem({
			language: props.language,
			label: "Тип",
			name: "type",
			dataType: formFactory.itemDataType.STR,
			inputType: formFactory.itemInputType.MANUAL,
			required: true,
			value: article.type
		});		
		var nameTmp = formFactory.buildFormItem({
			language: props.language,
			label: "Код",
			name: "name",
			dataType: formFactory.itemDataType.STR,
			inputType: formFactory.itemInputType.MANUAL,
			required: true,
			value: article.name
		});
		var titleTmp = formFactory.buildFormItem({
			language: props.language,
			label: "Заголовок",
			name: "title",
			dataType: formFactory.itemDataType.STR,
			inputType: formFactory.itemInputType.MANUAL,
			required: true,
			value: article.title
		});
		var textTmp = formFactory.buildFormItem({
			language: props.language,
			label: "Текст",
			name: "text",
			dataType: formFactory.itemDataType.STR,
			inputType: formFactory.itemInputType.TEXT,
			required: true,
			value: article.text
		});
		formFactory.appedFormItem(formTmp, langTmp);
		formFactory.appedFormItem(formTmp, typeTmp);
		formFactory.appedFormItem(formTmp, nameTmp);
		formFactory.appedFormItem(formTmp, titleTmp);
		formFactory.appedFormItem(formTmp, textTmp);
		this.setState({iuArtForm: formTmp, mode: mode, currentArticle: article});		
	},
	//на форме добавления/исправления нажали ОК
	onIUFormOK: function (values) {		
		var modeTmp = this.state.mode;
		this.setState({mode: ""}, function () {
			var artTmp = {
					lang: _.find(values, {name: "lang"}).value,
					type: _.find(values, {name: "type"}).value,
					name: _.find(values, {name: "name"}).value,
					title: _.find(values, {name: "title"}).value,
					text: _.find(values, {name: "text"}).value
				}
			if(modeTmp == AriclesEditorMode.INSERT) {				
				this.insertArticle(artTmp);
			}
			if(modeTmp == AriclesEditorMode.UPDATE) {
				artTmp.articleId = this.state.currentArticle.id;
				this.updateArticle(artTmp);
			}
		});

	},
	//на форме добавления/исправления нажали ОТМЕНА
	onIUFormChancel: function () {
		this.setState({mode: ""});
	},
	//обработка результатов получения статей
	handleGetArticlesResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.setState({articles: [], articlesLoaded: false});
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {			
			if((resp.MESSAGE)&&(Array.isArray(resp.MESSAGE))&&(resp.MESSAGE.length > 0)) {				
				this.setState({articles: resp.MESSAGE, articlesLoaded: true});
			} else {
				this.setState({articles: [], articlesLoaded: false});
			}
		}
	},
	//обработка результатов добавления статьи
	handleInsertArticleResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {			
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {			
			this.getArticles();
		}
	},
	//обработка результатов исправления статьи
	handleUpdateArticleResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {			
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {			
			this.getArticles();
		}
	},
	//обработка результатов удаления статьи
	handleDeleteArticleResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {			
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {			
			this.getArticles();
		}
	},
	//загрузка данных статей
	getArticles: function () {
		this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
		var getPrms = {
			language: this.props.language,
			addLanguage: false,
			filter: {}
		}
		clnt.getArticles(getPrms, this.handleGetArticlesResult);		
	},
	//добавление статьи
	insertArticle: function (article) {
		this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
		var insPrms = {
			language: this.props.language,
			data: article
		}
		clnt.addArticle(insPrms, this.handleInsertArticleResult);		
	},
	//исправление статьи
	updateArticle: function (article) {
		this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
		var d = {};
		d.articleId = article.id;
		_.extend(d, article)
		var updPrms = {
			language: this.props.language,
			data: d
		}
		clnt.updateArticle(updPrms, this.handleUpdateArticleResult);		
	},
	//удаление статьи
	deleteArticle: function (articleId) {
		this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
		var delPrms = {
			language: this.props.language,
			articleId: articleId
		}
		clnt.removeArticle(delPrms, this.handleDeleteArticleResult);		
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {		
		this.getArticles();
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {		
	},
	//обработка нажатия на добавление
	onArticleAddClick: function () {
		this.buildAddUpdForm(this.props, {}, AriclesEditorMode.INSERT);		
	},
	//обработка нажатия на удаление
	onArticleDeleteClick: function (index) {		
		this.deleteArticle(this.state.articles[index].id);
	},
	//обработка нажатия на удаление
	onArticleUpdateClick: function (index) {
		this.buildAddUpdForm(this.props, this.state.articles[index], AriclesEditorMode.UPDATE);		
	},
	//генерация представления главной страницы
	render: function () {
		//стиль контейнера
		var divStyle = {
			padding: "5px"
		};
		//стиль ячейки
		var cellStyle = {
			border: "1px black solid",
			padding: "5px"
		};
		//форма добавления/изменения
		var iuForm;
		if(
			(this.state.mode == AriclesEditorMode.INSERT)||
			(this.state.mode == AriclesEditorMode.UPDATE)
		) {
			iuForm =	<FormBuilder form={this.state.iuArtForm} 
							onOK={this.onIUFormOK} 
							onChancel={this.onIUFormChancel} 
							onShowError={this.props.onShowError}
							language={this.props.language}/>
		}
		//статьи
		var articles;
		if(this.state.articlesLoaded) {
			var articlesLines = this.state.articles.map(function (item, i) {
				return (
					<tr key={i}>
						<td style={cellStyle}>
							<a href="javascript:void(0)" onClick={this.onArticleUpdateClick.bind(this, i)}><strong>Исправить</strong></a>
							<br/>
							<a href="javascript:void(0)" onClick={this.onArticleDeleteClick.bind(this, i)}><strong>Удалить</strong></a>
						</td>
						<td style={cellStyle}>{item.lang}</td>						
						<td style={cellStyle}>{item.type}</td>
						<td style={cellStyle}>{item.name}</td>						
						<td style={cellStyle}>{item.title}</td>						
						<td style={cellStyle}>{item.text}</td>
					</tr>
				);
			}, this);
			articles =	<table>
							<tbody>
								<tr>
									<td style={cellStyle}></td>
									<td style={cellStyle}><strong>Язык</strong></td>						
									<td style={cellStyle}><strong>Тип</strong></td>
									<td style={cellStyle}><strong>Код</strong></td>
									<td style={cellStyle}><strong>Заголовок</strong></td>
									<td style={cellStyle}><strong>Текст</strong></td>								
								</tr>
								{articlesLines}
							</tbody>
						</table>
		}		
		//генератор		
		return (
			<div style={divStyle}>
				{iuForm}
				<div style={divStyle}>
					<a href="javascript:void(0)" onClick={this.onArticleAddClick}><strong>Добавить</strong></a>
				</div>
				{articles}
				<div style={divStyle}>
					<a href="javascript:void(0)" onClick={this.onArticleAddClick}><strong>Добавить</strong></a>
				</div>
			</div>
		);
	}
});