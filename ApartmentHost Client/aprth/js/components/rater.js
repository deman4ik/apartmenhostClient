/*
	Управление рейтингами
*/
var Rater = React.createClass({
	//состояние рейтинга
	getInitialState: function () {
		return {
			maxRate: 0, //максимальное значение рейтинга
			curRate: 0, //текущее значение рейтинга
			curRateTmp: 0, //буфер для значения рейтинга (при изменении)
			isActive: false, //активность компонента (только для чтения/для измнения рейтинга)
			showCount: false, //флаг отображения счетчика рейтинга
			rateCount: 0 //счетчик рейтинга
		};
	},
	//установка значений состояния
	initState: function (props) {
		var tmpState = {
			maxRate: 0,
			curRate: 0,
			curRateTmp: 0,
			isActive: false,
			showCount: false,
			rateCount: 0
		};
		if((Utils.isNumber(props.rating))&&(Utils.isNumber(props.total))) {
			tmpState.maxRate = props.total;
			tmpState.curRate = props.rating;
			tmpState.curRateTmp = props.rating;
		}
		if((props.onRate)&&(Utils.isFunction(props.onRate))) {
			tmpState.isActive = true;
			tmpState.showCount =  false;
		}
		if((!tmpState.isActive)&&(Utils.isNumber(props.ratingCount))) {
			tmpState.showCount = true;
			tmpState.rateCount = props.ratingCount;
		}
		
		this.setState({
			maxRate: tmpState.maxRate,
			curRate: tmpState.curRate,
			curRateTmp: tmpState.curRateTmp,
			isActive: tmpState.isActive,
			showCount: tmpState.showCount,
			rateCount: tmpState.rateCount
		});
	},
	//инициализация рейтинга
	componentDidMount: function () {
		this.initState(this.props);
	},
	//завершение генерации/обновления представления рейтинга
	componentDidUpdate: function (prevProps, prevState) {		
	},
	//обновление параметров рейтинга
	componentWillReceiveProps: function (newProps) {
		this.initState(newProps);
	},
	//обработка нажатия на звезду
	handleStarClick: function (index) {
		if(this.state.isActive) {
			var newRate;
			if((index == 0)&&(this.state.curRateTmp == 1)) {
				newRate = 0;
			} else {
				newRate = index + 1;				
			}
			this.setState({curRate: newRate, curRateTmp: newRate}, function() {this.props.onRate(newRate);});			
		}
	},
	//обработка выхода мыши за пределы звезды
	handleStarMouseOut: function (index) {
		if(this.state.isActive) {
			this.setState({curRate: this.state.curRateTmp});
		}
	},
	//обработка вхождения мыши в пределы звезды
	handleStarMouseOver: function (index) {
		if(this.state.isActive) {
			this.setState({curRate: (index + 1)});
		}
	},	
	//генерация представления рейтинга
	render: function () {
		//генерация звёздочек
		var stars;
		if(this.state.maxRate > 0) {
			var starsTmp = [];
			for(var i = 1; i <= this.state.maxRate; i ++) {
				if(i <= this.state.curRate) starsTmp.push(1); else starsTmp.push(0);
			}	
			stars = starsTmp.map(function (star, i) {
				var cStar = React.addons.classSet;
				var classesStar = cStar({
					"rater-item": true,
					"rater-item-active": (star == 1),
					"rater-item-rw": this.state.isActive
				});
				return (
					<span className={classesStar} 
						onClick={this.handleStarClick.bind(this, i)}
						onMouseOut={this.handleStarMouseOut.bind(this, i)}
						onMouseOver={this.handleStarMouseOver.bind(this, i)}>
						&#x2605;
					</span>
				);
			}, this);
		}
		//генерация счетчика рейтингов
		var counter;
		if(this.state.showCount) {			
			counter = <span className="rater-count">&nbsp;{"(" + this.state.rateCount + ")"}</span>
		}
		//представление рейтинга
		return (
			<div className="rater">
				{stars}{counter}
			</div>	
		);
	}
});