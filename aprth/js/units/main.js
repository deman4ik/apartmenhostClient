/*
	Главная страница
*/
var Main = React.createClass({
	//состояние главной страницы
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
	//генерация представления главной страницы
	render: function () {
		//сообщение по умолчанию
		var underConstrMessage = Utils.getStrResource({lang: this.props.language, code: "UI_UNIT_UNDER_CONSTRUCTION"})
		//генератор		
		return (
	<div name="landing">
  <div className="w-section u-sect-hero">
    <h1 className="u-t-h1-land">Сдай своё жильё</h1>
    <h1 className="u-t-h1-land sub1">И живи спокойно.</h1>
    <div className="u-block-land"><a className="w-button u-btn-land" href="#">Попробовать</a>
    </div>
  </div>
  <div className="w-section u-sect-land under">
    <h1 className="u-t-h1-land2 sub">или</h1>
    <h1 className="u-t-h1-land2">Найди себе новое!</h1>
    <div className="u-block-spacer"></div>
    <div className="w-container">
      <div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/1.jpg"></img></div>
      <div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/2.jpg"></img></div>
      <div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/3.jpg"></img></div>
      <div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/4.jpg"></img></div>
      <div className="u-block-land-item center"><br/><span>здесь будет форма поиска<br/></span>

      </div>
      <div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/5.jpg"></img></div>
      <div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/6.jpg"></img></div>
      <div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/8.jpg"></img></div>
      <div className="u-block-land-item"><img calss="u-tmp-img" src="aprth/img/tmp/2.jpg"></img></div>
    </div>
  </div>
  <div className="w-section u-sect-land">
    <div className="w-container">
      <h1 className="u-t-h1-main">как это работает?</h1>
      <div className="u-block-spacer"></div>
      <div className="w-row">
        <div className="w-col w-col-4 u-col-howto card">
          <h2>для&nbsp;собственников</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.</p>
        </div>
        <div className="w-col w-col-4 u-col-howto card">
          <h2>для&nbsp;нанимателей</h2>
          <p>Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique.&nbsp;Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div className="w-col w-col-4 u-col-howto card">
          <h2>доверие и надежность</h2>
          <p>&nbsp;Suspendisse varius enim in eros elementum tristique.</p>
        </div>
      </div>
      <div className="u-block-spacer"></div>
    </div>
  </div>
  </div>
		);
	}
});