      function fixFooter(){
          var windowHeight = $(window).height();
          var bodyHeight = $(".u-sect-main").height();
          if (bodyHeight + $(".u-sect-page-footer").outerHeight(true) < windowHeight) {
              $(".u-sect-page-footer").css("position", "absolute");
              $(".u-sect-page-footer").css("left", 0);
              $(".u-sect-page-footer").css("right", 0);
              $(".u-sect-page-footer").css("bottom", 0); 
          }
          else $(".u-sect-page-footer").css("position", "relative");
      }   
      // ????? из этого работает только resize !
      //$(document).ready(function () {fixFooter();});
      //$(window).load(function() {fixFooter();});
      //$( window ).bind( "pageshow", fixFooter);
      //$(".u-sect-main").bind( "ready", fixFooter);
      $(window).resize(function(){fixFooter();});