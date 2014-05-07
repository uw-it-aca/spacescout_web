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
    sbutler1@illinois.edu: fix obvious JSHint bugs.
    sbutler1@illinois.edu: formatting fixes plus hide non-global
      variables/functions.
*/

// $ = jQuery
(function ($) {

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

    $(document).ready(function() {

        _setMobileContentHeights();

        // check if a map_canvas exists... populate it
        if ($("#map_canvas").length == 1) {
            initialize();
        }

        // initialize the carousel for mobile standalone space page
        initializeCarousel();
        resizeCarouselMapContainer();
        replaceUrls();

        if ($(".space-detail-body").length == 1) {
            initMapCarouselButtons();
        }

        // scroll to the top of page
        $('#top_link').click(function (e) {
              // Prevent a page reload when a link is pressed
              e.preventDefault();
              // Call the scroll function
              _scrollTo('top');
        });

        // scroll to top of filter list
        $('#filter_link').click(function (e) {
              // Prevent a page reload when a link is pressed
              e.preventDefault();
              // Call the scroll function
              _scrollTo('info_list');
        });

        // back to spaces button on mobile space details page
        $('#back_home_button').click(function () {
            location.href = '/';
        });

        // for iphones (ios5) - check if they have the ios detector cookie, if they don't give them one and show the popup
        // otherwise, don't do anything since they've already seen the popup --- updated ios6 supports smart banners
        if (iphone && ios5 || iphone && chrome ) {
            if (!$.cookie('showSpaceScoutiOS')) {
                $.cookie('showSpaceScoutiOS', 'true');
                _showIosCallout();
            }
        }

        // show filter panel
        $('#filter_button').click(function () {
            var block = $("#filter_block");

            // calculate the filter block height
//          _resizeFilterBlock();

            if (block.css('display') == 'none') {
                // reflect current filter
                if (window.hasOwnProperty('spacescout_search_options')) {
                    clear_filter();
                    repopulate_filters(window.spacescout_search_options);
                }

                // slide down the filter block
                $("#filter_block").slideDown(400, function () {
                    // hide the main content (map and list) by setting a height on the main container and hiding overflow
                    var icon = $('.fa-angle-double-down');

                    if (icon.length) {
                        icon.switchClass('fa-angle-double-down', 'fa-angle-double-up', 0);
                    }

//                  _setFilterContainer();
                });
            } else {
                block.slideUp(400, function () {
                    var icon = $('.fa-angle-double-up');

                    if (icon.length) {
                        icon.switchClass('fa-angle-double-up', 'fa-angle-double-down', 0);
                    }
                });
            }

            // show the correct buttons
//          $('#filter_button').hide();
//          $('#spacecount').hide();
//          $('#space_count_container').hide();
//          $('#done-clear-group').show();
//          $('#view_results_button').show();
//          $('#cancel_results_button').show();

            // handle scrolling for android froyo or newer
            if (android || gingerbreadOrNewer) {
                touchScroll("filter_block");
            }

        });

        // clear filters
        $('#cancel_results_button').click(function () {

            $('#filter-clear').slideDown(50);
            $('#filter-clear').delay(1000).fadeOut(500);
            // clear saved search options
//          if ($.cookie('spacescout_search_opts')) {
//              $.removeCookie('spacescout_search_opts');
//          }

            clear_filter();

            // remove initial_load cookie so we can use the in-page json
            $.removeCookie('initial_load');
        });

        // handle view details click
        $('.view-details').live('click', function (e) {

            // get the space id
            var id =  $(this).find('.space-detail-list-item').attr('id');

            e.preventDefault();

            //clear any unneded pending ajax window.requests
            for (var i = 0; i < window.requests.length; i++) {
                window.requests[i].abort();
            }
            window.requests.push(
                $.ajax({
                    url: '/space/'+id+'/json/',
                    success: _showSpaceDetails
                })
            );

        });
    });

    // Update dimensions on orientation change
    $(document).bind('orientationchange', function () {

        landscape = (window.orientation == 90) || (window.orientation == -90);

        _setMobileContentHeights();
        resizeCarouselMapContainer();

        if ($('#filter_block').is(":visible")) {
//          _resizeFilterBlock();
//          _setFilterContainer();
        }

    });


    // set a height for main container and hide any overflowing
    function _setFilterContainer() {

          var filterH = $(window).height();

          $('#container').height(filterH);
          $('#container').css({
              overflow: 'hidden',
          });
    }

    // Show space details
    function _showSpaceDetails(data) {
        // change url
        location.href = '/space/' + data.id;
    }


    // ScrollTo a spot on the UI
    function _scrollTo(id) {
        // Scroll
        $('html,body').animate({scrollTop: $("#"+id).offset().top}, 'fast');
    }

    // Mobile display defaults
    function _setMobileContentHeights() {

        var windowH = $(window).height();
        var headerH = $('#nav').height();
        var mapH = windowH - headerH;

        if (ipad) {
            if (landscape) {
                mapH = mapH - 150; // give plenty of room to show space list
            } else {
                mapH = mapH - 380; // give plenty of room to show space list
            }
        } else {
            mapH = mapH - 50; // enough to show the loading spinner at the bottom of the viewport
        }

        $('#map_canvas').height(mapH);
        $('#map_canvas').css({ minHeight: mapH });
        $('#info_list').height('auto');
    }

/*
    function _resizeFilterBlock() {
        var winH = $(window).height();
        $("#filter_block").height(winH - 110);
    }
*/

    // callout for ios5-6 native app
    function _showIosCallout() {

        $('#ios_callout').show(0, function () {
            // Animation complete.
            $('.ios-inner-container').show("slide", { direction: "down" }, 700);
            // disable the iphone scroll
            document.ontouchmove = function (event) { event.preventDefault(); };
        });

        $('#continue_webapp').click(function() {
            // close the modal
            $('#ios_callout').hide();
            // enable scrolling
            document.ontouchmove = function (event) { return true; };
        });

        $('#download_native').click(function () {
            // redirect to app store
            window.location = "http://itunes.apple.com/us/app/spacescout/id551472160";
            // enable scrolling
            document.ontouchmove = function (event) { return true; };
        });
    }

    // enable div overflow scrolling for android
    function touchScroll(id) {
        var el = document.getElementById(id);
        var scrollStartPos=0;

        // jQuery doesn't have anything for touchmove?
        el.addEventListener("touchstart", function (event) {
          scrollStartPos = this.scrollTop + event.touches[0].pageY;
        }, false);

        el.addEventListener("touchmove", function (event) {
          this.scrollTop = scrollStartPos - event.touches[0].pageY;
        }, false);
    }

})(jQuery);
