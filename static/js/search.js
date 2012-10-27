var spacescout_map = null, spacescout_infowindow, spacescout_marker_ids = {}, spacescout_markers = [], speed = 800, mc = null, youarehere = null, update_count = null;

function openInfoWindow(marker, info) {

    // reset scroll position
    $("#info_list").scrollTop(0);

    // show the loading spinner for a few seconds
    $('.loading').show().delay(3000);

    var source = $('#spot_info').html();
    var template = Handlebars.compile(source);
    $("#info_items").html(template(info));

    scrollToTop('info_list');
    $('.loading').slideUp('fast');

    lazyLoadSpaceImages();

}

function addMarkerListener(marker, data) {
    google.maps.event.addListener(marker, 'click', function(m) {
        openInfoWindow(m, data);
    });
}

function openClusterInfoWindow(cluster, data) {

    // reset scroll position
    $("#info_list").scrollTop(0);

    // show the loading spinner for a few seconds
    $('.loading').show().delay(3000).focus();

    // I'm sure there's a better way of filtering this down to spaces...
    var spaces = new Array();
    for (i=0; i < cluster.getMarkers().length; i++) {
        for (j=0; j < data.length; j++) {
            if (data[j].name == cluster.getMarkers()[i].title) {
                spaces.push(data[j]);
            }
        }
    }
    var source = $('#cluster_list').html();
    var template = Handlebars.compile(source);
    data = buildingNameHeaders(spaces);
    $('#info_items').html(template({data: data}));

    scrollToTop('info_list');
    $('.loading').slideUp('fast');

    lazyLoadSpaceImages();

}

function addClusterListener(markerCluster, data) {
    google.maps.event.addListener(markerCluster, 'click', function(c) {
        openClusterInfoWindow(c, data);
    });

}

function openAllMarkerInfoWindow(data) {
    var source = $('#all_markers').html();
    var template = Handlebars.compile(source);
    data = buildingNameHeaders(data);
    $('#info_items').html(template({'data': data}));
    $('.loading').slideUp('fast');

    lazyLoadSpaceImages();

    $(document).ready(function() {
        if ($.cookie('spot_id') != null) {
            if ($("#" + $.cookie('spot_id')).parent().prev().prev().children()[1] != null) {
                window.location.hash = $("#" + $.cookie('spot_id')).parent().prev().prev().children()[1].id;
            }
            $("#" + $.cookie('spot_id')).click();
            $.removeCookie('spot_id');
        }
    });

}

function sortByBuildingName(data) {
    data.sort(function(one, two){
        var abuilding=one.location.building_name.toLowerCase(), bbuilding=two.location.building_name.toLowerCase()
        if (abuilding < bbuilding)
            return -1
        if (abuilding > bbuilding)
            return 1
        return 0
    })
    return data;
}

function buildingNameHeaders(data) {
    data = sortByBuildingName(data);
    var byBuilding = {};
    var big_list = [];
    var nobuilding = 'no building';
    for (i=0; i<data.length; i++) {
        var bname = data[i].location.building_name;
        if (bname === null) {
            if (!byBuilding.hasOwnProperty(nobuilding)) {
                byBuilding[nobuilding] = [data[i]];
            }
            byBuilding[nobuilding].push(data[i]);
        }
        else {
            if (!byBuilding.hasOwnProperty(bname)) {
                byBuilding[bname] = [data[i]];
            }
            else {
                byBuilding[bname].push(data[i]);
            }
        }
    }
    for (i in byBuilding) {
        var small_json = {};
        small_json.name = i;
        small_json.spots = byBuilding[i];
        big_list.push(small_json);

    }
    return big_list;
}

// jquery function to check if scrollable
(function($) {
    $.fn.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    }
})(jQuery);

function lazyLoadSpaceImages() {
    // container lazy loading for desktop ui
    if ($('#info_list').hasScrollBar()) {
        $("img.lazy").lazyload({
             container: $("#info_list")
         });
    }
    else { //mobile ui
        $("img.lazy").lazyload();
    }
}

