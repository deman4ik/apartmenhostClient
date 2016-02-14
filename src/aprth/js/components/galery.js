/*
	Картинная галерея
*/
var Galery = React.createClass({
	//состояние галери
	getInitialState: function () {
		return {
			imagesCount: 0 //количество картинок в гелерее	
		};
	},
	//отработка загрузки изображения
	handleImageLoad: function (image, i) {
		if((i + 1) == this.state.imagesCount) {
			Webflow.require("slider").destroy();
			Webflow.require("slider").ready();
		}
	},
	//инициализация галереи
	componentDidMount: function () {
		if((this.props.images)&&(Array.isArray(this.props.images))) {
			this.setState({imagesCount: this.props.images.length});
		}
	},
	//завершение генерации/обновления представления галереи
	componentDidUpdate: function (prevProps, prevState) {
	},
	//обновление параметров галереи
	componentWillReceiveProps: function (newProps) {
	},
	//генерация представления галереи
	render: function () {
		//генерация картинок
		var images;
		if((this.props.images)&&(Array.isArray(this.props.images))) {
			images = this.props.images.map(function (item, i) {
				return (
					<div className="w-slide u-slide">
						<div className="u-block-slide">
							<img src={item.url}
								onLoad={this.handleImageLoad.bind(this, item, i)}
								width="100%"/>
						</div>
					</div>					
				);
			}, this);
		}
		//представление галереи
		return (
			<div className="w-slider u-img-slider" data-animation="over" data-duration="500" data-infinite="1">
				<div className="w-slider-mask">
					{images}
				</div>
				<div className="w-slider-arrow-left">
					<div className="w-icon-slider-left u-slider-ico"></div>
				</div>
				<div className="w-slider-arrow-right">
					<div className="w-icon-slider-right u-slider-ico"></div>
				</div>
				<div className="w-slider-nav w-round">
					<div className="w-slider-dot w-active" data-wf-ignore=""></div>
					<div className="w-slider-dot" data-wf-ignore=""></div>
				</div>
			</div>	
		);
	}
});