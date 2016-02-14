/*
	Компонент для разбора и выдачи списка опций (в строке с разделителем)
*/
//способы представления списка опций
var OptionsParserView = {
	LIST: "list", //список вертикальный
	ROW: "row" //строка горизогтальная
}
//способы конвертации опций
var OptionsParserConvert = {
	NO_CONVERT: "no", //не конвертировать
	DO_CONVERT: "yes" //конвертировать
}
//парсер опций
var OptionsParser = React.createClass({
	//формирование представления
	render: function () {
		//представление списка
		var view;
		if(this.props.view) {
			view = this.props.view;
		} else {
			view = OptionsParserView.ROW;
		}
		//заголовок списка
		var title;
		if(this.props.title) {
			switch(view) {
				case(OptionsParserView.LIST): {
					title = <div className="descr">{this.props.title}</div>;
					break;
				}
				case(OptionsParserView.ROW): {
					title = this.props.title;
					break;
				}
				default: {
					title = this.props.title;
				}
			}			
		}
		//стиль списка
		var listStyle;
		if(this.props.listStyle) {
			listStyle = this.props.listStyle;
		}
		//разделитель элементов в строке
		var rowSeparator;
		if(this.props.rowSeparator) {
			rowSeparator = this.props.rowSeparator;
		} else {
			rowSeparator = ","
		}
		//подсвечиваемый элемент
		var hlOption;
		if(this.props.highlightOption) {
			hlOption = this.props.highlightOption;
		}
		//формирование представления списка опций
		var options;
		var convertOptions;
		if(this.props.convertOptions) {
			convertOptions = this.props.convertOptions;
		} else {
			convertOptions = OptionsParserConvert.DO_CONVERT;
		}		
		if((this.props.options)&&(Array.isArray(this.props.options))) {
			var optionsLength = this.props.options.length;
			var optionsItems = this.props.options.map(function (option, i) {
				var cOptionItem = React.addons.classSet;
				var classesOptionItem = cOptionItem({
					"hightLight": (hlOption == option)
				});
				switch(view) {
					case(OptionsParserView.LIST): {
						return (
							<li>
								<span className={classesOptionItem}>
								{(convertOptions == OptionsParserConvert.DO_CONVERT)?Utils.getStrResource({lang: this.props.language, code: option}):option}
								</span>
							</li>
						);
						break;
					}
					case(OptionsParserView.ROW): {
						return (
							<span className={classesOptionItem}>
								{(convertOptions == OptionsParserConvert.DO_CONVERT)?Utils.getStrResource({lang: this.props.language, code: option}):option}
								{(i < (optionsLength - 1))?(rowSeparator + " "):""}
							</span>
						);
						break;
					}				
					default: {
						return (
							<span className={classesOptionItem}>
								{(convertOptions == OptionsParserConvert.DO_CONVERT)?Utils.getStrResource({lang: this.props.language, code: option}):option}
								{(i < (optionsLength - 1))?(rowSeparator + " "):""}
							</span>
						);
					}
				}
			}, this);
			switch(view) {
				case(OptionsParserView.LIST): {					
					options = 	<div>
									{title}
									<ul className="descr" style={listStyle}>
										{optionsItems}								
									</ul>
								</div>
					break;
				}
				case(OptionsParserView.ROW): {
					options = <span>{optionsItems}</span>
					break;
				}				
				default: {
					options = <span>{optionsItems}</span>
				}
			}
		}
		return (
			<span>{options}</span>
		);
	}
});