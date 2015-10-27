/*
	Список объявлений в профиле пользователя
*/
var ProfilePostsList = React.createClass({
	//состояние списка объявлений
	getInitialState: function () {
		return {
		}
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
	},
	//оповещение родителя о нажатии на элемент списка объявлений
	notifyParentItemClick: function (item) {
		if((this.props.onItemClick)&&(Utils.isFunction(this.props.onItemClick))) {
			this.props.onItemClick(item);
		}
	},
	//оповещение родителя о нажатии на кнопку редактирования элемента списка объявлений
	notifyParentItemEditClick: function (item) {
		if((this.props.onItemEditClick)&&(Utils.isFunction(this.props.onItemEditClick))) {
			this.props.onItemEditClick(item);
		}
	},
	//оповещение родителя о нажатии на кнопку удаления элемента списка объявлений
	notifyParentItemDeleteClick: function (item) {
		if((this.props.onItemDeleteClick)&&(Utils.isFunction(this.props.onItemDeleteClick))) {
			this.props.onItemDeleteClick(item);
		}
	},
	//оповещение родителя о нажатии на кнопку добавления элемента списка объявлений
	notifyParentItemAddClick: function () {
		if((this.props.onItemAddClick)&&(Utils.isFunction(this.props.onItemAddClick))) {
			this.props.onItemAddClick();
		}
	},	
	//обработка нажатия на элемент списка объявлений
	handleItemClick: function (item) {
		this.notifyParentItemClick(item);
	},
	//обработка нажатия на кнопку редактирования элемента списка объявлений
	handleItemEditClick: function (item) {
		this.notifyParentItemEditClick(item);
	},
	//обработка нажатия на кнопку удаления элемента списка объявлений
	handleItemDeleteClick: function (item) {
		this.notifyParentItemDeleteClick(item);
	},
    //обработка нажатия на кнопку добавления элемента списка объявлений
	handleItemAddClick: function () {
		this.notifyParentItemAddClick();
	},
	//генерация представления списка объявлений
	render: function () {
		//заголовок
		var title;
		if(this.props.title) {
			title =	<div className="u-block-underline h3">
						<h3>{this.props.title}</h3>
					</div>
		}
		//список объявлений
		var advertsList;
		if((this.props.adverts)&&(Array.isArray(this.props.adverts))&&(this.props.adverts.length > 0)) {
			advertsList = this.props.adverts.map(function (item, i) {
				var editButtons;
				if(this.props.showEditButtons) {
					editButtons =	<div className="w-clearfix u-block-right">
										<a className="u-btn btn-sm"
											href="javascript:void(0);"
											onClick={this.handleItemEditClick.bind(this, item)}>
											{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_UPD"})}										
										</a>
										&nbsp;
										<a className="u-btn btn-sm u-btn-danger"
											href="javascript:void(0);"
											onClick={this.handleItemDeleteClick.bind(this, item)}>
											{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_DELETE_ADVERT"})}										
										</a>
									</div>
				}
				return (
					<div key={i}>						
						<a className="w-inline-block u-lnk-norm" 
							href="javascript:void(0);" 
							onClick={this.handleItemClick.bind(this, item)}>
							<div className="w-row u-row-cardlst bordered">
								<div className="w-col w-col-5 w-col-stack w-col-small-6">
									<img src={_.find(item.apartment.pictures, {default: true}).url}/>
								</div>
								<div className="w-col w-col-7 w-col-stack w-col-small-6">
									<div className="u-block-card-desc">
										<h1>{Utils.getStrResource({lang: this.props.language, code: item.apartment.type})}</h1>
										<div>{item.apartment.adress}</div>
									</div>
								</div>
							</div>
						</a>
						{editButtons}
						<div className="u-block-spacer"></div>						
					</div>
				);
			}, this);			
		} else {
			if(this.props.noAdvertsMessage) {
				if(this.props.showAddButton) {
					advertsList =	<center>
										<a className="u-t-right u-lnk-norm" href="javascript:void(0);" onClick={this.handleItemAddClick}>
											{this.props.noAdvertsMessage}
										</a>
									</center>
				} else {
					advertsList =	<center>
										<div>
											{this.props.noAdvertsMessage}
										</div>
									</center>
				}
			}
		}
		//генератор		
		return (
			<div>
				{title}
				{advertsList}
			</div>
		);
	}
});