function repopulate_filters() {
    if ($.cookie('spacescout_search_opts')) {
        var form_opts = JSON.parse($.cookie('spacescout_search_opts'));

        // set types
        for (i=0; i < form_opts["type"].length; i++) {
            $('#'+form_opts["type"][i]).prop('checked', true);
        }

        // set reservability
        if (form_opts["extended_info:reservable"]) {
            $('#reservable').prop('checked', true);
        }

        // set capacity
        $('#capacity').val(form_opts["capacity"]);

        // set hours
        if (form_opts["open_at"]) {
            var day = form_opts["open_at"].split(',')[0];
            var time = form_opts["open_at"].split(',')[1];
            time = time.split(':');
            var ampm = 'AM';
            if (Number(time[0]) > 12) {
                time[0] = Number(time[0]) - 12;
                ampm = 'PM';
            }
            time = time.join(':');
            $('#day-from').val(day);
            $('#hour-from').val(time);
            $('#ampm-from').val(ampm);
        }
        if (form_opts["open_until"]) {
            var day = form_opts["open_until"].split(',')[0];
            var time = form_opts["open_until"].split(',')[1];
            time = time.split(':');
            var ampm = 'AM';
            if (Number(time[0]) > 12) {
                time[0] = Number(time[0]) - 12;
                ampm = 'PM';
            }
            time = time.join(':');
            $('#day-until').val(day);
            $('#hour-until').val(time);
            $('#ampm-until').val(ampm);
        }

        // set location
        if (form_opts["building_name"]) {
            $('#e9').val(form_opts["building_name"]);
        }

        // set resources
        if (form_opts["extended_info:has_whiteboards"]) {
            $('#has_whiteboards').prop('checked', true);
        }
        if (form_opts["extended_info:has_outlets"]) {
            $('#has_outlets').prop('checked', true);
        }
        if (form_opts["extended_info:has_computers"]) {
            $('#has_computers').prop('checked', true);
        }
        if (form_opts["extended_info:has_scanner"]) {
            $('#has_scanner').prop('checked', true);
        }
        if (form_opts["extended_info:has_projector"]) {
            $('#has_projector').prop('checked', true);
        }
        if (form_opts["extended_info:has_printing"]) {
            $('#has_printing').prop('checked', true);
        }
        if (form_opts["extended_info:has_displays"]) {
            $('#has_displays').prop('checked', true);
        }

        // set noise level
        if (form_opts["extended_info:noise_level"]) {
            for (i=0; i < form_opts["extended_info:noise_level"].length; i++) {
                $('#'+form_opts["extended_info:noise_level"][i]).prop('checked', true);
            }
        }

        // set lighting
        if (form_opts["extended_info:has_natural_light"]) {
            $('#lighting').prop('checked', true);
        }

        // set food/coffee
        if (form_opts["extended_info:food_nearby"]) {
            for (i=0; i < form_opts["extended_info:food_nearby"].length; i++) {
                $('#'+form_opts["extended_info:food_nearby"][i]).prop('checked', true);
            }
        }

    }
}

