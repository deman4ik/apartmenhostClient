function fixFooter(){
	var windowHeight = $(window).height();
	var bodyHeight = $(".u-sect-main").height();
	if (bodyHeight && $(window).height() > 991 && (bodyHeight + $(".u-sect-page-footer").outerHeight(true) < windowHeight) ) {
		$(".u-sect-page-footer").css("position", "absolute");
		$(".u-sect-page-footer").css("left", 0);
		$(".u-sect-page-footer").css("right", 0);
		$(".u-sect-page-footer").css("bottom", 0); 
	}
	else {
		$(".u-sect-page-footer").css("position", "relative");
	}
}   

function openUploadPicApt () {
  var translation = {
	  "powered_by_cloudinary": "",
	  "sources.local.title": "Файлы",
	  "sources.local.drop_file": "Перетащите файл с картинкой сюда",
	  "sources.local.drop_files": "Перетащите файлы с картинками сюда",
	  "sources.local.drop_or": "или",
	  "sources.local.select_file": "Выберите файл",
	  "sources.local.select_files": "Выберите файлы",
	  "sources.url.title": "URL",
	  "sources.url.note": "Общедоступный URL файла с картинкой:",
	  "sources.url.upload": "Загрузить",
	  "sources.url.error": "Please type a valid HTTP URL.",
	  "sources.camera.title": "Camera",
	  "sources.camera.note": "Make sure your browser allows camera capture, position yourself and click Capture:",
	  "sources.camera.capture": "Capture",
	  "progress.uploading": "Загружаю...",
	  "progress.upload_cropped": "Загрузить",
	  "progress.processing": "Обрабатываю...",
	  "progress.retry_upload": "Попробуйте еще раз",
	  "progress.use_succeeded": "OK",
	  "progress.failed_note": "Некоторые картинки не смогли загрузиться."
	};

  cloudinary.openUploadWidget(
    { 
  	  cloud_name: "apartmenthost", 
  	  upload_preset: "obj_pics",
  	  theme: "white",
  	  sources: ["local", "url"],
  	  text: translation
  	}, 
    function(error, result) { 
    	var length = result.length;
    	var i = 0;
    	for (; i < length; i++) {
    	  $("#img_holder").append("<img src='" + result[i].thumbnail_url + "'/>"); 
    	}
    }
  );
}

$(".u-sect-main").resize(function(){fixFooter();});
$(document).bind( "click", fixFooter);