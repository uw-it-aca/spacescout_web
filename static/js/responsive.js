/* Normalized hide address bar for iOS & Android (c) Scott Jehl, scottjehl.com MIT License */
(function(a){var b=a.document;if(!location.hash&&a.addEventListener){window.scrollTo(0,1);var c=1,d=function(){return a.pageYOffset||b.compatMode==="CSS1Compat"&&b.documentElement.scrollTop||b.body.scrollTop||0},e=setInterval(function(){if(b.body){clearInterval(e);c=d();a.scrollTo(0,c===1?0:1)}},15);a.addEventListener("load",function(){setTimeout(function(){if(d()<20){a.scrollTo(0,c===1?0:1)}},0)})}})(this);

/*! A fix for the iOS orientationchange zoom bug. Script by @scottjehl, rebound by @wilto.MIT License.*/
(function(m){var l=m.document;if(!l.querySelector){return}var n=l.querySelector("meta[name=viewport]"),a=n&&n.getAttribute("content"),k=a+",maximum-scale=1",d=a+",maximum-scale=10",g=true,j,i,h,c;if(!n){return}function f(){n.setAttribute("content",d);g=true}function b(){n.setAttribute("content",k);g=false}function e(o){c=o.accelerationIncludingGravity;j=Math.abs(c.x);i=Math.abs(c.y);h=Math.abs(c.z);if(!m.orientation&&(j>7||((h>6&&i<8||h<8&&i>6)&&j>5))){if(g){b()}}else{if(!g){f()}}}m.addEventListener("orientationchange",f,false);m.addEventListener("devicemotion",e,false)})(this);

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
            $('#view_space_descriptions').popover('hide');
            return false;
        });

        $('#view_space_descriptions').click(function(e){
            e.preventDefault();
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

         $('#map_canvas').height('auto');
         $('#info_list').height('auto');
    }


})(this);