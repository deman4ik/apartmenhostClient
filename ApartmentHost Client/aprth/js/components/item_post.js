/*
	Элемент списка объявлений
*/
var PostItem = React.createClass({
	//состояние элемента
	getInitialState: function () {
		return {
		};
	},
	//обработка нажатия на "Избранное"
	handleFavorClick: function () {
		this.props.onFavorChange(this.props.item.id);
	},
	//обработка нажатия на карточку объявления
	handlePostClick: function () {
		this.props.onItemClick(this.props.item.id);
	},
	//инициализация элемента
	componentDidMount: function () {
	},
	//обновление параметров элемента
	componentWillReceiveProps: function (newProps) {
	},
	//генерация представления элемента
	render: function () {
		//дополнительные стили
		var aStyle = {textDecoration: "none"};
		//дополнительные опции объявления
		var advOptions;
		if(this.props.item.apartment.options) {			 
			var advOptionsItems = this.props.item.apartment.options.split(";").map(function (option, i) {
				return (
					<li>
						{Utils.getStrResource({lang: this.props.language, code: option})}
					</li>
				);
			}, this);
			advOptions = 	<div>
								<div className="descr">
									{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_EXTRAS"})}:
								</div>
								<ul className="descr">
									{advOptionsItems}								
								</ul>
							</div>
		}
		//кнопка управления избранным
		var favorText;
		if(this.props.item.isFavorite) {
			//выбираем текст в зависимости от режима
			switch(this.props.mode) {
				//режим поиска
				case(PostsModes.SEARCH): {
					favorText = Utils.getStrResource({lang: this.props.language, code: "UI_BTN_FAVOR_RM"});
					break;
				}
				//режим избранного
				case(PostsModes.FAVORITES): {
					favorText = Utils.getStrResource({lang: this.props.language, code: "UI_BTN_FAVOR_DEL"});
					break;
				}
				//прочие режимы
				default: {
					favorText = Utils.getStrResource({lang: this.props.language, code: "UI_BTN_FAVOR_RM"});
				}
			}
		} else {
			favorText = Utils.getStrResource({lang: this.props.language, code: "UI_BTN_FAVOR_ADD"});	
		}
		var cFavorBtn = React.addons.classSet;
		var classesFavorBtn = cFavorBtn({
			"u-btn": true,
			"btn-sm": true,
			"btn-done": (this.props.item.isFavorite)
		});
		/*if(this.props.item.isFavorite) {
			favorBtn =	<a className={classesFavorBtn} href="javascript:;" style={aStyle} onClick={this.handleFavorClick}>
								<i className="ico-chevron-down" aria-hidden="true"></i>{favorText}
						</a>
		} else {
			favorBtn =	<a className={classesFavorBtn} href="javascript:;" style={aStyle} onClick={this.handleFavorClick}>
								<i className="ico-heart3" aria-hidden="true"></i>{favorText}
						</a>			
		}*/		
		var favorBtn;
		if(this.props.item.isFavorite) {
			favorBtn =	<a className={classesFavorBtn} href="javascript:;" style={aStyle} onClick={this.handleFavorClick}>
							<span className="glyphicon glyphicon-ok btn" aria-hidden="true"></span>
							{favorText}
						</a>
		} else {
			favorBtn =	<a className={classesFavorBtn} href="javascript:;" style={aStyle} onClick={this.handleFavorClick}>
							<span className="glyphicon glyphicon-heart btn" aria-hidden="true"></span>
							{favorText}
						</a>			
		}
		//представление элемента
		return (
			<div>
				<div className="w-row u-row-cardlst">
					<div className="w-col w-col-4 w-col-small-4">
						<a className="w-inline-block u-block-card-desc" 
							href="javascript:;" 
							onClick={this.handlePostClick}>
							<img src={this.props.item.apartment.img}/>
							<img className="u-img-author-sm" src={this.props.item.user.img}/>
						</a>
						<div><img src="aprth/img/tmp/rater_1.png"/><div className="card_lst_rate">(6)</div></div>
					</div>
					<div className="w-col w-col-4 w-col-small-4">
					  <div className="w-clearfix u-block-card-desc">
						<div>{this.props.item.user.lastName} {this.props.item.user.firstName}</div>
						<h4>{Utils.getStrResource({lang: this.props.language, code: this.props.item.apartment.type})}</h4>
						<div className="u-t-price price-sm">
							<strong>
								{this.props.item.priceDay}&nbsp;
								{Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})}&nbsp;/&nbsp;
								{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_PERIOD_DAY"})}
							</strong>
						</div>
						<div className="u-t-price2 price-sm">
							{this.props.item.pricePeriod}&nbsp;
							{Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})}&nbsp;/&nbsp;
							{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_PERIOD_WEEK"})}
						</div>
						<div>
							{favorBtn}
						</div>
					  </div>
					</div>
					<div className="w-col w-col-4 w-col-small-4">
						<div>
							<div></div>
							<div>
								{Utils.getStrResource({lang: this.props.language, code: "MD_ITM_GUEST_SEX"})}:&nbsp;
								<strong>
									{Utils.getStrResource({lang: this.props.language, code: this.props.item.residentGender})}
								</strong>
							</div>
							{advOptions}
						</div>
					</div>
				</div>
			</div>
		);
	}
});