/*
	Просмотр профиля пользователя
*/
var ProfileView = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},	
	//состояние просмотрщика профиля
	getInitialState: function () {
		return {
			userId: "", //идентификатор пользователя
			profileLoaded: false, //флаг загруженности профиля
			adverts: [], //объявления профиля
			advertsCount: 0, //счетчик объявлений профиля
			advertsLoaded: false, //флаг загруженности объявлений профиля			
		}
	},
	//обработка результатов загрузки объявлений
	handleLoadProfilePostsResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.setState({adverts: resp.MESSAGE, advertsCount: resp.MESSAGE.length, advertsLoaded: true}, this.loadActiveTab);			
		}
	},
	//загрузка данных объявлений профиля
	loadProfilePosts: function () {		
		if(this.props.session.loggedIn) {
			this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
			var getAdvertsPrms = {
				language: this.props.language, 
				filter: {userId: this.state.userId},
				session: this.props.session.sessionInfo
			}
			clnt.getAdverts(getAdvertsPrms, this.handleLoadProfilePostsResult);
		}
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		this.setState({userId: this.context.router.getCurrentParams().userId});
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
	},
	//обработка загрузки профиля
	handleProfileLoad: function (newProfile) {		
		if(!this.state.profileLoaded) this.setState({profileLoaded: true, advertsLoaded: false}, this.loadProfilePosts);
	},
	//обработка нажатия на объявление
	handlePostClick: function (post) {		
		this.context.router.transitionTo("post", {postId: post.id}, {});
	},
	//генерация представления профиля
	render: function () {
		//профиль пользователя
		var userProfile =	<UserProfile language={this.props.language}
								session={this.props.session}
								profileId={this.state.userId}
								onDisplayProgress={this.props.onDisplayProgress}
								onHideProgress={this.props.onHideProgress}
								onShowError={this.props.onShowError}
								onShowMessage={this.props.onShowMessage}
								onProfileLoaded={this.handleProfileLoad}/>
		//объявления профиля
		var adverts;
		if((this.state.advertsLoaded)&&(this.state.profileLoaded)) {				
			adverts =	<ProfileAdvertsList language={this.props.language}
							title={Utils.getStrResource({lang: this.props.language, code: "CLNT_ADVERTS_VIEW_TITLE"})}
							noAdvertsMessage={Utils.getStrResource({lang: this.props.language, code: "CLNT_NO_ADVERTS_VIEW"})}
							showAddButton={false}
							showRemoveButton={false}
							adverts={this.state.adverts}
							onItemClick={this.handlePostClick}/>
		}
		//сгенерируем представление для просмотра профиля		
		return (
			<div classNameName="content-center">
				<section className="w-container">
					<div className="w-section u-sect-card">
						<div className="w-row">
							<div className="w-col w-col-6 u-col-card">
								{userProfile}
							</div>
							<div className="w-col w-col-6 u-col-card">										
								{adverts}											
							</div>
						</div>
					</div>					
				</section>
			</div>
		);
	}
});