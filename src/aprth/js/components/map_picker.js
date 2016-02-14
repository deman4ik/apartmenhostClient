/*
	Выбор точки на карте
*/
var MapPicker = React.createClass({
	//состояние
	getInitialState: function () {
		return {
			latitude: "", //широта маркера
			longitude: "", //долгота маркера
			address: "", //адрес маркера
			map: {}, //карта
			marker: {} //маркер на карте
		};
	},
	//установка центра карты в точку по-умолчанию
	setMapToDefaultPoint: function () {
		var geocoder = new google.maps.Geocoder();
		var latlng = new google.maps.LatLng(config.latitude, config.longitude);
		geocoder.geocode({"location": latlng}, Utils.bind(function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[1]) {
					this.setState(
						{
							latitude: config.latitude,
							longitude: config.longitude,
							address: results[1].formatted_address
						}, 
						this.setMapCenterAndMarker
					);
				}
			}
		}, this));
	},
	//установка маркера и центра карты
	setMapCenterAndMarker: function () {
		var point = new google.maps.LatLng(this.state.latitude, this.state.longitude);
		if($.isEmptyObject(this.state.marker)) {
			var tmp = new google.maps.Marker({position: point, map: this.state.map});
			this.setState({marker: tmp});
		} else {
			this.state.marker.setPosition(point);
		}
		this.state.map.setCenter(point);
	},
	//инициализация центра карты и маркера
	initMapCenterAndMarker: function () {
		//если переданы координаты или адрес
		if(((this.state.latitude)&&(this.state.longitude))||(this.state.address)) {
			//у координат приоритет, поэтому проверяем - есть ли они
			if((this.state.latitude)&&(this.state.longitude)) {
				//если вместе с координатами пришел и адрес - делать ничего не надо, ставим маркер и двигаем карту к точке
				if(this.state.address) {
					this.setMapCenterAndMarker();
				//координаты есть, но нет адреса
				} else {
					//будем делать обратное геокодирование (поиск адреса по координатам)
					var geocoder = new google.maps.Geocoder();
					var latlng = new google.maps.LatLng(this.state.latitude, this.state.longitude);
					geocoder.geocode({"location": latlng}, Utils.bind(function (results, status) {
						//адрес нашелся - пишем его в состояние и двигаем туда карту, а так же ставим маркер
						if (status == google.maps.GeocoderStatus.OK) {
							if (results[1]) {
								this.setState({address: results[1].formatted_address}, this.setMapCenterAndMarker);
							//адрес не нашелся - ставим карту в точку по умолчанию
							} else {
								this.setMapToDefaultPoint();
							}
						//адрес не нашелся - ставим карту в точку по умолчанию
						} else {
							this.setMapToDefaultPoint();
						}
					}, this));
				}
			//нет координат, но есть адрес
			} else {
				//геокодируем его (найдем координаты)
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({"address": this.state.address}, Utils.bind(function (results, status) {
					//координаты нашлись - пишем их в состояние и двигаем туда карту, а так же ставим маркер
					if (status == google.maps.GeocoderStatus.OK) {
						this.setState({latitude: results[0].geometry.location.lat(), longitude: results[0].geometry.location.lng()}, this.setMapCenterAndMarker);
					//координаты не нашлись - ставим карту в точку по умолчанию
					} else {
						this.setMapToDefaultPoint();
					}
				}, this));				
			}
		//нет ни координат, ни адреса
		} else {
			//если поддерживается определение местоположения
			if(navigator.geolocation) {
				//запросим определение местоположения
				navigator.geolocation.getCurrentPosition(
					//пользователь разрешил определить местоположение и оно определилось
					Utils.bind(function (position) {
						//найдем адрес для найденного местоположения
						var geocoder = new google.maps.Geocoder();
						var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
						geocoder.geocode({"location": latlng}, Utils.bind(function (results, status) {
							//адрес нашелся - пишем его и местоположение в состояние и двигаем туда карту, а так же ставим маркер
							if (status == google.maps.GeocoderStatus.OK) {
								if (results[1]) {
									this.setState(
										{
											latitude: position.coords.latitude,
											longitude: position.coords.longitude,
											address: results[1].formatted_address
										}, 
										this.setMapCenterAndMarker
									);
								//адрес не нашелся - ставим карту в точку по умолчанию
								} else {
									this.setMapToDefaultPoint();
								}
							//адрес не нашелся - ставим карту в точку по умолчанию
							} else {
								this.setMapToDefaultPoint();
							}
						}, this));
					}, this),
					//пользователь не разрешил определить местоположение или оно не определилось - ставим карту в точку по умолчанию
					this.setMapToDefaultPoint					
				);
			//определение местоположения не поддерживается
			} else {
				//ставим карту в точку по умолчанию
				this.setMapToDefaultPoint();
			}
		}		
	},
	//установка значений состояния
	initState: function (props) {
		var mapTmp = new google.maps.Map(React.findDOMNode(this.refs.mapCanvas), {zoom: 15, draggableCursor: "crosshair"});
		google.maps.event.addListener(mapTmp, "click", Utils.bind(function (event) {this.handleMapClick(event.latLng);}, this));
		this.setState({
			latitude: props.latitude,
			longitude: props.longitude,
			address: props.address,
			map: mapTmp
		}, this.initMapCenterAndMarker);
	},
	//обработка нажатия на карту
	handleMapClick: function (location) {
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({"latLng": location}, Utils.bind(function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[1]) {
					this.setState({
						address: results[0].formatted_address,
						latitude: location.lat(),
						longitude: location.lng()
					}, this.setMapCenterAndMarker);
				}
			}
		}, this));
	},
	//нажатие на OK
	handleOKClick: function () {
		if((this.state.latitude)&&(this.state.longitude)&&(this.state.address)) {
			if((this.props.onOK)&&(Utils.isFunction(this.props.onOK))) {
				this.props.onOK({address: this.state.address, latitude: this.state.latitude, longitude: this.state.longitude});
			}
		}
	},
	//нажатие на отмену
	handleChancelClick: function () {
		if((this.props.onCancel)&&(Utils.isFunction(this.props.onCancel))) {
			this.props.onCancel();
		}
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
		//заголовок
		var title;
		if(this.props.title) {
			title = this.props.title;
		} else {
			title = Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_PICK_ON_MAP"});
		}
		//представление
		return (
			<div>
				<div className="modal show messagebox-wraper">
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<h4 className="modal-title">{title}</h4>
							</div>
							<div className="modal-body">
								<div>{this.state.address}</div>
								<div ref="mapCanvas" style={mapStyle}></div>								
							</div>
							<div className="modal-footer">
								<button type="button" className="w-button u-btn-primary" onClick={this.handleOKClick}>
									{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_OK"})}
								</button>
								<button type="button" className="w-button u-btn-regular" onClick={this.handleChancelClick}>
									{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_CHANCEL"})}
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