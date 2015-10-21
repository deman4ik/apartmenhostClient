/*
	Загрузчик картинок
*/
//предопределенные сообщения об ишибках загрузчика картинок
var ImageUpLoaderErrs = {
	CLOSED: "User closed widget"
}
//стили загрузчика
var ImageUpLoaderStyles = {
	ANCOR: "a",
	IMAGE_BUTTON: "image_button"
}
//загрузчик картинок
var ImageUpLoader = React.createClass({
	//состояние загрузчика
	getInitialState: function () {
		return {
		};
	},
	//инициализация компонента загрузчика
	componentDidMount: function () {
	},
	//завершение генерации/обновления представления компонента загрузчика
	componentDidUpdate: function (prevProps, prevState) {		
	},
	//обновление параметров компонента загрузчика
	componentWillReceiveProps: function (newProps) {
	},
	//обработка нажатия на кнопку отображения диалога загрузки
	handleOpenUploaderClick: function () {
		var translation = {
			"powered_by_cloudinary": "",
			"sources.local.title": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_SOURCES_LOCAL_TITLE"}),
			"sources.local.drop_file": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_SOURCES_LOCAL_DROP_FILE"}),
			"sources.local.drop_files": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_SOURCES_LOCAL_DROP_FILES"}),
			"sources.local.drop_or": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_SOURCES_LOCAL_DROP_OR"}),
			"sources.local.select_file": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_SOURCES_LOCAL_SELECT_FILE"}),
			"sources.local.select_files": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_SOURCES_LOCAL_SELECT_FILES"}),
			"sources.url.title": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_SOURCES_URL_TITLE"}),
			"sources.url.note": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_SOURCES_URL_NOTE"}),
			"sources.url.upload": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_SOURCES_URL_UPLOAD"}),
			"sources.url.error": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_SOURCES_URL_ERROR"}),
			"sources.camera.title": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_SOURCES_CAMERA_TITLE"}),
			"sources.camera.note": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_SOURCES_CAMERA_NOTE"}),
			"sources.camera.capture": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_SOURCES_CAMERA_CAPTURE"}),
			"progress.uploading": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_PROGRESS_UPLOADING"}),
			"progress.upload_cropped": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_PROGRESS_UPLOAD_CROPPED"}),
			"progress.processing": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_PROGRESS_PROCESSING"}),
			"progress.retry_upload": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_PROGRESS_RETRY_UPLOAD"}),
			"progress.use_succeeded": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_PROGRESS_USE_SUCCEEDED"}),
			"progress.failed_note": Utils.getStrResource({lang: this.props.language, code: "IUPLDR_PROGRESS_FAILED_NOTE"})
		};
		cloudinary.openUploadWidget(
			{ 
				cloud_name: config.cloudinaryCloudName, 
				upload_preset: "obj_pics",
				theme: "white",
				sources: ["local", "url"],
				multiple: (this.props.single?false:true),
				max_files: (this.props.maxFiles?this.props.maxFiles:null),
				text: translation
			},
			Utils.bind(function (error, result) { 
				if((this.props.onUpLoaded)&&(Utils.isFunction(this.props.onUpLoaded))) {
					this.props.onUpLoaded(error, result);
				}
			}, this)
		);
	},
	//генерация представления компонента загрузчика
	render: function () {
		//сборка представления загрузчика
		var content;
		if((!this.props.style)||(this.props.style == ImageUpLoaderStyles.IMAGE_BUTTON))	{
			content = <input className="w-button u-btn-round u-btn round" 
				type="button"
				value="+"
				title={Utils.getStrResource({lang: this.props.language, code: "UI_BTN_ADD_PHOTO"})}
				onClick={this.handleOpenUploaderClick}/>
		}
		if((this.props.style == ImageUpLoaderStyles.ANCOR)&&(this.props.caption))	{
			content =	<a href="javascript:void(0);" 
							className="u-lnk-norm" 
							onClick={this.handleOpenUploaderClick}>
							{this.props.caption}
						</a>
		}
		//представление компонента загрузчика
		return content;
	}
});