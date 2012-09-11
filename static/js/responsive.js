(function(w){

	var windowW = $(window).width();
		breakpoint = 768,
		speed = 800,
		mobile = true;


	$(document).ready(function() {
		checkMobile();
	});

	$(w).resize(function(){ //Update dimensions on resize
		sw = document.body.clientWidth;
		checkMobile();
	});

	// Check if Mobile
	function checkMobile() {
		mobile = (windowW > breakpoint) ? false : true;

		if (!mobile) {
		  // If Not Mobile (Desktop )
		  resizeContent();

		} else {

		  // Do this for mobile size
		  resetContent();

		}
	}

	// Resize Map and List
	function resizeContent() {

    	var windowH = $(window).height();
        var headerH = $('#nav').height();
        var contentH = windowH - headerH;

         $('#map_canvas').height(contentH);
         $('#info_list').height(contentH);
    }

    function resetContent() {

        var windowH = $(window).height();
        var headerH = $('#nav').height();
        var contentH = windowH - headerH;

         $('#map_canvas').height(300);
         $('#info_list').height('auto');
    }


})(this);