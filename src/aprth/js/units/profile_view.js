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
			reviews: [], //отзывы
			reviewsCount: 0, //счетчик отзывов
			reviewsLoaded: false //флаг загруженности отзывов
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
		this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
		var getAdvertsPrms = {
			language: this.props.language, 
			filter: {userId: this.state.userId},
			session: this.props.session.sessionInfo
		}
		clnt.getAdverts(getAdvertsPrms, this.handleLoadProfilePostsResult);		
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		this.setState({userId: this.context.router.getCurrentParams().userId});
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
		if(this.state.userId != this.context.router.getCurrentParams().userId) {
			this.setState({
				userId: this.context.router.getCurrentParams().userId,
				profileLoaded: false,
				adverts: [],
				advertsCount: 0,
				advertsLoaded: false,
				reviews: [],
				reviewsCount: 0,
				reviewsLoaded: false
			});
		}
	},
	//обработка загрузки профиля
	handleProfileLoad: function (newProfile) {
		if(!this.state.profileLoaded) this.setState({
			profileLoaded: true,
			reviewsLoaded: true,
			reviews: newProfile.reviews,
			reviewsCount: newProfile.reviews.length,
			advertsLoaded: false
		}, this.loadProfilePosts);
	},
	//обработка нажатия на объявление
	handlePostClick: function (post) {		
		this.context.router.transitionTo("post", {postId: post.id}, {});
	},
	//обработка нажатий на ссылки на пользователей
	handleUserClick: function (userId) {
		this.context.router.transitionTo("user", {userId: userId});
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
			adverts =	<ProfilePostsList language={this.props.language}
							title={Utils.getStrResource({lang: this.props.language, code: "CLNT_ADVERTS_VIEW_TITLE"})}
							noAdvertsMessage={Utils.getStrResource({lang: this.props.language, code: "CLNT_NO_ADVERTS_VIEW"})}
							showAddButton={false}
							showEditButtons={false}
							adverts={this.state.adverts}
							onItemClick={this.handlePostClick}/>
		}
		//отзывы профиля
		var reviews;
		if((this.state.reviewsLoaded)&&(this.state.reviewsCount > 0)) {
			var reviewsList = this.state.reviews.map(function (item, i) {
				var arrow;
				if(item.type == ProfileOrdersTypes.owner) {
					arrow = <span className="glyphicon u-request-direct glyphicon-arrow-right"></span>
				} else {
					arrow = <span className="glyphicon u-request-direct glyphicon-arrow-left my"></span>
				}
				var cReviewItem = React.addons.classSet;
				var classesReviewItem = cReviewItem({
					"w-row": true,
					"u-row-underline": (i < this.state.reviewsCount - 1)
				});
				return (
					<div className={classesReviewItem}>
						<div className="w-col w-col-2">
							<div className="u-block-author-reviewlst">
								<a className="u-lnk-norm" href="javascript:void(0);" onClick={this.handleUserClick.bind(this, item.fromUser.id)}>
									<img className="u-img-author-review" 
										src={item.fromUser.picture.large} 
										width="76"/>
									<div>{item.fromUser.firstName} {item.fromUser.lastName}</div>
								</a>
							</div>
						</div>
						<div className="w-col w-col-1 w-clearfix">
							{arrow}
						</div>		
						<div className="w-col w-col-9 w-clearfix">
							<div>
								<Rater total={5} rating={item.rating} align={"left"}/>
								<p>{item.text}</p>
							</div>
							<div className="u-t-small u-t-right u-t-rel">
								{Utils.formatDate({lang: this.props.language, 
									date: item.createdAt})}
							</div>
						</div>
					</div>					
				);
			}, this);
			reviews =	<div>
							<div className="w-tabs u-block-tabs">
								<div className="w-tab-menu">
									<a className="w-tab-link w-inline-block w--current" href="javascript:void(0);">
										<div>{Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_REVIEWS"})}</div>
									</a>
								</div>
							</div>
							<div className="w-tab-content u-tab-cont1">
								{reviewsList}
							</div>
							<div className="u-block-spacer"></div>
						</div>
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
					<div className="u-block-spacer"></div>
					{reviews}												
				</section>
			</div>
		);
	}
});