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

$(".u-sect-main").resize(function(){fixFooter();});
$(document).bind( "click", fixFooter);