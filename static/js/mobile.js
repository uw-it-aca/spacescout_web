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

(function(m) {


    var deviceAgent = navigator.userAgent.toLowerCase();

    // detect ios versions
	var iphone = deviceAgent.match(/(ipad|iphone)/);
	var ios56 = navigator.userAgent.match(/OS [56](_\d)+ like Mac OS X/i);

    // detect android versions
    var android = deviceAgent.match(/(android)/);
    var gingerbread = deviceAgent.match(/android 2\.3/i);
    var gingerbreadOrNewer = deviceAgent.match(/android [2-9]/i);
    var honeycombOrNewer = deviceAgent.match(/android [3-9]/i);
    var froyoOrOlder = android && !gingerbread && !honeycombOrNewer;

	$(document).ready(function() {

    	// check if a map_canvas exists... populate it
    	if ($("#map_canvas").length == 1) {
          initialize();
        }


		mobileContent();


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

        // back to spaces button on mobile space details page
        $('#back_home_button').click(function() {
            location.href = '/';
        });

        // for iphones (ios5-6) - check if they have the ios detector cookie, if they don't give them one and show the popup
        // otherwise, don't do anything since they've already seen the popup
        if (iphone && ios56) {
            if (!$.cookie('showSpaceScoutiOS')){
                $.cookie('showSpaceScoutiOS', 'true');
                showIosCallout();
            }
        }



		// Toggle Filter display
		$('#filter_button').click(function() {

    		// calculate the filter height for mobile browsers

    		$("#filter_block").height($(window).height() - $('#nav').height() - 10);


    		if ($("#filter_block").is(":hidden")) {

                $("#filter_block").slideDown('slow');

                $('#filter_button').hide();
                $('#view_results_button').show();
                $('#cancel_results_button').show();


                    // if mobile
                    $('#main_content').hide();
                    $('#footer').hide();
                    $('.back-top').hide();

                    // handle scrolling for android gingerbread or newer
            		if (gingerbreadOrNewer) {
                		touchScroll("filter_block");
            		}


            } else {


                    // if mobile
                    $('#main_content').show();
                    $('#footer').show();
                    $('.back-top').show();


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

            // if mobile
                $('#main_content').show();
                $('#footer').show();
                $('.back-top').show();


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

            $.ajax({
                url: '/space/'+id+'/json/',
                success: showSpaceDetails
            });

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

        // handle clicking on map centering buttons
        $('#center_all').live('click', function(e){
            alert("center all");
        });

        $('#center_me').live('click', function(e){
            alert("center me");
        });

	});

	// Update dimensions on resize
	$(m).resize(function(){


	   mobileContent();

	});


	// Show space details (sliding transition)
	function showSpaceDetails(data) {

        	// change url
        	location.href = '/space/' + data.id;

	}


	// ScrollTo a spot on the UI
	function scrollTo(id) {
        // Scroll
        $('html,body').animate({ scrollTop: $("#"+id).offset().top},'fast');
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

        //$("#filter_block").height(mapH + 60);

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

    // callout for ios5-6 native app
    function showIosCallout() {


        $('#ios_callout').show(0, function() {
            // Animation complete.
            $('.ios-inner-container').show("slide", { direction: "down" }, 700);
            // disable the iphone scroll
            document.ontouchmove = function(event){ event.preventDefault(); }
        });

        $('#continue_webapp').click(function() {
            // close the modal
            $('#ios_callout').hide();
            // enable scrolling
            document.ontouchmove = function(event){ return true; }
        });

        $('#download_native').click(function() {
            // redirect to app store
            window.location = "http://itunes.apple.com/us/app/spacescout/id551472160";
            // enable scrolling
            document.ontouchmove = function(event){ return true; }
        });
    }

    // enable div overflow scrolling for android
    function touchScroll(id) {

		var el=document.getElementById(id);
		var scrollStartPos=0;

		document.getElementById(id).addEventListener("touchstart", function(event) {
			scrollStartPos=this.scrollTop+event.touches[0].pageY;
			event.preventDefault();
		},false);

		document.getElementById(id).addEventListener("touchmove", function(event) {
			this.scrollTop=scrollStartPos-event.touches[0].pageY;
			event.preventDefault();
		},false);

    }




})(this);
