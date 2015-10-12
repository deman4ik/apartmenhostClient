/*
	Статья
*/
var Article = React.createClass({
	//состояние страницы статьи
	getInitialState: function () {
		return {
		}
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
	},
	//генерация представления статьи
	render: function () {
		var image;
		if(this.props.imageURL) {
			image = <img height={128} width={128} src={this.props.imageURL}/>
		}
		//генератор		
		return (
			<div className="w-container">
			  <div className="u-block-spacer"></div>
			  <div className="u-block-spacer"></div>
	      <h1 className="u-t-h1-main">как это работает?</h1>
	      <div className="w-row">
	        <div className="w-col w-col-3 u-col-howto">
	          <h2>{this.props.title}</h2>
	        </div>
	        <div className="w-col w-col-9 u-col-howto">
	          <p>{this.props.text}</p>
	        </div>
	      </div>
	    </div>		
		);
	}
});