function run_custom_search() {
    // if searching, reset that spot count
    window.update_count = true;

    // Clear the map
    for (var i = 0; i < window.spacescout_markers.length; i++) {
        window.spacescout_markers[i].setMap(null);
    }
    window.spacescout_markers = [];
    window.spacescout_marker_ids = {};
    window.mc.clearMarkers();

    // Set the search values, so they'll stick through zooms and pans
    window.spacescout_search_options = {};
    if ($.cookie('spacescout_search_opts')) {
        var set_cookie = true; // if there is a cookie, we'd better reset it, or else we get filters that are too sticky
    } else {
        var set_cookie = false;
    }

    // type
    var checked = new Array();
    $.each($("input[name='type']:checked"), function() {
        checked.push($(this).val());
    });
    if (checked.length > 0) {
        window.spacescout_search_options["type"] = checked;
        set_cookie = true;
    }

    // reservable
    if ( $("#reservable").is(":checked") ) {
        window.spacescout_search_options["extended_info:reservable"] = "true";
        set_cookie = true;
    }

    // capacity
    window.spacescout_search_options["capacity"] = $("#capacity option:selected").val();
    if (window.spacescout_search_options["capacity"] != 1) {
        set_cookie = true;
    }

    // hours
    if ($("#hours_list_input").attr("checked") == "checked") {
        if ($('#day-from').val() != 'nopref') {
            var from_query = new Array;
            from_query.push($('#day-from').val());
            if ($('#hour-from').val() != 'nopref') {
                var time = $('#hour-from').val();
                var hour = time.split(':')[0];
                var min = time.split(':')[1];
                if ($('#ampm-from').val() == 'PM' && hour != 12) {
                    hour = Number(hour) + 12;
                    time = hour+':'+min;
                } else if ($('#ampm-from').val() == 'AM' && hour == 12) {
                    hour = 0;
                    time = hour+':'+min;
                }
                from_query.push(time);
            } else {
                from_query.push('00:00');
            }
            window.spacescout_search_options["open_at"] = from_query.join(",");
        }

        if ($('#day-from').val() != 'nopref' && $('#day-until').val() != 'nopref') {
            var until_query = new Array;
            until_query.push($('#day-until').val());
            if ($('#hour-until').val() != 'nopref') {
                var time = $('#hour-until').val();
                var hour = time.split(':')[0];
                var min = time.split(':')[1];
                if ($('#ampm-until').val() == 'PM' && hour != 12) {
                    hour = Number(hour) + 12;
                    time = hour+':'+min;
                } else if ($('#ampm-until').val() == 'AM' && hour == 12) {
                    hour = 0;
                    time = hour+':'+min;
                }
                until_query.push(time);
            } else {
                until_query.push('23:59');
            }
            window.spacescout_search_options["open_until"] = until_query.join(",");
        }
        set_cookie = true;
    }

    // location
    if ($("#building_list_input").attr("checked") == "checked") {
        window.spacescout_search_options["building_name"] = $('select#e9').val();
        set_cookie = true;
    }

    // equipment
    checked = [];
    $.each($("input[name='equipment']:checked"), function() {
        checked.push($(this).val());
    });
    for (i=0; i < checked.length; i++) {
        window.spacescout_search_options["extended_info:" + checked[i]] = true;
    }
    if (checked.length > 0) {
        set_cookie = true;
    }

    // noise
    checked = [];
    $.each($("input[name='noise_level']:checked"), function() {
        checked.push($(this).val());
    });
    if (checked.length > 0) {
        window.spacescout_search_options["extended_info:noise_level"] = checked;
        set_cookie = true;
    }

    // lighting
    if ( $("#lighting").is(":checked") ) {
        window.spacescout_search_options["extended_info:has_natural_light"] = "true";
        set_cookie = true;
    }

    // food/coffee
    checked = [];
    $.each($("input[name='food_nearby']:checked"), function() {
        checked.push($(this).val());
    });
    if (checked.length > 0) {
        window.spacescout_search_options["extended_info:food_nearby"] = checked;
        set_cookie = true;
    }

    // close space detail if visible (desktop only)
    if ($('#space_detail_container').is(":visible")) {
        $('#info_items li').removeClass('selected');
        $('.space-detail').hide("slide", { direction: "right" }, 700, function() {
        	   $('#space_detail_container').remove();
        });
    }


    // show the correct buttons
    $('#filter_button').show();
    $('#view_results_button').hide();
    $('#cancel_results_button').hide();

    // reset the map center and zoom
    window.spacescout_map.setCenter(new google.maps.LatLng(window.default_latitude, window.default_longitude));
    window.spacescout_map.setZoom(window.default_zoom);

    // Run the search
    //console.log(window.spacescout_search_options);
    fetch_data();

    // slide the filter up
    $("#filter_block").slideUp(400, function() {

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

// TODO: is this used anymore?
function clear_custom_search() {
    window.spacescout_search_options = [];
    fetch_data();
}

function initialize() {

    var i;

    window.spacescout_search_options = {};
    window.update_count = true;

    repopulate_filters();
    if ($.cookie('spacescout_search_opts')) {
        window.spacescout_search_options = JSON.parse($.cookie('spacescout_search_opts'));
    }

    if (navigator.geolocation) {
        // Doing a timeout here, to make sure we load something...
        window.position_timeout = window.setTimeout(function() {
            load_map(window.default_latitude, window.default_longitude, window.default_zoom);
        }, 5000);

        navigator.geolocation.getCurrentPosition(
            // Success...
            function(position) {
                window.clearTimeout(window.position_timeout);
                youarehere = position.coords;
                load_map(window.default_latitude, window.default_longitude, window.default_zoom);
            }
        );
    }
    else {
        load_map(window.default_latitude, window.default_longitude, window.default_zoom);
    }

}

function load_map(latitude, longitude, zoom) {
    $('.loading').show();
    var myOptions = {
        center: new google.maps.LatLng(latitude, longitude),
        zoom: zoom,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        styles: [{
            featureType: "poi.place_of_worship",
            stylers: [
              { "visibility": "off" }
                ]
        }]
    };

    if (window.spacescout_map == null) {
        window.spacescout_map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
        var mcOpts = {
            averageCenter: true,
            zoomOnClick: false,
            styles: [{
                textColor: 'white',
                textSize: 12,
                fontWeight: 'normal',
                anchor: [5, 0], // These values can only be positive
                height: 40,
                width: 35, // The icon width is actually 40, but the anchorIcon offset doesn't seem to work right, this gets the cluster icon centered on the number
                url: '/static/img/pins/pin00.png'
            }]
        };
        window.mc = new MarkerClusterer(spacescout_map, [], mcOpts);
    } else {
        window.spacescout_map.setCenter(new google.maps.LatLng(latitude, longitude));
    }
    google.maps.event.addListener(window.spacescout_map, 'idle', reload_on_idle);

    // append the centering buttons after map has loaded
    displayMapCenteringButtons();
}

function display_search_results(data) {
    $('.loading').show();

    for (i = 0; i < data.length; i++) {
        if (!window.spacescout_marker_ids[data[i].id]) {
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(data[i].location.latitude, data[i].location.longitude),
                title: data[i].name,
                icon: '/static/img/pins/pin01.png'
            });

            //marker.setMap(window.spacescout_map);
            window.mc.addMarker(marker);
            addMarkerListener(marker, data[i]);

            window.spacescout_marker_ids[data[i].id] = true;
            window.spacescout_markers.push(marker);
        }
    }
    addClusterListener(window.mc, data);
    openAllMarkerInfoWindow(data);

    // you are here marker
    if (youarehere != null) {
        my_marker = new google.maps.Marker({
            position: new google.maps.LatLng(youarehere.latitude, youarehere.longitude),
            title: "You are here",
            map: spacescout_map,
            icon: '/static/img/pins/me_pin.png'
        });
        //window.spacescout_markers.push(my_marker);
    }

    // set the # of spaces in the bubble if epdate_count is true
    if (update_count) {
        var source = $('#space_count').html();
        var template = Handlebars.compile(source);
        $('#space_count_container').html(template({count: data.length}));
    }

    // if this was true, now that we've updated the count don't do it again unless a custom search was run
    if (window.update_count == true) {
        window.update_count = false;
    }

}

function load_data(data) {

    // update the map
    display_search_results(data);
}

function reload_on_idle() {

    // only fetch data as long as space details are NOT being shown
    if (!$('#space_detail_container').is(":visible")) {
        fetch_data();
    }

}

function fetch_data() {
    $('.loading').show();
    // abort any pending ajax window.requests
    for (i =0; i < window.requests.length; i++) {
        window.requests[i].abort();
    }
    var args = window.spacescout_search_options;
    if (!args) {
        args = {};
    }
    // it's a hack, but it should work
    if (!args["open_at"]) {
        args["open_now"] = 1;
    }

    var display_bounds = window.spacescout_map.getBounds();
    var ne = display_bounds.getNorthEast();
    var sw = display_bounds.getSouthWest();
    var center = window.spacescout_map.getCenter();

    // which is longer?
    var north = distance_between_points(center.lat(), center.lng(), ne.lat(), center.lng());
    var east = distance_between_points(center.lat(), center.lng(), center.lat(), ne.lng());

    if (north > east) {
        var distance = north;
    } else {
        var distance = east;
    }

    // Calculated in KM
    distance = distance * 1000;

    args["center_latitude"] = [center.lat()];
    args["center_longitude"] = center.lng();
    //args["open_now"] = 1;
    args["distance"] = distance;
    args["limit"] = 0;

    // "type" needs to exist as something
    if (!window.spacescout_search_options["type"]) {
        window.spacescout_search_options["type"] = [];
    }

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
    var template = Handlebars.compile(source);
    $('#bubble_filters_container').html(template(bubble_filters));

    var url_args = ["/search/?"];
    for (var key in args) {
        if (typeof(args[key]) == "object") {
            for (var i = 0; i < args[key].length; i++) {
                url_args.push(encodeURIComponent(key), "=", encodeURIComponent(args[key][i]), '&');
            }
        }
        else {
            url_args.push(encodeURIComponent(key), "=", encodeURIComponent(args[key]), '&');
        }
    }

    url_args.pop();

    var query = url_args.join("");

    window.requests.push(
        $.ajax({
            url: query,
            success: load_data
        })
    );
}

function distance_between_points(lat1, lon1, lat2, lon2) {
    // from http://www.movable-type.co.uk/scripts/latlong.html
    var R = 6371; // km
    var dLat = (lat2-lat1) * Math.PI / 180;
    var dLon = (lon2-lon1) * Math.PI / 180;
    var lat1 = lat1 * Math.PI / 180;
    var lat2 = lat2 * Math.PI / 180;

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

 function displayMapCenteringButtons() {
    // build the template
   var source = $('#map_controls').html();
   var template = Handlebars.compile(source);
   $('#map_canvas').append(template(template));
}


