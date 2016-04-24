/*
	Отписка от рассылок и оповещений
*/
//виды подписок
var subscrTypes = {
	newsletter: "newsletter", //рассылка
	notifications: "notifications" //оповещение
}
//класс раздела
var UnsusbscrConfirm = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},
	//состояние формы подтверждения отписки от подписки
	getInitialState: function () {
		return {
			subscrType: "", //тип подписки
			code: "" //специальный код для идентификации
		}
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		if(
			(this.context.router.getCurrentQuery().type)&&
			(this.context.router.getCurrentQuery().code)&&
			((this.context.router.getCurrentQuery().type == subscrTypes.newsletter)||
			(this.context.router.getCurrentQuery().type == subscrTypes.notifications))
		) this.setState({subscrType: this.context.router.getCurrentQuery().type, code: this.context.router.getCurrentQuery().code});
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
	},
	//обработка результатов подтверждения отписки
	handleUnsubscribeResult: function (result) {
		this.props.onHideProgress();
		if(result.TYPE == clnt.respTypes.STD) {
			this.props.onShowError(Utils.getStrResource({
					lang: this.props.language, 
					code: "CLNT_COMMON_ERROR"}), 
				result.MESSAGE
			);
		} else {
			var messageCode = "CLNT_UNSUBSCR_DONE_NEWSLETTERS";
			if(this.state.subscrType == subscrTypes.notifications) messageCode = "CLNT_UNSUBSCR_DONE_NOTIFICATIONS";
			this.props.onShowMessage(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_SUCCESS"}), 
				Utils.getStrResource({lang: this.props.language, code: messageCode}));
			this.context.router.transitionTo("main");
		}
	},
	//подтверждение отписки
	unsubscribe: function () {
		this.props.onDisplayProgress(Utils.getStrResource({
			lang: this.props.language, 
			code: "CLNT_COMMON_PROGRESS"
		}));		
		var confPrms = {
			language: this.props.language,
			data: {
				type: this.state.subscrType,
				code: this.state.code
			}
		};
		clnt.unsubscribeConfirm(confPrms, this.handleUnsubscribeResult);		
	},	
	//отработка нажатия на подтверждение отписки
	handleConfirmClick: function () {
		this.unsubscribe();
	},
	//отработка нажатия на отмену подтверждения
	handleCancelClick: function () {
		if(!this.context.router.goBack()) {
			this.context.router.transitionTo("main");
		}
	},
	//генерация представления формы подтверждения отписки
	render: function () {
		//содержимое формы
		var content;
		if(this.state.subscrType) {
			var confirmMessage;
			if(this.state.subscrType == subscrTypes.newsletter) {
				confirmMessage = Utils.getStrResource({lang: this.props.language, code: "CLNT_UNSUBSCR_NEWSLETTERS"});
			} else {
				confirmMessage = Utils.getStrResource({lang: this.props.language, code: "CLNT_UNSUBSCR_NOTIFICATIONS"});
			}
			content =	<div>
							<div className="w-row">
								<div className="w-col w-col-9">
								{confirmMessage}
								</div>
							</div>
							<div className="u-block-spacer"></div>
							<div className="u-block-spacer"></div>										
							<input className="w-button u-btn-primary"
								type="button"
								value={Utils.getStrResource({lang: this.props.language, code: "UI_BTN_REG_CONFIRM"})}
								onClick={this.handleConfirmClick}/>
							<input className="w-button u-btn-regular"
								type="button"
								value={Utils.getStrResource({lang: this.props.language, code: "UI_BTN_CHANCEL"})}
								onClick={this.handleCancelClick}/>
						</div>
		} else {
			content =	<div className="w-row">
							<div className="w-col w-col-12">
								<InLineMessage type={Utils.getMessageTypeErr()} 
									message={Utils.getStrResource({lang: this.props.language, code: "CLNT_NO_SUBSRC_TYPE"})}/>
							</div>
						</div>
		}
		//генератор		
		return (
			<div className="w-section">
				<div className="w-container">
					<div className="u-block-underline h3">
						<h3>{Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_UNSUBSRSC_CONFIRM"})}</h3>
					</div>
					<div className="w-form">
						<form className="w-clearfix" id="regConfForm">
							<div className="u-block-spacer"></div>
							<div className="u-block-spacer"></div>
							{content}
						</form>
					</div>
				</div>
			</div>
		);
	}
});