var detailsLat, detailsLon;

// Handlebars helpers

Handlebars.registerHelper('carouselimages', function(spacedata) {
    var space_id = spacedata.id;
    var elements = new Array;
    for (i=0; i < spacedata.images.length; i++) {
        image_id = spacedata.images[i].id;
        console.log(image_id);
        elements.push('<div class="item"><img src="/space/'+space_id+'/image/'+image_id+'/thumb/600x400" class="img"></div>');
    }
    return new Handlebars.SafeString(elements.join('\n'));
});

Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {

    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    operator = options.hash.operator || "==";

    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    }

    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

    var result = operators[operator](lvalue,rvalue);

    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});


(function(w){
	var sw = document.body.clientWidth,
		breakpoint = 767,
		speed = 600,
		mobile = true;

	$(document).ready(function() {

    	// check if a map_canvas exists... populate it
    	if ($("#map_canvas").length == 1) {
          initialize();
        }

		checkMobile();
		setDisplay();

		if (mobile) {

    		// initialize the carousel for mobile standalone space page
            initializeCarousel();
            resizeCarouselMapContainer();

            // scroll to the top of page
            $('#top_link').click(function(e){
                  // Prevent a page reload when a link is pressed
                  e.preventDefault();
                  // Call the scroll function
                  scrollTo('top');
            });

            // scroll to top of filter list
            $('#filter_link').click(function(e){
                  // Prevent a page reload when a link is pressed
                  e.preventDefault();
                  // Call the scroll function
                  scrollTo('info_list');
            });

		}




		// Toggle Filter display
		$('#filter_button').click(function() {
    		if ($("#filter_block").is(":hidden")) {

                $("#filter_block").slideDown('slow');

                if (mobile) {
                    //$('#map_canvas').hide();
                    //$('#info_list').hide();

                    $('#main_content').hide();

                    $('.back-top').hide();
                }

            } else {

                if (mobile) {
                    //$('#map_canvas').show();
                    //$('#info_list').show();
                    $('#main_content').show();

                    $('#filter_button_container').show();
                    $('.back-top').show();
                }

                $("#filter_block").slideUp('slow');
            }
        });

        // Close the filter display using Cancel button
        $('#cancel_results_button').click(function() {

            if (mobile) {
                //$('#map_canvas').show();
                //$('#info_list').show();

                $('#main_content').show();

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



        // handle view details click
        $('.view-details').live('click', function(e){

            // get the space id
            id =  $(this).attr('id');

            e.preventDefault();

            // clear previously selected space
            $('#info_items li').removeClass('selected');

            //highlight the selected space
            $(this).parent().addClass('selected');

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

        // Toggle between carousel and map
        $('.space-image-map-buttons button').live('click', function(e){

            if ($('#carouselControl').hasClass('active')) { // show the carousel
                $('#spaceCarouselContainer').show();
                $('#spaceMap').hide();
            }
            else { //show the map
                $('#spaceCarouselContainer').hide();
                $('#spaceMap').show();
                getSpaceMap(detailsLat, detailsLon);
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

	// Show space details (sliding transition)
	function showSpaceDetails(data) {

    	if (mobile) {
        	// change url
        	location.href = '/space/' + data.id;
    	}
    	else {

    	   // remove any open details
    	   $('#space_detail_container').remove();

        	// build the template
    	   var source = $('#space_details').html();
    	   var template = Handlebars.compile(source);
    	   $('#map_canvas').append(template(data));

    	   // set/reset initial state
    	   $('.space-detail-inner').show();
    	   $('#space_detail_container').show();

    	   $('#space_detail_container').height($('#map_canvas').height());
    	   $('.space-detail-body').height($('.space-detail').height() - 162);

    	   $('.space-detail').show("slide", { direction: "right" }, 700);

    	   initializeCarousel();
    	   resizeCarouselMapContainer();

    	   detailsLat = data.location.latitude;
    	   detailsLon = data.location.longitude;

    	}

	}

	// Replace space details (inline loading of already slid panel)
	function replaceSpaceDetails(data) {

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
    	   //$(".space-detail .loading").show();

    	   $('.space-detail-body').height($('.space-detail').height() - 162);

    	   $('.space-detail').show();

    	   // wait before showing the new space
    	   $(".space-detail-inner").delay(700).show(0, function() {
        	   initializeCarousel();
        	   resizeCarouselMapContainer();
           });

           detailsLat = data.location.latitude;
    	   detailsLon = data.location.longitude;
    	}


	}

	function hideSpaceDetails() {
        $('.space-detail').hide("slide", { direction: "right" }, 700, function() {
        	   $('#space_detail_container').remove();
        });

        // deselect selected space in list
        $('#info_items li').removeClass('selected');
	}

	// ScrollTo a spot on the UI
	function scrollTo(id) {
        // Scroll
        $('html,body').animate({ scrollTop: $("#"+id).offset().top},'fast');
    }

	// Desktop display defaults
	function desktopContent() {

    	var windowH = $(window).height();
        var headerH = $('#nav').height();
        var contentH = windowH - headerH;

        $('#map_canvas').height(contentH - 100);
        $('#info_list').height(contentH -80);

        // make sure loading and list height fills the list container
        $('#info_list .list-inner').css('min-height', contentH - 100);
        //$('.loading').height(contentH);
    }

    // Mobile display defaults
    function mobileContent() {

        var windowH = $(window).height();
        var headerH = $('#nav').height();
        //var contentH = windowH - headerH;
        //var mainContentH = windowH - headerH + 35;
        var mapH = windowH - headerH - 70; // enough to show the loading spinner at the bottom of the viewport

        $('#map_canvas').height(mapH);
        $('#map_canvas').css({ minHeight: mapH })
        $('#info_list').height('auto');

        //$('#main_content').height(mainContentH);
        //$('#main_content').css({ minHeight: mainContentH });
    }

    function initializeCarousel() {

        console.log("carousel initialized");

        $('.carousel').each(function(){
            $(this).carousel({
                interval: false
            });

            //set the first item as active
            $(this).find(".item:first-child").addClass("active");

            // hide the controls if only 1 picture exists
            if ($(this).find('.item').length == 1) {
                 $(this).find('.carousel-control').hide();
            }
        });


    }

    function resizeCarouselMapContainer() {

        // get the width
        var containerW = $('.image-container').width();

        // calcuate height based on 3:2 aspect ratio
        var containerH = containerW / 1.5;

        $('.carousel').height(containerH);
        $('.map-container').height(containerH);

    }

})(this);
