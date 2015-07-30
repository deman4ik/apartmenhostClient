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
			showRadar: false //признак отображения радара (режим группового отображения объектов)
		};
	},
	//установка маркера и центра карты
	setMapCenterAndMarkers: function () {
		var point = new google.maps.LatLng(this.state.latitude, this.state.longitude);
		this.state.map.setCenter(point);		
		if(this.props.mode == mapModes.modeSignle) {
			var marker = new google.maps.Marker({
				position: point,
				map: this.state.map,
				title: this.state.title
			});
		}
		if(this.props.mode == mapModes.modeGroup) {
			if((this.state.markers)&&(Array.isArray(this.state.markers))) {
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
						google.maps.event.addListener(m, "click", Utils.bind(function() {
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
	//инициализация маркера и центра карты
	initMapCenterAndMarkers: function () {
		if(
			((this.state.latitude)&&(this.state.longitude))
			||(this.state.address)		
		) {
			if((this.state.latitude)&&(this.state.longitude)) {
				this.setMapCenterAndMarkers();
			} else {
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({"address": this.state.address}, Utils.bind(function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						this.setState({latitude: results[0].geometry.location.lat(), longitude: results[0].geometry.location.lng()}, this.setMapCenterAndMarkers);
					} else {
						this.setState({latitude: config.latitude, longitude: config.longitude}, this.setMapCenterAndMarkers);
					}
				}, this));				
			}
		} else {
			this.setState({latitude: config.latitude, longitude: config.longitude}, this.setMapCenterAndMarkers);
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
	//установка значений состояния
	initState: function (props) {
		var mapTmp = new google.maps.Map(React.findDOMNode(this.refs.mapCanvas), {zoom: (props.zoom)?props.zoom:15});		
		var searchRadarTmp = {};
		if(config.useSearchRadar) {
			searchRadarTmp = new google.maps.Circle({fillColor: "#00ccc5", fillOpacity: 0.25, strokeWeight: 0, map: mapTmp, editable: true, draggable: false});
			google.maps.event.addListener(searchRadarTmp, "radius_changed", Utils.bind(function () {this.handleSearchRadarRadiusChange();}, this));
			google.maps.event.addListener(searchRadarTmp, "dragend", Utils.bind(function () {this.handleSearchRadarPlaceChange();}, this));
			google.maps.event.addListener(searchRadarTmp, "center_changed", Utils.bind(function () {this.handleSearchRadarPlaceChange();}, this));
		}
		this.setState({
			latitude: props.latitude,
			longitude: props.longitude,
			address: props.address,
			title: props.title,
			map: mapTmp,
			searchRadar: searchRadarTmp,
			markers: props.markers,
			radius: props.radius,
			showRadar: props.showRadar,
		}, this.initMapCenterAndMarkers);
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
			witdh: (this.props.witdh)?this.props.witdh:"100%",
			height: (this.props.height)?this.props.height:"300px"
		}
		//представление
		return (
			<div ref="mapCanvas" style={mapStyle}></div>	
		);
	}
});