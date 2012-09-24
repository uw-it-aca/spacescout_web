(function(w){
	var sw = document.body.clientWidth,
		breakpoint = 767,
		speed = 600,
		mobile = true;

	$(document).ready(function() {

		checkMobile();
		setDisplay();

		// Initialize bootstrap stuff
		$('.carousel').carousel();

		// Toggle Filter display
		$('#filter_button').click(function() {
    		if ($("#filter_block").is(":hidden")) {

                $("#filter_block").slideDown('slow');

                if (mobile) {
                    $('#map_canvas').hide();
                    $('#info_list').hide();
                    $('.back-top').hide();
                }

            } else {

                if (mobile) {
                    $('#map_canvas').show();
                    $('#info_list').show();
                    $('#filter_button_container').show();
                    $('.back-top').show();
                }

                $("#filter_block").slideUp('slow');
            }
        });

        // Close the filter display using Cancel button
        $('#cancel_results_button').click(function() {

            if (mobile) {
                $('#map_canvas').show();
                $('#info_list').show();
                $('#filter_button_container').show();
                $('.back-top').show();
                // scroll to top since the cancel button is at the bottom
                scrollTo('top');
            }

            $("#filter_block").slideUp('slow');


        });

        // Space descriptions
        if (mobile){
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
        }
        else {
            // Handle space description popover
            $('#view_space_descriptions').popover({
                title: 'Space Descriptions',
                content: 'Some content!',
                placement: 'right',
                html: true,
                content: function() {
                  return $('#space_descriptions_list').html();
                }
            });
        }


        $('#close_descriptions').live('click', function(){
            $('#view_space_descriptions').popover('hide');
            return false;
        });

        $('#view_space_descriptions').click(function(e){
            e.preventDefault();
            if (mobile) {
                $('.popover').addClass("popover-mobile-override");
            }
            else {
                $('.popover').addClass("popover-desktop-override");
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

        // handle view details click
        $('.view-details').live('click', function(e){

            // get the space id
            id =  $(this).attr('id');

            e.preventDefault();

            // if a space details already exists
            if ($('#space_detail_container').is(':visible')) {
                $.ajax({
                    url: '/space/'+id+'/json/',
                    success: replaceSpaceDetails
                });
            }
            else {
                $.ajax({
                    url: '/space/'+id+'/json/',
                    success: showSpaceDetails
                });
            }

        });

        $('#space_detail_container .close').live('click', function(e){
            e.preventDefault();
            hideSpaceDetails();
        });

        // fancy location select
        $("#e9").select2({
                placeholder: "Select a building",
                allowClear: true
            });

        // handle checkbox and radio button clicks
        $('.checkbox input:checkbox').click(function() {
            if(this.checked) {
                $(this).parent().addClass("selected");
            }
            else {
                $(this).parent().removeClass("selected");
            }
        });

        $('#filter_hours input:radio').change(function() {
            $(this).parent().addClass("selected");
            $(this).parent().siblings().removeClass("selected");

            if ($('#hours_list_input').is(':checked')) {
                //scrollTo('filter_hours');
                $('#hours_list_container').show();
            }
            else {
                $('#hours_list_container').hide();
            }
        });

        $('#filter_location input:radio').change(function() {
            $(this).parent().addClass("selected");
            $(this).parent().siblings().removeClass("selected");

            if ($('#building_list_input').is(':checked')) {
                //scrollTo('filter_location');
                $('#building_list_container').show();
            }
            else {
                $('#building_list_container').hide();
            }

        });

	});

	//Update dimensions on resize
	$(w).resize(function(){

	   console.log("resized");
	   sw = document.body.clientWidth;

	   checkMobile();
	   setDisplay();

	});

	// Check if Mobile
	function checkMobile() {
		mobile = (sw > breakpoint) ? false : true;
	}

	// Set the proper display settings
	function setDisplay() {
    	if (mobile) {
		  // mobile
		  mobileContent();
		} else {
		  // desktop
		  desktopContent();
		}
	}

	// Show space details
	function showSpaceDetails(data) {

    	// remove any open details
    	$('#space_detail_container').remove();

    	console.log("the following id is pissed: " + data.id);

    	if (mobile) {
        	// change url
        	location.href = '/space/' + data.id;
    	}
    	else {
        	// build the template
    	   var source = $('#space_details').html();
    	   var template = Handlebars.compile(source);
    	   $('#map_canvas').append(template(data));

    	   // set/reset initial state
    	   $('.space-detail-inner').show();
    	   $('#space_detail_container').show();

    	   $('#space_detail_container').height($('#map_canvas').height());
    	   $('.space-detail-body').height($('.space-detail').height() - 110);

    	   $('.space-detail').show("slide", { direction: "right" }, 700);
    	   
    	}

	}

	function replaceSpaceDetails(data) {

    	console.log("the following id was passed: " + data.id);

    	if (mobile) {
        	// change url
        	location.href = '/space/' + data.id;
    	}
    	else {
        	// build the template
    	   var source = $('#space_details_replace').html();
    	   var template = Handlebars.compile(source);
    	   $('#space_detail_container').html(template(data));

    	   // set/reset initial state
    	   $('.space-detail-inner').hide();
    	   $(".space-detail .loading").show();
    	   $('.space-detail-body').height($('.space-detail').height() - 110);

    	   $('.space-detail').show();

    	   setTimeout('$(".space-detail .loading").hide()', 1000);
    	   setTimeout('$(".space-detail-inner").show()', 1300);
    	       	   
    	}

	}

	function hideSpaceDetails() {
        $('.space-detail').hide("slide", { direction: "right" }, 700, function() {
        	   $('#space_detail_container').remove();
        });
	}

	// ScrollTo a spot on the UI
	function scrollTo(id) {
        // Scroll
        $('html,body').animate({
            scrollTop: $("#"+id).offset().top},speed);
    }

	// Desktop display defaults
	function desktopContent() {

    	var windowH = $(window).height();
        var headerH = $('#nav').height();
        var contentH = windowH - headerH;

        $('#map_canvas').height(contentH);
        $('#info_list').height(contentH);

        // make sure loading and list height fills the list container
        $('#info_list .list-inner').css('min-height', contentH);
        //$('.loading').height(contentH);
    }

    // Mobile display defaults
    function mobileContent() {

        var windowH = $(window).height();
        var headerH = $('#nav').height();
        //var contentH = windowH - headerH;
        //var mainContentH = windowH - headerH + 35;
        var mapH = windowH - headerH - 43; // enough to show the loading spinner at the bottom of the viewport

        $('#map_canvas').height(mapH);
        $('#map_canvas').css({ minHeight: mapH })
        $('#info_list').height('auto');

        //$('#main_content').height(mainContentH);
        //$('#main_content').css({ minHeight: mainContentH });
    }

    function blah() {
        $('#map_canvas').show();
        $('#info_list').show();
        $('#filter_button_container').show();
        $('.back-top').show();
    }

})(this);
