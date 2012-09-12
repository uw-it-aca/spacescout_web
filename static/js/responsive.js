(function(w){

	var sw = document.body.clientWidth,
		breakpoint = 768,
		speed = 800,
		mobile = true;


	$(document).ready(function() {
		checkMobile();

		// Toggle Filter display
		$('#filter_button').click(function() {
          $('#filter_block').slideToggle('fast', function() {
            // Animation complete.
          });
        });

        $('#waaa').popover({
            title: 'Space Descriptions',
            content: 'Some content!',
            placement: 'bottom',
            html: true,
            content: function() {
              return $('#waaa_content').html();
            }
        })

	});

	$(w).resize(function(){ //Update dimensions on resize
		sw = document.body.clientWidth;
		checkMobile();
	});

	// Check if Mobile
	function checkMobile() {
		mobile = (sw > breakpoint) ? false : true;

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

         $('#map_canvas').height(320);
         $('#info_list').height('auto');
    }


})(this);