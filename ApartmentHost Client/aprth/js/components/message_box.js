/*
	Диалог сообщения
*/
var MessageBox = React.createClass({
	//обработчик кнопки закрытия
	handleClose: function () {
		this.props.onClose();
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
			  <div className="modal show messagebox-wraper" onClick={this.handleClose}>
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