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
		//генератор		
		return (
<<<<<<< HEAD
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
=======
			<div>
				<div>
					<div><b>{this.props.title}</b></div>
					<div>{this.props.text}</div>
				</div>
			</div>
>>>>>>> d76273e7d487cc1bbf333995611bb1bb79fb385c
		);
	}
});