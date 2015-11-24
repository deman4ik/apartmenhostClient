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
	//проверка на "своё" обявления
	isMyPost: function () {
		var res = false;
		try {
			if(this.props.session.loggedIn) {
				if(this.props.item.apartment.userId == this.props.session.sessionInfo.user.profile.id)
					res = true;
			}
		} catch (e) {}
		return res;
	},
	//генерация представления элемента
	render: function () {
		//дополнительные стили
		var aStyle = {textDecoration: "none"};
		var pricePeriodStyle;
		if(this.props.item.pricePeriod > this.props.item.priceDay) pricePeriodStyle = {display: "inline"}; else pricePeriodStyle = {display: "none"};
		//дополнительные опции объявления
		var advOptions 
		if(this.props.item.apartment.options) {
			if(!optionsFactory.isParseble(this.props.item.apartment.options)) {
				advOptions =	<div>
									{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_EXTRAS"})}:&nbsp;
									{this.props.item.apartment.options}
								</div>
			} else {
				advOptions =	<OptionsParser language={this.props.language}
									title={Utils.getStrResource({lang: this.props.language, code: "UI_LBL_EXTRAS"}) + ":"}
									options={optionsFactory.parse(this.props.item.apartment.options)}
									convertOptions={OptionsParserConvert.NO_CONVERT}
									view={OptionsParserView.LIST}/>		
			}
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
			"fav": !(this.props.item.isFavorite)
		});
		var favorBtn;
		if(this.props.item.isFavorite) {
			favorBtn =	<a className={classesFavorBtn} href="javascript:void(0);" style={aStyle} onClick={this.handleFavorClick}>
							<span className="glyphicon glyphicon-heart btn" aria-hidden="true"></span>
							{favorText}
						</a>
		} else {
			if(!this.isMyPost())
				favorBtn =	<a className={classesFavorBtn} href="javascript:void(0);" style={aStyle} onClick={this.handleFavorClick}>
								<span className="glyphicon glyphicon-heart-empty btn" aria-hidden="true"></span>
								{favorText}
							</a>			
		}
		var hlPc;
		if(this.props.item.higlightPriceCat) {
			hlPc = this.props.item.higlightPriceCat;
		}
		//представление элемента
		return (
			<div>
				<div className="w-row u-row-cardlst">
					<div className="w-col w-col-4 w-col-small-4">
						<a className="w-inline-block u-block-card-desc"
							href="javascript:void(0);" 
							onClick={this.handlePostClick}>
							<img src={_.find(this.props.item.apartment.pictures, {default: true}).mid}/>
							<img className="u-img-author-sm" src={this.props.item.user.picture.mid}/>				
							<Rater total={5} rating={this.props.item.user.rating} ratingCount={this.props.item.user.ratingCount}/>
						</a>
					</div>
					<div className="w-col w-col-4 w-col-small-4">
						<div className="w-clearfix u-block-card-desc u-block-lnk" onClick={this.handlePostClick}>
							<div>{this.props.item.user.lastName} {this.props.item.user.firstName}</div>
							<h4>{Utils.getStrResource({lang: this.props.language, code: this.props.item.apartment.type})}</h4>
							<div>{this.props.item.apartment.adress}</div>
							<div className="u-t-price price-sm">
								<strong>
									{this.props.item.priceDay}&nbsp;
									{Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})}&nbsp;/&nbsp;
									{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_PERIOD_DAY"})}
								</strong>
							</div>
							<div className="u-t-price2 price-sm" style={pricePeriodStyle}>
								{this.props.item.pricePeriod}&nbsp;
								{Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})}&nbsp;/&nbsp;
								{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_PERIOD"})}
							</div>
						</div>
						<div className="w-clearfix u-block-card-desc">
							{favorBtn}						
						</div>						
					</div>
					<div className="w-col w-col-4 w-col-small-4" onClick={this.handlePostClick}>
						<div className="u-block-lnk">
							{Utils.getStrResource({lang: this.props.language, code: "MD_ITM_PET_TYPE"})}:&nbsp;
							<strong>
								<OptionsParser language={this.props.language}								
									options={_.pluck(this.props.item.genders, "name")}
									view={OptionsParserView.ROW}
									highlightOption={hlPc}/>									
							</strong>
						</div>
						<div className="u-block-lnk" onClick={this.handlePostClick}>
							{advOptions}
						</div>
					</div>
				</div>
			</div>
		);
	}
});
