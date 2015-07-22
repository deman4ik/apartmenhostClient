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
		var cContent = React.addons.classSet;
		var classesContent = cContent({
			"modal-content": true,
			"warning": true
		});
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
		//генерация диалога
		return (
			<div>
			  <div className="modal show messagebox-wraper ">
					<div className="modal-dialog">
						<div className={classesContent}>
							<div className="modal-header">
								<button type="button" className="close" onClick={this.handleCancel}>×</button>						
								<h4 className={classesTitle}>{this.props.title}</h4>
							</div>
							<div className={classesBody}>
								<p className={classesBodyText}>{this.props.text}</p>
							</div>
							<div className="modal-footer">
								<a className={classesBodyText} href="javascript:void(0);" onClick={this.handleCancel}>
									{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_CHANCEL"})}
								</a><span>&nbsp;&nbsp;</span>
								<button type="button" className={classesOkButton} onClick={this.handleOk}>
									{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_OK"})}
								</button>							
							</div>
						</div>
					</div>
				</div>
				<div className="modal-backdrop fade in"></div>
			</div>
		);
	}
});