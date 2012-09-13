(function(w){

	var sw = document.body.clientWidth,
		breakpoint = 768,
		speed = 800,
		mobile = true;

	$(document).ready(function() {
		checkMobile();

		// Toggle Filter display
		$('#filter_button').click(function() {
    		if ($("#filter_block").is(":hidden")) {
                $("#filter_block").slideDown(speed, function() {
                    // Animation complete.
                    if (mobile) {
                        $('#map_canvas').hide();
                        $('#info_list').hide();
                        $('#filter_button_container').hide();

                    }

                    $('.back-top').hide();

                });



            } else {
                // scroll to top of the page and then slide the filters up
                scrollTo('top');

                $("#filter_block").slideUp(speed);

                if (mobile) {
                    $('#map_canvas').show();
                    $('#info_list').show();
                    $('#filter_button_container').show();

                }
                $('.back-top').show();
            }
        });

        // Close the filter display using Cancel button
        $('#cancel_results_button').click(function() {
            scrollTo('top');
            $("#filter_block").slideUp(speed);

            if (mobile) {
                $('#map_canvas').show();
                $('#info_list').show();
                $('#filter_button_container').show();
            }

            $('.back-top').show();

        });


        // Handle space description popover
        $('#view_space_descriptions').popover({
            title: 'Space Descriptions',
            content: 'Some content!',
            placement: 'bottom',
            html: true,
            content: function() {
              return $('#space_descriptions_list').html();
            }
        });

        $('#close_descriptions').live('click', function(){
            console.log("this is the click");
            $('#view_space_descriptions').popover('hide');
            return false;
        });

        $('#view_space_descriptions').click(function(event){
            event.preventDefault();

            if (mobile) {
                $('.popover').addClass("popover-mobile-override");
            }
        });

        // Scroll to the top of page
        $('#top_link').click(function(e){
              // Prevent a page reload when a link is pressed
              e.preventDefault();
              // Call the scroll function
              scrollTo('top');
        });

        // Scroll to top of Filter list
        $('#filter_link').click(function(e){
              // Prevent a page reload when a link is pressed
              e.preventDefault();
              // Call the scroll function
              scrollTo('info_items');
        });


	});

	$(w).resize(function(){ //Update dimensions on resize
		sw = document.body.clientWidth;
		checkMobile();
	});


	// ScrollTo a spot on the UI
	function scrollTo(id) {

        // Scroll
        $('html,body').animate({
            scrollTop: $("#"+id).offset().top},speed);
    }

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