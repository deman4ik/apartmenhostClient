/*
	Подвал страниц
*/
var Footer = React.createClass({
	//генерация представления подвала
	render: function () {
		//основное меню подвала
		var menuFooter = <FooterMainMenu session={this.props.session} language={this.props.language}/>
		//меню социальных сервисов подвала
		var menuFooterSocial = <FooterSocialMenu language={this.props.language}/>			
		//меню языков подвала
		var menuFooterLanguage;
		if(this.props.languageEnabled)
			menuFooterLanguage = <LangMenu language={this.props.language} onLangugeChange={this.props.onLangugeChange}/>;
		//генерация представления подвала
		return (
				<section className="w-section u-sect-page-footer">
					<footer className="w-row">
						<div className="w-col w-col-4 w-col-small-4 w-col-tiny-4 u-col-footer">
							<div className="u-block-footer-logo">
								<div className="u-t-comptitle">
									{Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_APP"})}
								</div>
							</div>
							<div className="u-t-copyright">
								{Utils.getStrResource({lang: this.props.language, code: "UI_COPYRIGHT"})}
							</div>
						</div>
						{menuFooter}						
					</footer>
					<footer className="u-block-footer-social">
						<div className="w-row">
							{menuFooterSocial}
							{menuFooterLanguage}							
						</div>
					</footer>
				</section>
		);
	}
});