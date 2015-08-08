/*
	Позунок
*/
var Slider = React.createClass({
	//состояние ползунка
	getInitialState: function () {
		return {
			minVal: 0, //минимальное значение
			maxVal: 100, //максимальное значение
			curVal: 0, //текущее значение
			step: 1, //шаг наращивания значения
			meas: "%" //единица измерения
		};
	},
	//установка значений состояния
	initState: function (props) {
		var tmpState = {
			minVal: 0,
			maxVal: 100,
			curVal: 0,
			step: 1,
			meas: "%"
		};
		if(Utils.isNumber(props.minVal)) {
			tmpState.minVal = props.minVal;
		}
		if(Utils.isNumber(props.maxVal)) {
			tmpState.maxVal = props.maxVal;
		}
		if(Utils.isNumber(props.curVal)) {
			tmpState.curVal = props.curVal;
		}
		if(Utils.isNumber(props.step)) {
			tmpState.step = props.step;
		}
		if(props.meas) {
			tmpState.meas = props.meas;
		}
		this.setState({
			minVal: tmpState.minVal,
			maxVal: tmpState.maxVal,
			curVal: tmpState.curVal,
			step: tmpState.step,
			meas: tmpState.meas
		});
	},
	//инициализация ползунка
	componentDidMount: function () {
		this.initState(this.props);
	},
	//завершение генерации/обновления представления ползунка
	componentDidUpdate: function (prevProps, prevState) {		
	},
	//обновление параметров ползунка
	componentWillReceiveProps: function (newProps) {
		this.initState(newProps);
	},
	//оповещение родителя о смене состояния
	notifyParent: function () {
		if((this.props.onStep)&&(Utils.isFunction(this.props.onStep))) {
			this.props.onStep(this.state.curVal);
		}
	},
	//обработка нажатия на +
	handleIncClick: function () {
		if((this.state.curVal + this.state.step) <= this.state.maxVal) {
			this.setState({curVal: this.state.curVal + this.state.step}, this.notifyParent);
		} else {
			this.setState({curVal: this.state.maxVal}, this.notifyParent);
		}
	},
	//обработка нажатия на -
	handleDecClick: function () {
		if((this.state.curVal - this.state.step) >= this.state.minVal) {
			this.setState({curVal: this.state.curVal - this.state.step}, this.notifyParent);
		} else {
			this.setState({curVal: this.state.minVal}, this.notifyParent);
		}
	},
	//генерация представления ползунка
	render: function () {
		//стиль контейнера ползунка
		var sliderContStyle = {marginBottom: "0px"};
		//стиль ползунка
		var sliderStyle = {width: Math.round((this.state.curVal/this.state.maxVal) * 100) + "%"};
		//представление ползунка
		return (
			<div>
				<div className="progress" style={sliderContStyle}>
					<div className="progress-bar" 
						role="progressbar" 
						aria-valuenow={this.state.curVal}
						aria-valuemin={this.state.minVal}
						aria-valuemax={this.state.maxVal}
						style={sliderStyle}>
							{this.state.curVal + this.state.meas}
					</div>
				</div>
				<div>				
					<button type="button" className="w-button u-btn-regular" onClick={this.handleIncClick}>
						+
					</button>
					<button type="button" className="w-button u-btn-regular" onClick={this.handleDecClick}>
						-
					</button>
				</div>
			</div>
		);
	}
});