/*
	Карта
*/
//режимы отображения данны
var mapModes = {
	modeSignle: "post", //режим отображения одного объекта
	modeGroup: "search" //режим отображения группы объектов
}
//карта
var Map = React.createClass({
	//состояние
	getInitialState: function () {
		return {
			latitude: "", //широта центра карты (и маркера если режим отображения одного объекта, для группового режима - центр радара)
			longitude: "", //долгота центра карты (и маркера если режим отображения одного объекта, для группового режима - центр радара)
			address: "", //адрес маркера (если режим отображения одного объекта)
			title: "", //заголовок маркера (если режим отображения одного объекта)
			map: {}, //карта
			searchRadar: {}, //радар (режим группового отображения объектов)
			markers: [], //маркеры (режим группового отображения объектов)
			radius: 0, //радиус поиска
			centerIsSet: false, //признак указания центра карты
			showRadar: false, //признак отображения радара (режим группового отображения объектов)
			showMarkers: true //признак отображения маркеров
		};
	},
	//установка маркера и центра карты
	setMapCenterAndMarkers: function () {
		var point = new google.maps.LatLng(this.state.latitude, this.state.longitude);
		this.state.map.setCenter(point);		
		if((this.props.mode == mapModes.modeSignle)&&(this.state.showMarkers)) {
			var marker = new google.maps.Marker({
				position: point,
				map: this.state.map,
				title: this.state.title
			});
		}
		if(this.props.mode == mapModes.modeGroup) {
			if((this.state.markers)&&(Array.isArray(this.state.markers))&&(this.state.showMarkers)) {
				this.state.markers.map(function (mrk, i) {					
					if((mrk.latitude)&&(mrk.longitude)&&(mrk.title)&&(mrk.content)) {
						var p = new google.maps.LatLng(mrk.latitude, mrk.longitude);
						var m = new google.maps.Marker({
							position: p,
							map: this.state.map,
							title: mrk.title
						});
						var infowindow = new google.maps.InfoWindow({
							content: mrk.content
						});
						google.maps.event.addListener(m, "click", Utils.bind(function () {
							infowindow.open(this.state.map, m);
						}, this));
					}
				}, this);
			}
			if(
				(this.state.radius)
				&&(this.state.radius > 0)
				&&(this.state.showRadar)
				&&(config.useSearchRadar)
				&&(!$.isEmptyObject(this.state.searchRadar))
			) {
				google.maps.event.clearListeners(this.state.searchRadar, "radius_changed");
				google.maps.event.clearListeners(this.state.searchRadar, "center_changed");
				this.state.searchRadar.setCenter(point);
				this.state.searchRadar.setRadius(this.state.radius);
				google.maps.event.addListener(this.state.searchRadar, "radius_changed", Utils.bind(function () {this.handleSearchRadarRadiusChange();}, this));
				google.maps.event.addListener(this.state.searchRadar, "center_changed", Utils.bind(function () {this.handleSearchRadarPlaceChange();}, this));
			}
		}
	},
	//установка центра карты в точку по-умолчанию
	setMapToDefaultPoint: function () {
		this.setState(
			{
				latitude: config.latitude, 
				longitude: config.longitude, 
				showRadar: false,
				showMarkers: false
			}, 
			this.setMapCenterAndMarkers
		);
	},
	//установка центра карты в локацию пользователя
	setMapToUserLocation: function () {
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				Utils.bind(function (position) {
					var geocoder = new google.maps.Geocoder();
					var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
					geocoder.geocode({"location": latlng}, Utils.bind(function (results, status) {
						if (status == google.maps.GeocoderStatus.OK) {
							if (results[1]) {
								this.setState(
									{
										latitude: position.coords.latitude,
										longitude: position.coords.longitude,
										address: results[1].formatted_address,
										showRadar: false,
										showMarkers: false
									}, 
									this.setMapCenterAndMarkers
								);
							} else {
								this.setMapToDefaultPoint();
							}
						} else {
							this.setMapToDefaultPoint();
						}
					}, this));
				}, this),
				this.setMapToDefaultPoint()
			);
		} else {
			this.setMapToDefaultPoint();
		}
	},
	//инициализация маркера и центра карты
	initMapCenterAndMarkers: function () {
		if(
			((this.state.latitude)&&(this.state.longitude))
			||(this.state.address)		
		) {
			if((this.state.latitude)&&(this.state.longitude)) {
				this.setState(
					{
						showRadar: true,
						showMarkers: true
					},
					this.setMapCenterAndMarkers
				);				
			} else {
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({"address": this.state.address}, Utils.bind(function (results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						this.setState(
							{
								latitude: results[0].geometry.location.lat(),
								longitude: results[0].geometry.location.lng(),
								showRadar: true,
								showMarkers: true
							},
							this.setMapCenterAndMarkers
						);
					} else {
						this.setMapToUserLocation();
					}
				}, this));				
			}
		} else {
			this.setMapToUserLocation();
		}
	},
	//оповещение родителя о смене радиуса радара
	notifyParentSearchRadarRadiusChange: function () {
		if((!$.isEmptyObject(this.state.searchRadar))&&(config.useSearchRadar)) {
			if((this.props.onSearchRadarRadiusChange)&&(Utils.isFunction(this.props.onSearchRadarRadiusChange))) {
				this.props.onSearchRadarRadiusChange(Math.round(this.state.radius));
			}
		}
	},
	//оповещение родителя о смене места радара
	notifyParentSearchRadarPlaceChange: function () {
		if((!$.isEmptyObject(this.state.searchRadar))&&(config.useSearchRadar)) {
			if((this.props.onSearchRadarPlaceChange)&&(Utils.isFunction(this.props.onSearchRadarPlaceChange))) {
				this.props.onSearchRadarPlaceChange(this.state.searchRadar.getCenter());
			}
		}
	},
	//обработка смены радиуса радара
	handleSearchRadarRadiusChange: function () {
		if((!$.isEmptyObject(this.state.searchRadar))&&(config.useSearchRadar)) {
			var newRadius = this.state.searchRadar.getRadius();
			var correctRadius = false;		
			if(newRadius > config.searchRadiusMax) {
				newRadius = config.searchRadiusMax;
				correctRadius = true;
			}
			if(newRadius < config.searchRadiusMin) {
				newRadius = config.searchRadiusMin;
				correctRadius = true;
			}
			if(correctRadius) this.state.searchRadar.setRadius(newRadius);
			this.setState({radius: newRadius}, function () {			
				this.notifyParentSearchRadarRadiusChange();
			});
		}
	},
	//обработка перетаскивания радара
	handleSearchRadarPlaceChange: function () {
		if((!$.isEmptyObject(this.state.searchRadar))&&(config.useSearchRadar)) {
			this.notifyParentSearchRadarPlaceChange();
		}
	},
	//зачистка маркеров на карте
	removeMarkers: function () {
		this.state.map.clearMarkers();
	},
	//установка значений состояния
	initState: function (props) {
		this.removeMarkers();
		if(config.useSearchRadar) {
			if($.isEmptyObject(this.state.searchRadar)) {
			var searchRadarTmp = new google.maps.Circle({fillColor: "#00ccc5", fillOpacity: 0.25, strokeWeight: 0, map: this.state.map, editable: true, draggable: false});
			google.maps.event.addListener(searchRadarTmp, "radius_changed", Utils.bind(function () {this.handleSearchRadarRadiusChange();}, this));
			google.maps.event.addListener(searchRadarTmp, "dragend", Utils.bind(function () {this.handleSearchRadarPlaceChange();}, this));
			google.maps.event.addListener(searchRadarTmp, "center_changed", Utils.bind(function () {this.handleSearchRadarPlaceChange();}, this));
			} else {
				searchRadarTmp = this.state.searchRadar;
				google.maps.event.clearListeners(this.state.searchRadar, "center_changed");
				searchRadarTmp.setCenter(null);
				google.maps.event.addListener(searchRadarTmp, "center_changed", Utils.bind(function () {this.handleSearchRadarPlaceChange();}, this));
			}
		}
		this.setState({
			latitude: props.latitude,
			longitude: props.longitude,
			address: props.address,
			title: props.title,
			searchRadar: searchRadarTmp,
			markers: props.markers,
			radius: props.radius,
			showRadar: props.showRadar,
		}, this.initMapCenterAndMarkers);
	},
	//инициализация
	componentDidMount: function () {
		var mapTmp = new google.maps.Map(
			React.findDOMNode(this.refs.mapCanvas), 
			{zoom: (this.props.zoom)?this.props.zoom:15}
		);
		this.setState({map: mapTmp}, function () {this.initState(this.props);});
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
		//представление
		return (
			<div className="w-widget w-widget-map u-block-cardlst-map" ref="mapCanvas"></div>	
		);
	}
});