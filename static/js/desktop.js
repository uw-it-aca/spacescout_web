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
    sbutler1@illinois.edu: fix obvious JSHint bugs
    sbutler1@illinois.edu: formatting fixes plus hide non-global
      variables/functions.
*/

// H = Handlebars, $ = jQuery
(function (H, $) {
    window.speed = 600;

    H.registerHelper('ifany', function(a, b) {
        // if anything passed is true, return true
        if (a || b) {
            return fn(this);
        }
    });

    $(document).ready(function() {

        _desktopContent();

        // check if a map_canvas exists... populate it
        if ($("#map_canvas").length == 1) {
            initialize();
        }

        // show filter panel
        $('#filter_button').click(function() {
            var $block = $("#filter_block");

            if ($block.css('display') == 'none') {
                // reflect current filter
                if (window.hasOwnProperty('spacescout_search_options')) {
                    clear_filter();
                    repopulate_filters(window.spacescout_search_options);
                }

                $block.slideDown(400, function() {
                    var $icon = $('.fa-angle-double-down');

                    if ($icon.length) {
                        $icon.switchClass('fa-angle-double-down', 'fa-angle-double-up', 0);
                    }

                    $('#study_room').focus();
                });
            } else {
                $block.slideUp(400, function() {
                    var $icon = $('.fa-angle-double-up');

                    if ($icon.length) {
                        $icon.switchClass('fa-angle-double-up', 'fa-angle-double-down', 0);
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
        $('.view-details').live('click', function(e){

            // get the space id
            var id =  $(this).find('.space-detail-list-item').attr('id');

            e.preventDefault();

            // clear any uneeded ajax window.requests
            for (var i = 0; i < window.requests.length; i++) {
                window.requests[i].abort();
            }
            window.requests.push(
                $.ajax({
                    url: '/space/'+id+'/json/',
                    success: _showSpaceDetails
                })
            );

             // clear previously selected space
            $('#info_items li').removeClass('selected');
            //highlight the selected space
            $(this).addClass('selected');

        });

        $('.space-detail-container .close').live('click', function(e) {
            e.preventDefault();
            closeSpaceDetails();
        });
    });

    // Update dimensions on resize
    $(document).resize(function(){

        // desktop
        _desktopContent();

        // if the space details is already open
        if ($('.space-detail-container').is(":visible")) {
            $('.space-detail-container').height($('#map_canvas').height());
            $('.space-detail-body').height($('.space-detail').height() - 98);

            resizeCarouselMapContainer();
        }

    });

    // Show space details (sliding transition)
    function _showSpaceDetails(data) {
        // format last modified date
        var last_mod= new Date(data["last_modified"]);
        var month = last_mod.getMonth();
        var day = last_mod.getDate();
        var year = last_mod.getFullYear();
        data["last_modified"] = month + "/" + day + "/" + year;

        // check to see if the space has the following
        data["has_notes"] = ( data.extended_info.access_notes || data.extended_info.reservation_notes );
        data["has_resources"] = ( data.extended_info.has_computers || data.extended_info.has_displays || data.extended_info.has_outlets || data.extended_info.has_printing || data.extended_info.has_projector || data.extended_info.has_scanner || data.extended_info.has_whiteboards );

        // remove any open details
        var open = $('.space-detail-container').is(':visible');
        $('.space-detail-container').remove();

        // build the template
        var source = $('#space_details').html();
        var template = H.compile(source);
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

        // set up favorites
        var fav_icon = $('.space-detail-container .space-detail-fav');

        if (fav_icon.is(':visible')) {
            var title = 'Favorite this space';

            if (window.spacescout_favorites.is_favorite(data.id)) {
                fav_icon.addClass('space-detail-fav-set');
                title = 'Remove this space from favorites';
            } else {
                fav_icon.removeClass('space-detail-fav-set');
            }

            fav_icon.unbind();
            fav_icon.click(function (e) {
                var list_item = $('button#' + data.id + ' .space-detail-fav');

                window.spacescout_favorites.toggle(
                    data.id,
                    function () {
                        fav_icon.addClass('space-detail-fav-set');
                        list_item.show();
                        fav_icon.tooltip('hide');
                        fav_icon.data('tooltip', false);
                        fav_icon.tooltip({
                            title: 'Remove this space from Favorites',
                            placement: 'right'
                        });
                        fav_icon.tooltip('show');
                    },
                    function () {
                        fav_icon.removeClass('space-detail-fav-set');
                        list_item.hide();
                        fav_icon.tooltip('hide');
                        fav_icon.data('tooltip', false);
                        fav_icon.tooltip({
                            title: 'Favorite this space',
                            placement: 'right'
                        });
                        fav_icon.tooltip('show');
                    }
                );
           });

           fav_icon.tooltip({placement: 'right', title: title});
       }

       // Set focus on details container
       $('.space-detail-inner').focus();
    }

    // Desktop display defaults
    function _desktopContent() {

        var windowH = $(window).height();
        var headerH = $('#nav').height();
        var contentH = windowH - headerH;

        $('#map_canvas').height(contentH - 100);
        $('#info_list').height(contentH - 80);

        // make sure loading and list height fills the list container
        $('#info_list .list-inner').css('min-height', contentH - 100);
        //$('.loading').height(contentH);
    }

})(Handlebars, jQuery);
