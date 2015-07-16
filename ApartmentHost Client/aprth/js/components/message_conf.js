/*
	Диалог подтверждения
*/
var MessageConf = React.createClass({
	//обработчик кнопки ОК
	handleOk: function () {
		this.props.onOk();
	},
	//обработчик кнопки Отмена
	handleCancel: function () {
		this.props.onCancel();
	},
	//генерация представления диалога
	render: function () {
		//классы заголовка
		var cTitle = React.addons.classSet;
		var classesTitle = cTitle({
			"modal-title": true,
			"text-warning": true
		});
		//классы тела
		var cBody = React.addons.classSet;
		var classesBody = cBody({
			"modal-body": true,
			"bg-warning": true
		});
		//классы текста тела
		var cBodyText = React.addons.classSet;
		var classesBodyText = cBodyText({
			"text-warning": true
		});		
		//классы кнопки OK
		var cOkButton = React.addons.classSet;
		var classesOkButton = cOkButton({
			"btn": true,
			"btn-warning": true
		});
		//классы кнопки Отмена
		var cCancelButton = React.addons.classSet;
		var classesCancelButton = cCancelButton({
			"btn": true
		});
		//генерация диалога
		return (
			<div className="modal fade show in messagebox-wraper">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h4 className={classesTitle}>{this.props.title}</h4>
						</div>
						<div className={classesBody}>
							<p className={classesBodyText}>{this.props.text}</p>
						</div>
						<div className="modal-footer">
							<button type="button" className={classesOkButton} onClick={this.handleOk}>
								{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_OK"})}
							</button>
							<button type="button" className={classesCancelButton} onClick={this.handleCancel}>
								{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_CHANCEL"})}
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
});