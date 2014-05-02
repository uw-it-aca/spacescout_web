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

    sbutler1@illinois.edu: attr(checked) to prop(checked); open_anytime
      option.
    sbutler1@illinois.edu: cleanup of obvious bugs highighted by JSHint.
    sbutler1@illinois.edu: added events to handle custom filter options;
      removed open_anytime and used the events instead.
*/

var spacescout_map = null, spacescout_markers = [], speed = 800, update_count = null;

// H = Handlebars, $ = jQuery, GM = google.maps
(function (H, $, GM) {
    var spacescout_marker_ids = {};
    // var mc = null;
    var youarehere = null;

    function openAllMarkerInfoWindow(data) {
        var source = $('#all_markers').html();
        var template = H.compile(source);
        data = buildingNameHeaders(data);
        $('#info_items').html(template({'data': data}));
        $('.loading').slideUp('fast');

        // load and update favorites
        if ($(window.spacescout_favorites.k.favorites_count_container).length == 1) {
            window.spacescout_favorites.load();

            if (window.hasOwnProperty('spacescout_favorites_refresh')
                && window.spacescout_favorites_refresh) {
                window.clearInterval(window.spacescout_favorites_refresh);
                window.spacescout_favorites_refresh = null;
            }

            // refresh favorites favorite cues every 10 seconds
            window.spacescout_favorites_refresh = window.setInterval(function () {
                window.spacescout_favorites.load();
            }, 10000);
        }

        //_lazyLoadSpaceImages();

        $(document).ready(function () {
            if ($.cookie('spot_id')) {
                var $spot = $('#' + $.cookie('spot_id'));
                var scroll_spot_id = null;

                if ($spot.parent().prev().prev().children()[1]) { // for normal case when there are two before clicked in ol
                    scroll_spot_id = $spot.parent().prev().prev().children()[1].id;
                } else if ($spot.parent().parent().prev().prev()[0]) { // if there is an ol before the current one
                    if (!$spot.parent().prev()[0] || !$spot.parent().prev().prev()[0]) { // if there are two or less spots before the one clicked in the current ol
                        scroll_spot_id = $spot.parent().parent().prev().prev().children().children().last()[0].id;
                    }
                }
                if (scroll_spot_id) {
                    document.getElementById(scroll_spot_id).scrollIntoView();
                }
                $spot.click();
                $.removeCookie('spot_id');
            }
            // LazyLoading the spot images
            var lazyload_target = isMobile ? window : '#info_list';
            $(lazyload_target).lazyScrollLoading({
                lazyItemSelector : ".lazyloader",
                onLazyItemFirstVisible : function (e, $lazyItems, $firstVisibleLazyItems) {
                    $firstVisibleLazyItems.each(function () {
                        var $img = $(this);
                        var src = $img.data('src');
                        $img.css('background', 'transparent url("'+src+'") no-repeat 50% 50%');
                    });
               }
            });
        });

    }
    window.openAllMarkerInfoWindow = openAllMarkerInfoWindow;

    function _sortByBuildingName(data) {
        data.sort(function (one, two) {
            var abuilding = one.location.building_name.toLowerCase(), bbuilding = two.location.building_name.toLowerCase();
            if (abuilding < bbuilding)
                return -1;
            if (abuilding > bbuilding)
                return 1;
            return 0;
        });
        return data;
    }

    function buildingNameHeaders(data) {
        data = _sortByBuildingName(data);

        var byBuilding = {};
        var nobuilding = 'no building';
        for (var i = 0; i < data.length; i++) {
            var bname = data[i].location.building_name;
            if (bname === null) {
                if (!byBuilding.hasOwnProperty(nobuilding)) {
                    byBuilding[nobuilding] = [data[i]];
                }
                byBuilding[nobuilding].push(data[i]);
            } else {
                if (!byBuilding.hasOwnProperty(bname)) {
                    byBuilding[bname] = [data[i]];
                } else {
                    byBuilding[bname].push(data[i]);
                }
            }
        }

        var result = [];
        for (var bname in byBuilding) {
            if (byBuilding.hasOwnProperty(bname)) {
                result.push({
                    name: bname,
                    spots: byBuilding[bname]
                });
            }
        }
        return result;
    }
    window.buildingNameHeaders = buildingNameHeaders;

    // jquery function to check if scrollable
    $.fn.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    };

    function _lazyLoadSpaceImages() {
        // container lazy loading for desktop ui
        if ($('#info_list').hasScrollBar()) {
            $("img.lazy").lazyload({
                 container: $("#info_list")
             });
        } else { //mobile ui
            $("img.lazy").lazyload();
        }
    }

    function repopulate_filters(form_opts) {
        if (!form_opts) {
            return;
        }

        $.event.trigger('search_beforeRepopulateFilters', form_opts);

        // set types
        if (form_opts.hasOwnProperty('type')) {
            $.each(form_opts.type, function () {
                $('#'+this).prop('checked', true);
            });
        }

        // set reservability
        if (form_opts["extended_info:reservable"]) {
            $('#reservable').prop('checked', true);
        }

        // set capacity
        $('#capacity').val(form_opts.capacity);

        // set hours
        if (form_opts.open_at || form_opts.open_until) {
            $('#hours_list_input').prop('checked', true);
            $('#hours_list_container').show();
            var day, time, ampm, open_parts;

            if (form_opts.open_at) {
                open_parts = form_opts.open_at.split(',');
                day = open_parts[0];
                time = open_parts[1].split(':');

                ampm = 'AM';
                if (time[0] >= 12) {
                    if (time[0] > 12) {
                        time[0] = time[0] - 12;
                    }
                    ampm = 'PM';
                }

                $('#day-from').val(day);
                $('#hour-from').val(time.join(':'));
                $('#ampm-from').val(ampm);
            }

            if (form_opts.open_until) {
                open_parts = form_opts.open_until.split(',');
                day = open_parts[0];
                time = open_parts[1].split(':');

                ampm = 'AM';
                if (time[0] >= 12) {
                    if (time[0] > 12) {
                        time[0] = time[0] - 12;
                    }
                    ampm = 'PM';
                }

                $('#day-until').val(day);
                $('#hour-until').val(time.join(':'));
                $('#ampm-until').val(ampm);
            }
        }

        // set location
        if (form_opts.building_name) {
            $('#e9').val(form_opts.building_name).trigger("liszt:updated");
            $('#building_list_input').prop('checked', true);
            $('#building_list_container').show();
        }

        // set resources
        var resources = [
            'whiteboards', 'outlets', 'computers', 'scanner',
            'projector', 'printing', 'displays'
        ];
        for (var i = 0; i < resources.length; i++) {
            var resource = resources[i];
            if (form_opts["extended_info:has_" + resource]) {
                $('#has_' + resource).prop('checked', true);
            }
        }
        
        // set noise level
        if (form_opts.hasOwnProperty("extended_info:noise_level")) {
            for (var i = 0; i < form_opts["extended_info:noise_level"].length; i++) {
                $('#'+form_opts["extended_info:noise_level"][i]).prop('checked', true);
            }
        }

        // set lighting
        if (form_opts["extended_info:has_natural_light"]) {
            $('#lighting').prop('checked', true);
        }

        // set food/coffee
        if (form_opts.hasOwnProperty("extended_info:food_nearby")) {
            for (var i = 0; i < form_opts["extended_info:food_nearby"].length; i++) {
                $('#'+form_opts["extended_info:food_nearby"][i]).prop('checked', true);
            }
        }

        $.event.trigger('search_afterRepopulateFilters', form_opts);
    }
    window.repopulate_filters = repopulate_filters;

    function clear_filter() {
        // reset checkboxes
        $('input[type=checkbox]').each(function () {
            var $this = $(this);
            if ($this.prop('checked')) {
                $this.prop('checked', false);
                $this.parent().removeClass("selected");
            }
        });

        // reset capacity
        $('#capacity').val('1');

        // reset hours
        $('#open_now').prop('checked', true);
        $('#open_now').parent().removeClass("selected");
        $('#hours_list_container').hide();
        $('#hours_list_input').parent().removeClass("selected");
        default_open_at_filter();

        reset_location_filter();
    }
    window.clear_filter = clear_filter;

    function reset_location_filter() {
        var $node;

        // reset location
        $('#entire_campus').prop('checked', true);
        $('#entire_campus').parent().removeClass("selected");
        $('#building_list_container').hide();
        $('#building_list_input').parent().removeClass("selected");
        $('#building_list_container').children().children().children(".select2-search-choice").remove();
        $('#building_list_container').children().children().children().children().val('Select building(s)');
        $('#building_list_container').children().children().children().children().attr('style', "");

        $node = $('#e9.building-location');
        if ($node.length > 0) {
            $.each($node.children().children(), function () {
                this.selected = false;
            });
            $node.trigger("liszt:updated") ;
        }
    }
    window.reset_location_filter = reset_location_filter;

    function run_custom_search() {
        var event_results;
         
        // if searching, reset that spot count
        window.update_count = true;

        // Clear the map
        for (var i = 0; i < window.spacescout_markers.length; i++) {
            window.spacescout_markers[i].setMap(null);
        }
        window.spacescout_markers = [];
        spacescout_marker_ids = {};

        // Set the search values, so they'll stick through zooms and pans
        window.spacescout_search_options = {};
        var set_cookie = false;
        if ($.cookie('spacescout_search_opts')) {
            set_cookie = true; // if there is a cookie, we'd better reset it, or else we get filters that are too sticky
        }

        event_results = { set_cookie: set_cookie };
        $.event.trigger('search_beforeRunCustomOptions', [window.spacescout_search_options, event_results]);
        set_cookie = event_results.set_cookie;

        // type
        var checked = [];
        $.each($("input[name='type']:checked"), function() {
            checked.push($(this).val());
        });
        if (checked.length > 0) {
            window.spacescout_search_options.type = checked;
            set_cookie = true;
        }

        // reservable
        if ($("#reservable").is(":checked")) {
            window.spacescout_search_options["extended_info:reservable"] = "true";
            set_cookie = true;
        }

        // capacity
        window.spacescout_search_options.capacity = $("#capacity option:selected").val();
        if (window.spacescout_search_options.capacity != 1) {
            set_cookie = true;
        }

        // hours
        if ($("#hours_list_input").prop("checked")) {
            if ($('#day-from').val() != 'nopref') {
                var from_query = [];
                from_query.push($('#day-from').val());
                if ($('#hour-from').val() != 'nopref') {
                    var time = $('#hour-from').val().split(':');

                    if ($('#ampm-from').val() == 'PM' && time[0] != 12) {
                        time[0] = time[0] + 12;
                    } else if ($('#ampm-from').val() == 'AM' && time[0] == 12) {
                        time[0] = 0;
                    }

                    from_query.push(time.join(':'));
                } else {
                    from_query.push('00:00');
                }
                window.spacescout_search_options.open_at = from_query.join(",");
            }

            if ($('#day-from').val() != 'nopref' && $('#day-until').val() != 'nopref') {
                var until_query = [];
                until_query.push($('#day-until').val());
                if ($('#hour-until').val() != 'nopref') {
                    var time = $('#hour-until').val().split(':');

                    if ($('#ampm-until').val() == 'PM' && time[0] != 12) {
                        time[0] = time[0] + 12;
                    } else if ($('#ampm-until').val() == 'AM' && time[0] == 12) {
                        time[0] = 0;
                    }

                    until_query.push(time.join(':'));
                } else {
                    until_query.push('23:59');
                }
                window.spacescout_search_options.open_until = until_query.join(",");
            }
            
            set_cookie = true;
        }

        // location
        if ($("#building_list_input").prop("checked")) {
            if (!$('select#e9').val()) {
                reset_location_filter();
            } else {
                window.spacescout_search_options.building_name = $('select#e9').val();
            }
            set_cookie = true;
        }

        // equipment
        checked = [];
        $.each($("input[name='equipment']:checked"), function () {
            checked.push($(this).val());
        });
        for (var i = 0; i < checked.length; i++) {
            window.spacescout_search_options["extended_info:" + checked[i]] = true;
        }
        if (checked.length > 0) {
            set_cookie = true;
        }

        // noise
        checked = [];
        $.each($("input[name='noise_level']:checked"), function () {
            checked.push($(this).val());
        });
        if (checked.length > 0) {
            window.spacescout_search_options["extended_info:noise_level"] = checked;
            set_cookie = true;
        }

        // lighting
        if ($("#lighting").is(":checked")) {
            window.spacescout_search_options["extended_info:has_natural_light"] = "true";
            set_cookie = true;
        }

        // food/coffee
        checked = [];
        $.each($("input[name='food_nearby']:checked"), function () {
            checked.push($(this).val());
        });
        if (checked.length > 0) {
            window.spacescout_search_options["extended_info:food_nearby"] = checked;
            set_cookie = true;
        }

        event_results = { set_cookie: set_cookie };
        $.event.trigger('search_afterRunCustomOptions', [window.spacescout_search_options, event_results]);
        set_cookie = event_results.set_cookie;

        // close space detail if visible (desktop)
        if ($('.space-detail-container').is(":visible")) {
            $('#info_items li').removeClass('selected');
            $('.space-detail').hide("slide", { direction: "right" }, 700, function () {
                $('.space-detail-container').remove();
            });
        }
        
        // run google analytics tracking for filters
        trackCheckedFilters();

        // show the correct buttons
//      $('#filter_button').show();
        $('#space_count_container').show();
//      $('#view_results_button').hide();
//      $('#cancel_results_button').hide();

        // reset the map center and zoom
        window.spacescout_map.setCenter(new GM.LatLng(window.default_latitude, window.default_longitude));
        window.spacescout_map.setZoom(parseInt(window.default_zoom));

        // Run the search
        //console.log(window.spacescout_search_options);
        _fetchData();

        // slide the filter up
        $("#filter_block").slideUp(400, function () {
            var icon = $('.fa-angle-double-up');

            if (icon.length) {
                icon.switchClass('fa-angle-double-up', 'fa-angle-double-down', 0);
            }

            // check to see if the style attribute was added to the container (mobile only)
            if ($('#container').attr("style")) {
                // undo fixed height and show all overflowing content
                $('#container').height('auto');
                $('#container').css('overflow','visible');
            }

        });

        if (set_cookie) {
            $.cookie('spacescout_search_opts', JSON.stringify(window.spacescout_search_options), { expires: 1 });
        }
        
        // reset the scroll to top of container
        $('#info_list').scrollTop(0);
    }
    window.run_custom_search = run_custom_search;

/*
    function fix_filter_overflow() {
        var old;
        var outofspace = false;
        $('#filter_display_list > li').each(function(){
            if (outofspace) {
                $(this).hide();
            }
            else {
                oScrollTop = $('#filter_display_list').height();
                var thisItemIsVisible = ($(this).position().top < oScrollTop);
                if (!thisItemIsVisible) {
                    $(this).html("...");
                    outofspace = true;
                    thisItemIsVisible = ($(this).position().top < oScrollTop);
                    if (!thisItemIsVisible) {
                        $(old).html("...");
                        $(this).hide();
                    }
                }
                old = this;
            }
        });

    }
*/

    // TODO: is this used anymore?
    function clear_custom_search() {
        window.spacescout_search_options = [];
        _fetchData();
    }

    function initialize() {
        window.spacescout_search_options = {};
        window.update_count = true;

        if ($.cookie('spacescout_search_opts')) {
            window.spacescout_search_options = JSON.parse($.cookie('spacescout_search_opts'));
            repopulate_filters(window.spacescout_search_options);
        }

        /* why are we asking for their location if we're not doing anything with it?
        // leaving this in but commented out until I can talk to the team about *if* the web app should do something with location
        if (navigator.geolocation) {
            // Doing a timeout here, to make sure we load something...
            _loadMap(window.default_latitude, window.default_longitude, window.default_zoom);

            navigator.geolocation.getCurrentPosition(
                // Success...
                function(position) {
                    youarehere = position.coords;
                    _loadMap(window.default_latitude, window.default_longitude, window.default_zoom);
                }
            );
        } else { */
            _loadMap(window.default_latitude, window.default_longitude, window.default_zoom);
        //}
    }
    window.initialize = initialize;

    function _loadMap(latitude, longitude, zoom) {
        $('.loading').show();
        var myOptions = {
            center: new GM.LatLng(latitude, longitude),
            zoom: zoom,
            mapTypeControl: false,
            mapTypeId: GM.MapTypeId.ROADMAP,
            streetViewControl: false,
            styles: [{
                featureType: "poi.place_of_worship",
                stylers: [
                  { "visibility": "off" }
                ]
            }]
        };

        if (window.spacescout_map) {
            window.spacescout_map.setCenter(new GM.LatLng(latitude, longitude));
        } else {
            window.spacescout_map = new GM.Map(document.getElementById("map_canvas"), myOptions);
        }

        GM.event.addListener(window.spacescout_map, 'idle', _reloadOnIdle);
        //next three lines courtesy of samolds
        GM.event.addListener(spacescout_map, 'mouseup', function (c) {
            spacescout_map.setOptions({draggable: true});
        });
        
        // these commented out lines cause LOTS of CPU
        // add listeners to disable click events for points of interest
        // http://stackoverflow.com/questions/7950030/can-i-remove-just-the-popup-bubbles-of-pois-in-google-maps-api-v3
        //GM.event.addListener(spacescout_map, "mouseup",function(event){
        //    setInterval(function(){$('[src$="/mv/imgs8.png"]').trigger('click'); },1);
        //});
        //GM.event.addListener(spacescout_map, "dragstart",function(event){
        //    setInterval(function(){$('[src="http://maps.gstatic.com/mapfiles/mv/imgs8.png"]').trigger('click'); },1);
        //});
        //GM.event.trigger(spacescout_map, 'mouseup'); // prime the cover.

        GM.event.addListenerOnce(spacescout_map, 'tilesloaded', function () {
            document.getElementById('center_all').style.display = "inline";
        });

        // append the centering buttons after map has loaded
        _displayMapCenteringButtons();
    }

/*
    function display_search_results(data) {
        $('.loading').show();

        for (i = 0; i < data.length; i++) {
            if (!spacescout_marker_ids[data[i].id]) {
                marker = new GM.Marker({
                    position: new GM.LatLng(data[i].location.latitude, data[i].location.longitude),
                    title: data[i].name,
                    icon: '/static/img/pins/pin01.png'
                });

                //marker.setMap(window.spacescout_map);
                mc.addMarker(marker);
                addMarkerListener(marker, data[i]);

                spacescout_marker_ids[data[i].id] = true;
                window.spacescout_markers.push(marker);
            }
        }
        addClusterListener(mc, data);
        openAllMarkerInfoWindow(data);

        // you are here marker
        if (youarehere != null) {
            my_marker = new GM.Marker({
                position: new GM.LatLng(youarehere.latitude, youarehere.longitude),
                title: "You are here",
                map: spacescout_map,
                icon: '/static/img/pins/me_pin.png'
            });
            //window.spacescout_markers.push(my_marker);
        }

        // set the # of spaces in the bubble if update_count is true
        if (window.update_count) {
            var source = $('#space_count').html();
            var template = H.compile(source);
            $('#space_count_container').html(template({count: data.length}));
        }

        // if this was true, now that we've updated the count don't do it again unless a custom search was run
        if (window.update_count == true) {
            window.update_count = false;
        }

    }
*/

    function _loadData(data) {
        // update the map
        // display_search_results(data);
        updatePins(data);
    }

    function _reloadOnIdle() {
        // load the in-page json first time through
        if (window.initial_load) {
//          var source = $('#filter_list').html();
//          var template = H.compile(source);
//          $('#bubble_filters_container').html(template({}));
            _loadData(initial_json);
            window.initial_load = false;
        // only fetch data as long as space details are NOT being shown
        } else if (!$('.space-detail-container').is(":visible")) {
            _fetchData();
        }
    }

    function _fetchData() {
        $('.loading').show();
        // abort any pending ajax window.requests
        for (var i = 0; i < window.requests.length; i++) {
            window.requests[i].abort();
        }
        var args = window.spacescout_search_options;
        if (!args) {
            args = {};
        }

        $.event.trigger('search_beforeFetchDataArgs', args);

        // it's a hack, but it should work
        if (!args.open_at) {
            args.open_now = 1;
        }

        var display_bounds = window.spacescout_map.getBounds();
        var ne = display_bounds.getNorthEast();
        var sw = display_bounds.getSouthWest();
        var center = window.spacescout_map.getCenter();

        // which is longer?
        var north = _distanceBetweenPoints(center.lat(), center.lng(), ne.lat(), center.lng());
        var east = _distanceBetweenPoints(center.lat(), center.lng(), center.lat(), ne.lng());

        var distance;
        if (north > east) {
            distance = north;
        } else {
            distance = east;
        }

        // Calculated in KM
        distance = distance * 1000;

        args.center_latitude = center.lat();
        args.center_longitude = center.lng();
        args.distance = distance;
        args.limit = 0;

        $.event.trigger('search_afterFetchDataArgs', args);

        // "type" needs to exist as something
        if (!window.spacescout_search_options.hasOwnProperty('type')) {
            window.spacescout_search_options.type = [];
        }

        /*
        // Populate the bubble with which filters are used
        var bubble_filters = $().extend({}, window.spacescout_search_options);

        bubble_filters["space_type"] = (window.spacescout_search_options["type"].length > 0);
        bubble_filters["true_capacity"] = parseInt(window.spacescout_search_options["capacity"]) > 1;

        bubble_filters["reservable"] = (window.spacescout_search_options["extended_info:reservable"] != null);
        bubble_filters["noise"] = (window.spacescout_search_options["extended_info:noise_level"] != null);
        bubble_filters["lighting"] = (window.spacescout_search_options["extended_info:has_natural_light"] != null);
        bubble_filters["food"] = (window.spacescout_search_options["extended_info:food_nearby"] != null);
        bubble_filters["resources"] = (window.spacescout_search_options["extended_info:has_computers"] != null) || (window.spacescout_search_options["extended_info:has_displays"] != null) || (window.spacescout_search_options["extended_info:has_outlets"] != null) || (window.spacescout_search_options["extended_info:has_printing"] != null) || (window.spacescout_search_options["extended_info:has_projector"] != null) || (window.spacescout_search_options["extended_info:has_scanner"] != null) || (window.spacescout_search_options["extended_info:has_whiteboards"] != null);

        var source = $('#filter_list').html();
        var template = H.compile(source);
        $('#bubble_filters_container').html(template(bubble_filters));

        fix_filter_overflow();
        */

        var url_args = [];
        for (var key in args) {
            if (args.hasOwnProperty(key)) {
                var val = args[key];

                if (typeof(val) == "object") {
                    // only objects allowed in args are arrays
                    for (var i = 0; i < val.length; i++) {
                        url_args.push(encodeURIComponent(key) + "=" + encodeURIComponent(val[i]));
                    }
                } else {
                    url_args.push(encodeURIComponent(key) + "=" + encodeURIComponent(val));
                }
            }
        }

        var query = '/search/?' + url_args.join('&');

        window.requests.push(
            $.ajax({
                url: query,
                success: _loadData
            })
        );
    }

    function _distanceBetweenPoints(lat1, lon1, lat2, lon2) {
        // from http://www.movable-type.co.uk/scripts/latlong.html
        var R = 6371; // km
        var dLat = (lat2-lat1) * Math.PI / 180;
        var dLon = (lon2-lon1) * Math.PI / 180;
        lat1 = lat1 * Math.PI / 180;
        lat2 = lat2 * Math.PI / 180;

        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;

        return d;
    }

    // ScrollTo a spot on the UI
    function scrollToTop(id) {
        // Scroll
        $('html,body').animate({ scrollTop: $("#"+id).offset().top},'fast');
    }
    window.scrollToTop = scrollToTop;

    function _displayMapCenteringButtons() {
       // build the template
       var source = $('#map_controls').html();
       var template = H.compile(source);
       $('#map_canvas').append(template({}));
    }

})(Handlebars, jQuery, google.maps);
