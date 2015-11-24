/*
	Диалог сообщения
*/
var MessageBox = React.createClass({
	//обработчик кнопки закрытия
	handleClose: function () {
		this.props.onClose();
	},
	//обработка события клавиатуры
	handleKeyDown: function (event) {
		if(event.keyCode == 27) {
			this.handleClose();			
		}		
	},
	bindKeyDown: function () {
		$(document.body).on("keydown", this.handleKeyDown);
	},
	unBindKeyDown: function () {
		$(document.body).off("keydown", this.handleKeyDown);
	},
	//инициализация при старте приложения
	componentDidMount: function () {
		this.bindKeyDown();
	},
	//отключение компонента от страницы
	componentWillUnmount: function() {
		this.unBindKeyDown();
	},
	//генерация представления диалога
	render: function () {
		//классы заголовка
		var cTitle = React.addons.classSet;
		var classesTitle = cTitle({
			"modal-title": true,
			"text-danger": (this.props.message.type == Utils.getMessageTypeErr()),
			"text-success": (this.props.message.type == Utils.getMessageTypeInf())
		});
		//классы тела
		var cContent = React.addons.classSet;
		var classesContent = cContent({
			"modal-content": true,
			"danger": (this.props.message.type == Utils.getMessageTypeErr()),
			"success": (this.props.message.type == Utils.getMessageTypeInf())
		});		
		var cBody = React.addons.classSet;
		var classesBody = cBody({
			"modal-body": true,
			"bg-danger": (this.props.message.type == Utils.getMessageTypeErr()),
			"bg-success": (this.props.message.type == Utils.getMessageTypeInf())
		});
		//классы текста тела
		var cBodyText = React.addons.classSet;
		var classesBodyText = cBodyText({
			"text-danger": (this.props.message.type == Utils.getMessageTypeErr()),
			"text-success": (this.props.message.type == Utils.getMessageTypeInf())
		});		
		//классы кнопки закрытия
		var cButton = React.addons.classSet;
		var classesButton = cButton({
			"btn": true,
			"btn-danger": (this.props.message.type == Utils.getMessageTypeErr()),
			"btn-success": (this.props.message.type == Utils.getMessageTypeInf())		
		});
		//генерация диалога
		return (
			  <div style={{zIndex:3000}} className="modal show messagebox-wraper" onClick={this.handleClose}>
					<div className="modal-dialog">
						<div className={classesContent}>
							<div className="modal-header">
								<button type="button" className="close" onClick={this.handleClose}>×</button>						
								<h4 className={classesTitle}>{this.props.message.title}</h4>
							</div>
							<div className={classesBody}>
								<p className={classesBodyText}>{this.props.message.text}</p>
							</div>
							<div className="modal-footer">			
							</div>
						</div>
					</div>
				</div>
		);
	}
});