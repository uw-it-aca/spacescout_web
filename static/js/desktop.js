var detailsLat, detailsLon;

// Handlebars helpers
Handlebars.registerHelper('carouselimages', function(spacedata) {
    var space_id = spacedata.id;
    var elements = new Array;
    for (i=0; i < spacedata.images.length; i++) {
        image_id = spacedata.images[i].id;
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

(function(d){

	$(document).ready(function() {

		desktopContent();

		// Toggle Filter display
		$('#filter_button').click(function() {

    		if ($("#filter_block").is(":hidden")) {

                $("#filter_block").slideDown('slow');

                $('#filter_button').hide();
                $('#view_results_button').show();
                $('#cancel_results_button').show();


            } else {

                $('#filter_button').show();
                $('#view_results_button').hide();
                $('#cancel_results_button').hide();

                $("#filter_block").slideUp('slow');
            }
        });

        // Close the filter display using Cancel button
        $('#cancel_results_button').click(function() {

            // reset the map
            clear_custom_search();

            $('#filter_button').show();
            $('#view_results_button').hide();
            $('#cancel_results_button').hide();

            $("#filter_block").slideUp('slow');

            // reset checkboxes
            $('input[type=checkbox]').each(function() {
                if ($(this).attr('checked')) {
                    $(this).attr('checked', false);
                    $(this).parent().removeClass("selected");
                }
            });

            // reset capacity
            $('#capacity').val('1');

            // reset hours
            $('#open_now').prop('checked', true);
            $('#open_now').parent().removeClass("selected");
            $('#hours_list_container').hide();
            $('#hours_list_input').parent().removeClass("selected");

            // reset location
            $('#entire_campus').prop('checked', true);
            $('#entire_campus').parent().removeClass("selected");
            $('#building_list_container').hide();
            $('#building_list_input').parent().removeClass("selected");

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
                placeholder: "Select building(s)",
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

	// Update dimensions on resize
	$(d).resize(function(){

        // desktop
        desktopContent();

        // if the space details is already open
        if ($('#space_detail_container').is(":visible")) {
            $('#space_detail_container').height($('#map_canvas').height());
            $('.space-detail-body').height($('.space-detail').height() - 172);

            resizeCarouselMapContainer();
        }

	});

	// Show space details (sliding transition)
	function showSpaceDetails(data) {

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
    	   $('.space-detail-body').height($('.space-detail').height() - 172);

    	   $('.space-detail').show("slide", { direction: "right" }, 700);

    	   initializeCarousel();
    	   resizeCarouselMapContainer();

    	   detailsLat = data.location.latitude;
    	   detailsLon = data.location.longitude;

	}

	// Replace space details (inline loading of already slid panel)
	function replaceSpaceDetails(data) {

        	// build the template
    	   var source = $('#space_details_replace').html();
    	   var template = Handlebars.compile(source);
    	   $('#space_detail_container').html(template(data));

    	   // set/reset initial state
    	   $('.space-detail-inner').hide();
    	   //$(".space-detail .loading").show();

    	   $('.space-detail-body').height($('.space-detail').height() - 172);

    	   $('.space-detail').show();

    	   // wait before showing the new space
    	   //$(".space-detail-inner").delay(300).show(0, function() {
           //   initializeCarousel();
           //   resizeCarouselMapContainer();
           //});

           // fade the new space in
           $('.space-detail-inner').fadeIn('400', function() {
                resizeCarouselMapContainer();
                initializeCarousel();
            });

           detailsLat = data.location.latitude;
    	   detailsLon = data.location.longitude;

	}

	function hideSpaceDetails() {
        $('.space-detail').hide("slide", { direction: "right" }, 700, function() {
            $('#space_detail_container').remove();
        });

        // deselect selected space in list
        $('#info_items li').removeClass('selected');
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

    function initializeCarousel() {

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