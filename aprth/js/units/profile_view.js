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
			userId: "" //идентификатор пользователя
		}
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		this.setState({userId: this.context.router.getCurrentParams().userId});
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
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
								onShowMessage={this.props.onShowMessage}/>
		//сгенерируем представление для просмотра профиля		
		return (
			<div classNameName="content-center">
				<section className="w-container">
					{userProfile}
				</section>
			</div>
		);
	}
});