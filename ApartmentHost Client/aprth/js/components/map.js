/*
	Карта
*/
var Map = React.createClass({
	//состояние
	getInitialState: function () {
		return {
		};
	},
	//установка значений состояния
	initState: function (props) {
		var point = new google.maps.LatLng(props.latitude, props.longitude);
		var mapOptions = {
			center: point,
			zoom: 15
		};
		var map = new google.maps.Map(React.findDOMNode(this.refs.mapCanvas), mapOptions);
		var marker = new google.maps.Marker({
			position: point,
			map: map,
			title: props.title
		});
	},
	//инициализация
	componentDidMount: function () {
		this.initState(this.props);
	},
	//завершение генерации/обновления представления
	componentDidUpdate: function (prevProps, prevState) {		
	},
	//обновление параметров
	componentWillReceiveProps: function (newProps) {
		this.initState(newProps);
	},
	//генерация представления
	render: function () {
		//дополнительные стили карты
		mapStyle = {
			witdh: "100%",
			height: "300px"
		}
		//представление
		return (
			<div ref="mapCanvas" style={mapStyle}></div>	
		);
	}
});