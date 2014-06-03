/*
    Copyright 2012 UW Information Technology, University of Washington

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

    Changes
    =================================================================

    sbutler1@illinois.edu: attr(checked) to prop(checked).
*/

(function(m) {

    var deviceAgent = navigator.userAgent.toLowerCase();

    // detect ladscape orientation
    var landscape = (window.orientation) == 90 || (window.orientation == -90);

    // detect chrome ios
    var chrome = deviceAgent.match(/(crios)/);

    // detect ios versions
	var iphone = deviceAgent.match(/(iphone)/);
	var ipad = deviceAgent.match(/(ipad)/);
	var ios5 = navigator.userAgent.match(/OS [5](_\d)+ like Mac OS X/i);
	var ios56 = navigator.userAgent.match(/OS [56](_\d)+ like Mac OS X/i);

    // detect android versions
    var android = deviceAgent.match(/(android)/);
    var gingerbread = deviceAgent.match(/android 2\.3/i);
    var gingerbreadOrNewer = deviceAgent.match(/android [2-9]/i);
    var honeycombOrNewer = deviceAgent.match(/android [3-9]/i);
    var froyoOrOlder = android && !gingerbread && !honeycombOrNewer;

    window.spacescout_web_mobile = {};

    window.spacescout_web_mobile.show_main_app = function () {
        $('#main_space_detail').hide();
        $('#main_app').show();

		setMobileContentHeights();

        if (window.spacescout_map) {
            google.maps.event.trigger(window.spacescout_map, "resize");
        }
    };

    window.spacescout_web_mobile.show_space_detail = function(id) {
        $('#main_space_detail').html('');
        $('#main_space_detail').show();
        $('#main_app').hide();
        loadSpaceDetails(id);
    };

	$(document).ready(function() {

        $('.logo').click(function () {
            window.location.href = '/';
        });

        // share destination typeahead
        if ($('#id_recipient').length) {
            var node = $('#id_recipient');

            var engine = new Bloodhound({
                datumTokenizer: function (d) {
                    return Blookdhound.tokenizers.whitespace(d.email);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                limit: 15,
                remote: 'web_api/v1/directory/?q=%QUERY'
            });

            engine.initialize();

            node.addClass('tokenfield');
            node.tokenfield({
                delimiter: [',', '\t'],
                createTokensOnBlur: true,
                typeahead: [null, {
                    displayKey: 'email',
                    minLength: 3,
                    source: engine.ttAdapter()
                }]
            });
        }

        if (window.spacescout_url) {
            var state = window.spacescout_url.parse_path(window.location.pathname);
            if (state.id) {
                window.spacescout_web_mobile.show_space_detail(state.id);
            } else {
                window.spacescout_web_mobile.show_main_app();
            }
        }

	    // check if a map_canvas exists... populate it
    	if ($("#map_canvas").length == 1) {
            initialize();
        }

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

        // back to spaces button on contact, share and suggest pages
        var nodes = $('#back_home_button, #back_home_button + div > h2');

        nodes.css('cursor', 'pointer');
        nodes.click(function () {
            window.location.href = window.spacescout_referrer.length ? window.spacescout_referrer : '/';
        });

        // for iphones (ios5) - check if they have the ios detector cookie, if they don't give them one and show the popup
        // otherwise, don't do anything since they've already seen the popup --- updated ios6 supports smart banners
        if (iphone && ios5 || iphone && chrome ) {
            if (!$.cookie('showSpaceScoutiOS')){
                $.cookie('showSpaceScoutiOS', 'true');
                showIosCallout();
            }
        }

		// show filter panel
		$('#filter_button').click(function() {
            var block = $("#filter_block");

            if (block.css('display') == 'none') {
                get_location_buildings();

                // reflect current filter
                if (window.hasOwnProperty('spacescout_search_options')) {
                    clear_filter();
                    repopulate_filters(window.spacescout_search_options);
                }

    		    // slide down the filter block
                $("#filter_block").slideDown(400, function() {
                    // hide the main content (map and list) by setting a height on the main container and hiding overflow
                    var icon = $('.fa-angle-double-down');

                    if (icon.length) {
                        icon.switchClass('fa-angle-double-down', 'fa-angle-double-up', 0);
                    }
                });
            }
            else {
                block.slideUp(400, function() {
                    var icon = $('.fa-angle-double-up');

                    if (icon.length) {
                        icon.switchClass('fa-angle-double-up', 'fa-angle-double-down', 0);
                    }
                });
            }

            // show the correct buttons
//            $('#filter_button').hide();
//            $('#spacecount').hide();
//            $('#space_count_container').hide();
//            $('#done-clear-group').show();
//            $('#view_results_button').show();
//            $('#cancel_results_button').show();

            // handle scrolling for android froyo or newer
    		if (android || gingerbreadOrNewer) {
        		touchScroll("filter_block");
    		}

        });

        // clear filters
        $('#cancel_results_button').click(function() {

            $('#filter-clear').slideDown(50);
            $('#filter-clear').delay(1000).fadeOut(500);
            // clear saved search options
//            if ($.cookie('spacescout_search_opts')) {
//                $.removeCookie('spacescout_search_opts');
//            }

            clear_filter();

            // remove initial_load cookie so we can use the in-page json
            $.removeCookie('initial_load');
        });

        $('#login_button').click(function (e) {
            e.preventDefault();
            window.location.href = '/login'
                + '?next=' + encodeURIComponent(window.location.pathname);
        });

        $('#logout_button').click(function (e) {
            e.preventDefault();
            window.location.href = '/logout'
                + '?next=' + encodeURIComponent(window.location.pathname);
        });

        $('a span.favorites_count_container').parent().click(function (e) {
            e.preventDefault();
            window.location.href = '/favorites'
                + '?back=' + encodeURIComponent(window.location.pathname);
        });

        $(document).on('searchResultsLoaded', function (e, data) {
            // handle view details click
            $('.view-details').on('click', function(e){

                // get the space id
                var id =  $(this).find('.space-detail-list-item').attr('id');

                e.preventDefault();

                window.spacescout_web_mobile.show_space_detail(id);
            });


            $('#space_count_container .count').html(data.count);
        });

	});

	// Update dimensions on orientation change
	$(m).bind('orientationchange', function() {

        landscape = (window.orientation) == 90 || (window.orientation == -90);

        setMobileContentHeights();
        resizeCarouselMapContainer();
    });

    // fetch and show space 
    function loadSpaceDetails(id) {
        //clear any uneeded pending ajax window.requests
        $.each(window.requests, function () {
            this.abort();
        });

        window.requests.push(
            $.ajax({
                url: '/space/'+id+'/json/',
                success: showSpaceDetails,
                error: showSpaceDetailError
                
            })
        );
    }

	// set a height for main container and hide any overflowing
	function setFilterContainer() {

        var filterH = $(window).height();

        $('#container').height(filterH);
        $('#container').css({
            overflow: 'hidden'
        });
	}

	// Show space details
	function showSpaceDetails(data) {
    	var source = $('#space_details').html();
    	var template = Handlebars.compile(source);

        data.has_access_reservation_notes = (data.extended_info.access_notes
                                             || data.extended_info.reservation_notes);
        data.has_labstats = (data.extended_info.labstats_id
                             && data.extended_info.auto_labstats_total
                             && data.extended_info.auto_labstats_total != '0');
        data.has_labstats_available = (data.extended_info.auto_labstats_available > '0');
        data.has_resources = (data.extended_info.has_computers
                              || data.extended_info.has_displays
                              || data.extended_info.has_outlets
                              || data.extended_info.has_printing
                              || data.extended_info.has_projector
                              || data.extended_info.has_scanner
                              || data.extended_info.has_whiteboards);

        data["review_count"] = (data.extended_info.review_count) || 0;
        data["stars"] = [];
        var rating = parseFloat(data.extended_info.rating) || 0;
        for (var star_pos = 1; star_pos <= 5; star_pos++) {
            if (rating == star_pos - 0.5) {
                data.stars.push({ "icon": "fa-star-half-o" });
            }
            else if (star_pos <= rating) {
                data.stars.push({ "icon": "fa-star" });
            }
            else {
                data.stars.push({ "icon": "fa-star-o" });
            }
        }

    	$('#main_space_detail').html(template(data));

        $('html, body').animate({ scrollTop: 0 }, 'fast');

        window.spacescout_url.push(data.id);

        initializeCarousel();
        resizeCarouselMapContainer();
        replaceReservationNotesUrls();
        initMapCarouselButtons();

        $('#back_home_button').css('cursor', 'pointer');
        $('#back_home_button').click(function(e) {
            var m =  window.location.pathname.match(/\/(\d+)\/?$/);

            window.spacescout_web_mobile.show_main_app();
            window.spacescout_url.push(null);

            if (m) {
                window.location.hash = '#space_detail_' + m[1];
            }
        });

        // set us up teh favorites
        window.spacescout_favorites.update_favorites_button(data.id);

        setupRatingsAndReviews(data);
        loadRatingsAndReviews(data.id, $('.space-reviews-content'), $('.space-actions'));

        // set up share space
        $('button#share_space').unbind('click');
        $('button#share_space').click(function (e) {
            var id =  window.location.pathname.match(/(\d+)\/?$/)[1];

            window.location.href = '/share/' + id
                + '?back=' + encodeURIComponent(window.location.pathname);
        });
	}

	function showSpaceDetailError(data) {
        var error;

    	var source = $('#space_detail_error').html();
    	var template = Handlebars.compile(source);

        switch (data.status) {
        case 404:
            error = 'The requested space could not be found.';
            break;
        default:
            error = 'Unable to load details for this space';
            break;
        };

    	$('#main_space_detail').html(template({ error_message: error }));

        window.spacescout_url.push(null);

        $('#back_home_button').css('cursor', 'pointer');
        $('#back_home_button').click(function(e) {
            window.spacescout_web_mobile.show_main_app();
        });
    }

	// ScrollTo a spot on the UI
	function scrollTo(id) {
        // Scroll
        $('html,body').animate({ scrollTop: $("#"+id).offset().top},'fast');
    }

    // Mobile display defaults
    function setMobileContentHeights() {

        var windowH = $(window).height();
        var headerH = $('#nav').height();
        var mapH = windowH - headerH;

        if (ipad) {
            if (landscape) {
                mapH = mapH - 150; // give plenty of room to show space list
            }
            else {
                mapH = mapH - 380; // give plenty of room to show space list
            }
        }
        else
        {
            mapH = mapH - 50; // enough to show the loading spinner at the bottom of the viewport
        }

        $('#map_canvas').height(mapH);
        $('#map_canvas').css({ minHeight: mapH });
        $('#info_list').height('auto');
    }

/*    function resizeFilterBlock() {
        var winH = $(window).height();
        $("#filter_block").height(winH - 110);
    }
*/

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
		},false);

		document.getElementById(id).addEventListener("touchmove", function(event) {
			this.scrollTop=scrollStartPos-event.touches[0].pageY;
		},false);

    }

})(this);
