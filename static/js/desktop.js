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

    sbutler1@illinois.edu: attr(checked) to prop(checked); focus on
      spot details.
*/

Handlebars.registerHelper('ifany', function(a, b) {
    // if anything passed is true, return true
    if (a || b) {
        return fn(this);
    }
});

(function(d){

	var sw = document.body.clientWidth,
		breakpoint = 767,
		speed = 600,
		mobile = true;

    var deviceAgent = navigator.userAgent.toLowerCase();
	var iphone = deviceAgent.match(/(iphone|ipod)/);

	$(document).ready(function() {
        var nodes = $('.logo, .actions + h2');

        nodes.css('cursor', 'pointer');
        nodes.click(function () {
            window.location.href = window.spacescout_referrer.length ? window.spacescout_referrer : '/';
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

            return;
        }

		desktopContent();

	   // check if a map_canvas exists... populate it
    	if ($("#map_canvas").length == 1) {
          initialize();
        }

		// show filter panel
		$('#filter_button').click(function() {
            var block = $("#filter_block");

            if (block.css('display') == 'none') {
                // reflect current filter
                if (window.hasOwnProperty('spacescout_search_options')) {
                    clear_filter();
                    repopulate_filters(window.spacescout_search_options);
                }

                block.slideDown(400, function() {
                    var icon = $('.fa-angle-double-down');

                    if (icon.length) {
                        icon.switchClass('fa-angle-double-down', 'fa-angle-double-up', 0);
                    }

                    $('#study_room').focus();
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
        });

        $('#neighboring').blur(function() {
            $('#cancel_results_button').focus();
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
            // clear the initial_load cookie so we can use the in-page json
            $.removeCookie('initial_load');
        });


        // handle view details click
        $(document).on('click', '.view-details', function(e){
            var id = $(this).find('.space-detail-list-item').attr('id');

            e.preventDefault();
            // clear previously selected space
            $('#info_items li').removeClass('selected');

            fetchSpaceDetails(id);

            // Update location hash
            window.spacescout_url.push(id);

        });

        $(document).on('loadSpaceDetail', function (e, id) {
            if (id) {
                $('#info_items li').removeClass('selected');
                fetchSpaceDetails(id);
            }
        });

	});

	// Update dimensions on resize
	$(d).resize(function(){

        // desktop
        desktopContent();

        // if the space details is already open
        if ($('.space-detail-container').is(":visible")) {
            $('.space-detail-container').height($('#map_canvas').height());
            $('.space-detail-body').height($('.space-detail').height() - 98);

            resizeCarouselMapContainer();
        }

	});

    function fetchSpaceDetails(id){
        // clear any uneeded ajax window.requests
        $.each(window.requests, function () {
            this.abort();
        });

        // fetch and paint details
        window.requests.push(
            $.ajax({
                url: '/space/'+id+'/json/',
                success: showSpaceDetails
            })
        );
    }

	// Show space details (sliding transition)
	function showSpaceDetails(data) {
        // format last modified date
        var last_mod= new Date(data["last_modified"]);
        var month = last_mod.getMonth();
        var day = last_mod.getDate();
        var year = last_mod.getFullYear();
        data["last_modified"] = month + "/" + day + "/" + year;

        // campuses match?
        if (data['extended_info'].hasOwnProperty('campus')) {
            $('#location_select option').each(function (i) {
                var location = $(this).val().split(',');

                if (location[2] == data['extended_info']['campus']) {
                    if (!$(this).is(':selected')) {
                        $(this).attr('selected', 'selected');
                        $(this).trigger('change');
                    }
                }
            });
        }

        // check to see if the space has the following
        data["has_notes"] = ( ( data.extended_info.access_notes != null) || ( data.extended_info.reservation_notes != null) );
        data["has_resources"] = ( data.extended_info.has_computers != null || data.extended_info.has_displays != null || data.extended_info.has_outlets != null || data.extended_info.has_printing != null || data.extended_info.has_projector != null || data.extended_info.has_scanner != null || data.extended_info.has_whiteboards != null );

    	// remove any open details
        var open = (!$('.space-detail-container').is(':visible'));

        $('.space-detail-container').remove();

        // build the template
    	var source = $('#space_details').html();
    	var template = Handlebars.compile(source);
    	$('#map_canvas').append(template(data));

        initMapCarouselButtons();

    	// set/reset initial state

        $('.space-detail-inner').show();
        $('.space-detail-container').show();

        //set focus on the closing x

        $('.space-detail-container').height($('#map_canvas').height());
        $('.space-detail-body').height($('.space-detail').height() - 98);

        //TODO: make these identical anonymous callback functions a real named function.  Had unknown scope problems doing this before
        if (!open) {
            $('.space-detail').show("slide", { direction: "right" }, 400, function () {
                $('.close').focus();
                $('.btn.active').attr("tabindex", -1);
                $('.space-detail-body').attr("tabindex", -1);
                $('.carousel-nav ul li a').each(function () {
                    $(this).attr("tabindex", -1);
                });
                $('.space-detail-report a').blur(function () {
                    $('.close').focus();
                });
            });
        } else {
            $('.space-detail').show(0, function() {
                $('.close').focus();
                $('.btn.active').attr("tabindex", -1);
                $('.space-detail-body').attr("tabindex", -1);
                $('.carousel-nav ul li a').each(function () {
                    $(this).attr("tabindex", -1);
                });
                $('.space-detail-report a').blur(function () {
                    $('.close').focus();
                });
            });
        }

    	initializeCarousel();

        replaceUrls();

        $('.space-detail-header .close').on('click', function(e){
            e.preventDefault();
            window.spacescout_url.push();
            closeSpaceDetails();
        });

        // set up favorites
        var fav_icon = $('.space-detail-header .space-detail-fav');
        var fav_icon_i = $('i', fav_icon);

        if (fav_icon.is(':visible')) {
            var title = 'Favorite this space',
                auth_user = window.spacescout_authenticated_user;

            if (auth_user.length && window.spacescout_favorites.is_favorite(data.id)) {
                fav_icon.removeClass('space-detail-fav-unset').addClass('space-detail-fav-set');
                fav_icon_i.removeClass('fa-heart-o').addClass('fa-heart');
                title = 'Remove this space from favorites';
            } else {
                fav_icon.removeClass('space-detail-fav-set').addClass('space-detail-fav-unset');
                fav_icon_i.removeClass('fa-heart').addClass('fa-heart-o');
            }

            fav_icon.unbind();
            is_over_favs = false;
            fav_icon.on('mouseover', function() {
                is_over_favs = true;
            });
            fav_icon.on('mouseout', function() {
                is_over_favs = false;
            });
            fav_icon.click(function (e) {
                var list_item = $('button#' + data.id + ' .space-detail-fav');

                if (auth_user.length < 1) {
                    window.location.href = '/login?next=' + window.location.pathname;
                }


                window.spacescout_favorites.toggle(data.id,
                                                   function () {
                                                       fav_icon.removeClass('space-detail-fav-unset').addClass('space-detail-fav-set');
                                                       fav_icon_i.removeClass('fa-heart-o').addClass('fa-heart');
                                                       list_item.show();
                                                       fav_icon.tooltip('hide');
                                                       fav_icon.data('tooltip', false);
                                                       fav_icon.tooltip({ title: 'Remove this space from Favorites',
                                                                          placement: 'right' });

                                                        if (is_over_favs) {
                                                            fav_icon.tooltip('show');
                                                        }
                                                   },
                                                   function () {
                                                       fav_icon.removeClass('space-detail-fav-set').addClass('space-detail-fav-unset');
                                                       fav_icon_i.removeClass('fa-heart').addClass('fa-heart-o');
                                                       list_item.hide();
                                                       fav_icon.tooltip('hide');
                                                       fav_icon.data('tooltip', false);
                                                       fav_icon.tooltip({ title: 'Favorite this space',
                                                                          placement: 'right' });
                                                        if (is_over_favs) {
                                                            fav_icon.tooltip('show');
                                                        }

                                                   });
            });

            fav_icon.tooltip({ placement: 'right', title: title});
        }

        $('a#share_space').unbind('click');
        $('a#share_space').click(function (e) {
            var url = '/share/' + data.id
                    + '?back=' + encodeURIComponent(window.location.pathname);

            if (window.spacescout_authenticated_user.length < 1) {
                window.location.href = '/login?next=' + encodeURIComponent(url);
            } else {
                window.location.href = url;
            }
        });

        //highlight the selected space
        $('button#' + data.id).closest('.view-details').addClass('selected');

        // Set focus on details container
        $('.space-detail-inner').focus();
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

})(this);
