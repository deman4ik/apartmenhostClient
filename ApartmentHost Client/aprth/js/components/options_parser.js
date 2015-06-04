/*
	Компонент для разбора и выдачи списка опций (в строке с разделителем)
*/
//способы представления списка опций
var OptionsParserView = {
	LIST: "list", //список вертикальный
	ROW: "row" //строка горизогтальная
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
		//формирование представления списка опций
		var options;
		if(this.props.options) {
			var optionsLength = this.props.options.split(";").length;
			var optionsItems = this.props.options.split(";").map(function (option, i) {
				var optionsItem;
				switch(view) {
					case(OptionsParserView.LIST): {
						optionsItem = 	<li>
											{Utils.getStrResource({lang: this.props.language, code: option})}
										</li>
						break;
					}
					case(OptionsParserView.ROW): {
						optionsItem = Utils.getStrResource({lang: this.props.language, code: option});
						if(i < (optionsLength - 1)) optionsItem += rowSeparator + " ";
						break;
					}				
					default: {
						optionsItem = Utils.getStrResource({lang: this.props.language, code: option}) + this.props.rowSeparator + " ";
						if(i < (optionsLength - 1)) optionsItem += rowSeparator + " ";
					}
				}
				return (
					{optionsItem}			
				);
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
					options = {optionsItems}
					break;
				}				
				default: {
					options = {optionsItems}
				}
			}
		}
		return (
			<span>{options}</span>
		);
	}
});